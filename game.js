'use strict';
// TRUE NORTH DRAGONS — fictional satire. All characters are generic and fictional.
const C=document.getElementById('c'),X=C.getContext('2d');X.imageSmoothingEnabled=false;
const W=384,H=216,FLOOR_TOP=150,FLOOR_BOT=208;
function fit(){const s=Math.max(1,Math.min(innerWidth/W,(innerHeight-16)/H));C.style.width=W*s+'px';C.style.height=H*s+'px';}
addEventListener('resize',fit);fit();

// ---------- AUDIO ----------
let AC=null,master=null,muted=false,musicTimer=null,musicStep=0,curSong=null;
function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.25;master.connect(AC.destination);}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function tone(f,d,type='square',v=.3,t0=0,slide=0){if(!AC||muted)return;const t=AC.currentTime+t0,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);}
function noise(d,v=.3,hp=800){if(!AC||muted)return;const n=AC.sampleRate*d,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='highpass';f.frequency.value=hp;g.gain.value=v;s.connect(f);f.connect(g);g.connect(master);s.start();}
const SFX={punch(){noise(.07,.4,1500);tone(180,.06,'square',.2,0,-100)},kick(){noise(.1,.4,600);tone(120,.1,'square',.25,0,-70)},hit(){noise(.12,.5,300);tone(90,.12,'sawtooth',.3,0,-50)},whiff(){noise(.05,.1,3000)},poof(){noise(.3,.25,200)},pick(){[660,880,1320].forEach((f,i)=>tone(f,.08,'square',.2,i*.06))},hurt(){tone(300,.2,'sawtooth',.3,0,-220)},start(){[523,659,784,1047].forEach((f,i)=>tone(f,.12,'square',.25,i*.08))},type(){tone(1200,.02,'square',.08)},boss(){[110,104,98,92].forEach((f,i)=>tone(f,.25,'sawtooth',.3,i*.2))}};
const N=n=>440*Math.pow(2,(n-69)/12);
const SONGS={
 title:{bpm:132,bass:[45,45,57,45,43,43,55,43,41,41,53,41,43,43,55,47],lead:[69,0,72,74,76,0,74,72,74,0,71,67,69,0,0,0,69,0,72,74,76,79,81,79,77,76,74,72,71,0,0,0]},
 lv1:{bpm:140,bass:[40,40,52,40,43,43,55,43,38,38,50,38,45,45,57,47],lead:[64,0,67,0,69,71,0,69,67,0,64,0,62,64,0,0,64,0,67,0,69,71,74,0,72,71,69,67,69,0,0,0]},
 lv2:{bpm:150,bass:[38,38,50,38,41,41,53,41,36,36,48,36,43,43,55,45],lead:[62,0,65,67,0,69,0,67,65,0,62,0,60,62,0,0,62,65,67,69,72,0,70,69,67,65,67,0,62,0,0,0]},
 boss:{bpm:168,bass:[36,36,48,36,37,37,49,37,36,36,48,36,39,39,51,38],lead:[60,63,66,0,60,63,67,0,60,63,66,0,72,71,70,69]},
 win:{bpm:120,bass:[48,48,55,55,53,53,55,55,48,48,57,57,53,55,48,0],lead:[72,76,79,84,0,79,81,0,77,81,84,0,79,0,84,0]}};
function playSong(name){if(curSong===name)return;curSong=name;musicStep=0;if(musicTimer)clearInterval(musicTimer);const s=SONGS[name];if(!s)return;musicTimer=setInterval(()=>{if(!AC||muted||paused)return;const sp=60/s.bpm/2;const b=s.bass[musicStep%s.bass.length];if(b)tone(N(b),sp*.9,'triangle',.35);const l=s.lead[musicStep%s.lead.length];if(l)tone(N(l),sp*.8,'square',.12);if(musicStep%4===0)noise(.04,.15,4000);if(musicStep%8===4)noise(.08,.2,300);musicStep++;},60000/s.bpm/2);}

// ---------- INPUT ----------
const keys={},pressed={};
const KM={KeyW:'p1up',KeyS:'p1down',KeyA:'p1left',KeyD:'p1right',KeyJ:'p1punch',KeyK:'p1kick',
 ArrowUp:'p2up',ArrowDown:'p2down',ArrowLeft:'p2left',ArrowRight:'p2right',Comma:'p2punch',Period:'p2kick',Numpad1:'p2punch',Numpad2:'p2kick',
 Enter:'start',Space:'start',NumpadEnter:'start'};
