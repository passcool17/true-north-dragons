'use strict';
// Sprite/background renderer using pre-made 16-bit art (assets/). Logical canvas 384x216, drawn at 2x.
const OUT='#120a18';
const IMG={};['stage1','stage2','ending'].forEach(n=>{const i=new Image();i.src='assets/'+n+'.jpg';IMG[n]=i;});
const CH={trucker:'hero1',reporter:'hero2',taxman:'tax',bureau:'bur',bot:'bot',boss:'boss'};
const POSES={hero1:['idle','punch','kick','hit','down'],hero2:['idle','punch','kick','hit','down'],tax:['idle','attack','hit','down'],bur:['idle','attack','hit','down'],bot:['idle','attack','hit','down'],boss:['idle','attack','hit','down']};
const SPR={},WHITE={};
for(const c in POSES){SPR[c]={};for(const p of POSES[c]){const i=new Image();i.src='assets/sprites/'+c+'_'+p+'.png';SPR[c][p]=i;}}
function whiteOf(img){if(WHITE[img.src])return WHITE[img.src];const o=document.createElement('canvas');o.width=img.width;o.height=img.height;const c=o.getContext('2d');c.drawImage(img,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);return WHITE[img.src]=o;}
function kindOf(f){if(f.player)return f.id?'reporter':'trucker';return f.type||'trucker';}
function frameFor(c,pose,isHero){if(pose==='down')return'down';if(pose==='hurt')return'hit';if(pose==='punch')return isHero?'punch':'attack';if(pose==='kick')return isHero?'kick':'attack';return'idle';}
drawFighter=function(f,sx,sy){const c=CH[kindOf(f)],hero=c.startsWith('hero');const img=SPR[c][frameFor(c,f.pose,hero)];if(!img||!img.complete||!img.width)return;
 const w=img.width/2,h=img.height/2;let sqx=1,sqy=1,by=0;
 if(f.pose==='walk'){const t=f.anim*.35;by=-Math.abs(Math.sin(t))*2;sqy=1+Math.sin(t*2)*.02;sqx=1-Math.sin(t*2)*.02;}
 else if(f.pose==='idle'){sqy=1+Math.sin(f.anim*.08)*.012;}
 const flip=hero?f.face<0:f.face>0;
 X.save();X.translate(Math.round(sx),Math.round(sy+by));X.scale(flip?-sqx:sqx,sqy);
 // attack frames are wider: shift so body stays roughly in place (extend forward)
 let ox=-w/2;if(f.pose==='punch'||f.pose==='kick'){const iw=SPR[c].idle.width/2;ox=hero?-iw/2:-(w-iw/2);}
 X.drawImage(img,ox,-h,w,h);
 if(f.flash>0&&(f.flash>>1)%2){X.globalAlpha=.75;X.drawImage(whiteOf(img),ox,-h,w,h);X.globalAlpha=1;}
 X.restore();};
drawEnt=function(f){const x=f.x-camX,s=f.boss?1.5:1;X.fillStyle='rgba(0,0,0,.45)';X.beginPath();X.ellipse(x,f.y,18*s,4.5*s,0,0,7);X.fill();
 if(f.player&&!f.alive)return;if(f.player&&f.inv>0&&f.hurtT<=0&&(tick>>2)%2)return;
 drawFighter(f,x,f.y-f.z);
 if(f.player&&f.power>0&&tick%6<3){X.fillStyle='#fa2';X.fillRect(x-16,f.y-60,3,3);X.fillRect(x+14,f.y-40,3,3);X.fillRect(x-4,f.y-80,3,3);}};
