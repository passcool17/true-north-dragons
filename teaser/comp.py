import sys,glob,random
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
MODE=sys.argv[1]; W,H=(1920,1080) if MODE=='h' else (1080,1920)
FD='/usr/share/fonts/truetype/sand-box/google/'
BIG=FD+'Bungee/Bungee-Regular.ttf'; PX=FD+'Press Start 2P/PressStart2P-Regular.ttf'
def F(p,s,c={}):
    k=(p,s)
    if k not in c:c[k]=ImageFont.truetype(p,s)
    return c[k]
fr={d:sorted(glob.glob(f'frames/{d}/*.png')) for d in ['l1','l2','l3','l4','l5','l6','l7','h1','h2','h3','b1','b2','b3','b7','p2','sv']}
logo=Image.open('../assets/logo.png').convert('RGBA')
# timeline: (clip, start_frame, nframes, caption, subcaption, color)
R,Y,Wt,C='#ff2a2a','#ffd800','#ffffff','#3cf'
T=[('l1',8,36,"ILS ONT CONFINÉ LE PAYS.","NIVEAU 1 · CONFINEMENT",R),
   ('l2',5,30,"VIDÉ LE BUDGET.","NIVEAU 2 · OTTAWA, LA NUIT",Y),
   ('l3',5,30,"IMPRIMÉ L'ARGENT.","NIVEAU 3 · LA COLLINE DU PARLEMENT",Y),
   ('l4',5,30,"FERMÉ LA FRONTIÈRE.","NIVEAU 4 · LA FRONTIÈRE",Y),
   ('l5',5,30,"TAXÉ LE PÉTROLE.","NIVEAU 5 · LES CHAMPS PÉTROLIFÈRES",Y),
   ('l6',5,30,"CENSURÉ LA VÉRITÉ.","NIVEAU 6 · LA TOUR DU MINISTÈRE",Y),
   ('l7',5,36,"ET DÉCLENCHÉ LA 3E GUERRE.","NIVEAU 7 · TROISIÈME GUERRE MONDIALE",R),
   ('h1',0,45,"LE CAMIONNEUR","COUP SPÉCIAL : KLAXON DU CONVOI !",C),
   ('h2',0,45,"LE REPORTER","LA VÉRITÉ FRAPPE FORT",C),
   ('h3',0,45,"LA FERMIÈRE DE L'ALBERTA","NOUVELLE HÉROÏNE",C),
   ('b1',2,26,"LE GRAND RÉINITIALISEUR","BOSS",R),
   ('b2',4,30,"LA VICE-PREMIÈRE MINISTRE DES FINANCES","BOSS",R),
   ('b3',4,30,"LE BANQUIER CENTRAL","BOSS",R),
   ('b7',4,34,"LE GÉNÉRAL APOCALYPSE","BOSS FINAL",R),
   ('p2',0,45,"2 JOUEURS EN CO-OP","MÊME ÉCRAN · MANETTE OU CLAVIER",Y),
   ('sv',0,40,"MODE SURVIE","VAGUES SANS FIN · RECORDS LOCAUX",Y),
   ('l5',20,20,"JOUE SUR MOBILE","PLEIN ÉCRAN · COMMANDES TACTILES",C)]
INTRO=60; END=105
def outline(d,xy,t,f,fill,sw,anchor='mm'):
    d.text(xy,t,font=f,fill=fill,anchor=anchor,stroke_width=sw,stroke_fill='black')
def fit(t,path,size,maxw):
    while F(path,size).getlength(t)>maxw and size>20:size-=4
    return F(path,size)
def place(g):
    """put game frame on canvas, return canvas and game rect"""
    if MODE=='h':
        return g.resize((1920,1080),Image.NEAREST),(0,0,1920,1080)
    bg=g.resize((3413,1920),Image.NEAREST).crop((1166,0,2246,1920)).filter(ImageFilter.GaussianBlur(30))
    bg=ImageEnhance.Brightness(bg).enhance(.45)
    gi=g.resize((1080,608),Image.NEAREST);y0=656;bg.paste(gi,(0,y0));return bg,(0,y0,1080,y0+608)
