'use strict';
// Detailed 16-bit style sprites: shaded parts + dark outline, cached per pose/frame.
const IMG={};['stage1','stage2','ending','title'].forEach(n=>{const i=new Image();i.src='assets/'+n+'.png';IMG[n]=i;});
function sh(hex,a){let n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(a>0?v+(255-v)*a:v*(1+a))));return'#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1);}
function bx(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);if(w>2&&h>2){c.fillStyle=sh(col,.25);c.fillRect(x,y,1,h-1);c.fillRect(x,y,w-1,1);c.fillStyle=sh(col,-.35);c.fillRect(x+w-2,y+1,2,h-1);c.fillRect(x+1,y+h-1,w-1,1);}}
const OUT='#120a18';
const SP={
 trucker:{skin:'#e8a878',gi:'#d4202a',pants:'#ecebe6',belt:'#1a1a1a',band:'#d4202a',shades:1,beard:'#5a3418',hair:'#4a2a12',feet:'skin',leaf:1,vest:1},
 reporter:{skin:'#b97a4e',gi:'#2050c8',pants:'#ecebe6',belt:'#1a1a1a',band:'#2050c8',shades:1,hair:'#1c1410',feet:'skin',mic:1,vest:1},
 taxman:{skin:'#e0a880',gi:'#a89058',pants:'#5a4c34',belt:'#5a4c34',hair:'#3a2a1a',hat:'#3a3428',feet:'#1a1410',clip:1,coat:1},
 bureau:{skin:'#c88e64',gi:'#3c4458',pants:'#2e3446',belt:'#2e3446',hair:'#2a2420',glasses:1,feet:'#111',tie:'#c02020',suit:1,stamp:1},
 bot:{skin:'#9aa4b4',gi:'#6c7688',pants:'#4c5466',belt:'#c02020',feet:'#30343e',robot:1},
 boss:{skin:'#d09a70',gi:'#1e1e26',pants:'#16161c',belt:'#16161c',hair:'#6a6a70',feet:'#000',tie:'#d4a020',suit:1,brief:1,glasses:1}};
