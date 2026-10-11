# remove sunglasses from hero1/hero2 frames: find dark lens pixels just under the headband, paint skin + small eyes
from PIL import Image
import numpy as np
from scipy import ndimage
S='raw/orig_glasses/';O='assets/sprites/'
P=['idle','walk','punch','kick','hit','jumpkick','special','stick','shovel']
def band(a,h):
    r,g,b=[a[...,i].astype(int) for i in range(3)]
    if h=='hero1':return (r>140)&(g<70)&(b<70)&(a[...,3]>200)
    return (b>120)&(r<90)&(b-r>60)&(a[...,3]>200)
def fix(h,p,dbg=None):
    im=Image.open(S+f'{h}_{p}.png').convert('RGBA');a=np.asarray(im).copy();H,W=a.shape[:2]
    bm=band(a,h);bm[int(H*.45):]=False
    lab,n=ndimage.label(bm)
    if not n:bm[0,0]=True;lab,n=ndimage.label(bm)
    sz=ndimage.sum(bm,lab,range(1,n+1));
    # headband = component; ignore tails: take the component, then restrict to columns where its row-span is thin & topmost
    cand=[(ndimage.find_objects(lab)[i][0].start,i+1) for i in range(n) if sz[i]>=15];k=min(cand)[1] if cand else 1+int(np.argmax(sz));ys,xs=np.where(lab==k)
    # the band across the forehead is the part furthest in facing dir (right side); tails trail left
    x1=xs.max();x0=max(xs.min(),x1-30)
    sel=(xs>=x0);by=int(np.percentile(ys[sel],90))+1
    rgb=a[...,:3].astype(int);lum=rgb.max(-1)
    reg=np.zeros((H,W),bool);reg[by:by+8,x0:x1+3]=True
    dark=reg&(lum<70)&(a[...,3]>150)
    lab2,n2=ndimage.label(dark);
    sz2=ndimage.sum(dark,lab2,range(1,n2+1));keep=[i+1 for i,s in enumerate(sz2) if s>=4]
    m=np.isin(lab2,keep)
    m=ndimage.binary_dilation(m,iterations=1)&reg&(a[...,3]>150)&(lum<130)
    if m.sum()<30:
        sk_=(rgb[...,0]>150)&(rgb[...,0]>rgb[...,1]+20)&(rgb[...,1]>rgb[...,2])
        d=(lum<70)&(a[...,3]>150);d[int(H*.5):]=0
        l3,n3=ndimage.label(d);cs=[]
        for i,sl in enumerate(ndimage.find_objects(l3)):
            hh=sl[0].stop-sl[0].start;ww=sl[1].stop-sl[1].start
            if 6<=ww<=34 and 2<=hh<=10:
                mm=l3==i+1;ring=ndimage.binary_dilation(mm,iterations=2)&~mm
                sf=(sk_&ring).sum()/max(1,ring.sum())
                if sf>=0.25:cs.append((sf,mm,sl))
        if not cs:return im,0
        cs.sort(key=lambda c:-c[0]);b=cs[0][2];reg=np.zeros((H,W),bool);mm=np.zeros((H,W),bool)
        for sf,m1,sl in cs:
            if abs(sl[1].start-b[1].start)<22 and abs(sl[0].start-b[0].start)<8:
                mm|=m1;reg[max(0,sl[0].start-1):sl[0].stop+1,max(0,sl[1].start-1):sl[1].stop+1]=True
        m=ndimage.binary_dilation(mm,iterations=1)&reg&(a[...,3]>150)&(lum<130)
    yy,xx=np.where(m)
    # skin sample: pixels right below the mask that are skin-like
    sk=[];
    for y,x in zip(yy,xx):
        for dy in range(2,8):
            if y+dy<H:
                c=rgb[y+dy,x]
                if c[0]>150 and c[0]>c[1]+20 and c[1]>c[2] and not m[y+dy,x]:sk.append(c);break
    if not sk:return im,0
    return paint(a,m,rgb,lum,h,H,W,im)
