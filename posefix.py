# post-processing after keyout.py for the weapon poses / new enemies (run after: python3 keyout.py hero1 hero2 drone lob chair mega)
from PIL import Image, ImageOps
import numpy as np, shutil
from scipy import ndimage as nd
D='assets/sprites/'
for n in ['hero1_stick','hero2_stick','hero1_shovel','hero2_shovel']:
  a=np.asarray(Image.open(D+n+'.png')).astype(float);R,G,B,A=a[...,0],a[...,1],a[...,2],a[...,3]
  pk=np.clip(np.minimum(R-G,B-G)/170,0,1);m=(pk>0.12)&(A>0);t=np.clip((G-10)/245,0,1)
  a[...,0][m]=255;a[...,1][m]=255;a[...,2][m]=255;a[...,3][m]=(A*t*1.1).clip(0,255)[m]
  Image.fromarray(a.astype(np.uint8)).save(D+n+'.png')
ImageOps.mirror(Image.open(D+'lob_idle.png')).save(D+'lob_idle.png')
shutil.copy(D+'drone_hit.png',D+'drone_down.png')
a=np.asarray(Image.open(D+'chair_attack.png')).astype(int);m=(a[...,0]-a[...,1]>50)&(a[...,2]-a[...,1]>15)&(a[...,2]>70);a[...,3][m]=0;Image.fromarray(a.astype(np.uint8)).save(D+'chair_attack.png')
# standalone office chair (throwable) cut from chair_idle: dark neutral pixels on the chair side
i=Image.open(D+'chair_idle.png').crop((58,40,104,125));a=np.asarray(i).astype(int);mx=a[...,:3].max(-1);mn=a[...,:3].min(-1)
keep=nd.binary_opening((a[...,3]>0)&(mx-mn<28)&(mx<120),iterations=1);l,n=nd.label(keep);sz=nd.sum(keep,l,range(1,n+1));keep=np.isin(l,[k+1 for k,v in enumerate(sz) if v>40])
a[...,3]=np.where(keep,a[...,3],0);h,w=a.shape[:2];a[:int(h*.78),:int(w*.36),3]=0;a[:int(h*.86),:int(w*.42),3]=0
o=Image.fromarray(a.astype(np.uint8));o.crop(o.getbbox()).save(D+'o_chair.png')
