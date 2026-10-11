# key out #00FF00 backgrounds: tight distance to pure green so muted-green banknotes survive; despill only on the edge band
from PIL import Image
import numpy as np, sys
from scipy import ndimage
D='assets/sprites/'
def key(f):
    a=np.asarray(Image.open(f).convert('RGB')).astype(float);r,g,b=a[...,0],a[...,1],a[...,2]
    d=np.sqrt(r**2+(255-g)**2+b**2)
    al=np.clip((d-70)/60,0,1)
    lab,n=ndimage.label(al>.5);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1))
    keep=np.isin(lab,1+np.where(sz>=40)[0]);al=al*ndimage.binary_dilation(keep,iterations=2)
    edge=ndimage.binary_dilation(al<.98,iterations=3)
    lim=np.maximum(r,b);g2=np.where(edge&(g>lim+10),lim+np.minimum(g-lim,25)*.4,g)
    o=np.dstack([r,g2,b,al*255]).astype(np.uint8);im=Image.fromarray(o,'RGBA');return im.crop(im.getbbox())
import sys
JOBS=[('fin',182),('bank',200),('tele',146),('pron',146),('clim',142)]
for c,hh in [j for j in JOBS if len(sys.argv)<2 or j[0] in sys.argv[1:]]:
    fr={p:key(f'raw/{c}_{p}.jpg') for p in ['idle','attack','hit']};s=hh/fr['idle'].height
    for p,im in fr.items():im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS);im.save(D+f'{c}_{p}.png');print(c,p,im.size)
    h=Image.open(D+f'{c}_hit.png');dd=h.rotate(-80,expand=True,resample=Image.BICUBIC);dd.crop(dd.getbbox()).save(D+f'{c}_down.png')