def paint(a,m,rgb,lum,h,H,W,im):
    yy,xx=np.where(m)
    sk=[]
    for y,x in zip(yy,xx):
        for dy in range(2,8):
            if y+dy<H:
                c=rgb[y+dy,x]
                if c[0]>150 and c[0]>c[1]+20 and c[1]>c[2] and not m[y+dy,x]:sk.append(c);break
    if not sk:return im,0
    skin=np.median(np.array(sk),0)
    ys0,ys1=yy.min(),yy.max()
    for y,x in zip(yy,xx):
        t=(y-ys0)/max(1,ys1-ys0);sh=0.82+0.12*t
        a[y,x,:3]=np.clip(skin*sh,0,255)
    # eyes: split mask columns into two lenses by largest gap / halves
    cols=np.unique(xx);mid=cols[len(cols)//2]
    gaps=np.diff(cols)
    if gaps.size and gaps.max()>1:mid=cols[np.argmax(gaps)]+1
    eye_y=int(round(ys0+(ys1-ys0)*0.45))
    brow=np.array([70,40,25]) if h=='hero1' else np.array([110,105,100])
    for part in [cols[cols<mid],cols[cols>=mid]]:
        if part.size<2:continue
        cx=int(round(part.mean()));w=2
        for dx in range(-w//2,w-w//2):
            x=cx+dx
            if 0<=x<W and a[eye_y,x,3]>150:a[eye_y,x,:3]=[215,200,185]
            
        for bx in range(cx-2,cx+2):
            if 0<=bx<W and m[ys0,bx]:a[ys0,bx,:3]=brow
        px=cx+ (1 if True else 0)
        if 0<=px<W:a[eye_y,px,:3]=[40,25,20];
        if 0<=px<W and eye_y+1<H and m[eye_y+1,px]:a[eye_y+1,px,:3]=np.clip(skin*.7,0,255)
    return Image.fromarray(a),int(m.sum())
import sys
for h in ['hero1','hero2']:
    for p in P:
        o,n=fix(h,p);o.save(O+f'{h}_{p}.png');print(h,p,n)
MAN={('hero2','hit'):(27,7,38,13),('hero1','hit'):(31,9,42,14),('hero1','special'):(96,12,111,16),('hero1','stick'):(58,13,76,17)}
for (h,p),(x0,y0,x1,y1) in MAN.items():
    im=Image.open(S+f'{h}_{p}.png').convert('RGBA');a=np.asarray(im).copy();H,W=a.shape[:2]
    rgb=a[...,:3].astype(int);lum=rgb.max(-1)
    m=np.zeros((H,W),bool);m[y0:y1,x0:x1]=True;m&=(lum<120)&(a[...,3]>150)
    o,n=paint(a,m,rgb,lum,h,H,W,im);o.save(O+f'{h}_{p}.png');print('man',h,p,n)
    pass
for h,(x0,y0,x1,y1) in {'hero1':(15,21,27,31),'hero2':(26,37,34,49)}.items():
    im=Image.open(S+f'{h}_down.png').convert('RGBA');a=np.asarray(im).copy();rgb=a[...,:3].astype(int);lum=rgb.max(-1)
    m=np.zeros(lum.shape,bool);m[y0:y1,x0:x1]=True;m&=(lum<120)&(a[...,3]>150)
    sk=rgb[y0-2:y1+2,x0-4:x1+6].reshape(-1,3);sk=sk[(sk[:,0]>150)&(sk[:,0]>sk[:,1]+20)];skin=np.median(sk,0)
    for y,x in zip(*np.where(m)):a[y,x,:3]=np.clip(skin*(0.8+0.1*(x-x0)/(x1-x0)),0,255)
    xs=np.where(m.any(0))[0];cx=int(xs.mean())
    for ey in (y0+3,y1-4):
        a[ey,cx,:3]=[215,200,185];a[ey+1,cx,:3]=[215,200,185];a[ey,cx+1,:3]=[40,25,20]
    Image.fromarray(a).save(O+f'{h}_down.png');print('down',h,m.sum())