addEventListener('keydown',e=>{audio();const k=KM[e.code];if(e.code==='KeyM'){muted=!muted;}if(e.code==='KeyP'&&state==='play')paused=!paused;if(k){if(!keys[k])pressed[k]=1;keys[k]=1;e.preventDefault();}});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)keys[k]=0;});
const isTouch='ontouchstart'in window||navigator.maxTouchPoints>0;
if(isTouch){document.getElementById('touch').style.display='block';document.getElementById('help').style.display='none';}
document.querySelectorAll('.tb[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{audio();e.preventDefault();if(!keys[k])pressed[k]=1;keys[k]=1;});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>keys[k]=0));});
const dp=document.getElementById('t-dpad');
function dpad(e){const r=dp.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;keys.p1left=dx<-15;keys.p1right=dx>15;keys.p1up=dy<-15;keys.p1down=dy>15;}
dp.addEventListener('pointerdown',e=>{audio();dp.setPointerCapture(e.pointerId);dpad(e)});dp.addEventListener('pointermove',e=>{if(e.buttons||e.pressure)dpad(e)});
['pointerup','pointercancel'].forEach(t=>dp.addEventListener(t,()=>{keys.p1left=keys.p1right=keys.p1up=keys.p1down=0}));
C.addEventListener('pointerdown',()=>{audio();pressed.start=1;});

// ---------- PIXEL FONT (canvas text, pixel style) ----------
function text(s,x,y,col='#fff',size=8,align='left',shadow='#000'){X.font=`bold ${size}px monospace`;X.textAlign=align;X.textBaseline='top';if(shadow){X.fillStyle=shadow;X.fillText(s,Math.round(x)+1,Math.round(y)+1);}X.fillStyle=col;X.fillText(s,Math.round(x),Math.round(y));}
const R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h);};

// ---------- CHARACTER DRAWING ----------
// pose: idle, walk(frame), punch, kick, hurt, down
function drawFighter(f,sx,sy){
 const p=f.pal,dir=f.face,t=f.anim;X.save();X.translate(Math.round(sx),Math.round(sy));X.scale(dir,1);
 const flash=f.flash>0&&(f.flash>>1)%2;
 if(f.pose==='down'){ // lying
  R(-16,-6,32,6,flash?'#fff':p.body);R(10,-8,8,8,p.skin);R(-18,-4,6,4,p.leg);X.restore();return;}
 let lean=f.pose==='hurt'?-3:0, w=f.pose==='walk'?Math.sin(t*.4)*3:0, bob=f.pose==='walk'?Math.abs(Math.sin(t*.4)):0;
 const hy=-40+bob|0;
 // legs
 if(f.pose==='kick'){R(-6,-16,5,16,p.leg);R(-1,-18,16,5,p.leg);R(14,-19,4,6,p.shoe);R(-7,-2,6,2,p.shoe);}
 else{R(-6+w,-16,5,15,p.leg);R(1-w,-16,5,15,p.leg);R(-7+w,-2,6,2,p.shoe);R(1-w,-2,6,2,p.shoe);}
 // torso
 R(-7+lean,-30+bob,14,15,flash?'#fff':p.body);R(-7+lean,-17+bob,14,2,p.belt);
 if(p.patch)drawLeaf(-1+lean,-27+bob,p.patch);
 if(p.tie){R(-1+lean,-30+bob,2,10,p.tie);}
 if(p.screen){R(-5+lean,-28+bob,10,7,'#123');R(-3+lean,-26+bob,2,2,'#f22');R(1+lean,-26+bob,2,2,'#f22');}
 // head
 if(p.robot){R(-6+lean,hy,12,10,p.skin);R(-4+lean,hy+3,8,3,'#000');R(-3+lean,hy+4,6,1,'#f22');R(-1+lean,hy-4,2,4,'#999');R(-2+lean,hy-5,4,2,'#f22');}
 else{R(-5+lean,hy,10,10,p.skin);R(-5+lean,hy,10,3,p.hair);
  if(p.band){R(-5+lean,hy+2,10,2,p.band);R(-9+lean,hy+3,4,2,p.band);}
  if(p.shades)R(-2+lean,hy+4,7,2,'#111');else R(2+lean,hy+4,2,2,'#111');
  if(p.hat){R(-6+lean,hy-2,12,3,p.hat);R(-4+lean,hy-5,8,3,p.hat);}}
 // arms
 if(f.pose==='punch'){R(0+lean,-29+bob,14,4,p.arm);R(14+lean,-30+bob,4,6,p.skin);if(p.mic){R(14,-34,2,4,'#333');R(13,-37,4,4,'#888')}}
 else{const a=f.pose==='walk'?-w:0;R(-9+lean+a,-29+bob,4,11,p.arm);R(5+lean-a,-29+bob,4,11,p.arm);R(5+lean-a,-18+bob,4,3,p.skin);
  if(p.clip){R(7+lean,-24+bob,7,9,'#c96');R(8+lean,-23+bob,5,6,'#fff');}
  if(p.mic&&f.pose!=='hurt'){R(6,-21,2,5,'#333');R(5,-24,4,4,'#888');}
  if(p.stamp){R(7+lean,-22+bob,6,4,'#a33');R(9+lean,-26+bob,2,4,'#642');}}
 X.restore();
}
function drawLeaf(x,y,c){X.fillStyle=c;[[2,0],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[2,4]].forEach(([a,b])=>X.fillRect(x+a,y+b,1,1));}
function bigLeaf(x,y,s,c){X.fillStyle=c;const m=["....#....","...###...","#..###..#","##.###.##","#########",".#######.","..#####..","....#....","....#...."];m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='#')X.fillRect(x+i*s,y+j*s,s,s)}));}

