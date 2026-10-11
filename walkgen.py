# 4-frame walk cycle for hero1 (Camionneur) from the base walk frame: contact A, pass, contact B (legs mirrored), pass
from PIL import Image
import numpy as np
D='assets/sprites/';w=Image.open('raw/hero1_walk_base.png').convert('RGBA');W,H=w.size
a=np.asarray(w).astype(float)
T0,T1=104,124   # hip band: feather from original to warped legs
row=np.where(a[T1,:,3]>128)[0];hip=(row.min()+row.max())/2
def warp(fn,pad=0):
    out=np.zeros((H+pad,W+0,4));out[pad:]=a.copy()
    for y in range(T0,H):
        t=min(1,(y-T0)/(T1-T0))
        xs=np.arange(W);src=fn(xs,y)
        s=np.clip(np.round(src).astype(int),0,W-1);valid=(src>=0)&(src<=W-1)
        r=a[y][s]*valid[:,None]
        both=(a[y][:,3]>200)&(r[:,3]>200)
        bl=a[y]*(1-t)+r*t;hard=np.where((t>=.5),r.T,a[y].T).T
        out[y+pad]=np.where(both[:,None],bl,hard)
    return out
def save(arr,n,bob=0):
    arr=np.clip(arr,0,255).astype(np.uint8);im=Image.fromarray(arr)
    if bob:c=Image.new('RGBA',im.size);c.alpha_composite(im.crop((0,0,W,T0)),(0,-bob));c.alpha_composite(im.crop((0,T0,W,im.height)),(0,T0-bob));
    # keep bottom aligned: simply shift whole upper body up by bob, stretch-free gap filled by legs top rows
    im.save(D+f'hero1_{n}.png')
A=a.copy();Image.fromarray(A.astype(np.uint8)).save(D+'hero1_walk.png')
B=warp(lambda x,y:2*hip-x)
save(B,'walk3')
P=warp(lambda x,y:hip+(x-hip)/max(.45,1-0.55*min(1,(y-T0)/(H-T0))))
# body bob: lift everything above T0 by 3px (pass pose is the high point)
Pi=np.clip(P,0,255).astype(np.uint8);im=Image.fromarray(Pi);c=Image.new('RGBA',(W,H));c.alpha_composite(im.crop((0,T0-3,W,H)),(0,T0-3));c.alpha_composite(im.crop((0,0,W,T0+2)),(0,-3));c.save(D+'hero1_walk2.png')
print(W,H,hip)