function body(c,s,pose,f){
 const sk=s.skin,gi=s.gi,pa=s.pants,armCol=s.vest?sk:gi,hand=s.robot?'#c8d0dc':sk;
 const bob=pose==='idle'?(f%2):0,lean=pose==='hurt'?-4:pose==='punch'?3:0;
 const st=pose==='walk'?[-5,0,5,0][f%4]:0;
 const T=-52+bob, feetC=s.feet==='skin'?sk:s.feet;
 // back arm
 const backArm=()=>{if(pose==='punch'){bx(c,-12+lean,T+4,8,12,sh(armCol,-.2));bx(c,-10+lean,T+14,8,7,sh(hand,-.2));}
  else if(pose==='hurt'){bx(c,-18+lean,T+1,10,7,sh(armCol,-.2));bx(c,-24+lean,T-4,7,7,sh(hand,-.2));}
  else{bx(c,-10+lean-st/2,T+3,8,13,sh(armCol,-.2));bx(c,-6+lean-st/2,T-2,7,9,sh(armCol,-.2));bx(c,-6+lean-st/2,T-7,8,7,sh(hand,-.2));
   if(s.clip){bx(c,-11+lean,T+4,11,14,'#9a6a3a');c.fillStyle='#f4f0e0';c.fillRect(-10+lean,T+6,9,10);c.fillStyle='#555';for(let i=0;i<4;i++)c.fillRect(-9+lean,T+7+i*2,6,1);}}};
 // legs
 const legs=()=>{if(pose==='kick'){bx(c,-9,-30,10,26,sh(pa,-.15));bx(c,-11,-4,12,4,feetC);bx(c,0,T+18,30,10,pa);bx(c,28,T+16,9,11,feetC);}
  else{bx(c,-11-st,-30,10,26,sh(pa,-.15));bx(c,-14-st,-4,13,4,sh(feetC,-.1));bx(c,1+st,-30,10,26,pa);bx(c,2+st,-4,13,4,feetC);
   if(!s.robot){c.fillStyle=sh(pa,-.3);c.fillRect(5+st,-26,1,18);}}};
 const torso=()=>{const x=-12+lean;
  if(s.robot){bx(c,x-1,T,26,24,gi);bx(c,x+4,T+5,14,10,'#20242c');c.fillStyle='#ff3030';c.fillRect(x+6,T+8,10,3);c.fillStyle='#fff';c.font='bold 5px monospace';c.fillText('',0,0);bx(c,x+2,T+18,20,4,'#c02020');return;}
  for(let i=0;i<24;i++){const w=i<6?28:i<14?26:22,xx=x+12-w/2;c.fillStyle=i<2?sh(gi,.2):gi;c.fillRect(xx,T+i,w,1);c.fillStyle=sh(gi,.18);c.fillRect(xx,T+i,2,1);c.fillStyle=sh(gi,-.35);c.fillRect(xx+w-3,T+i,3,1);}
  if(s.vest){for(let i=0;i<13;i++){const w=Math.max(0,14-i);c.fillStyle=sk;c.fillRect(x+12-w/2+2,T+i,w,1);}
   c.fillStyle=sh(sk,-.3);c.fillRect(x+14,T+3,1,8);c.fillRect(x+9,T+6,4,1);c.fillRect(x+15,T+6,4,1);
   c.fillStyle=sh(gi,-.45);for(let i=0;i<13;i++){const w=Math.max(0,14-i);c.fillRect(x+12-w/2+1,T+i,1,1);c.fillRect(x+12+w/2+2,T+i,1,1);}
   c.fillStyle=sh(gi,-.3);c.fillRect(x+4,T+12,1,8);c.fillRect(x+20,T+12,1,8);if(s.leaf)leaf(c,x+16,T+14,'#fff');}
  if(s.suit||s.coat){c.fillStyle='#f0f0f0';c.fillRect(x+13,T,6,12);if(s.tie){bx(c,x+15,T+1,3,13,s.tie);}c.fillStyle=sh(gi,-.4);c.fillRect(x+12,T,1,16);c.fillRect(x+19,T,1,16);}
  if(s.coat){bx(c,x,T+20,24,10,gi);}
  bx(c,x,T+20,24,4,s.belt);if(s.vest){bx(c,x+15,T+22,5,8,s.belt);}};
 const head=()=>{const x=-7+lean*1.3,y=T-17;
  if(s.robot){bx(c,x-1,y,16,15,'#aab4c4');bx(c,x+3,y+4,12,6,'#14181e');c.fillStyle='#ff3030';c.fillRect(x+4,y+6,10,2);c.fillStyle='#ff3030';c.fillRect(x+6,y-6,2,2);c.fillStyle='#888';c.fillRect(x+6,y-4,2,4);return;}
  bx(c,x,y,14,16,sk);c.fillStyle=sh(sk,-.3);c.fillRect(x+1,y+6,3,4);// ear
  bx(c,x-1,y-2,15,6,s.hair);if(s.hat){bx(c,x-3,y-1,20,3,s.hat);bx(c,x,y-6,14,6,s.hat);}
  if(s.band){bx(c,x-1,y+2,16,3,s.band);c.fillStyle=s.band;c.fillRect(x-6,y+3,5,2);c.fillRect(x-8,y+5,4,2);}
  if(s.shades){c.fillStyle='#0c0c10';c.fillRect(x+6,y+6,9,3);c.fillStyle='#8cf';c.fillRect(x+8,y+6,2,1);}
  else if(s.glasses){c.fillStyle='#222';c.fillRect(x+7,y+6,8,1);c.fillRect(x+7,y+6,3,3);c.fillRect(x+12,y+6,3,3);c.fillStyle='#000';c.fillRect(x+11,y+8,1,1);}
  else{c.fillStyle='#000';c.fillRect(x+10,y+7,2,2);c.fillRect(x+9,y+5,4,1);}
  c.fillStyle=sh(sk,-.35);c.fillRect(x+13,y+9,2,2);// nose
  if(s.beard){bx(c,x+3,y+10,12,7,s.beard);c.fillStyle=sh(s.beard,-.4);c.fillRect(x+10,y+12,4,1);}
  else{c.fillStyle=pose==='hurt'?'#600':'#5a2a20';c.fillRect(x+10,y+12,pose==='hurt'?3:4,pose==='hurt'?3:1);}};
 const frontArm=()=>{const x=lean;if(s.vest&&pose!=='punch'){bx(c,x+6,T-1,10,9,sh(gi,.05));}
  if(pose==='punch'){bx(c,x+4,T+2,12,9,armCol);bx(c,x+14,T+2,16,8,armCol);bx(c,x+29,T,9,10,hand);c.fillStyle=sh(hand,-.4);c.fillRect(x+33,T+3,1,6);if(s.mic){bx(c,x+31,T-8,3,8,'#333');bx(c,x+29,T-13,7,6,'#999');}}
  else if(pose==='hurt'){bx(c,x+2,T+1,8,12,armCol);bx(c,x+6,T+10,7,7,hand);}
  else{bx(c,x+4+st/2,T+2,9,14,armCol);c.fillStyle=sh(armCol,-.3);c.fillRect(x+7+st/2,T+5,1,6);bx(c,x+9+st/2,T-2,8,10,armCol);bx(c,x+9+st/2,T-8,9,8,hand);
   if(s.mic){bx(c,x+12,T-14,3,7,'#333');bx(c,x+10,T-20,7,7,'#999');c.fillStyle='#666';c.fillRect(x+11,T-18,5,1);}
   if(s.stamp){bx(c,x+15,T-6,4,8,'#5a3a1a');bx(c,x+12,T+1,10,5,'#b02020');}
   if(s.brief){bx(c,x+8,T+12,16,12,'#5a3a1a');c.fillStyle='#d4a020';c.fillRect(x+14,T+11,4,2);}}};
 backArm();legs();torso();head();frontArm();
}
function leaf(c,x,y,col){c.fillStyle=col;[[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4]].forEach(([a,b])=>c.fillRect(x+a,y+b,1,1));}
const CACHE={};
function sprite(kind,pose,f){const key=kind+pose+f;if(CACHE[key])return CACHE[key];
 const a=document.createElement('canvas');a.width=96;a.height=96;const ac=a.getContext('2d');ac.translate(40,90);body(ac,SP[kind],pose,f);
 const o=document.createElement('canvas');o.width=96;o.height=96;const oc=o.getContext('2d');
 for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[1,-1],[-1,1]])oc.drawImage(a,dx,dy);
 oc.globalCompositeOperation='source-in';oc.fillStyle=OUT;oc.fillRect(0,0,96,96);oc.globalCompositeOperation='source-over';oc.drawImage(a,0,0);
 return CACHE[key]=o;}