const PAL={
 trucker:{body:'#d22',belt:'#111',leg:'#d22',arm:'#d22',skin:'#e9b48a',hair:'#5a3a1a',band:'#fff',shades:1,shoe:'#222',patch:'#fff'},
 reporter:{body:'#2659d8',belt:'#111',leg:'#2659d8',arm:'#2659d8',skin:'#c58c5e',hair:'#222',band:'#ff0',shades:1,shoe:'#222',mic:1},
 taxman:{body:'#6b6b2a',belt:'#333',leg:'#444',arm:'#6b6b2a',skin:'#d9a37a',hair:'#333',shoe:'#111',clip:1,hat:'#444'},
 bureau:{body:'#334',belt:'#223',leg:'#223',arm:'#334',skin:'#b8865c',hair:'#654',shoe:'#000',tie:'#c22',stamp:1},
 bot:{body:'#778',belt:'#556',leg:'#556',arm:'#889',skin:'#aab',hair:'#aab',shoe:'#333',robot:1,screen:1},
 boss:{body:'#222',belt:'#a80',leg:'#111',arm:'#222',skin:'#c9a07a',hair:'#999',shoe:'#000',tie:'#a80',clip:1,hat:'#111'}};

// ---------- GAME STATE ----------
let state='title',paused=false,tick=0,level=0,camX=0,camLock=null,players=[],enemies=[],items=[],fx=[],floaters=[],waveIdx=0,score=0,hi=+localStorage.tndHi||0,stateT=0,shake=0,typeT=0,twoP=false;
const LEVELS=[
 {name:'STAGE 1  OTTAWA STREET - NIGHT',len:1500,song:'lv1',bg:drawStreet,
  waves:[{at:150,e:['taxman','taxman']},{at:500,e:['bureau','taxman','taxman']},{at:850,e:['bot','bureau','taxman']},{at:1150,e:['bot','bot','bureau','taxman']}],items:[[420,'coffee'],[1000,'syrup'],[1250,'coffee']]},
 {name:'STAGE 2  PARLIAMENT HILL - NIGHT',len:1400,song:'lv2',bg:drawHill,
  waves:[{at:150,e:['bureau','bureau','bot']},{at:480,e:['taxman','bot','bureau','taxman']},{at:820,e:['bot','bot','bureau','bureau']},{at:1080,e:['boss','bureau','taxman'],boss:1}],items:[[350,'coffee'],[700,'syrup'],[1000,'coffee']]}];
const EN={taxman:{name:'CARBON TAX COLLECTOR',hp:30,spd:.6,dmg:6,pts:100},bureau:{name:'RED TAPE BUREAUCRAT',hp:40,spd:.5,dmg:8,pts:150},bot:{name:'CENSORSHIP BOT',hp:35,spd:.8,dmg:7,pts:200},boss:{name:'THE MEGA-REGULATOR',hp:320,spd:.55,dmg:14,pts:5000}};

function newPlayer(i){return{id:i,pal:i?PAL.reporter:PAL.trucker,name:i?'REPORTER':'TRUCKER',x:camX+60+i*30,y:160+i*20,z:0,vz:0,face:1,hp:100,lives:3,pose:'idle',anim:0,atk:0,atkType:'',cd:0,hurtT:0,inv:120,flash:0,combo:0,comboT:0,power:0,alive:true,player:true}}
function newEnemy(t,x,y){const d=EN[t];return{type:t,pal:PAL[t],name:d.name,x,y,z:0,vz:0,face:-1,hp:d.hp,max:d.hp,spd:d.spd,dmg:d.dmg,pts:d.pts,pose:'idle',anim:0,atk:0,cd:60+Math.random()*60,hurtT:0,flash:0,dead:0,knock:0,vx:0,boss:t==='boss',hits:0,think:0,tx:0,ty:0}}
function startGame(two){twoP=two;score=0;level=0;players=[newPlayer(0)];if(two)players.push(newPlayer(1));startLevel(0);SFX.start();}
function startLevel(n){level=n;camX=0;camLock=null;waveIdx=0;enemies=[];fx=[];floaters=[];items=LEVELS[n].items.map(([x,k])=>({x,y:170+Math.random()*32,k,taken:0}));players.forEach((p,i)=>{p.x=60+i*30;p.y=160+i*20;p.inv=120;});state='intro';stateT=0;playSong(LEVELS[n].song);}

