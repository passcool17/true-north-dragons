# keys the level-1 / level-7 sprites (hue-distance key from the sheet's own bg colour)
import numpy as np, json, sys
from PIL import Image, ImageOps
from scipy import ndimage as nd
H=156;D='assets/sprites/'
SC={'san':.95,'qr':.95,'snitch':.9,'doc':1.12,'pm':1.15,'reset':1.15,'soldier':.97,'mech':1.22,'general':1.55}
MIRROR={'doc_hit','pm_attack','pm_hit'}
def key(path,tight=False,largest=False):
    a=np.asarray(Image.open(path).convert('RGB')).astype(int);R,G,B=a[...,0],a[...,1],a[...,2]
    bgc=np.median(np.r_[a[:6].reshape(-1,3),a[-6:].reshape(-1,3),a[:,:6].reshape(-1,3),a[:,-6:].reshape(-1,3)],axis=0)
    d=np.sqrt(((a-bgc)**2).sum(-1))
    thr=55 if tight else 80
    near=d<thr
    if not tight: near|=(R-G>100)&(B-G>60)&(G<90)
    else: near|=(R-G>150)&(B-G>80)&(G<50)
    lab,n=nd.label(near);border=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
    bg=np.isin(lab,list(border))|(d<thr*.55)
    fg=nd.binary_opening(~bg,iterations=1);fg=nd.binary_erosion(fg,iterations=1)
    l2,n2=nd.label(fg);sz=nd.sum(fg,l2,range(1,n2+1))
    comps=[(s,i+1) for i,s in enumerate(sz)]
    if largest: keep=[max(comps)[1]]
    else: keep=[i for s,i in comps if s>0.006*sz.max()]
    fgk=np.isin(l2,keep)
    out=np.zeros(a.shape[:2]+(4,),np.uint8);out[...,:3]=a
    edge=fgk&~nd.binary_erosion(fgk,iterations=2);sp=edge&(R-G>40)&(B-G>20)
    if not tight:
        out[...,0][sp]=np.minimum(R[sp],G[sp]+40);out[...,2][sp]=np.minimum(B[sp],G[sp]+40)
    else:
        sp=edge&(G<70)&(R-G>120);out[...,0][sp]=np.minimum(R[sp],G[sp]+60);out[...,2][sp]=np.minimum(B[sp],G[sp]+60)
    out[...,3]=fgk*255;return Image.fromarray(out),l2,comps,a,fg
meta={}
only=sys.argv[1:]
for ch,s0 in SC.items():
    if only and ch not in only: continue
    ims={}
    for p in ['idle','attack','hit']:
        im,*_=key(f'raw/{ch}_{p}.jpg',tight=ch=='snitch',largest=ch=='reset')
        im=im.crop(im.getbbox())
        if f'{ch}_{p}' in MIRROR: im=ImageOps.mirror(im)
        ims[p]=im
    s=H*s0/ims['idle'].size[1];meta[ch]={}
    for p,im in ims.items():
        w,h=im.size;im=im.resize((max(1,round(w*s)),max(1,round(h*s))),Image.LANCZOS);im.save(D+f'{ch}_{p}.png');meta[ch][p]=im.size
    hit=Image.open(D+f'{ch}_hit.png')
    if ch=='general': hit.save(D+'general_down.png')
    else:
        d=hit.rotate(-80,expand=True,resample=Image.BICUBIC);d.crop(d.getbbox()).save(D+f'{ch}_down.png')
    if ch=='reset':
        # pedestal = second biggest component of reset_idle
        im,l2,comps,a,fg=key('raw/reset_idle.jpg')
        comps.sort(reverse=True);m=l2==comps[1][1]
        o=np.zeros(a.shape[:2]+(4,),np.uint8);o[...,:3]=a;o[...,3]=m*255;o=Image.fromarray(o);o=o.crop(o.getbbox());w,h=o.size;o=o.resize((round(w*s),round(h*s)),Image.LANCZOS);o.save(D+'o_pedestal.png');print('pedestal',o.size)
print(meta)
# general on foot: crop the pilot from the mech cockpit with a feathered oval mask
if not only or 'general' in only:
    g=Image.open(D+'general_idle.png').crop((172,0,236,95));a=np.asarray(g).astype(float)
    h,w=a.shape[:2];yy,xx=np.mgrid[0:h,0:w];cx=w*.55;d=((xx-cx)/(w*.52))**2+((yy-h*.42)/(h*.62))**2
    m=np.clip((1.0-d)/0.12,0,1);m[int(h*.55):,:]=np.maximum(m[int(h*.55):,:],np.clip((1-np.abs(xx[int(h*.55):,:]-cx)/(w*.48))/0.15,0,1))
    a[...,3]*=m;o=Image.fromarray(a.astype(np.uint8));o=o.crop(o.getbbox())
    for p in ['idle','attack','hit']:o.save(D+f'gen_{p}.png')
    dd=o.rotate(-80,expand=True);dd.crop(dd.getbbox()).save(D+'gen_down.png')