function kindOf(f){if(f.player)return f.id?'reporter':'trucker';if(f.type)return f.type;return f.pal===PAL.reporter?'reporter':'trucker';}
// override character drawing: (sx,sy)=feet position on canvas
drawFighter=function(f,sx,sy){const k=kindOf(f);let pose=f.pose,fr=pose==='walk'?(f.anim>>3)%4:pose==='idle'?(f.anim>>5)%2:0;
 X.save();X.translate(Math.round(sx),Math.round(sy));
 if(pose==='down'){X.rotate(-Math.PI/2*f.face);X.translate(0,8);pose='hurt';}
 X.scale(f.face,1);const img=sprite(k,pose,fr);X.drawImage(img,-40,-90);
 if(f.flash>0&&(f.flash>>1)%2){X.globalCompositeOperation='lighter';X.globalAlpha=.6;X.drawImage(img,-40,-90);X.globalAlpha=1;X.globalCompositeOperation='source-over';}
 X.restore();};
// backgrounds: image tiled + foreground props
function tiled(img,par,y=0){if(!img.complete||!img.width)return;const w=img.width,o=((camX*par)%w+w)%w;for(let x=-o;x<W;x+=w)X.drawImage(img,Math.round(x),y);}
function crate(x,y){bx(X,x,y,20,18,'#9a6a34');X.fillStyle='#5a3a18';X.fillRect(x+2,y+8,16,2);X.fillRect(x+9,y+2,2,14);X.strokeStyle=OUT;X.strokeRect(x+.5,y+.5,20,18);}
function bag(x,y){X.fillStyle=OUT;X.beginPath();X.ellipse(x+10,y+9,11,10,0,0,7);X.fill();X.fillStyle='#22222c';X.beginPath();X.ellipse(x+10,y+9,10,9,0,0,7);X.fill();X.fillStyle='#4a4a5a';X.fillRect(x+5,y+3,3,4);X.fillStyle='#22222c';X.fillRect(x+8,y-3,4,4);}
function can(x,y){bx(X,x,y,16,22,'#8a8e96');X.fillStyle='#5a5e66';X.fillRect(x+3,y+4,1,16);X.fillRect(x+8,y+4,1,16);X.fillRect(x+12,y+4,1,16);bx(X,x-2,y-3,20,4,'#a0a4ac');X.strokeStyle=OUT;X.strokeRect(x-1.5,y-2.5,19,24);}
function lampFG(x){bx(X,x,40,4,176,'#1c1c24');bx(X,x-8,36,20,6,'#2a2a34');X.fillStyle='#fff2b0';X.fillRect(x-6,42,16,3);}
function props(list){for(const[wx,t]of list){const x=wx-camX;if(x<-60||x>W+40)continue;if(t==='crate'){crate(x,186);crate(x+6,168);}else if(t==='bag'){bag(x,190);bag(x+16,192);}else if(t==='can')can(x,186);else if(t==='truck')bigTruck(x,96);}}
function bigTruck(x,y){X.save();X.translate(x,y);X.fillStyle=OUT;X.fillRect(-2,-2,164,46);bx(X,0,0,120,38,'#c81e28');bx(X,4,4,112,30,'#d83038');leafBig(44,6,3,'#fff');X.fillStyle='#fff';X.font='bold 8px monospace';X.fillText('FREEDOM CONVOY',8,32);
 bx(X,122,6,36,34,'#b01820');bx(X,136,10,18,12,'#9cd4ff');bx(X,118,-12,4,20,'#888');X.fillStyle='#111';X.fillRect(0,38,160,6);for(const w of[10,30,90,110,140]){X.fillStyle=OUT;X.beginPath();X.arc(w+6,46,8,0,7);X.fill();X.fillStyle='#555';X.beginPath();X.arc(w+6,46,3,0,7);X.fill();}X.restore();}
