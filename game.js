'use strict';
// TRUE NORTH DRAGONS — fictional, family-friendly political satire beat 'em up. All characters are fictional.
const C=document.getElementById('c'),X=C.getContext('2d');
const W=384,H=216,FLOOR_TOP=150,FLOOR_BOT=208,OUT='#120a18';
function fit(){const s=Math.min(innerWidth/W,(innerHeight-16)/H);C.style.width=W*s+'px';C.style.height=H*s+'px';}
addEventListener('resize',fit);fit();

// ---------- AUDIO ----------
let AC=null,master=null,muted=false,musicTimer=null,musicStep=0,curSong=null;
function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.25;master.connect(AC.destination);}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function tone(f,d,type='square',v=.3,t0=0,slide=0){if(!AC||muted)return;const t=AC.currentTime+t0,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);}
function noise(d,v=.3,hp=800){if(!AC||muted)return;const n=AC.sampleRate*d|0,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='highpass';f.frequency.value=hp;g.gain.value=v;s.connect(f);f.connect(g);g.connect(master);s.start();}
const SFX={kick(){noise(.1,.4,600);tone(120,.1,'square',.25,0,-70)},hit(){noise(.12,.5,300);tone(90,.12,'sawtooth',.3,0,-50)},heavy(){noise(.25,.6,120);tone(70,.25,'sawtooth',.4,0,-40)},whiff(){noise(.05,.1,3000)},poof(){noise(.35,.25,200)},pick(){[660,880,1320].forEach((f,i)=>tone(f,.08,'square',.2,i*.06))},coin(){tone(988,.06,'square',.2);tone(1319,.25,'square',.2,.06)},hurt(){tone(300,.2,'sawtooth',.3,0,-220)},start(){[523,659,784,1047].forEach((f,i)=>tone(f,.12,'square',.25,i*.08))},type(){tone(1200,.02,'square',.08)},boss(){[110,104,98,92].forEach((f,i)=>tone(f,.25,'sawtooth',.3,i*.2))},jump(){tone(300,.12,'square',.15,0,400)},wave(){noise(.4,.4,150);tone(60,.4,'sawtooth',.3,0,60)},tally(){tone(1500,.03,'square',.1)}};
const N=n=>440*Math.pow(2,(n-69)/12);
const BASE={bass:[40,40,52,40,43,43,55,43,38,38,50,38,45,45,57,47],lead:[64,0,67,0,69,71,0,69,67,0,64,0,62,64,0,0,64,0,67,0,69,71,74,0,72,71,69,67,69,0,0,0]};
const LEAD2=[64,67,71,0,69,67,64,0,62,64,67,69,71,0,69,0,72,71,69,67,64,0,62,0,64,0,67,69,64,0,0,0];
function mk(tr,bpm,alt){return{bpm,bass:BASE.bass.map(n=>n+tr),lead:(alt?LEAD2:BASE.lead).map(n=>n?n+tr:0)};}
const SONGS={title:{bpm:132,bass:[45,45,57,45,43,43,55,43,41,41,53,41,43,43,55,47],lead:[69,0,72,74,76,0,74,72,74,0,71,67,69,0,0,0,69,0,72,74,76,79,81,79,77,76,74,72,71,0,0,0]},
 s1:mk(0,140,0),s2:mk(-2,150,1),s3:mk(3,156,0),s4:mk(-4,146,1),s5:mk(1,164,1),
 boss:{bpm:168,bass:[36,36,48,36,37,37,49,37,36,36,48,36,39,39,51,38],lead:[60,63,66,0,60,63,67,0,60,63,66,0,72,71,70,69]},
 win:{bpm:120,bass:[48,48,55,55,53,53,55,55,48,48,57,57,53,55,48,0],lead:[72,76,79,84,0,79,81,0,77,81,84,0,79,0,84,0]},
 cont:{bpm:100,bass:[45,0,45,0,44,0,44,0,43,0,43,0,42,0,42,0],lead:[69,0,0,0,68,0,0,0,67,0,0,0,66,0,0,0]}};
function playSong(name){if(curSong===name)return;curSong=name;musicStep=0;if(musicTimer)clearInterval(musicTimer);const s=SONGS[name];if(!s)return;musicTimer=setInterval(()=>{if(!AC||muted||paused)return;const sp=60/s.bpm/2;const b=s.bass[musicStep%s.bass.length];if(b)tone(N(b),sp*.9,'triangle',.35);const l=s.lead[musicStep%s.lead.length];if(l)tone(N(l),sp*.8,'square',.12);if(musicStep%4===0)noise(.04,.15,4000);if(musicStep%8===4)noise(.08,.2,300);musicStep++;},60000/s.bpm/2);}

// ---------- INPUT ----------
const keys={},pressed={};
const KM={KeyW:'p1up',KeyS:'p1down',KeyA:'p1left',KeyD:'p1right',KeyJ:'p1punch',KeyK:'p1kick',KeyL:'p1jump',
 ArrowUp:'p2up',ArrowDown:'p2down',ArrowLeft:'p2left',ArrowRight:'p2right',Comma:'p2punch',Period:'p2kick',Slash:'p2jump',Numpad1:'p2punch',Numpad2:'p2kick',Numpad3:'p2jump',
 Enter:'start',Space:'start',NumpadEnter:'start'};
