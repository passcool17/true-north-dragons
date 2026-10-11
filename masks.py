# paint light-blue surgical masks on activist enemies (per-frame quads: top-A, top-B, bottom-B, bottom-A ; "back" = ear side given by EAR index)
from PIL import Image, ImageDraw
import numpy as np
S='raw/orig_nomask/';O='assets/sprites/'
# quad points: (front-top, back-top, back-bottom, front-bottom)
Q={('pron','idle'):[(63,34),(82,32),(80,44),(66,47)],('pron','attack'):[(52,46),(68,43),(68,53),(56,56)],('pron','hit'):[(97,28),(108,24),(112,36),(102,40)],
 ('pronM','idle'):[(66,33),(84,31),(82,45),(70,48)],('pronM','attack'):[(42,46),(57,44),(58,56),(46,58)],('pronM','hit'):[(93,30),(108,27),(110,40),(98,43)],
 ('clim','idle'):[(88,26),(70,27),(72,38),(84,38)],('clim','attack'):[(150,26),(134,27),(136,38),(147,39)],('clim','hit'):[(65,25),(50,26),(52,37),(62,38)],
 ('climM','idle'):[(93,24),(75,25),(77,38),(89,39)],('climM','attack'):[(106,24),(124,24),(122,38),(112,40)],('climM','hit'):[(55,18),(39,20),(42,32),(52,32)],
 ('snitch','idle'):[(46,28),(66,27),(65,41),(50,42)]}
def lerp(a,b,t):return (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
for (c,p),q in Q.items():
    im=Image.open(S+f'{c}_{p}.png').convert('RGBA');W,H=im.size;a=np.asarray(im).copy()
    m=Image.new('L',(W,H),0);ImageDraw.Draw(m).polygon(q,fill=255);mm=(np.asarray(m)>0)&(a[...,3]>128)
    ys,xs=np.where(mm)
    ft,bt,bb,fb=q
    for y,x in zip(ys,xs):
        # u: front->back (0..1), v: top->bottom
        u=np.clip(((x-ft[0])*(bt[0]-ft[0])+(y-ft[1])*(bt[1]-ft[1]))/max(1,(bt[0]-ft[0])**2+(bt[1]-ft[1])**2),0,1)
        v=np.clip(((y-(ft[1]+(bt[1]-ft[1])*u)))/max(1,((fb[1]+(bb[1]-fb[1])*u)-(ft[1]+(bt[1]-ft[1])*u))),0,1)
        base=np.array([178,220,242])*(1-.18*u)+np.array([0,0,0])
        if any(abs(v-k)<.07 for k in (.33,.6,.85)):base=base*.82
        a[y,x,:3]=np.clip(base,0,255);a[y,x,3]=255
    # outline
    e=mm&~(np.roll(mm,1,0)&np.roll(mm,-1,0)&np.roll(mm,1,1)&np.roll(mm,-1,1))
    a[e,:3]=[70,120,160]
    im2=Image.fromarray(a);d=ImageDraw.Draw(im2)
    ear=(bt[0]+(bt[0]-ft[0])*.18,bt[1]+(bb[1]-bt[1])*.25)
    d.line([lerp(bt,bb,.05),ear],fill=(235,242,248,255),width=1);d.line([lerp(bt,bb,.95),ear],fill=(235,242,248,255),width=1)
    im2.save(O+f'{c}_{p}.png')
# regenerate downs from hit (enemies: rotate -80) and mirror climate idle frames (source faced right)
for c in ['pron','pronM','clim','climM']:
    h=Image.open(O+f'{c}_hit.png');dd=h.rotate(-80,expand=True,resample=Image.BICUBIC);dd.crop(dd.getbbox()).save(O+f'{c}_down.png')
for c in ['clim','climM']:
    Image.open(O+f'{c}_idle.png').transpose(Image.FLIP_LEFT_RIGHT).save(O+f'{c}_idle.png')
print('ok')
