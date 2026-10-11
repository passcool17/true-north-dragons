# key Camionneur walk frames raw/h1walk{1,2,3}.jpg (pinkish-magenta bg sampled from border) -> hero1_walk, walk2, walk3
from PIL import Image
import numpy as np
from scipy import ndimage
H=151
for i in (1,2,3):
    a=np.asarray(Image.open(f'raw/h1walk{i}.jpg').convert('RGB')).astype(float)
    bd=np.concatenate([a[:4].reshape(-1,3),a[-4:].reshape(-1,3),a[:,:4].reshape(-1,3),a[:,-4:].reshape(-1,3)]);bg=np.median(bd,0)
    d=np.sqrt(((a-bg)**2).sum(-1));al=np.clip((d-45)/45,0,1)
    lab,n=ndimage.label(al>.5);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1));big=1+np.argmax(sz)
    keep=ndimage.binary_dilation(lab==big,iterations=2)|np.isin(lab,1+np.where(sz>sz.max()*.02)[0])
    al*=keep
    edge=ndimage.binary_dilation(al<.98,iterations=2)
    r,g,b=a[...,0],a[...,1],a[...,2];sp=edge&(b>g+40)&(r>g+60)
    b=np.where(sp,np.minimum(b,g+20),b)
    im=Image.fromarray(np.dstack([r,g,b,al*255]).astype(np.uint8),'RGBA');im=im.crop(im.getbbox())
    s=H/im.height;im=im.resize((round(im.width*s),H),Image.LANCZOS)
    im.save(f'assets/sprites/hero1_walk{"" if i==1 else i}.png');print(i,im.size,bg)