addEventListener('keydown',e=>{audio();const k=KM[e.code];if(e.code==='KeyM')muted=!muted;if(e.code==='KeyP'&&state==='play')paused=!paused;if(k){if(!keys[k])pressed[k]=1;keys[k]=1;e.preventDefault();}});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)keys[k]=0;});
const isTouch='ontouchstart'in window||navigator.maxTouchPoints>0;
if(isTouch){document.getElementById('touch').style.display='block';document.getElementById('help').style.display='none';}
document.querySelectorAll('.tb[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{audio();e.preventDefault();if(!keys[k])pressed[k]=1;keys[k]=1;});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>keys[k]=0));});
const dp=document.getElementById('t-dpad');
function dpad(e){const r=dp.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;keys.p1left=dx<-15;keys.p1right=dx>15;keys.p1up=dy<-15;keys.p1down=dy>15;}
dp.addEventListener('pointerdown',e=>{audio();dp.setPointerCapture(e.pointerId);dpad(e)});dp.addEventListener('pointermove',e=>{if(e.buttons||e.pressure)dpad(e)});
['pointerup','pointercancel'].forEach(t=>dp.addEventListener(t,()=>{keys.p1left=keys.p1right=keys.p1up=keys.p1down=0}));
C.addEventListener('pointerdown',()=>{audio();pressed.start=1;});

// ---------- ASSETS ----------
const IMG={};['stage1_a','stage1_b','stage2_a','stage2_b','stage3_a','stage3_b','stage4_a','stage4_b','stage5_a','ending'].forEach(n=>{const i=new Image();i.src='assets/'+n+'.jpg';IMG[n]=i;});
const POSES={hero1:['idle','walk','punch','kick','hit','down'],hero2:['idle','walk','punch','kick','hit','down']};
['tax','bur','bot','boss','insp','final'].forEach(c=>POSES[c]=['idle','attack','hit','down']);
const SPR={},WHITE={};for(const c in POSES){SPR[c]={};for(const p of POSES[c]){const i=new Image();i.src='assets/sprites/'+c+'_'+p+'.png';SPR[c][p]=i;}}
const ITEM={};['coffee','syrup','donuts','loonie'].forEach(n=>{const i=new Image();i.src='assets/sprites/item_'+n+'.png';ITEM[n]=i;});
function whiteOf(img){if(WHITE[img.src])return WHITE[img.src];const o=document.createElement('canvas');o.width=img.width;o.height=img.height;const c=o.getContext('2d');c.drawImage(img,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);return WHITE[img.src]=o;}

// ---------- TEXT ----------
function text(s,x,y,col='#fff',size=8,align='left',shadow='#000'){X.font=`bold ${size}px monospace`;X.textAlign=align;X.textBaseline='top';if(shadow){X.fillStyle=shadow;X.fillText(s,Math.round(x)+1,Math.round(y)+1);}X.fillStyle=col;X.fillText(s,Math.round(x),Math.round(y));}
function leafBig(x,y,s,c){X.fillStyle=c;const m=["....#....","...###...","#..###..#","##.###.##","#########",".#######.","..#####..","....#....","....#...."];m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='#')X.fillRect(x+i*s,y+j*s,s,s)}));}

// ---------- DATA ----------
const EN={
 taxman:{spr:'tax',name:'CARBON TAX COLLECTOR',hp:30,spd:.6,dmg:6,pts:100,sc:1},
 bureau:{spr:'bur',name:'RED TAPE BUREAUCRAT',hp:40,spd:.5,dmg:8,pts:150,sc:1},
 bot:{spr:'bot',name:'CENSORSHIP BOT',hp:35,spd:.8,dmg:7,pts:200,sc:1},
 insp:{spr:'insp',name:'PERMIT INSPECTOR',hp:38,spd:.65,dmg:8,pts:180,sc:1},
 bigbur:{spr:'bur',name:'SENIOR UNDER-DEPUTY BUREAUCRAT',hp:160,spd:.5,dmg:12,pts:1500,sc:1.25,boss:1},
 boss:{spr:'boss',name:'THE MEGA-REGULATOR',hp:320,spd:.55,dmg:14,pts:5000,sc:1,boss:1},
 boss2:{spr:'boss',name:'MEGA-REGULATOR (REMATCH)',hp:420,spd:.65,dmg:15,pts:6000,sc:1,boss:1},
 giantinsp:{spr:'insp',name:'THE GRAND PERMIT INSPECTOR',hp:420,spd:.6,dmg:15,pts:6000,sc:1.4,boss:1},
 final:{spr:'final',name:'THE MINISTRY',hp:600,spd:.6,dmg:16,pts:20000,sc:1,boss:1,final:1}};
const STAGES=[
 {title:'OTTAWA AFTER DARK',panels:['stage1_a','stage1_b'],song:'s1',len:1700,snow:1,
  waves:[{at:150,e:['taxman','taxman']},{at:500,e:['bureau','taxman','taxman']},{at:850,e:['bureau','bureau','taxman']},{at:1200,e:['taxman','taxman','bureau','insp']},{at:1600,e:['bigbur','taxman'],boss:1}],items:[[420,'coffee'],[1000,'syrup'],[1300,'coffee']]},
 {title:'PARLIAMENT HILL',panels:['stage2_a','stage2_b'],song:'s2',len:1700,snow:1,
  waves:[{at:150,e:['bureau','bureau','bot']},{at:480,e:['bot','bot','bureau']},{at:820,e:['bot','bureau','bureau','taxman']},{at:1150,e:['bot','bot','bot','bureau']},{at:1600,e:['boss','bureau','bot'],boss:1}],items:[[350,'coffee'],[700,'syrup'],[1100,'donuts']]},
 {title:'THE BORDER',panels:['stage3_a','stage3_b'],song:'s3',len:1900,snow:0,
  waves:[{at:150,e:['taxman','bureau','bot','insp']},{at:500,e:['bot','bot','taxman','taxman','bureau']},{at:900,e:['insp','insp','bureau','bot']},{at:1300,e:['taxman','bureau','bot','insp','bot']},{at:1800,e:['boss2','bigbur'],boss:1}],items:[[400,'coffee'],[800,'syrup'],[1200,'coffee'],[1550,'donuts']]},
 {title:'ALBERTA OIL FIELDS',panels:['stage4_a','stage4_b'],song:'s4',len:1900,snow:1,
  waves:[{at:150,e:['insp','insp','taxman']},{at:500,e:['insp','taxman','taxman','insp']},{at:900,e:['insp','insp','insp','bureau']},{at:1300,e:['taxman','insp','taxman','insp','bot']},{at:1800,e:['giantinsp','insp','insp'],boss:1}],items:[[350,'coffee'],[750,'syrup'],[1150,'donuts'],[1500,'coffee']]},
 {title:'MINISTRY OF APPROVED NEWS',panels:['stage5_a'],song:'s5',len:1900,snow:0,
  waves:[{at:150,e:['bot','bot','bot']},{at:500,e:['bot','bot','bureau','bot']},{at:900,e:['bot','insp','bot','taxman','bot']},{at:1300,e:['bot','bot','bot','bureau','bureau']},{at:1800,e:['final'],boss:1}],items:[[400,'coffee'],[800,'syrup'],[1200,'donuts'],[1600,'coffee']]}];