// ---------- UPDATE ----------
function inp(p,a){return keys['p'+(p.id+1)+a];}
function prs(p,a){return pressed['p'+(p.id+1)+a];}
function updatePlayer(p){
 if(!p.alive)return;p.anim++;if(p.inv>0)p.inv--;if(p.flash>0)p.flash--;if(p.cd>0)p.cd--;if(p.comboT>0)p.comboT--;else p.combo=0;if(p.power>0)p.power--;
 if(p.hurtT>0){p.hurtT--;p.pose=p.hp<=0&&p.hurtT<30?'down':'hurt';if(p.hurtT===0&&p.hp<=0){p.lives--;if(p.lives>0){p.hp=100;p.inv=150;poof(p.x,p.y);}else{p.alive=false;poof(p.x,p.y);}}return;}
 if(p.atk>0){p.atk--;if(p.atk===(p.atkType==='kick'?8:5))doHit(p);if(p.atk===0)p.pose='idle';return;}
 let dx=(inp(p,'right')?1:0)-(inp(p,'left')?1:0),dy=(inp(p,'down')?1:0)-(inp(p,'up')?1:0);
 const sp=p.power?2.1:1.5;p.x+=dx*sp;p.y+=dy*sp*.7;if(dx)p.face=dx;
 const minX=camX+10,maxX=camLock!=null?camLock+W-10:camX+W-10;p.x=Math.max(minX,Math.min(maxX,p.x,LEVELS[level].len+W-20));p.y=Math.max(FLOOR_TOP+8,Math.min(FLOOR_BOT,p.y));
 p.pose=(dx||dy)?'walk':'idle';
 if(p.cd<=0&&(prs(p,'punch')||prs(p,'kick'))){const k=prs(p,'kick');p.atkType=k?'kick':'punch';p.atk=k?16:11;p.cd=k?14:8;p.pose=p.atkType;(k?SFX.kick:SFX.whiff)();}
}
function doHit(p){
 const reach=p.atkType==='kick'?44:38;let any=false;
 for(const e of enemies){if(e.dead||e.hurtT>12)continue;const dx=(e.x-p.x)*p.face;if(dx>-4&&dx<reach&&Math.abs(e.y-p.y)<14){any=true;
  p.combo=p.comboT>0?p.combo+1:1;p.comboT=50;const fin=p.combo>=3;let dmg=(p.atkType==='kick'?12:8)*(p.power?2:1)*(fin?1.6:1);
  e.hp-=dmg;e.flash=10;e.hurtT=fin||e.hp<=0?40:16;e.knock=fin||e.hp<=0?1:0;e.vx=p.face*(fin?3:1);if(e.knock){e.vz=3;}e.face=-p.face;shake=fin?6:3;
  score+=10*p.combo;spark(e.x,e.y-26);if(fin){floaters.push({x:e.x,y:e.y-50,t:50,s:'COMBO x'+p.combo+'!',c:'#ff0'});p.combo=0;}
  if(e.hp<=0&&!e.dead){e.dead=1;score+=e.pts;floaters.push({x:e.x,y:e.y-44,t:50,s:'+'+e.pts,c:'#fff'});if(e.boss){SFX.boss();}}}}
 if(any)(p.atkType==='kick'?SFX.kick:SFX.hit)();
}
function updateEnemy(e){
 e.anim++;if(e.flash>0)e.flash--;
 if(e.z>0||e.vz){e.z+=e.vz;e.vz-=.3;if(e.z<=0){e.z=0;e.vz=0;}}
 if(e.hurtT>0){e.hurtT--;e.x+=e.vx;e.vx*=.9;e.pose=e.knock&&e.hurtT<28?'down':'hurt';if(e.hurtT===0){if(e.dead){e.gone=1;poof(e.x,e.y);SFX.poof();}else{e.pose='idle';e.knock=0;}}return;}
 if(e.dead){e.gone=1;poof(e.x,e.y);return;}
 const live=players.filter(p=>p.alive);if(!live.length)return;
 let t=live.reduce((a,b)=>Math.abs(a.x-e.x)+Math.abs(a.y-e.y)<Math.abs(b.x-e.x)+Math.abs(b.y-e.y)?a:b);
 if(e.atk>0){e.atk--;e.pose=e.atk<12?'punch':'idle';if(e.atk===8){const dx=(t.x-e.x)*e.face;const r=e.boss?52:36;if(dx>-4&&dx<r&&Math.abs(t.y-e.y)<12&&t.inv<=0&&t.hurtT<=0){t.hp-=e.dmg;t.flash=10;t.hurtT=t.hp<=0?60:18;t.inv=t.hp<=0?0:40;t.x-=e.face*-6;shake=4;SFX.hurt();spark(t.x,t.y-26);}}return;}
 if(--e.think<=0){e.think=30+Math.random()*40;e.side=t.x<e.x?1:-1;e.ty=(Math.random()-.5)*8;}
 const gx=t.x+e.side*30,gy=t.y+e.ty;const dx=gx-e.x,dy=gy-e.y;e.face=t.x<e.x?-1:1;
 if(Math.abs(dx)>3||Math.abs(dy)>3){e.x+=Math.sign(dx)*Math.min(Math.abs(dx),e.spd*(e.boss&&e.hp<e.max/2?1.5:1));e.y+=Math.sign(dy)*Math.min(Math.abs(dy),e.spd*.7);e.pose='walk';}else e.pose='idle';
 e.y=Math.max(FLOOR_TOP+8,Math.min(FLOOR_BOT,e.y));
 if(e.cd>0)e.cd--;else if(Math.abs(t.x-e.x)<(e.boss?56:38)&&Math.abs(t.y-e.y)<10){e.atk=24;e.cd=(e.boss?50:80)+Math.random()*60;}
}
function spark(x,y){for(let i=0;i<6;i++)fx.push({x,y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,t:12,c:i%2?'#ff0':'#fff',s:2});}
function poof(x,y){for(let i=0;i<14;i++)fx.push({x:x+(Math.random()-.5)*20,y:y-10-Math.random()*25,vx:(Math.random()-.5)*1.2,vy:-Math.random()*.8,t:30+Math.random()*15,c:['#ddd','#bbb','#999'][i%3],s:4+Math.random()*5|0,smoke:1});}