function leafBig(x,y,s,c){X.fillStyle=c;const m=["....#....","...###...","#..###..#","##.###.##","#########",".#######.","..#####..","....#....","....#...."];m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='#')X.fillRect(x+i*s,y+j*s,s,s)}));}
function snowFX(){for(let i=0;i<60;i++){const x=((i*73+tick*(.3+i%3*.2))-(camX*.8))%W,y=(i*41+tick*(.5+i%4*.2))%H;X.fillStyle='#fff';X.fillRect((x+W)%W,y,i%5?1:2,i%5?1:2);}}
const P1=[[260,'bag'],[330,'crate'],[520,'can'],[600,'truck'],[900,'bag'],[1010,'crate'],[1240,'can'],[1330,'bag'],[1600,'crate']];
const P2=[[240,'can'],[480,'bag'],[760,'crate'],[1010,'can'],[1290,'bag'],[1500,'crate']];
LEVELS[0].bg=function(){tiled(IMG.stage1,1);X.fillStyle='rgba(10,10,40,.25)';X.fillRect(0,0,W,H);props(P1);snowFX();};
LEVELS[1].bg=function(){tiled(IMG.stage2,1);X.fillStyle='rgba(10,10,40,.2)';X.fillRect(0,0,W,H);
 // iron fence
 const o=((camX)%8+8)%8;X.fillStyle=OUT;X.fillRect(0,116,W,2);X.fillRect(0,132,W,2);for(let x=-o;x<W;x+=8){X.fillRect(x,112,2,24);X.fillRect(x-1,110,4,3);}
 props(P2);snowFX();};