// ---------- STATE ----------
let state='title',paused=false,tick=0,stage=0,camX=0,camLock=null,players=[],enemies=[],items=[],fx=[],floaters=[],hazards=[],waveIdx=0,score=0,hi=+localStorage.tndHi||0,stateT=0,shake=0,hitstop=0,typeT=0,stageTime=0,tally=null,goT=0,credits=0;
function newPlayer(i){return{id:i,player:true,spr:i?'hero2':'hero1',name:i?'REPORTER':'TRUCKER',x:camX+60+i*30,y:170+i*20,z:0,vz:0,face:1,hp:100,lives:3,pose:'idle',anim:0,atk:0,atkType:'',cd:0,hurtT:0,inv:120,flash:0,combo:0,comboT:0,power:0,alive:true,walkT:0}}
function newEnemy(t,x,y){const d=EN[t],k=1+.18*stage;return{type:t,spr:d.spr,sc:d.sc,name:d.name,x,y,z:0,vz:0,face:-1,hp:d.hp*k,max:d.hp*k,spd:d.spd*(1+.06*stage),dmg:d.dmg*(1+.1*stage),pts:d.pts,pose:'idle',anim:0,atk:0,cd:60+Math.random()*60,hurtT:0,flash:0,dead:0,knock:0,vx:0,boss:!!d.boss,final:!!d.final,think:0,ty:0,side:1,special:240,phase2:0}}
function startGame(two){score=0;credits=0;players=[newPlayer(0)];if(two)players.push(newPlayer(1));startStage(0);SFX.start();}
function startStage(n){stage=n;camX=0;camLock=null;waveIdx=0;enemies=[];fx=[];floaters=[];hazards=[];stageTime=0;goT=0;items=STAGES[n].items.map(([x,k])=>({x,y:172+Math.random()*30,k,taken:0}));players.forEach((p,i)=>{p.x=60+i*30;p.y=170+i*20;p.z=0;p.inv=120;p.atk=0;p.hurtT=0;if(!p.alive&&p.lives>0)p.alive=true;});state='card';stateT=0;playSong(STAGES[n].song);}