function update(){
 tick++;stateT++;
 if(state==='title'){playSong('title');if(pressed.start||pressed.p1punch)startGame(false);else if(pressed.p2punch)startGame(true);}
 else if(state==='intro'){if(stateT>120||pressed.start)state='play';stepWorld();}
 else if(state==='play'){if(paused)return;
  if(pressed.p2punch&&players.length<2){const p=newPlayer(1);p.x=camX+40;players.push(p);floaters.push({x:p.x,y:p.y-50,t:60,s:'2P JOINED!',c:'#6cf'})}
  stepWorld();
  const L=LEVELS[level];
  // waves
  if(camLock==null&&waveIdx<L.waves.length&&camX>=L.waves[waveIdx].at){const w=L.waves[waveIdx];camLock=camX;w.e.forEach((t,i)=>{const side=i%2?-1:1;enemies.push(newEnemy(t,camX+(side>0?W+20+i*15:-20-i*15),FLOOR_TOP+15+Math.random()*60))});if(w.boss){SFX.boss();playSong('boss');floaters.push({x:camX+W/2,y:90,t:120,s:'WARNING: THE MEGA-REGULATOR!',c:'#f44',fixed:1});}waveIdx++;}
  if(camLock!=null&&enemies.length===0){camLock=null;floaters.push({x:camX+W-60,y:60,t:90,s:'GO! >>',c:'#ff0',blink:1});if(level===1&&waveIdx>=L.waves.length){state='clear';stateT=0;}}
  if(camLock==null){const lead=Math.max(...players.filter(p=>p.alive).map(p=>p.x),0);const target=Math.min(L.len,Math.max(camX,lead-W*.55));camX+=(target-camX)*.1;}
  if(camLock==null&&waveIdx>=L.waves.length&&players.some(p=>p.alive&&p.x>L.len+W-60)){state='clear';stateT=0;}
  if(players.every(p=>!p.alive)){state='over';stateT=0;playSong(null);hi=Math.max(hi,score);localStorage.tndHi=hi;}
 }
 else if(state==='clear'){stepWorld();if(stateT>150){if(level===0)startLevel(1);else{state='victory';stateT=0;typeT=0;playSong('win');hi=Math.max(hi,score);localStorage.tndHi=hi;}}}
 else if(state==='victory'){if(stateT%3===0&&typeT<VMSG.length){typeT++;if(VMSG[typeT-1]!==' ')SFX.type();}if(stateT>VMSG.length*3+200||(pressed.start&&typeT>=VMSG.length)){state='tbc';stateT=0;}}
 else if(state==='tbc'||state==='over'){if(stateT>90&&pressed.start){state='title';stateT=0;}}
 for(const k in pressed)delete pressed[k];
}
function stepWorld(){
 players.forEach(updatePlayer);enemies.forEach(updateEnemy);enemies=enemies.filter(e=>!e.gone);
 for(const it of items)if(!it.taken)for(const p of players)if(p.alive&&Math.abs(p.x-it.x)<16&&Math.abs(p.y-it.y)<10){it.taken=1;SFX.pick();if(it.k==='coffee'){p.hp=Math.min(100,p.hp+40);floaters.push({x:it.x,y:it.y-30,t:50,s:'DOUBLE-DOUBLE! +HP',c:'#fc6'})}else{p.power=600;floaters.push({x:it.x,y:it.y-30,t:50,s:'MAPLE POWER!',c:'#f80'})}score+=50;}
 fx.forEach(f=>{f.x+=f.vx;f.y+=f.vy;f.t--;if(f.smoke)f.s+=.15});fx=fx.filter(f=>f.t>0);floaters.forEach(f=>{f.t--;if(!f.fixed)f.y-=.4});floaters=floaters.filter(f=>f.t>0);
 if(shake>0)shake--;
}
const VMSG='THANK YOU! for helping to save Canada!!!\n\nThe carbon tax forms are shredded,\nthe red tape is cut, and free speech\nrings out from coast to coast.\n\nDouble-doubles are on the house!';

