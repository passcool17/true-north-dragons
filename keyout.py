import numpy as np
from PIL import Image
from scipy import ndimage as nd
import glob,os,json
H=156  # sprite height at 2x render (36% of 432)
names={'hero1':['idle','walk','punch','kick','hit','down','jumpkick','special'],'hero2':['idle','walk','punch','kick','hit','down','jumpkick','special'],'insp':['idle','attack','hit'],'final':['idle','attack','hit'],'tax':['idle','attack','hit'],'bur':['idle','attack','hit'],'bot':['idle','attack','hit'],'boss':['idle','attack','hit']}
meta={}
# reference scale per character from idle bbox height
for ch,poses in names.items():
    cuts={}
    for p in poses:
        a=np.asarray(Image.open(f'raw/{ch}_{p}.jpg').convert('RGB')).astype(int);R,G,B=a[...,0],a[...,1],a[...,2]
        cand=(R>140)&(B>80)&(G<110)&(R-G>90)
        lab,n=nd.label(cand);border=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
        bg=np.isin(lab,list(border))|((R>170)&(B>110)&(G<90)&(R-G>110))
        bg=nd.binary_closing(bg,iterations=1)|bg
        fg=~bg; fg=nd.binary_opening(fg,iterations=1)
        fg=nd.binary_erosion(fg,iterations=1)
        # drop small islands
        l2,n2=nd.label(fg)
        if n2>1:
            sz=nd.sum(fg,l2,range(1,n2+1));keep=np.isin(l2,[i+1 for i,s in enumerate(sz) if s>0.01*sz.max()]);fg=keep
        out=np.zeros(a.shape[:2]+(4,),np.uint8);out[...,:3]=a
        # despill: edge pixels pinkish -> reduce
        edge=fg&~nd.binary_erosion(fg,iterations=2)
        sp=edge&(R-G>40)&(B-G>20)
        out[...,0][sp]=np.minimum(R[sp],G[sp]+40);out[...,2][sp]=np.minimum(B[sp],G[sp]+40)
        out[...,3]=fg*255
        ys,xs=np.where(fg);cuts[p]=(Image.fromarray(out),(xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    ih=cuts['idle'][1][3]-cuts['idle'][1][1]
    target=H*(1.4 if ch=='boss' else 1.5 if ch=='final' else 1.0)*(0.95 if ch in('tax','bur','bot','insp') else 1)
    s=target/ih;meta[ch]={}
    for p,(im,bb) in cuts.items():
        c=im.crop(bb);w,h=c.size;c=c.resize((max(1,round(w*s)),max(1,round(h*s))),Image.LANCZOS)
        c.save(f'assets/sprites/{ch}_{p}.png');meta[ch][p]=c.size
    # down frame from hit, rotated backward (heroes face right -> fall left = rotate CCW 80)
    if ch.startswith('hero'): continue
    hit=Image.open(f'assets/sprites/{ch}_hit.png');ang=80 if ch.startswith('hero') else -80
    d=hit.rotate(ang,expand=True,resample=Image.BICUBIC);d=d.crop(d.getbbox());d.save(f'assets/sprites/{ch}_down.png');meta[ch]['down']=d.size
json.dump(meta,open('/tmp/meta.json','w'));print(meta)