// ---------- UPDATE ----------
const inp=(p,a)=>keys['p'+(p.id+1)+a],prs=(p,a)=>pressed['p'+(p.id+1)+a];
function hurtPlayer(t,dmg,dir){if(t.inv>0||t.hurtT>0||!t.alive||t.z>18)return false;t.hp-=dmg;t.flash=10;t.hurtT=t.hp<=0?70:18;t.inv=t.hp<=0?0:40;t.x+=dir*6;t.atk=0;shake=Math.max(shake,4);SFX.hurt();spark(t.x,t.y-48);floaters.push({x:t.x,y:t.y-80,t:30,s:'-'+Math.round(dmg),c:'#f66'});return true;}
function updatePlayer(p){
 if(!p.alive)return;p.anim++;if(p.inv>0)p.inv--;if(p.flash>0)p.flash--;if(p.cd>0)p.cd--;if(p.comboT>0)p.comboT--;else p.combo=0;if(p.power>0)p.power--;
 if(p.z>0||p.vz){p.z+=p.vz;p.vz-=.32;if(p.z<=0){p.z=0;p.vz=0;if(p.atkType==='jkick'){p.atk=0;p.pose='idle';p.atkType='';}}}
 if(p.hurtT>0){p.hurtT--;p.pose=p.hp<=0&&p.hurtT<50?'down':'hurt';if(p.hurtT===0&&p.hp<=0){p.lives--;if(p.lives>0){p.hp=100;p.inv=150;poof(p.x,p.y);}else{p.alive=false;poof(p.x,p.y);}}return;}
 let dx=(inp(p,'right')?1:0)-(inp(p,'left')?1:0),dy=(inp(p,'down')?1:0)-(inp(p,'up')?1:0);
 if(p.atk>0&&p.atkType!=='jkick'){p.atk--;if(p.atk===(p.atkType==='kick'?8:p.atkType==='throw'?10:5))doHit(p);if(p.atk===0)p.pose='idle';return;}
 const sp=p.power?2.1:1.5;p.x+=dx*sp;p.y+=dy*sp*.7;if(dx)p.face=dx;
 const minX=camX+12,maxX=camLock!=null?camLock+W-12:camX+W-12;p.x=Math.max(minX,Math.min(maxX,p.x));p.y=Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,p.y));
 if(p.atkType==='jkick'){p.pose='kick';if(p.atk>0){p.atk--;doHit(p);}return;}
 if(p.z>0){p.pose='hurt'===p.pose?'idle':p.pose;if(prs(p,'punch')||prs(p,'kick')){p.atkType='jkick';p.atk=14;p.pose='kick';SFX.kick();}else p.pose=p.vz>0?'walk':'idle';return;}
 if(dx||dy){p.walkT++;p.pose='walk';}else{p.walkT=0;p.pose='idle';}
 if(prs(p,'jump')){p.vz=5.2;p.z=.1;SFX.jump();return;}
 if(p.cd<=0&&(prs(p,'punch')||prs(p,'kick'))){
  const k=prs(p,'kick');
  // grab & throw: punch a stunned enemy you are touching
  const g=!k&&enemies.find(e=>!e.dead&&!e.boss&&e.hurtT>0&&!e.knock&&Math.abs(e.x-p.x)<26&&Math.abs(e.y-p.y)<10);
  if(g){p.atkType='throw';p.atk=18;p.cd=20;p.pose='punch';p.grab=g;g.x=p.x+p.face*16;return;}
  p.atkType=k?'kick':'punch';p.atk=k?16:11;p.cd=k?14:8;p.pose=p.atkType;(k?SFX.kick:SFX.whiff)();}
}
function damageEnemy(p,e,dmg,heavy){
 e.hp-=dmg;e.flash=10;e.hurtT=heavy||e.hp<=0?44:16;e.knock=heavy||e.hp<=0?1:0;e.vx=p.face*(heavy?3.5:1);if(e.knock&&!e.boss)e.vz=3.2;else if(e.knock)e.vz=1.5;e.face=-p.face;e.atk=0;
 shake=Math.max(shake,heavy?7:3);hitstop=heavy?7:3;spark(e.x,e.y-48*(e.sc||1));floaters.push({x:e.x+(Math.random()*10-5),y:e.y-90*(e.sc||1),t:28,s:String(Math.round(dmg)),c:heavy?'#ff0':'#fff',small:1});
 if(e.hp<=0&&!e.dead){e.dead=1;score+=e.pts;floaters.push({x:e.x,y:e.y-70,t:50,s:'+'+e.pts,c:'#fff'});if(e.boss)SFX.boss();
  if(!e.boss&&Math.random()<.45)items.push({x:e.x,y:e.y,k:'loonie',taken:0,drop:1,vz:3,z:0});if(e.boss)for(let i=0;i<4;i++)items.push({x:e.x-30+i*20,y:e.y,k:'loonie',taken:0,vz:3+i*.5,z:0});}
}
function doHit(p){
 if(p.atkType==='throw'){const g=p.grab;p.grab=null;if(g&&!g.dead){g.x=p.x+p.face*10;damageEnemy(p,g,22*(p.power?1.6:1),true);g.vx=p.face*5;g.vz=4.5;SFX.heavy();
   for(const o of enemies)if(o!==g&&!o.dead&&Math.abs(o.y-g.y)<14&&(o.x-p.x)*p.face>0&&Math.abs(o.x-g.x)<60)damageEnemy(p,o,10,true);}return;}
 const jk=p.atkType==='jkick',reach=jk?52:p.atkType==='kick'?56:48;let any=false;
 for(const e of enemies){if(e.dead||e.hurtT>12||(jk&&e.jkHit===p.anim))continue;const sc=e.sc||1,dx=(e.x-p.x)*p.face;if(dx>-6&&dx<reach*(sc>1?1.1:1)&&Math.abs(e.y-p.y)<14*sc){any=true;
  if(jk){e.jkHit=p.anim;damageEnemy(p,e,16*(p.power?2:1),!e.boss);p.atk=0;continue;}
  p.combo=p.comboT>0?p.combo+1:1;p.comboT=50;const fin=p.combo>=3;const dmg=(p.atkType==='kick'?12:8)*(p.power?2:1)*(fin?1.6:1);
  score+=10*p.combo;damageEnemy(p,e,dmg,fin&&!e.boss||fin&&e.hp<dmg);if(fin){floaters.push({x:e.x,y:e.y-110,t:50,s:'COMBO x'+p.combo+'!',c:'#ff0'});p.combo=0;}}}
 if(any)(p.atkType==='kick'||jk?SFX.kick:SFX.hit)();
}
function updateEnemy(e){
 e.anim++;if(e.flash>0)e.flash--;
 if(e.z>0||e.vz){e.z+=e.vz;e.vz-=.3;if(e.z<=0){e.z=0;e.vz=0;}}
 if(e.hurtT>0){e.hurtT--;e.x+=e.vx;e.vx*=.92;e.pose=e.knock&&e.hurtT<32?'down':'hurt';e.x=Math.max(camX-30,Math.min(camX+W+30,e.x));if(e.hurtT===0){if(e.dead){e.gone=1;poof(e.x,e.y,e.sc);SFX.poof();}else{e.pose='idle';e.knock=0;}}return;}
 if(e.dead){e.gone=1;poof(e.x,e.y,e.sc);return;}
 const live=players.filter(p=>p.alive);if(!live.length){e.pose='idle';return;}
 let t=live.reduce((a,b)=>Math.abs(a.x-e.x)+Math.abs(a.y-e.y)<Math.abs(b.x-e.x)+Math.abs(b.y-e.y)?a:b);
 const sc=e.sc*(e.spr==='boss'?1.2:e.spr==='final'?1.3:1);
 // final boss: phase 2 + DENIED shockwave
 if(e.final){if(!e.phase2&&e.hp<e.max/2){e.phase2=1;e.spd*=1.5;floaters.push({x:camX+W/2,y:70,t:120,s:'PHASE 2: EMERGENCY POWERS!',c:'#f44',fixed:1});SFX.boss();shake=10;
   for(let i=0;i<2;i++)enemies.push(newEnemy('bot',camX+(i?-20:W+20),FLOOR_TOP+20+i*30));}
  if(--e.special<=0&&e.atk===0){e.special=e.phase2?150:220;e.atk=40;e.shock=1;}}
 if(e.atk>0){e.atk--;e.pose=e.atk<14?'attack':'idle';
  if(e.shock&&e.atk===10){e.shock=0;SFX.wave();shake=6;hazards.push({x:e.x+e.face*30,y:e.y,vx:e.face*3.2,t:160});if(e.phase2)hazards.push({x:e.x+e.face*30,y:e.y,vx:e.face*2.2,t:200,delay:30});}
  else if(e.atk===8){const dx=(t.x-e.x)*e.face,r=(e.boss?62:44)*sc;if(dx>-6&&dx<r&&Math.abs(t.y-e.y)<12*sc)hurtPlayer(t,e.dmg,e.face);}return;}
 if(--e.think<=0){e.think=30+Math.random()*40;e.side=t.x<e.x?1:-1;e.ty=(Math.random()-.5)*10;}
 const gx=t.x+e.side*42*sc,gy=t.y+e.ty;const dx=gx-e.x,dy=gy-e.y;e.face=t.x<e.x?-1:1;
 // avoid stacking
 for(const o of enemies)if(o!==e&&!o.dead&&Math.abs(o.x-e.x)<14&&Math.abs(o.y-e.y)<6){e.y+=o.y<e.y?.4:-.4;}
 if(Math.abs(dx)>3||Math.abs(dy)>3){e.x+=Math.sign(dx)*Math.min(Math.abs(dx),e.spd);e.y+=Math.sign(dy)*Math.min(Math.abs(dy),e.spd*.7);e.pose='walk';}else e.pose='idle';
 e.y=Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y));
 if(e.cd>0)e.cd--;else if(Math.abs(t.x-e.x)<48*sc&&Math.abs(t.y-e.y)<10*sc){e.atk=24;e.cd=(e.boss?50:90-stage*8)+Math.random()*60;}
}
function spark(x,y){for(let i=0;i<8;i++)fx.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,t:12,c:i%2?'#ff0':'#fff',s:2});fx.push({x,y,vx:0,vy:0,t:5,star:1});}
function poof(x,y,sc=1){for(let i=0;i<22;i++)fx.push({x:x+(Math.random()-.5)*40*sc,y:y-5-Math.random()*70*sc,vx:(Math.random()-.5)*1.4,vy:-Math.random()*.9,t:30+Math.random()*20,c:['#eee','#ccc','#aaa','#fff'][i%4],s:(6+Math.random()*8)*sc,smoke:1});}