function fgLamps(){for(let i=-1;i<4;i++){const x=i*220-((camX*1.25)%220);lampFG(x);}}
// Slim arcade HUD
hud=function(){
 players.forEach((p,i)=>{const x=i?W-92:4,y=4;X.fillStyle='rgba(0,0,0,.55)';X.fillRect(x,y,88,20);
  X.save();X.beginPath();X.rect(x+1,y+1,18,18);X.clip();X.drawImage(sprite(i?'reporter':'trucker','idle',0),x+1-33,y+1-21);X.restore();X.strokeStyle='#ffd800';X.strokeRect(x+.5,y+.5,19,19);
  X.font='bold 6px monospace';X.textAlign='left';X.textBaseline='top';X.fillStyle=i?'#7cf':'#f77';X.fillText((i?'2P ':'1P ')+p.name+'  x'+Math.max(0,p.lives),x+22,y+2);
  X.fillStyle='#300';X.fillRect(x+22,y+11,62,5);X.fillStyle=p.power>0&&tick%8<4?'#fa2':p.hp>30?'#ffd800':'#f42';X.fillRect(x+22,y+11,62*Math.max(0,p.hp)/100,5);X.strokeStyle='#000';X.strokeRect(x+21.5,y+10.5,63,6);});
 X.font='bold 7px monospace';X.textAlign='center';X.fillStyle='#fff';X.fillText(String(score).padStart(7,'0'),W/2,5);
 if(players.length<2&&state==='play'&&(tick>>5)%2&&!isTouch){X.font='6px monospace';X.fillStyle='#7cf';X.fillText('2P: PRESS ,',W-46,8);}
 const b=enemies.find(e=>e.boss);if(b){X.font='bold 7px monospace';X.fillStyle='#f66';X.fillText(b.name,W/2,H-19);X.fillStyle='#000';X.fillRect(W/2-80,H-11,160,6);X.fillStyle='#d22';X.fillRect(W/2-79,H-10,158*Math.max(0,b.hp)/b.max,4);}
 else{const e=enemies.find(e=>e.flash>0);if(e){X.font='bold 6px monospace';X.fillStyle='#ddd';X.fillText(e.name,W/2,15);}}
 floaters.forEach(f=>{if(f.blink&&(tick>>3)%2)return;text(f.s,f.fixed?W/2:f.x-camX,f.y,f.c,f.fixed?10:8,'center')});
 if(paused)text('PAUSED',W/2,90,'#fff',16,'center');};
// entity draw with bigger shadow, boss scale
drawEnt=function(f){const x=f.x-camX,s=f.boss?1.45:1;X.fillStyle='rgba(0,0,0,.4)';X.beginPath();X.ellipse(x,f.y,14*s,4*s,0,0,7);X.fill();
 if(f.player&&!f.alive)return;if(f.player&&f.inv>0&&f.hurtT<=0&&(tick>>2)%2)return;
 if(s!==1){X.save();X.translate(x,f.y-f.z);X.scale(s,s);drawFighter(f,0,0);X.restore();}else drawFighter(f,x,f.y-f.z);
 if(f.player&&f.power>0&&tick%6<3){X.fillStyle='#fa2';X.fillRect(x-12,f.y-60,3,3);X.fillRect(x+10,f.y-40,3,3);}};