// ---------- BACKGROUNDS ----------
function stars(seed,n){for(let i=0;i<n;i++){const x=(i*97+seed)%W,y=(i*53)%90;R(x,y,1,1,(i+tick/20|0)%7?'#aac':'#fff');}}
function drawStreet(){
 const g=X.createLinearGradient(0,0,0,130);g.addColorStop(0,'#05061a');g.addColorStop(1,'#1d2350');X.fillStyle=g;X.fillRect(0,0,W,130);stars(13,40);
 R(320,14,14,14,'#eee');R(324,14,10,14,'#cfd');
 // far skyline parallax
 for(let i=0;i<30;i++){const bx=i*48-(camX*.2)%48*1-48+((camX*.2/48|0)%1),h=40+((i+(camX*.2/48|0))*37)%50;const x=i*48-(camX*.2)%48-48;R(x,128-h,40,h,'#141a3a');for(let wy=128-h+6;wy<124;wy+=8)for(let wx=x+4;wx<x+36;wx+=8)if(((wx*7+wy*3+(i+(camX*.2/48|0))*11)%5)<2)R(wx,wy,3,4,'#e8c860');}
 // near buildings
 for(let i=-1;i<8;i++){const x=i*64-(camX*.6)%64,k=i+(camX*.6/64|0);R(x,40,60,90,['#3a2a2a','#2f2838','#33302a'][((k%3)+3)%3]);R(x,40,60,4,'#555');for(let wy=50;wy<110;wy+=14)for(let wx=x+6;wx<x+54;wx+=12)R(wx,wy,7,9,(k*wx+wy)%3?'#1a1a28':'#d9b860');if(((k%4)+4)%4===1){R(x+14,100,32,28,'#552');text('TAX',x+20,104,'#f55',8,'left',0);text('OFFICE',x+16,114,'#f55',7,'left',0)}}
 // convoy truck parallax
 const tx=((-camX*.6)%900+900)%900-200;drawTruck(tx,96);
 // snow on sidewalk + street
 R(0,118,W,12,'#d8dde8');R(0,130,W,H-130,'#2b2d3a');for(let i=0;i<W;i+=40){R(i-(camX%40),168,20,2,'#cc4')}
 R(0,128,W,3,'#999');
 // lamp posts
 for(let i=-1;i<5;i++){const x=i*120-(camX%120);R(x,62,3,66,'#333');R(x-6,60,14,4,'#444');R(x-4,64,10,3,'#ffd');X.fillStyle='rgba(255,240,180,.08)';X.beginPath();X.moveTo(x-4,66);X.lineTo(x-30,128);X.lineTo(x+34,128);X.lineTo(x+6,66);X.fill();}
 snow();
}
function drawTruck(x,y){R(x,y,90,26,'#ddd');R(x+3,y+3,84,20,'#c22');bigLeaf(x+36,y+5,2,'#fff');R(x+90,y+6,26,20,'#b11');R(x+100,y+9,12,8,'#9cf');R(x+86,y-6,3,12,'#888');R(x,y+26,120,4,'#222');[x+10,x+26,x+70,x+86,x+106].forEach(w=>{R(w,y+26,9,9,'#111');R(w+3,y+29,3,3,'#888')});text('FREEDOM',x+4,y-9,'#fff',7,'left','#000');}
function snow(){for(let i=0;i<50;i++){const x=((i*73+tick*(.3+i%3*.2))-(camX*.8))%W,y=(i*41+tick*(.5+i%4*.2))%H;R((x+W)%W,y,i%5?1:2,i%5?1:2,'#fff');}}
function drawHill(){
 const g=X.createLinearGradient(0,0,0,130);g.addColorStop(0,'#030512');g.addColorStop(1,'#192048');X.fillStyle=g;X.fillRect(0,0,W,130);stars(29,50);
 const ox=-camX*.15;
 // Centre Block
 const cx=ox+120;R(cx,70,220,60,'#a59d84');R(cx,66,220,4,'#6b8f7a');for(let i=0;i<220;i+=10)R(cx+i,64,5,3,'#6b8f7a');
 for(let wx=cx+8;wx<cx+212;wx+=12){R(wx,78,5,10,'#e8c860');R(wx,96,5,10,'#e8c860');}
 // Peace Tower
 const px=cx+92;R(px,18,36,112,'#b0a88e');R(px+4,30,28,4,'#8a8270');R(px+10,40,16,16,'#f4f0d0');R(px+17,43,2,7,'#333');R(px+17,48,6,2,'#333');R(px+12,64,12,24,'#e8c860');R(px+6,100,24,30,'#3a2a20');
 X.fillStyle='#6b8f7a';X.beginPath();X.moveTo(px-2,18);X.lineTo(px+18,-14);X.lineTo(px+38,18);X.fill();R(px+17,-24,2,12,'#ccc');
 // flag
 const fw=Math.sin(tick*.1);R(px+19,-24,16,9,'#d22');R(px+23,-24,8,9,'#fff');drawLeaf(px+25,-22,'#d22');
 // side towers
 [cx+10,cx+196].forEach(x=>{R(x,52,16,78,'#a59d84');X.fillStyle='#6b8f7a';X.beginPath();X.moveTo(x-2,52);X.lineTo(x+8,36);X.lineTo(x+18,52);X.fill();});
 // spotlights
 X.fillStyle='rgba(255,255,220,.05)';X.beginPath();X.moveTo(px+18,130);X.lineTo(px-40,0);X.lineTo(px+76,0);X.fill();
 // lawn/plaza + Centennial flame
 R(0,118,W,12,'#dfe6ee');R(0,130,W,H-130,'#5b5d66');for(let i=0;i<W;i+=32)R(i-(camX%32),130,1,H,'#4c4e57');
 const fx2=((ox*4+520)%1400+1400)%1400-200;R(fx2,116,40,8,'#777');R(fx2+16,108-((tick>>2)%3),8,8,'#f80');R(fx2+18,104-((tick>>2)%2),4,6,'#ff0');
 // red tape barricades
 for(let i=-1;i<4;i++){const x=i*160-(camX*.9%160)+60;R(x,122,30,3,'#d22');R(x,126,30,2,'#fff');R(x+2,122,2,8,'#888');R(x+26,122,2,8,'#888');}
 snow();
}
function drawCafe(){
 R(0,0,W,H,'#5a3520');for(let i=0;i<W;i+=24)R(i,0,2,140,'#4a2a18');R(0,0,W,30,'#7a1a1a');text("TIM'S HOCKEY DOUGHNUTS",W/2,9,'#fff',10,'center','#300');
 R(20,40,90,60,'#123');R(24,44,82,52,'#1d2a5a');snow();R(270,40,90,60,'#123');R(274,44,82,52,'#1d2a5a');
 R(0,140,W,76,'#8a5a3a');for(let i=0;i<W;i+=16)for(let j=140;j<H;j+=16)if((i+j)/16%2)R(i,j,16,16,'#7a4a2e');
 R(140,100,104,40,'#c9a46a');R(140,98,104,4,'#eee');for(let i=0;i<5;i++){R(150+i*18,88,10,10,'#fff');R(152+i*18,84,6,4,'#c63');}
 bigLeaf(176,46,4,'#d22');
}