function update(){
 tick++;stateT++;
 if(state==='title'){playSong('title');if(pressed.start||pressed.p1punch)startGame(false);else if(pressed.p2punch)startGame(true);}
 else if(state==='card'){if(stateT>150||(stateT>30&&pressed.start))state='play';}
 else if(state==='play'){if(paused)return;if(hitstop>0){hitstop--;if(shake>0)shake--;clr();return;}
  stageTime++;
  if(pressed.p2punch&&players.length<2){const p=newPlayer(1);p.x=camX+40;players.push(p);floaters.push({x:p.x,y:p.y-90,t:60,s:'2P JOINED!',c:'#6cf'})}
  stepWorld();
  const S=STAGES[stage];
  if(camLock==null&&waveIdx<S.waves.length&&camX>=S.waves[waveIdx].at){const w=S.waves[waveIdx];camLock=camX;goT=0;
   w.e.forEach((t,i)=>{const side=i%2?-1:1,boss=EN[t].boss;enemies.push(newEnemy(t,camX+(boss?W+30:side>0?W+20+i*15:-20-i*15),boss?178:FLOOR_TOP+15+Math.random()*45))});
   if(w.boss){SFX.boss();playSong('boss');floaters.push({x:camX+W/2,y:80,t:120,s:'WARNING: '+EN[w.e[0]].name+'!',c:'#f44',fixed:1});}waveIdx++;}
  if(camLock!=null&&enemies.length===0){camLock=null;if(waveIdx>=S.waves.length){state='clear';stateT=0;hazards=[];
    const tb=Math.max(0,180-Math.floor(stageTime/60))*20,hb=players.reduce((a,p)=>a+(p.alive?Math.max(0,p.hp):0),0)*10;tally={tb,hb,shown:0,total:tb+hb};}
   else{goT=180;playSong(S.song);}}
  if(camLock==null&&state==='play'){const lead=Math.max(...players.filter(p=>p.alive).map(p=>p.x),0);const target=Math.min(S.len,Math.max(camX,lead-W*.55));camX+=(target-camX)*.1;}
  if(goT>0)goT--;
  if(players.every(p=>!p.alive)){state='cont';stateT=0;playSong('cont');}
 }
 else if(state==='clear'){stepWorld();if(stateT>60&&tally.shown<tally.total){const st=Math.min(tally.total-tally.shown,Math.ceil(tally.total/80)+1);tally.shown+=st;score+=st;if(stateT%3===0)SFX.tally();}
  if(stateT>300||(stateT>120&&pressed.start&&tally.shown>=tally.total)){score+=tally.total-tally.shown;tally.shown=tally.total;if(stage<STAGES.length-1)startStage(stage+1);else{state='victory';stateT=0;typeT=0;playSong('win');saveHi();}}}
 else if(state==='cont'){if(pressed.start){credits++;players.forEach(p=>{p.alive=true;p.lives=3;p.hp=100;p.inv=180;p.hurtT=0;});state='play';playSong(enemies.some(e=>e.boss)?'boss':STAGES[stage].song);SFX.start();}
  else if(stateT>600){state='over';stateT=0;playSong(null);saveHi();}}
 else if(state==='victory'){if(stateT%3===0&&typeT<VMSG.length){typeT++;if(VMSG[typeT-1]!==' ')SFX.type();}if(stateT>VMSG.length*3+200||(pressed.start&&typeT>=VMSG.length)){state='tbc';stateT=0;}}
 else if(state==='tbc'||state==='over'){if(stateT>90&&pressed.start){state='title';stateT=0;}}
 clr();
}
function clr(){for(const k in pressed)delete pressed[k];}
function saveHi(){hi=Math.max(hi,score);localStorage.tndHi=hi;}
function stepWorld(){
 players.forEach(updatePlayer);enemies.forEach(updateEnemy);enemies=enemies.filter(e=>!e.gone);
 for(const h of hazards){if(h.delay>0){h.delay--;continue;}h.x+=h.vx;h.t--;for(const p of players)if(Math.abs(p.x-h.x)<14&&Math.abs(p.y-h.y)<9)hurtPlayer(p,14,Math.sign(h.vx));if(tick%4===0)fx.push({x:h.x,y:h.y-4,vx:0,vy:-.5,t:14,c:'#f33',s:4});}
 hazards=hazards.filter(h=>h.t>0&&h.x>camX-40&&h.x<camX+W+40);
 for(const it of items){if(it.vz!==undefined&&(it.z>0||it.vz)){it.z+=it.vz;it.vz-=.3;if(it.z<=0){it.z=0;it.vz=0;}}
  if(!it.taken&&!(it.z>0))for(const p of players)if(p.alive&&p.z<10&&Math.abs(p.x-it.x)<18&&Math.abs(p.y-it.y)<12){it.taken=1;
   if(it.k==='coffee'){p.hp=Math.min(100,p.hp+40);SFX.pick();floaters.push({x:it.x,y:it.y-40,t:50,s:'DOUBLE-DOUBLE! +40',c:'#fc6'})}
   else if(it.k==='syrup'){p.power=600;SFX.pick();floaters.push({x:it.x,y:it.y-40,t:50,s:'MAPLE POWER!',c:'#f80'})}
   else if(it.k==='donuts'){if(p.hp>=100){p.lives++;floaters.push({x:it.x,y:it.y-40,t:60,s:'1UP!',c:'#6f6'})}else floaters.push({x:it.x,y:it.y-40,t:50,s:'DONUT BOX! FULL HP',c:'#fc6'});p.hp=100;SFX.pick();}
   else{score+=500;SFX.coin();floaters.push({x:it.x,y:it.y-30,t:40,s:'+500',c:'#ffd800'})}
   if(it.k!=='loonie')score+=50;break;}}
 items=items.filter(i=>!i.taken);
 fx.forEach(f=>{f.x+=f.vx;f.y+=f.vy;f.t--;if(f.smoke){f.s+=.25;f.vx*=.97;}});fx=fx.filter(f=>f.t>0);floaters.forEach(f=>{f.t--;if(!f.fixed)f.y-=.4});floaters=floaters.filter(f=>f.t>0);
 if(shake>0)shake--;
}
const VMSG='THANK YOU! for helping to save Canada!!!\n\nThe carbon tax forms are shredded,\nthe red tape is cut, and free speech\nrings out from coast to coast.\n\nDouble-doubles are on the house!';

