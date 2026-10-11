# key Le Général à pied (raw/genf_*.jpg, magenta bg, faces LEFT) -> gen_{idle,attack,hit,call,down}
from PIL import Image
import numpy as np
from scipy import ndimage
HT=196
fr={}
for p in ['idle','attack','hit','call']:
    a=np.asarray(Image.open(f'raw/genf_{p}.jpg').convert('RGB')).astype(float)
    bd=np.concatenate([a[:4].reshape(-1,3),a[-4:].reshape(-1,3),a[:,:4].reshape(-1,3),a[:,-4:].reshape(-1,3)]);bg=np.median(bd,0)
    d=np.sqrt(((a-bg)**2).sum(-1));al=np.clip((d-28)/40,0,1)
    lab,n=ndimage.label(al>.5);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1))
    keep=np.isin(lab,1+np.where(sz>max(150,sz.max()*.004))[0]);al*=ndimage.binary_dilation(keep,iterations=1)
    r,g,b=a[...,0],a[...,1],a[...,2];edge=ndimage.binary_dilation(al<.98,iterations=2)&(al>0)
    sp=edge&(r>g+50)&(b>g+30);m=(r+b)/2
    r=np.where(sp,g+(r-g)*.55,r);b=np.where(sp,g+(b-g)*.55,b)
    im=Image.fromarray(np.dstack([r,g,b,al*255]).astype(np.uint8),'RGBA');fr[p]=im.crop(im.getbbox())
s=HT/fr['idle'].height
for p,im in fr.items():
    im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS);im.save(f'assets/sprites/gen_{p}.png');print(p,im.size)
h=Image.open('assets/sprites/gen_hit.png');dd=h.rotate(-80,expand=True,resample=Image.BICUBIC);dd.crop(dd.getbbox()).save('assets/sprites/gen_down.png')