// ---------- RENDER ----------
function drawItem(it){if(it.taken)return;const x=it.x-camX,y=it.y,b=Math.sin(tick*.15)*2;X.fillStyle='rgba(0,0,0,.3)';X.fillRect(x-6,y-1,12,3);
 if(it.k==='coffee'){R(x-4,y-14+b,8,11,'#fff');R(x-4,y-11+b,8,4,'#c22');R(x-5,y-15+b,10,2,'#622');R(x+4,y-11+b,2,4,'#fff');}
 else{R(x-3,y-16+b,6,13,'#c70');R(x-2,y-14+b,4,9,'#fa2');R(x-1,y-19+b,2,3,'#ddd');drawLeaf(x-2,y-12+b,'#d22');}}
function drawEnt(f){const x=f.x-camX;X.fillStyle='rgba(0,0,0,.35)';X.fillRect(Math.round(x-10*(f.boss?1.4:1)),Math.round(f.y-2),20*(f.boss?1.4:1),4);
 if(f.player&&!f.alive)return;if(f.player&&f.inv>0&&f.hurtT<=0&&(tick>>2)%2)return;
 X.save();if(f.boss){X.translate(x,f.y-f.z);X.scale(1.4,1.4);drawFighter(f,0,0);}else drawFighter(f,x,f.y-f.z);X.restore();
 if(f.player&&f.power>0&&tick%6<3){R(x-8,f.y-46,2,2,'#fa2');R(x+7,f.y-36,2,2,'#fa2');}}