// ---------- RENDER ----------
function drawBG(){const S=STAGES[stage],seq=S.panels.length>1?[[S.panels[0],0],[S.panels[1],0]]:[[S.panels[0],0]];
 const k0=Math.floor(camX/W);for(let k=k0;k<=k0+1;k++){const [n,m]=seq[((k%seq.length)+seq.length)%seq.length],img=IMG[n];if(!img.complete||!img.width)continue;const x=Math.round(k*W-camX);
  X.save();if(m){X.translate(x+W,0);X.scale(-1,1);X.drawImage(img,0,0,W+.5,H);}else X.drawImage(img,x,0,W+.5,H);X.restore();}
 if(S.snow)snowFX(stage===3?25:45);}
function snowFX(n){X.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<n;i++){const x=((i*73+tick*(.3+i%3*.2))-(camX*.8))%W,y=(i*41+tick*(.5+i%4*.2))%H;X.fillRect((x+W)%W,y,1,1);}}
function frameFor(f){const hero=!!f.player;if(f.pose==='down')return'down';if(f.pose==='hurt')return'hit';if(f.pose==='punch'||f.pose==='kick'||f.pose==='attack')return hero?f.pose:'attack';if(f.pose==='walk'&&hero)return(f.anim>>3)%2?'walk':'idle';return'idle';}
function drawFighter(f,sx,sy){const c=f.spr,hero=c.startsWith('hero');const fr=frameFor(f),img=SPR[c][fr];if(!img||!img.complete||!img.width)return;
 const sc=f.sc||1,w=img.width/2*sc,h=img.height/2*sc;let by=0,sqy=1;
 if(f.pose==='walk'&&!hero){by=-Math.abs(Math.sin(f.anim*.3))*2;}else if(f.pose==='idle')sqy=1+Math.sin(f.anim*.08)*.012;
 const flip=hero?f.face<0:f.face>0;X.save();X.translate(Math.round(sx),Math.round(sy+by));X.scale(flip?-1:1,sqy);
 let ox=-w/2;if(fr==='punch'||fr==='kick'||fr==='attack'){const iw=SPR[c].idle.width/2*sc;ox=hero?-iw/2:-(w-iw/2);}
 X.drawImage(img,ox,-h,w,h);if(f.flash>0&&(f.flash>>1)%2){X.globalAlpha=.75;X.drawImage(whiteOf(img),ox,-h,w,h);X.globalAlpha=1;}X.restore();}