// impact flash star on spark
const _spark=spark;spark=function(x,y){_spark(x,y);fx.push({x,y,vx:0,vy:0,t:5,c:'#fff',s:14,star:1});};
// title & ending
title=function(){X.fillStyle='#000';X.fillRect(0,0,W,H);if(IMG.title.complete)X.drawImage(IMG.title,(W-IMG.title.width)/2,0);X.fillStyle='rgba(0,0,30,.35)';X.fillRect(0,0,W,H);snowFX();
 const j=Math.min(1,stateT/45),hy=190-Math.sin(j*Math.PI)*70-(1-j)*120;
 [[110,1,'trucker'],[274,-1,'reporter']].forEach(([x,fc,k],i)=>{X.save();X.translate(x,hy);X.scale(1.3,1.3);drawFighter({player:1,id:i,face:fc,pose:stateT<45?(i?'punch':'kick'):'idle',anim:tick,flash:0},0,0);X.restore();});
 const ty=Math.min(26,-70+Math.max(0,stateT-40)*3);
 X.font='bold 30px Impact, monospace';X.textAlign='center';X.textBaseline='top';
 for(const[t,yy]of[['TRUE NORTH',ty],['DRAGONS',ty+32]]){X.lineWidth=5;X.strokeStyle=OUT;X.strokeText(t,W/2,yy);X.fillStyle='#b01010';X.fillText(t,W/2+2,yy+2);const g=X.createLinearGradient(0,yy,0,yy+30);g.addColorStop(0,'#fff6a0');g.addColorStop(.5,'#ffd800');g.addColorStop(1,'#e07000');X.fillStyle=g;X.fillText(t,W/2,yy);}
 if(stateT>80){leafBig(W/2-9,ty+66,2,'#e02020');
  if((tick>>4)%2)text(isTouch?'TAP TO START':'PRESS START',W/2,178,'#fff',10,'center');
  if(!isTouch)text('Press , for 2 PLAYERS',W/2,192,'#7cf',7,'center');
  text('HI '+hi+'  ©2026 PASSCOOL STUDIO · FICTIONAL SATIRE',W/2,205,'#aaa',6,'center');}};
drawCafe=function(){X.fillStyle='#000';X.fillRect(0,0,W,H);if(IMG.ending.complete)X.drawImage(IMG.ending,-((stateT*.2)%Math.max(1,IMG.ending.width-W)),0);snowFX();};
// patch render: use new cafe, impact stars, fg lamps
const _render=render;render=function(){
 if(state==='victory'||state==='tbc'){X.save();drawCafe();[0,1].forEach(i=>{X.save();X.translate(120+i*150,206);X.scale(1.2,1.2);drawFighter({player:1,id:i,face:i?-1:1,pose:(tick>>4)%2?'punch':'idle',anim:tick,flash:0},0,0);X.restore();});
  if(state==='victory'){X.fillStyle=OUT;X.fillRect(24,8,W-48,80);X.fillStyle='#1838a8';X.fillRect(26,10,W-52,76);X.fillStyle='#08104a';X.fillRect(28,12,W-56,72);VMSG.slice(0,typeT).split('\n').forEach((l,i)=>text(l,36,16+i*9.5,i===0?'#ffd800':'#fff',8));}
  else{X.fillStyle='rgba(0,0,0,.65)';X.fillRect(0,0,W,H);text('TO BE CONTINUED...',W/2,84,'#ffd800',18,'center');text('FINAL SCORE '+score,W/2,112,'#fff',9,'center');if(stateT>90&&(tick>>4)%2)text('PRESS START',W/2,140,'#aaa',8,'center');}
  X.restore();return;}
 _render();
 if(state==='play'||state==='intro'||state==='clear'){X.save();fgLamps();X.restore();
  for(const f of fx)if(f.star){const x=f.x-camX,y=f.y;X.fillStyle='#fff';X.fillRect(x-7,y-1,14,3);X.fillRect(x-1,y-7,3,14);X.fillRect(x-4,y-4,9,9);}}};
