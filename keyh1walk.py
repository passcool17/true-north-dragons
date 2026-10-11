# Camionneur walk: raw/h1w_{a,b,c}.jpg (magenta, facing right) -> hero1_walk, walk2 (+2px bob), walk3; common scale from a, hip-centred
from PIL import Image
import numpy as np
from scipy import ndimage
H=Image.open('assets/sprites/hero1_idle.png').height
def key(f):
    a=np.asarray(Image.open(f).convert('RGB')).astype(float)
    bd=np.concatenate([a[:4].reshape(-1,3),a[-4:].reshape(-1,3),a[:,:4].reshape(-1,3),a[:,-4:].reshape(-1,3)]);bg=np.median(bd,0)
    d=np.sqrt(((a-bg)**2).sum(-1));al=np.clip((d-40)/45,0,1)
    lab,n=ndimage.label(al>.5);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1))
    keep=np.isin(lab,1+np.where(sz>max(120,sz.max()*.003))[0]);al*=ndimage.binary_dilation(keep,iterations=1)
    r,g,b=a[...,0],a[...,1],a[...,2];edge=ndimage.binary_dilation(al<.98,iterations=2)&(al>0)
    sp=edge&(r>g+50)&(b>g+30);r=np.where(sp,g+(r-g)*.5,r);b=np.where(sp,g+(b-g)*.5,b)
    im=Image.fromarray(np.dstack([r,g,b,al*255]).astype(np.uint8),'RGBA');return im.crop(im.getbbox())
fr={k:key(f'raw/h1w_{k}.jpg') for k in 'abc'};s=H/fr['a'].height
for k,n in zip('abc',['walk','walk2','walk3']):
    im=fr[k].resize((round(fr[k].width*s),round(fr[k].height*s)),Image.LANCZOS)
    if k=='b':c=Image.new('RGBA',(im.width,im.height+4));c.alpha_composite(im,(0,0));im=c
    a=np.asarray(im)[...,3]>128;h=im.height;xs=np.where(a[int(h*.3):int(h*.55)].any(0))[0];hip=(xs.min()+xs.max())/2
    half=int(max(hip,im.width-hip))+1;c=Image.new('RGBA',(2*half,h));c.alpha_composite(im,(int(half-hip),0));c.save(f'assets/sprites/hero1_{n}.png');print(n,c.size)