function drawEnt(f){const x=f.x-camX,s=(f.sc||1)*(f.spr==='boss'?1.4:f.spr==='final'?1.5:1);const zs=Math.max(.5,1-(f.z||0)/80);
 X.fillStyle='rgba(0,0,0,.45)';X.beginPath();X.ellipse(x,f.y,18*s*zs,4.5*s*zs,0,0,7);X.fill();
 if(f.player&&!f.alive)return;if(f.player&&f.inv>0&&f.hurtT<=0&&(tick>>2)%2)return;
 drawFighter(f,x,f.y-(f.z||0));
 if(f.player&&f.power>0&&tick%6<3){X.fillStyle='#fa2';X.fillRect(x-16,f.y-60-f.z,3,3);X.fillRect(x+14,f.y-40-f.z,3,3);X.fillRect(x-4,f.y-80-f.z,3,3);}}
function drawItem(it){const img=ITEM[it.k];if(!img.complete)return;const x=it.x-camX,b=it.z>0?it.z:Math.sin(tick*.12+it.x)*1.5+1.5;X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(x,it.y,8,2.5,0,0,7);X.fill();
 const w=img.width/2,h=img.height/2;X.drawImage(img,x-w/2,it.y-h-b,w,h);if(it.k==='loonie'&&tick%40<4){X.fillStyle='#fff';X.fillRect(x+3,it.y-h-b+2,2,2);}}
function drawHazard(h){if(h.delay>0)return;const x=h.x-camX;X.save();X.translate(x,h.y);X.fillStyle='rgba(255,40,40,.35)';X.beginPath();X.ellipse(0,0,22,5,0,0,7);X.fill();
 const k=1+Math.sin(tick*.5)*.1;X.scale(k,k);X.fillStyle='#200';X.fillRect(-23,-15,46,13);X.fillStyle='#e01818';X.fillRect(-22,-14,44,11);text('DENIED',0,-13,'#fff',8,'center',0);X.restore();}
function portrait(i,x,y){const img=SPR[i?'hero2':'hero1'].idle;if(!img.complete)return;const sw=img.width*.42,sx=img.width*.29;X.drawImage(img,sx,0,sw,sw,x,y,18,18);}
function hud(){
 players.forEach((p,i)=>{const x=i?W-92:4,y=4;X.fillStyle='rgba(0,0,0,.55)';X.fillRect(x,y,88,20);X.fillStyle='#223';X.fillRect(x+1,y+1,18,18);portrait(i,x+1,y+1);X.strokeStyle='#ffd800';X.lineWidth=1;X.strokeRect(x+.5,y+.5,19,19);
  X.font='bold 6px monospace';X.textAlign='left';X.textBaseline='top';X.fillStyle=i?'#7cf':'#f77';X.fillText((i?'2P ':'1P ')+p.name+'  x'+Math.max(0,p.lives),x+22,y+2);
  X.fillStyle='#300';X.fillRect(x+22,y+11,62,5);X.fillStyle=p.power>0&&tick%8<4?'#fa2':p.hp>30?'#ffd800':'#f42';X.fillRect(x+22,y+11,62*Math.max(0,p.hp)/100,5);X.strokeStyle='#000';X.strokeRect(x+21.5,y+10.5,63,6);});
 X.font='bold 7px monospace';X.textAlign='center';X.textBaseline='top';X.fillStyle='#fff';X.fillText(String(score).padStart(7,'0'),W/2,5);X.font='bold 5px monospace';X.fillStyle='#ffd800';X.fillText('STAGE '+(stage+1),W/2,14);
 if(players.length<2&&state==='play'&&(tick>>5)%2&&!isTouch){X.font='6px monospace';X.fillStyle='#7cf';X.fillText('2P: PRESS ,',W-46,27);}
 const b=enemies.find(e=>e.boss&&!e.dead);if(b){X.font='bold 7px monospace';X.fillStyle='#f66';X.fillText(b.name,W/2,H-19);X.fillStyle='#000';X.fillRect(W/2-80,H-11,160,6);X.fillStyle=b.phase2?'#f80':'#d22';X.fillRect(W/2-79,H-10,158*Math.max(0,b.hp)/b.max,4);}
 else{const e=enemies.find(e=>e.flash>0);if(e){X.font='bold 6px monospace';X.fillStyle='#ddd';X.fillText(e.name,W/2,22);}}
 if(goT>0&&(tick>>4)%2){text('GO',W-56,82,'#ffd800',16,'left',OUT);X.fillStyle='#ffd800';X.beginPath();X.moveTo(W-30,82);X.lineTo(W-14,92);X.lineTo(W-30,102);X.fill();}
 floaters.forEach(f=>{if(f.blink&&(tick>>3)%2)return;text(f.s,f.fixed?W/2:f.x-camX,f.y,f.c,f.fixed?10:f.small?7:8,'center')});
 if(paused)text('PAUSED',W/2,90,'#fff',16,'center');}
function drawTitle(){X.fillStyle='#000';X.fillRect(0,0,W,H);if(IMG.stage1_a.complete)X.drawImage(IMG.stage1_a,0,0,W,H);X.fillStyle='rgba(0,0,25,.62)';X.fillRect(0,0,W,H);snowFX(50);
 const j=Math.min(1,stateT/45),hy=208-Math.sin(j*Math.PI)*70-(1-j)*140;
 [[96,1],[288,-1]].forEach(([x,fc],i)=>drawFighter({player:1,spr:i?'hero2':'hero1',face:fc,pose:stateT<45?(i?'punch':'kick'):'idle',anim:tick,flash:0},x,hy));
 const ty=Math.min(22,-70+Math.max(0,stateT-40)*3);
 X.font='bold 30px Impact, "Arial Black", monospace';X.textAlign='center';X.textBaseline='top';
 for(const[t,yy]of[['TRUE NORTH',ty],['DRAGONS',ty+32]]){X.lineWidth=5;X.strokeStyle=OUT;X.strokeText(t,W/2,yy);X.fillStyle='#b01010';X.fillText(t,W/2+2,yy+2);const g=X.createLinearGradient(0,yy,0,yy+30);g.addColorStop(0,'#fff6a0');g.addColorStop(.5,'#ffd800');g.addColorStop(1,'#e07000');X.fillStyle=g;X.fillText(t,W/2,yy);}
 if(stateT>80){leafBig(W/2-9,ty+66,2,'#e02020');
  if((tick>>4)%2)text(isTouch?'TAP TO START':'PRESS START',W/2,170,'#fff',10,'center');
  if(!isTouch)text('Press , for 2 PLAYERS',W/2,186,'#7cf',7,'center');
  text('HI '+hi+'  ©2026 PASSCOOL STUDIO · FICTIONAL SATIRE',W/2,203,'#aaa',6,'center');}}
