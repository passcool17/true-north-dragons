# key raw/noglasses_v2 hero frames (magenta bg), scale each to the height of the previous frame of same pose, mirror wrong-facing ones
from PIL import Image
import numpy as np, sys
from scipy import ndimage
R='raw/noglasses_v2/';OLD='raw/orig_glasses/';D='assets/sprites/'
MIRROR=set(sys.argv[1:])
def key(f):
    a=np.asarray(Image.open(f).convert('RGB')).astype(float)
    bd=np.concatenate([a[:4].reshape(-1,3),a[-4:].reshape(-1,3),a[:,:4].reshape(-1,3),a[:,-4:].reshape(-1,3)]);bg=np.median(bd,0)
    d=np.sqrt(((a-bg)**2).sum(-1));al=np.clip((d-40)/45,0,1)
    lab,n=ndimage.label(al>.5);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1))
    keep=np.isin(lab,1+np.where(sz>max(120,sz.max()*.003))[0]);al*=ndimage.binary_dilation(keep,iterations=1)
    r,g,b=a[...,0],a[...,1],a[...,2];edge=ndimage.binary_dilation(al<.98,iterations=2)&(al>0)
    sp=edge&(r>g+50)&(b>g+30);r=np.where(sp,g+(r-g)*.5,r);b=np.where(sp,g+(b-g)*.5,b)
    im=Image.fromarray(np.dstack([r,g,b,al*255]).astype(np.uint8),'RGBA');return im.crop(im.getbbox())
for h,ps in [('hero1',['idle','punch','kick','hit','jumpkick','special','stick','shovel']),('hero2',['idle','walk','punch','kick','hit','jumpkick','special','stick','shovel'])]:
    for p in ps:
        im=key(R+f'{h}_{p}.jpg')
        if f'{h}_{p}' in MIRROR:im=im.transpose(Image.FLIP_LEFT_RIGHT)
        th=Image.open(OLD+f'{h}_{p}.png').height;s=th/im.height
        im=im.resize((round(im.width*s),th),Image.LANCZOS);im.save(D+f'{h}_{p}.png');print(h,p,im.size)
    hit=Image.open(D+f'{h}_hit.png');dd=hit.rotate(38,expand=True,resample=Image.BICUBIC);dd.crop(dd.getbbox()).save(D+f'{h}_down.png')