function cover(img,par){if(!img.complete||!img.width)return;const w=img.width/2,h=img.height/2;const o=((camX*par)%w+w)%w;for(let x=-o;x<W;x+=w)X.drawImage(img,Math.round(x),0,w+.5,h);}
function snowFX(n=50){X.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<n;i++){const x=((i*73+tick*(.3+i%3*.2))-(camX*.8))%W,y=(i*41+tick*(.5+i%4*.2))%H;X.fillRect((x+W)%W,y,i%5?1:1.5,i%5?1:1.5);}}
LEVELS[0].bg=function(){cover(IMG.stage1,1);snowFX();};
LEVELS[1].bg=function(){cover(IMG.stage2,1);snowFX(30);};
const _spark=spark;spark=function(x,y){_spark(x,y);fx.push({x,y,vx:0,vy:0,t:5,c:'#fff',s:14,star:1});};
function portrait(i,x,y){const img=SPR[i?'hero2':'hero1'].idle;if(!img.complete)return;const sw=img.width*.42,sx=img.width*.29;X.drawImage(img,sx,0,sw,sw,x,y,18,18);}
hud=function(){
 players.forEach((p,i)=>{const x=i?W-92:4,y=4;X.fillStyle='rgba(0,0,0,.55)';X.fillRect(x,y,88,20);X.fillStyle='#223';X.fillRect(x+1,y+1,18,18);portrait(i,x+1,y+1);X.strokeStyle='#ffd800';X.lineWidth=1;X.strokeRect(x+.5,y+.5,19,19);
  X.font='bold 6px monospace';X.textAlign='left';X.textBaseline='top';X.fillStyle=i?'#7cf':'#f77';X.fillText((i?'2P ':'1P ')+p.name+'  x'+Math.max(0,p.lives),x+22,y+2);
  X.fillStyle='#300';X.fillRect(x+22,y+11,62,5);X.fillStyle=p.power>0&&tick%8<4?'#fa2':p.hp>30?'#ffd800':'#f42';X.fillRect(x+22,y+11,62*Math.max(0,p.hp)/100,5);X.strokeStyle='#000';X.strokeRect(x+21.5,y+10.5,63,6);});
 X.font='bold 7px monospace';X.textAlign='center';X.textBaseline='top';X.fillStyle='#fff';X.fillText(String(score).padStart(7,'0'),W/2,5);
 if(players.length<2&&state==='play'&&(tick>>5)%2&&!isTouch){X.font='6px monospace';X.fillStyle='#7cf';X.fillText('2P: PRESS ,',W-46,27);}
 const b=enemies.find(e=>e.boss);if(b){X.font='bold 7px monospace';X.fillStyle='#f66';X.fillText(b.name,W/2,H-19);X.fillStyle='#000';X.fillRect(W/2-80,H-11,160,6);X.fillStyle='#d22';X.fillRect(W/2-79,H-10,158*Math.max(0,b.hp)/b.max,4);}
 else{const e=enemies.find(e=>e.flash>0);if(e){X.font='bold 6px monospace';X.fillStyle='#ddd';X.fillText(e.name,W/2,15);}}
 floaters.forEach(f=>{if(f.blink&&(tick>>3)%2)return;text(f.s,f.fixed?W/2:f.x-camX,f.y,f.c,f.fixed?10:8,'center')});
 if(paused)text('PAUSED',W/2,90,'#fff',16,'center');};
function leafBig(x,y,s,c){X.fillStyle=c;const m=["....#....","...###...","#..###..#","##.###.##","#########",".#######.","..#####..","....#....","....#...."];m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='#')X.fillRect(x+i*s,y+j*s,s,s)}));}
title=function(){X.fillStyle='#000';X.fillRect(0,0,W,H);if(IMG.stage1.complete)X.drawImage(IMG.stage1,0,0,W,H);X.fillStyle='rgba(0,0,25,.62)';X.fillRect(0,0,W,H);snowFX();
 const j=Math.min(1,stateT/45),hy=208-Math.sin(j*Math.PI)*70-(1-j)*140;
 [[96,1],[288,-1]].forEach(([x,fc],i)=>drawFighter({player:1,id:i,face:fc,pose:stateT<45?(i?'punch':'kick'):'idle',anim:tick,flash:0},x,hy));
 const ty=Math.min(22,-70+Math.max(0,stateT-40)*3);
 X.font='bold 30px Impact, "Arial Black", monospace';X.textAlign='center';X.textBaseline='top';
 for(const[t,yy]of[['TRUE NORTH',ty],['DRAGONS',ty+32]]){X.lineWidth=5;X.strokeStyle=OUT;X.strokeText(t,W/2,yy);X.fillStyle='#b01010';X.fillText(t,W/2+2,yy+2);const g=X.createLinearGradient(0,yy,0,yy+30);g.addColorStop(0,'#fff6a0');g.addColorStop(.5,'#ffd800');g.addColorStop(1,'#e07000');X.fillStyle=g;X.fillText(t,W/2,yy);}
 if(stateT>80){leafBig(W/2-9,ty+66,2,'#e02020');
  if((tick>>4)%2)text(isTouch?'TAP TO START':'PRESS START',W/2,170,'#fff',10,'center');
  if(!isTouch)text('Press , for 2 PLAYERS',W/2,186,'#7cf',7,'center');
  text('HI '+hi+'  ©2026 PASSCOOL STUDIO · FICTIONAL SATIRE',W/2,203,'#aaa',6,'center');}};
const _render=render;render=function(){
 if(state==='victory'||state==='tbc'){X.save();if(IMG.ending.complete)X.drawImage(IMG.ending,0,0,W,H);
  [0,1].forEach(i=>drawFighter({player:1,id:i,face:i?-1:1,pose:(tick>>4)%2?'punch':'idle',anim:tick,flash:0},140+i*104,212));
  if(state==='victory'){X.fillStyle=OUT;X.fillRect(24,8,W-48,80);X.fillStyle='#1838a8';X.fillRect(26,10,W-52,76);X.fillStyle='rgba(8,16,74,.95)';X.fillRect(28,12,W-56,72);VMSG.slice(0,typeT).split('\n').forEach((l,i)=>text(l,36,16+i*9.5,i===0?'#ffd800':'#fff',8));}
  else{X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);text('TO BE CONTINUED...',W/2,84,'#ffd800',18,'center');text('FINAL SCORE '+score,W/2,112,'#fff',9,'center');if(stateT>90&&(tick>>4)%2)text('PRESS START',W/2,140,'#aaa',8,'center');}
  X.restore();return;}
 _render();
 if(state==='play'||state==='intro'||state==='clear')for(const f of fx)if(f.star){const x=f.x-camX,y=f.y;X.fillStyle='#fff';X.fillRect(x-7,y-1,14,3);X.fillRect(x-1,y-7,3,14);X.fillRect(x-4,y-4,9,9);}};