function render(){
 X.save();if(shake)X.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 if(state==='title')drawTitle();
 else if(state==='victory'||state==='tbc'){if(IMG.ending.complete)X.drawImage(IMG.ending,0,0,W,H);
  [0,1].forEach(i=>drawFighter({player:1,spr:i?'hero2':'hero1',face:i?-1:1,pose:(tick>>4)%2?'punch':'idle',anim:tick,flash:0},140+i*104,212));
  if(state==='victory'){X.fillStyle=OUT;X.fillRect(24,8,W-48,80);X.fillStyle='#1838a8';X.fillRect(26,10,W-52,76);X.fillStyle='rgba(8,16,74,.95)';X.fillRect(28,12,W-56,72);VMSG.slice(0,typeT).split('\n').forEach((l,i)=>text(l,36,16+i*9.5,i===0?'#ffd800':'#fff',8));}
  else{X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);text('TO BE CONTINUED...',W/2,84,'#ffd800',18,'center');text('FINAL SCORE '+score,W/2,112,'#fff',9,'center');if(stateT>90&&(tick>>4)%2)text('PRESS START',W/2,140,'#aaa',8,'center');}}
 else{drawBG();const all=[...items.map(i=>({y:i.y,it:i})),...enemies,...players].sort((a,b)=>a.y-b.y);
  hazards.forEach(drawHazard);all.forEach(o=>o.it?drawItem(o.it):drawEnt(o));
  fx.forEach(f=>{const x=f.x-camX;if(f.star){X.fillStyle='#fff';X.fillRect(x-8,f.y-1,16,3);X.fillRect(x-1,f.y-8,3,16);X.fillRect(x-4,f.y-4,9,9);return;}
   if(f.smoke){X.globalAlpha=Math.min(.9,f.t/25);X.fillStyle=f.c;X.beginPath();X.arc(x,f.y,f.s/2,0,7);X.fill();X.globalAlpha=1;}else{X.fillStyle=f.c;X.fillRect(x-1,f.y-1,f.s,f.s);}});
  hud();
  if(state==='card'){const a=stateT<20?stateT/20:stateT>130?Math.max(0,(150-stateT)/20):1;X.fillStyle=`rgba(0,0,0,${.85*Math.min(1,stateT<20?1:a)})`;X.fillRect(0,0,W,H);X.globalAlpha=a;
   X.fillStyle='#b01010';X.fillRect(0,78,W,2);X.fillRect(0,134,W,2);text('STAGE '+(stage+1),W/2,84,'#ffd800',22,'center',OUT);text(STAGES[stage].title,W/2,112,'#fff',12,'center',OUT);X.globalAlpha=1;}
  if(state==='clear'){X.fillStyle='rgba(0,0,0,.55)';X.fillRect(60,50,W-120,100);text('STAGE '+(stage+1)+' CLEAR!',W/2,58,'#ffd800',14,'center',OUT);
   if(tally){text('TIME BONUS',90,84,'#fff',8);text(String(tally.tb),W-90,84,'#fff',8,'right');text('HEALTH BONUS',90,98,'#fff',8);text(String(tally.hb),W-90,98,'#fff',8,'right');text('SCORE',90,120,'#7cf',9);text(String(score),W-90,120,'#7cf',9,'right');}}
  if(state==='cont'){X.fillStyle='rgba(0,0,0,.7)';X.fillRect(0,0,W,H);text('CONTINUE?',W/2,62,'#ffd800',20,'center',OUT);text(String(Math.max(0,10-Math.floor(stateT/60))),W/2,94,'#fff',30,'center',OUT);if((tick>>4)%2)text(isTouch?'TAP TO CONTINUE':'PRESS START',W/2,142,'#aaa',8,'center');}
  if(state==='over'){X.fillStyle='rgba(0,0,0,.7)';X.fillRect(0,0,W,H);text('GAME OVER',W/2,84,'#f44',20,'center');if(stateT>90)text('PRESS START',W/2,120,'#fff',8,'center');}}
 X.restore();}
let last=performance.now(),acc=0;
function loop(now){acc+=Math.min(100,now-last);last=now;while(acc>=1000/60){update();acc-=1000/60;}X.setTransform(2,0,0,2,0,0);X.imageSmoothingEnabled=true;render();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
window.__game={get state(){return state},get curStage(){return stage},startGame,get players(){return players},get enemies(){return enemies},get camX(){return camX},
 stage(n){if(!players.length)startGame(false);startStage(Math.max(0,Math.min(4,n-1)));state='play';},
 boss(){const S=STAGES[stage];state='play';enemies=[];camLock=null;waveIdx=S.waves.length-1;camX=S.waves[waveIdx].at;players.forEach((p,i)=>{p.x=camX+90+i*20;p.y=178;p.inv=0;p.hurtT=0;p.alive=true;});},
 win(){state='victory';stateT=0;typeT=0;playSong('win');}};