function hud(){
 players.forEach((p,i)=>{const x=i?W-118:6;text((i?'2P ':'1P ')+p.name,x,4,i?'#6cf':'#f66',8);R(x,14,102,7,'#000');R(x+1,15,100,5,'#400');R(x+1,15,Math.max(0,p.hp),5,p.hp>30?'#fd2':'#f42');text('x'+Math.max(0,p.lives),x+104,13,'#fff',7);if(p.power>0)text('MAPLE!',x+60,4,'#fa2',7);});
 if(players.length<2&&state==='play'&&(tick>>5)%2)text('2P PRESS ,',W-70,4,'#6cf',7);
 text('SCORE '+String(score).padStart(7,'0'),W/2,4,'#fff',8,'center');
 const b=enemies.find(e=>e.boss);if(b){text(b.name,W/2,H-14-8,'#f66',7,'center');R(W/2-80,H-12,160,6,'#000');R(W/2-79,H-11,158*Math.max(0,b.hp)/b.max,4,'#d22');}
 else{const e=enemies.find(e=>e.flash>0&&!e.boss);if(e)text(e.name,W/2,16,'#ccc',7,'center');}
 floaters.forEach(f=>{if(f.blink&&(tick>>3)%2)return;text(f.s,f.fixed?W/2:f.x-camX,f.y,f.c,f.fixed?10:8,'center')});
 if(paused)text('PAUSED',W/2,90,'#fff',16,'center');
}
function title(){
 const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02030c');g.addColorStop(1,'#2a1030');X.fillStyle=g;X.fillRect(0,0,W,H);stars(7,60);
 for(let i=0;i<14;i++){const h=50+(i*37)%70,x=i*30-4;R(x,H-h,28,h,'#0b0b1a');for(let wy=H-h+5;wy<H-4;wy+=7)for(let wx=x+3;wx<x+25;wx+=6)if((wx*3+wy*7+i)%5<2)R(wx,wy,2,3,'#c9a640');}
 // peace tower silhouette
 R(300,60,20,H-60,'#0b0b1a');X.fillStyle='#0b0b1a';X.beginPath();X.moveTo(298,60);X.lineTo(310,40);X.lineTo(322,60);X.fill();R(306,64,8,8,'#c9a640');
 snowT();
 // heroes jump in
 const j=Math.min(1,stateT/50);const hy=160-Math.sin(j*Math.PI)*60*(1-j)+(1-j)*-80;
 const a={pal:PAL.trucker,face:1,pose:stateT<50?'kick':'idle',anim:tick,flash:0},b={pal:PAL.reporter,face:-1,pose:stateT<50?'punch':'idle',anim:tick,flash:0};
 X.save();X.translate(140,hy);X.scale(2,2);drawFighter(a,0,0);X.restore();X.save();X.translate(244,hy);X.scale(2,2);drawFighter(b,0,0);X.restore();
 // title drop
 const ty=Math.min(30,-60+Math.max(0,stateT-40)*3);
 text('TRUE NORTH',W/2+2,ty+2,'#a00',28,'center',0);text('TRUE NORTH',W/2,ty,'#ffd800',28,'center','#000');
 text('DRAGONS',W/2+2,ty+32,'#a00',28,'center',0);text('DRAGONS',W/2,ty+30,'#ffd800',28,'center','#000');
 if(stateT>80){bigLeaf(W/2-9,ty+62,2,'#d22');
  if((tick>>4)%2)text(isTouch?'TAP TO START':'PRESS START (ENTER)',W/2,176,'#fff',10,'center');
  if(!isTouch)text('Press , for 2-PLAYER',W/2,190,'#6cf',7,'center');
  text('HI '+hi+'   (C) 2026 PASSCOOL STUDIO - FICTIONAL SATIRE',W/2,204,'#888',6,'center');}
}
function snowT(){for(let i=0;i<40;i++){R((i*73+tick*.4)%W,(i*41+tick*(.5+i%3*.3))%H,1,1,'#fff')}}
function render(){
 X.save();if(shake)X.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 if(state==='title')title();
 else if(state==='victory'||state==='tbc'){drawCafe();
  const crowd=[PAL.trucker,PAL.reporter];[0,1].forEach(i=>{X.save();X.translate(100+i*180,190);X.scale(1.5,1.5);drawFighter({pal:crowd[i],face:i?-1:1,pose:(tick>>4)%2?'punch':'idle',anim:tick,flash:0},0,0);X.restore();});
  for(let i=0;i<8;i++){const x=20+i*48;R(x,198-((tick>>3)+i)%2*3,10,14,['#c22','#fff','#36c','#c22'][i%4]);R(x+1,190-((tick>>3)+i)%2*3,8,8,'#d9a37a');}
  if(state==='victory'){R(24,110,W-48,84,'#000');R(26,112,W-52,80,'#00208a');R(28,114,W-56,76,'#000c40');const s=VMSG.slice(0,typeT).split('\n');s.forEach((l,i)=>text(l,36,118+i*10,i===0?'#ffd800':'#fff',8));}
  else{X.fillStyle='rgba(0,0,0,.7)';X.fillRect(0,0,W,H);text('TO BE CONTINUED...',W/2,90,'#ffd800',18,'center');text('FINAL SCORE '+score,W/2,118,'#fff',9,'center');if(stateT>90&&(tick>>4)%2)text('PRESS START',W/2,150,'#aaa',8,'center');}}
 else{LEVELS[level].bg();items.forEach(drawItem);const all=[...enemies,...players].sort((a,b)=>a.y-b.y);all.forEach(drawEnt);
  fx.forEach(f=>{if(f.star)return;X.globalAlpha=f.smoke?Math.min(1,f.t/20):1;R(f.x-camX-f.s/2,f.y-f.s/2,f.s|0,f.s|0,f.c);});X.globalAlpha=1;hud();
  if(state==='intro'){R(0,80,W,30,'rgba(0,0,0,.7)');text(LEVELS[level].name,W/2,90,'#ffd800',10,'center');}
  if(state==='clear'){text(level===1?'THE MEGA-REGULATOR IS DEFEATED!':'STAGE CLEAR!',W/2,86,'#ffd800',12,'center');}
  if(state==='over'){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);text('GAME OVER',W/2,84,'#f44',20,'center');if(stateT>90)text('PRESS START',W/2,120,'#fff',8,'center');}}
 X.restore();
}
// fixed timestep loop
let last=performance.now(),acc=0;
function loop(now){acc+=Math.min(100,now-last);last=now;while(acc>=1000/60){update();acc-=1000/60;}render();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
window.__game={get state(){return state},startGame,startLevel:n=>startLevel(n),get players(){return players},get enemies(){return enemies},get camX(){return camX},win(){state='victory';stateT=0;typeT=0;playSong('win');}};