def caption(im,rect,t,sub,col,k,n):
    d=ImageDraw.Draw(im)
    pop=min(1,k/4)  # slam in
    if MODE=='h':
        f=fit(t,BIG,int(110*(1.25-0.25*pop)),1800);outline(d,(W//2,H-200),t,f,col,8)
        if sub:outline(d,(W//2,H-90),sub,F(PX,30),'#fff',5)
    else:
        f=fit(t,BIG,int(100*(1.25-0.25*pop)),1000)
        words=t.split(' ');lines=[t]
        if f.size<80 and len(words)>2:
            h=len(words)//2;lines=[' '.join(words[:h]),' '.join(words[h:])];f=max([fit(l,BIG,100,1000) for l in lines],key=lambda x:-x.size)
        y=rect[1]-110-(len(lines)-1)*f.size//2
        for i,l in enumerate(lines):outline(d,(W//2,y+i*int(f.size*1.1)),l,f,col,8)
        if sub:
            sf=fit(sub,PX,34,1020);outline(d,(W//2,rect[3]+80),sub,sf,'#fff',5)
    if k<2:  # flash
        im.paste(Image.blend(im,Image.new('RGB',im.size,'white'),.6-.3*k))
    return im
def logo_img(scale):
    lw=int((1100 if MODE=='h' else 980)*scale);return logo.resize((lw,int(lw*logo.height/logo.width)),Image.NEAREST)
out=sys.stdout.buffer
# intro: logo slam over darkened l7 frames
for i in range(INTRO):
    g=Image.open(fr['l7'][i%len(fr['l7'])]).convert('RGB');im,rect=place(g);im=ImageEnhance.Brightness(im).enhance(.3)
    s=max(1,2.2-i*.12) if i<12 else 1;L=logo_img(s);im.paste(L,((W-L.width)//2+(random.randint(-8,8) if 10<i<18 else 0),(H-L.height)//2-(60 if MODE=='h' else 120)),L)
    d=ImageDraw.Draw(im)
    if i>20:outline(d,(W//2,H//2+(330 if MODE=='h' else 420)),"LE CANADA A BESOIN DE TOI.",fit("LE CANADA A BESOIN DE TOI.",BIG,80,W-80),'#fff',7)
    if 10<=i<13:im=Image.blend(im,Image.new('RGB',im.size,'white'),.7)
    out.write(im.tobytes())
for clip,s0,n,t,sub,col in T:
    fs=fr[clip];n+=8;s0=max(0,min(s0,len(fs)-n))
    for k in range(n):
        g=Image.open(fs[min(len(fs)-1,s0+k)]).convert('RGB');im,rect=place(g)
        if clip=='h1' and k<18:  # riposte line before hero
            caption(im,rect,"IL EST TEMPS DE RIPOSTER.",None,R,k,n)
        else:caption(im,rect,t,sub,col,k-(18 if clip=='h1' else 0),n)
        if clip=='l5' and t.startswith('JOUE'):
            d=ImageDraw.Draw(im);cx,cy=(W-260,170) if MODE=='h' else (W//2,330)
            d.rounded_rectangle((cx-90,cy-150,cx+90,cy+150),30,fill='#111',outline='#ffd800',width=8);d.rectangle((cx-70,cy-115,cx+70,cy+115),fill='#336')
            outline(d,(cx,cy),"▶",F(FD+'Bungee/Bungee-Regular.ttf',70),'#ffd800',4)
        out.write(im.tobytes())
# end card
for i in range(END):
    g=Image.open(fr['b7'][i%len(fr['b7'])]).convert('RGB');im,_=place(g);im=ImageEnhance.Brightness(im).enhance(.25)
    L=logo_img(.8 if MODE=='h' else .9);ly=(110 if MODE=='h' else 380);im.paste(L,((W-L.width)//2,ly),L)
    d=ImageDraw.Draw(im);y=ly+L.height+(70 if MODE=='h' else 120)
    pulse=1+.05*((i//8)%2)
    t="JOUEZ GRATUITEMENT";outline(d,(W//2,y),t,fit(t,BIG,int(110*pulse),W-80),'#ffd800',9)
    u="passcool17.github.io/true-north-dragons";outline(d,(W//2,y+(130 if MODE=='h' else 160)),u,fit(u,PX,44,W-60),'#fff',6)
    t2="NAVIGATEUR · MOBILE · MANETTE";outline(d,(W//2,y+(210 if MODE=='h' else 260)),t2,fit(t2,PX,30,W-80),'#3cf',5)
    if i<3:im=Image.blend(im,Image.new('RGB',im.size,'white'),.6)
    out.write(im.tobytes())
sys.stderr.write(f'frames {INTRO+sum(x[2]+8 for x in T)+END}\n')
