# keys out object sheets (magenta bg) and splits them into separate sprites by column gaps
import numpy as np
from PIL import Image
from scipy import ndimage as nd
SHEETS={'weapons':[('w_stick',84),('w_shovel',80),('w_puck',22)],
 'breakables':[('b_crate',54),('b_barrel',58),('b_can',58)],
 'projectiles':[('p_invoice',26),('p_brief',30),('p_mic',34),('p_splinter',42)],
 'machine':[('machine',210)],
 'props_new':[('p_directive',26),('p_ice',36),('p_shell',34),('o_phone',22),('p_scrap',34)],
 'nuke_button':[('o_nuke',84),('o_nuke_broken',84)]}
import sys
if sys.argv[1:]:SHEETS={k:v for k,v in SHEETS.items() if k in sys.argv[1:]}
for sh,objs in SHEETS.items():
    a=np.asarray(Image.open(f'raw/{sh}.jpg').convert('RGB')).astype(int)
    bgc=np.median(np.r_[a[:8].reshape(-1,3),a[-8:].reshape(-1,3)],axis=0)
    d=np.sqrt(((a-bgc)**2).sum(-1));R,G,B=a[...,0],a[...,1],a[...,2]
    mag=(R-G>90)&(B-G>50)
    fg=(d>70)&~mag;fg=nd.binary_opening(fg,iterations=1);fg=(nd.binary_fill_holes(fg)|fg)&~nd.binary_opening(mag,iterations=1)
    l,n=nd.label(fg);sz=nd.sum(fg,l,range(1,n+1));fg=np.isin(l,[i+1 for i,s in enumerate(sz) if s>60])
    fg=nd.binary_erosion(fg,iterations=1)
    out=np.zeros(a.shape[:2]+(4,),np.uint8);out[...,:3]=a;out[...,3]=fg*255
    edge=fg&~nd.binary_erosion(fg,iterations=2);sp=edge&(R-G>30)&(B-G>15)
    out[...,0][sp]=np.minimum(R[sp],G[sp]+30);out[...,2][sp]=np.minimum(B[sp],G[sp]+30)
    col=fg.any(0);xs=np.where(col)[0]
    # column runs separated by gaps >= 12px
    runs=[];s=xs[0];p=xs[0]
    for x in xs[1:]:
        if x-p>12:runs.append((s,p+1));s=x
        p=x
    runs.append((s,p+1))
    runs=sorted(runs,key=lambda r:-(r[1]-r[0]))[:len(objs)];runs.sort()
    print(sh,runs)
    for (name,th),(x0,x1) in zip(objs,runs):
        sub=fg[:,x0:x1];ys=np.where(sub.any(1))[0]
        im=Image.fromarray(out).crop((x0,ys[0],x1,ys[-1]+1))
        w,h=im.size;s=th/h;im=im.resize((max(1,round(w*s)),th),Image.LANCZOS)
        im.save(f'assets/sprites/{name}.png');print(name,im.size)
