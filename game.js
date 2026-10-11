'use strict';
// TRUE NORTH DRAGONS — fictional, family-friendly political satire beat 'em up. All characters are fictional.
const C=document.getElementById('c'),X=C.getContext('2d');
const W=384,H=216,FLOOR_TOP=150,FLOOR_BOT=208,OUT='#120a18';
const TOUCHDEV=('ontouchstart' in window)||navigator.maxTouchPoints>0;let LAYOUT='desk';
function fit(){const vw=innerWidth,vh=innerHeight,wrap=document.getElementById('wrap'),g=id=>document.getElementById(id);let s;
 if(!TOUCHDEV){s=Math.min(vw/W,(vh-34)/H);wrap.style.alignItems='flex-start';wrap.style.paddingTop='4px';LAYOUT='desk';}
 else if(vh-vw*9/16>=160){// portrait / tablet: game on top, controls below
  s=Math.min(vw/W,(vh-170)/H);wrap.style.alignItems='flex-start';wrap.style.paddingTop='4px';LAYOUT='below';
  const cs=Math.max(.6,Math.min(1.15,(vh-H*s-8)/236,vw/2/185));g('lc').style.transform=g('rc').style.transform=`scale(${cs})`;
  g('sys').style.cssText=`left:50%;right:auto;top:${Math.round(H*s+14)}px;transform-origin:50% 0;transform:translateX(-50%) scale(${Math.min(1,cs)})`;}
 else{// landscape: letterbox the game between side gutters holding the controls
  const G=Math.max(110,Math.min(190,vw*.18));s=Math.min((vw-2*G)/W,vh/H);wrap.style.alignItems='center';wrap.style.paddingTop='0';LAYOUT='side';
  const gut=(vw-W*s)/2,cs=Math.min(gut/182,(vh-44)/232,1.2);g('lc').style.transform=g('rc').style.transform=`scale(${cs})`;
  g('sys').style.cssText=`transform:scale(${Math.min(gut/172,1)})`;}
 C.style.width=W*s+'px';C.style.height=H*s+'px';}
addEventListener('resize',fit);fit();

// ---------- INPUT ----------
const keys={},pressed={};
const KM={KeyW:'p1up',KeyS:'p1down',KeyA:'p1left',KeyD:'p1right',KeyJ:'p1punch',KeyK:'p1kick',KeyL:'p1jump',KeyI:'p1special',Semicolon:'p2special',Numpad0:'p2special',Escape:'pause',KeyU:'p1throw',Numpad4:'p2throw',Quote:'p2throw',
 ArrowUp:'p2up',ArrowDown:'p2down',ArrowLeft:'p2left',ArrowRight:'p2right',Comma:'p2punch',Period:'p2kick',Slash:'p2jump',Numpad1:'p2punch',Numpad2:'p2kick',Numpad3:'p2jump',
 Enter:'start',Space:'start',NumpadEnter:'start'};
addEventListener('keydown',e=>{audio();if(typeof onKeyTyped==='function')onKeyTyped(e);const k=KM[e.code];if(e.code==='KeyM')muted=!muted;if(e.code==='KeyP'&&state==='play'){paused=!paused;SFX.pause();volSel=0;}if(k){if(!keys[k])pressed[k]=1;keys[k]=1;e.preventDefault();}});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)keys[k]=0;});
const isTouch='ontouchstart'in window||navigator.maxTouchPoints>0;
if(isTouch){document.getElementById('touch').style.display='block';document.getElementById('help').style.display='none';}
document.querySelectorAll('.tb[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{audio();e.preventDefault();if(!keys[k])pressed[k]=1;keys[k]=1;});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>keys[k]=0));});
const dp=document.getElementById('t-dpad');
function dpad(e){const r=dp.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;keys.p1left=dx<-15;keys.p1right=dx>15;keys.p1up=dy<-15;keys.p1down=dy>15;}
dp.addEventListener('pointerdown',e=>{audio();dp.setPointerCapture(e.pointerId);dpad(e)});dp.addEventListener('pointermove',e=>{if(e.buttons||e.pressure)dpad(e)});
['pointerup','pointercancel'].forEach(t=>dp.addEventListener(t,()=>{keys.p1left=keys.p1right=keys.p1up=keys.p1down=0}));
C.addEventListener('pointerdown',e=>{audio();const r=C.getBoundingClientRect(),lx=(e.clientX-r.left)/r.width*W,ly=(e.clientY-r.top)/r.height*H;if(typeof paused!=='undefined'&&paused&&pauseTap(lx,ly))return;if(state==='entry'&&entryTap(lx,ly))return;if(state==='title'&&stateT>80&&ly>96&&ly<110){gameMode=gameMode==='survie'?'arcade':'survie';SFX.blip();return;}if(state==='select'&&ly>40&&ly<190){const c=lx<W/3?0:lx<W*2/3?1:2;if(SELS&&SELS.c[0]!==c){SELS.c[0]=c;SFX.blip();return;}}pressed.start=1;});

// ---------- ASSETS ----------
const LOAD={n:0,done:0};function trackImg(i){LOAD.n++;i.onload=i.onerror=()=>LOAD.done++;return i;}
const IMG={};['intro','cut1','cut2','cut4','cut5','lock_a','lock_b','war_a','war_b','stage1_a','stage1_b','stage2_a','stage2_b','stage3_a','stage3_b','stage4_a','stage4_b','stage5_a','ending'].forEach(n=>{const i=trackImg(new Image());i.src='assets/'+n+'.jpg';IMG[n]=i;});const LOGO=trackImg(new Image());LOGO.src='assets/logo.png';
const POSES={hero3:['idle','walk','punch','kick','hit','down','jumpkick','special'],hero1:['idle','walk','punch','kick','hit','down','jumpkick','special','stick','shovel'],hero2:['idle','walk','punch','kick','hit','down','jumpkick','special','stick','shovel']};
['tax','bur','bot','boss','insp','final','drone','lob','chair','mega','san','qr','snitch','doc','pm','reset','soldier','mech','general','gen'].forEach(c=>POSES[c]=['idle','attack','hit','down']);
const SPR={},WHITE={};for(const c in POSES){SPR[c]={};for(const p of POSES[c]){const i=trackImg(new Image());i.src='assets/sprites/'+c+'_'+p+'.png';SPR[c][p]=i;}}
const ITEM={};['coffee','syrup','donuts','loonie'].forEach(n=>{const i=new Image();i.src='assets/sprites/item_'+n+'.png';ITEM[n]=i;});
const FLIP={};function flipOf(img){const k=img.src;if(FLIP[k])return FLIP[k];const o=document.createElement('canvas');o.width=img.width;o.height=img.height;const c=o.getContext('2d');c.translate(img.width,0);c.scale(-1,1);c.drawImage(img,0,0);return FLIP[k]=o;}
function whiteOf(img){if(WHITE[img.src])return WHITE[img.src];const o=document.createElement('canvas');o.width=img.width;o.height=img.height;const c=o.getContext('2d');c.drawImage(img,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);return WHITE[img.src]=o;}

// ---------- TEXT ----------
const OBJ={};['w_stick','w_shovel','w_puck','b_crate','b_barrel','b_can','p_invoice','p_brief','p_mic','p_splinter','machine','o_chair','p_directive','p_ice','p_shell','o_phone','p_scrap','o_nuke','o_nuke_broken','o_pedestal'].forEach(n=>{const i=trackImg(new Image());i.src='assets/sprites/'+n+'.png';OBJ[n]=i;});
const DARK={};function darkOf(img){if(DARK[img.src])return DARK[img.src];const o=document.createElement('canvas');o.width=img.width;o.height=img.height;const c=o.getContext('2d');c.drawImage(img,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='#1a0c08';c.fillRect(0,0,o.width,o.height);return DARK[img.src]=o;}
const ok=i=>i&&i.complete&&i.width;
// soft drop shadow
function shadow(x,y,rx,ry,a=.45){const g=X.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.7,`rgba(0,0,0,${a*.6})`);g.addColorStop(1,'rgba(0,0,0,0)');X.save();X.translate(x,y);X.scale(1,ry/rx);X.translate(-x,-y);X.fillStyle=g;X.beginPath();X.arc(x,y,rx,0,7);X.fill();X.restore();}
// draw an object sprite (2x art) centred at bottom
function glowObj(n,x,y,sc,rot,c='rgba(255,250,210,.95)'){X.save();X.shadowColor=c;X.shadowBlur=7;obj(n,x,y,sc,rot,.5,.5);X.shadowBlur=3;obj(n,x,y,sc,rot,.5,.5);X.restore();}
function trail(n,x,y,vx,sc,rot){for(let k=1;k<4;k++){X.globalAlpha=.3/k;obj(n,x-vx*k*1.6,y,sc,rot,.5,.5);}X.globalAlpha=1;}
function obj(n,x,y,sc=1,rot=0,ax=.5,ay=1){const i=OBJ[n];if(!ok(i))return;const w=i.width/2*sc,h=i.height/2*sc;X.save();X.translate(x,y);if(rot)X.rotate(rot);X.drawImage(i,-w*ax,-h*ay,w,h);X.restore();}
// arcade panel: rounded, bevelled, gradient, pixel border
function rr(x,y,w,h,r){X.beginPath();if(X.roundRect)X.roundRect(x,y,w,h,r);else X.rect(x,y,w,h);}
function panel(x,y,w,h,o={}){const r=o.r??4,c1=o.c1||'#23306e',c2=o.c2||'#0a0f2e',bd=o.bd||'#ffd800',a=o.a??.92;X.save();X.globalAlpha*=a;
 rr(x-1,y-1,w+2,h+2,r+1);X.fillStyle=OUT;X.fill();const g=X.createLinearGradient(0,y,0,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);rr(x,y,w,h,r);X.fillStyle=g;X.fill();
 X.globalAlpha=Math.min(1,X.globalAlpha/a)*(o.a??.92);rr(x+.5,y+.5,w-1,h-1,r);X.strokeStyle=bd;X.lineWidth=1;X.stroke();rr(x+2,y+2,w-4,h-4,Math.max(1,r-2));X.strokeStyle='rgba(255,255,255,.18)';X.stroke();
 X.fillStyle='rgba(255,255,255,.10)';rr(x+2,y+2,w-4,Math.min(h*.4,10),Math.max(1,r-2));X.fill();
 if(o.studs!==false&&w>40&&h>14){X.fillStyle=bd;[[x+3,y+3],[x+w-5,y+3],[x+3,y+h-5],[x+w-5,y+h-5]].forEach(([a,b])=>X.fillRect(a,b,2,2));}X.restore();}
// gradient bar with pixel border
function bar(x,y,w,h,p,c1,c2,bg='#300'){rr(x-1,y-1,w+2,h+2,2);X.fillStyle=OUT;X.fill();X.fillStyle=bg;X.fillRect(x,y,w,h);if(p>0){const g=X.createLinearGradient(0,y,0,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);X.fillStyle=g;X.fillRect(x,y,w*Math.min(1,p),h);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(x,y,w*Math.min(1,p),1);}}
function glint(x,y,t){if(t%70>12)return;const k=Math.sin((t%70)/12*Math.PI)*4;X.save();X.globalCompositeOperation='lighter';X.fillStyle='rgba(255,255,230,.9)';X.fillRect(x-k,y-.5,k*2,1);X.fillRect(x-.5,y-k,1,k*2);X.fillRect(x-1,y-1,2,2);X.restore();}
function text(s,x,y,col='#fff',size=8,align='left',shadow='#000'){X.font=`bold ${size}px monospace`;X.textAlign=align;X.textBaseline='top';if(shadow){X.fillStyle=shadow;X.fillText(s,Math.round(x)+1,Math.round(y)+1);}X.fillStyle=col;X.fillText(s,Math.round(x),Math.round(y));}
function leafBig(x,y,s,c){X.fillStyle=c;const m=["....#....","...###...","#..###..#","##.###.##","#########",".#######.","..#####..","....#....","....#...."];m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='#')X.fillRect(x+i*s,y+j*s,s,s)}));}

// ---------- DATA ----------
// Difficulty multipliers. The pre-v4 balance corresponds to hp/dmg=1, cd=1, extra=0 ("easy-ish").
const DIFFS=[
 {name:'NORMAL',tokens:2,hp:1,dmg:.68,cd:.85,wind:.85,extra:1,lives:3,cont:4,heal:.75,block:.06,col:'#7f7'},
 {name:'DIFFICILE',tokens:2,hp:1.7,dmg:1.6,cd:.55,wind:.72,extra:2,lives:2,cont:1,heal:.4,block:.12,col:'#fc4'},
 {name:'CAUCHEMAR',tokens:3,hp:2.1,dmg:2.0,cd:.42,wind:.62,extra:3,lives:1,cont:0,heal:.25,block:.2,col:'#f44'}];
let diffIdx=0;const D=()=>DIFFS[diffIdx];
const EN={
 taxman:{spr:'tax',name:'PERCEPTEUR DE TAXE CARBONE',hp:30,spd:.65,dmg:6,pts:100,sc:1},
 bureau:{spr:'bur',name:'BUREAUCRATE',hp:44,spd:.5,dmg:8,pts:150,sc:1},
 bot:{spr:'bot',name:'ROBOT-CENSEUR',hp:35,spd:.85,dmg:7,pts:200,sc:1},
 drone:{spr:'drone',name:'DRONE DE SURVEILLANCE',hp:20,spd:1,dmg:6,pts:250,sc:1,fly:1},
 lob:{spr:'lob',name:'LOBBYISTE',hp:28,spd:1,dmg:5,pts:220,sc:1},
 chair:{spr:'chair',name:'FONCTIONNAIRE EN CHAISE',hp:36,spd:.45,dmg:8,pts:220,sc:1},
 mega:{spr:'mega',name:'CRIEUR OFFICIEL',hp:28,spd:.5,dmg:4,pts:240,sc:1},
 insp:{spr:'insp',name:'INSPECTEUR DES PERMIS',hp:40,spd:.65,dmg:6,pts:180,sc:1},
 bigbur:{spr:'bur',name:'SOUS-SOUS-MINISTRE ADJOINT',hp:180,spd:.55,dmg:12,pts:1500,sc:1.25,boss:1},
 boss:{spr:'boss',name:'LE MÉGA-RÉGULATEUR',hp:360,spd:.6,dmg:14,pts:5000,sc:1,boss:1,brief:1},
 boss2:{spr:'boss',name:'LE MÉGA-RÉGULATEUR (REVANCHE)',hp:400,spd:.7,dmg:13,pts:6000,sc:1,boss:1,brief:1},
 giantinsp:{spr:'insp',name:'LE GRAND INSPECTEUR DES PERMIS',hp:420,spd:.62,dmg:13,pts:6000,sc:1.4,boss:1},
 final:{spr:'final',name:'LE MINISTÈRE',hp:640,spd:.6,dmg:16,pts:20000,sc:1,boss:1,final:1},
 san:{spr:'san',name:'AGENT SANITAIRE',hp:26,spd:.7,dmg:5,pts:150,sc:1},
 qr:{spr:'qr',name:'INSPECTEUR DU PASSEPORT',hp:30,spd:.6,dmg:5,pts:200,sc:1},
 snitch:{spr:'snitch',name:'DÉLATEUR',hp:16,spd:.95,dmg:4,pts:80,sc:1},
 doc:{spr:'doc',name:'LA DOCTEURE EN CHEF',hp:200,spd:.55,dmg:10,pts:4000,sc:1,boss:1,doc:1},
 pm:{spr:'pm',name:'LE PREMIER MINISTRE SELFIE',hp:250,spd:.7,dmg:11,pts:6000,sc:1,boss:1,pm:1},
 reset:{spr:'reset',name:'LE GRAND RÉINITIALISEUR',hp:230,spd:.45,dmg:11,pts:8000,sc:1,boss:1,reset:1},
 soldier:{spr:'soldier',name:'SOLDAT DE LA COALITION',hp:36,spd:.75,dmg:7,pts:220,sc:1},
 para:{spr:'soldier',name:'PARACHUTISTE',hp:30,spd:.85,dmg:5,pts:260,sc:1},
 mech:{spr:'mech',name:'MÉCHA ANTI-ÉMEUTE',hp:70,spd:.4,dmg:10,pts:500,sc:1},
 general:{spr:'general',name:'LE GÉNÉRAL APOCALYPSE',hp:420,spd:.4,dmg:14,pts:25000,sc:1,boss:1,gen:1},
 gen:{spr:'gen',name:'LE GÉNÉRAL APOCALYPSE (À PIED)',hp:75,spd:1.05,dmg:9,pts:10000,sc:1.6,boss:1,onfoot:1}};
const SDT=[0,0,1,2,3,4,4];const SD=()=>SDT[stage]||0;
function bossSong(t){const d=EN[t];return d.final?'final':d.pm||d.reset?'bossL':d.gen||d.onfoot?'bossW':'boss';}
const POOLS=[['snitch','san'],['taxman','bureau'],['bureau','bot'],['taxman','bureau','bot','insp'],['insp','taxman'],['bot','bot','bureau'],['soldier','para']];
const STAGES=[
 {title:'CONFINEMENT',sub:'RESTEZ CHEZ VOUS... OU PAS !',panels:['lock_a'],arena:{img:'lock_b'},song:'lock',len:2300,snow:0,
  waves:[{at:150,e:['snitch','snitch','snitch']},{at:450,e:['san','snitch','snitch']},{at:750,e:['qr','san','snitch']},{at:1050,e:['doc','snitch'],boss:1},{at:1400,e:['qr','san','chair','snitch']},{at:1750,e:['san','qr','snitch','snitch']},{at:2050,e:['pm','san'],boss:1},{at:2240,e:['reset'],boss:1}],items:[[300,'coffee'],[600,'stick'],[900,'coffee'],[1150,'syrup'],[1500,'puck'],[1900,'coffee'],[2100,'donuts'],[2250,'coffee']],brk:[[350,'crate'],[800,'can'],[1300,'barrel'],[1700,'crate'],[2050,'can']]},
 {title:'OTTAWA, LA NUIT',panels:['stage1_a','stage1_b'],song:'s1',len:1700,snow:1,
  waves:[{at:150,e:['taxman','taxman']},{at:500,e:['chair','taxman','taxman']},{at:850,e:['bureau','bureau','taxman']},{at:1200,e:['taxman','chair','bureau','insp']},{at:1600,e:['bigbur','taxman'],boss:1}],items:[[420,'coffee'],[760,'stick'],[900,'puck'],[1000,'syrup'],[1300,'coffee']],brk:[[330,'crate'],[700,'can'],[1080,'barrel'],[1450,'crate']]},
 {title:'LA COLLINE DU PARLEMENT',panels:['stage2_a','stage2_b'],song:'s2',len:1700,snow:1,
  waves:[{at:150,e:['bureau','mega','bot']},{at:480,e:['bot','bot','bureau']},{at:820,e:['bot','bureau','mega','taxman']},{at:1150,e:['bot','mega','bot','bureau']},{at:1600,e:['boss','bureau','bot'],boss:1}],items:[[350,'coffee'],[600,'shovel'],[700,'syrup'],[1100,'donuts']],brk:[[300,'can'],[650,'crate'],[1000,'barrel'],[1400,'can']]},
 {title:'LA FRONTIÈRE',panels:['stage3_a','stage3_b'],song:'s3',len:1900,snow:0,
  waves:[{at:150,e:['taxman','lob','bot','insp']},{at:500,e:['bot','drone','taxman','taxman']},{at:900,e:['insp','lob','drone','bot']},{at:1300,e:['taxman','lob','drone','insp','bot']},{at:1800,e:['boss2','bigbur'],boss:1}],items:[[400,'coffee'],[650,'stick'],[800,'syrup'],[1200,'coffee'],[1550,'donuts']],brk:[[320,'barrel'],[700,'crate'],[1100,'barrel'],[1600,'crate']]},
 {title:'LES CHAMPS PÉTROLIFÈRES',panels:['stage4_a','stage4_b'],song:'s4',len:1900,snow:1,
  waves:[{at:150,e:['insp','drone','taxman']},{at:500,e:['insp','chair','taxman']},{at:900,e:['insp','drone','taxman','bureau']},{at:1300,e:['taxman','insp','chair','drone']},{at:1800,e:['giantinsp','insp','insp'],boss:1}],items:[[350,'coffee'],[600,'shovel'],[750,'syrup'],[1150,'donuts'],[1500,'coffee']],brk:[[300,'barrel'],[680,'barrel'],[1050,'crate'],[1650,'barrel']]},
 {title:'MINISTÈRE DES NOUVELLES APPROUVÉES',panels:['stage5_a'],song:'s5',len:1900,snow:0,
  waves:[{at:150,e:['bot','drone','bot']},{at:500,e:['bot','mega','drone','bot']},{at:900,e:['bot','mega','lob','chair','drone']},{at:1300,e:['drone','mega','lob','chair','bot']},{at:1800,e:['final'],boss:1}],items:[[400,'coffee'],[650,'puck'],[800,'syrup'],[1200,'donuts'],[1600,'coffee']],brk:[[350,'can'],[750,'crate'],[1150,'can'],[1550,'crate']]},
 {title:'TROISIÈME GUERRE MONDIALE',sub:'ARRÊTEZ LE BOUTON ROUGE !',panels:['war_a'],arena:{img:'war_b',last:1},song:'war',len:2300,snow:0,war:1,
  waves:[{at:150,e:['soldier','soldier','drone']},{at:500,e:['para','para','soldier']},{at:850,e:['mech','soldier','soldier']},{at:1250,e:['para','drone','soldier','mech']},{at:1700,e:['mech','para','para','soldier','drone']},{at:2240,e:['general'],boss:1}],items:[[350,'coffee'],[600,'shovel'],[800,'syrup'],[1100,'coffee'],[1500,'donuts'],[1900,'coffee'],[2200,'syrup']],brk:[[300,'barrel'],[700,'crate'],[1050,'barrel'],[1450,'can'],[1850,'barrel']]}];

// Hero profiles (stats shown on the select screen are derived from these numbers)
const HERO={hero1:{spd:1.25,dmg:1.35,hp:150,armor:.88,kb:1.5,chain:3,punchT:11,kickT:16,cd:1,special:'horn',reach:1},
            hero2:{spd:1.85,dmg:1.1,hp:115,kb:1,chain:4,punchT:9,kickT:13,cd:.7,special:'flash',reach:1.15},
            hero3:{spd:1.5,dmg:1.18,hp:125,kb:1.25,chain:4,punchT:11,kickT:15,cd:.85,special:'wheat',reach:1.4}};
const HEROES=['hero1','hero2','hero3'],HNAME={hero1:'CAMIONNEUR',hero2:'REPORTER',hero3:'FERMIÈRE'};let SEL=[],SELS=null;
// ---------- STATE ----------
let volSel=0,pauseSel=0,bannerT=0,bannerName='',charSel=0,twoStart=false,introT=0,STATS={time:0,ko:0,maxc:0,loon:0,loonS:0,cont:0,maxStage:0},state='loading',paused=false,tick=0,stage=0,camX=0,camLock=null,players=[],enemies=[],items=[],fx=[],floaters=[],hazards=[],breakables=[],waveIdx=0,score=0,hi=0,stateT=0,shake=0,hitstop=0,slowmo=0,typeT=0,stageTime=0,tally=null,goT=0,contLeft=0,stageDmg=0,stageStartScore=0,entry=null,titleMode=0;
const MODES=['arcade0','arcade1','arcade2','survie'],MODEN={arcade0:'ARCADE · NORMAL',arcade1:'ARCADE · DIFFICILE',arcade2:'ARCADE · CAUCHEMAR',survie:'MODE SURVIE'};let gameMode='arcade',tableMode='arcade0';
let HS={};try{HS=JSON.parse(localStorage.tndHS||'{}')||{}}catch(e){HS={}}MODES.forEach(m=>{if(!Array.isArray(HS[m]))HS[m]=[];});
if(!HS.arcade0.some(s=>s[1]>0)){try{HS.arcade0=JSON.parse(localStorage.tndScores2||'[]').filter(s=>s[1]>0)}catch(e){}}
MODES.forEach(m=>{HS[m]=HS[m].filter(s=>Array.isArray(s)).sort((a,b)=>b[1]-a[1]).slice(0,10);while(HS[m].length<10)HS[m].push(['---',0]);});
let hiOf=()=>Math.max(...MODES.map(m=>HS[m][0][1]));hi=hiOf();function modeKey(){return gameMode==='survie'?'survie':'arcade'+diffIdx;}
function newPlayer(i){const hk=SEL[i]||(i?HEROES.find(h=>h!==(players[0]&&players[0].spr||HEROES[charSel])):HEROES[charSel]);const H=HERO[hk];return{score:0,rev:0,pal:i===1&&players[0]&&players[0].spr===hk?1:0,id:i,H,maxhp:H.hp,chargeT:0,dashT:0,tapT:0,tapDir:0,weapon:null,player:true,spr:hk,name:HNAME[hk],x:camX+60+i*30,y:170+i*20,z:0,vz:0,face:1,hp:H.hp,lives:D().lives,pose:'idle',anim:0,atk:0,atkType:'',cd:0,hurtT:0,inv:120,flash:0,combo:0,comboT:0,power:0,alive:true,hits:0,hitsT:0,held:0,spin:0}}
function newEnemy(t,x,y){const d=EN[t],k=(1+.18*SD())*D().hp*(players.length>1?(d.boss?1.45:1.2):1)*(gameMode==='survie'?survHP():1);return{type:t,spr:d.spr,sc:d.sc,name:d.name,x,y,z:0,vz:0,face:-1,hp:d.hp*k,max:d.hp*k,spd:d.spd*(1+.06*SD())*(1+diffIdx*.08),dmg:d.dmg*(1+.1*SD())*D().dmg,pts:d.pts,pose:'idle',anim:0,atk:0,atkKind:'',cd:40+Math.random()*60,hurtT:0,flash:0,dead:0,knock:0,vx:0,boss:!!d.boss,final:!!d.final,brief:!!d.brief,think:0,ty:0,side:Math.random()<.5?1:-1,special:200,phase:1,invT:0,nextInv:.75,dash:0,block:0,alt:d.fly?34:0,lowT:0,las:0,chT:0,shout:0,bribeT:0,bribeCD:200+Math.random()*200,gold:0,coins:0,doc:!!d.doc,pm:!!d.pm,reset:!!d.reset,gen:!!d.gen,onfoot:!!d.onfoot,shieldT:0,arm:0,sp2:150}}
let bonusM=null,bonusT=0,bonusDone=false,bonusEnd=0;
function startBonus(){bonusDone=true;state='bonus';stateT=0;camX=0;camLock=0;enemies=[];items=[];breakables=[];hazards=[];projs=[];fx=[];floaters=[];bonusT=30*60;bonusEnd=0;
 bonusM={x:250,y:182,hp:60,max:60,flash:0,shakeT:0};players.forEach((p,i)=>{p.x=90;p.y=170+i*22;p.hp=Math.max(p.hp,1);});playSong('bonus');SFX.stinger();}
function hitBonus(p,reach){const m=bonusM;if(m.hp<=0)return;const dx=(m.x-p.x)*p.face;if(dx>-10&&dx<reach+34&&Math.abs(m.y-p.y)<26){const d=p.atkType==='charge'?6:p.weapon||p.atkType==='kick'||p.atkType==='jkick'?2:1;m.hp-=d;m.flash=6;m.shakeT=8;shake=3;hitstop=2;score+=150*d;SFX.smash('crate',m.x);
  floaters.push({x:m.x+(Math.random()-.5)*40,y:m.y-90,t:26,s:'+'+150*d,c:'#ffd800',small:1});for(let i=0;i<3;i++)fx.push({x:m.x+(Math.random()-.5)*30,y:m.y-60,vx:(Math.random()-.5)*4,vy:-Math.random()*3-1,t:50,img:'p_invoice',sx:0,sy:0,sw:OBJ.p_invoice.width||58,sh:OBJ.p_invoice.height||52,rot:Math.random()*6,vr:(Math.random()-.5)*.3,grav:1,sc:.6,floor:m.y+12});
  if(m.hp<=0){bonusEnd=1;STATS.bonusKO=1;const tb=Math.floor(bonusT/60)*300;score+=10000+tb;shake=14;SFX.crunch(m.x);SFX.clear();for(let i=0;i<10;i++)poof(m.x+(Math.random()-.5)*60,m.y-Math.random()*20);for(let i=0;i<36;i++)fx.push({x:m.x+(Math.random()-.5)*40,y:m.y-60,vx:(Math.random()-.5)*7,vy:-2-Math.random()*5,t:70+Math.random()*30|0,img:'p_invoice',sx:0,sy:0,sw:OBJ.p_invoice.width||58,sh:OBJ.p_invoice.height||52,rot:Math.random()*6,vr:(Math.random()-.5)*.4,grav:1,sc:.8,floor:m.y+10+Math.random()*20});floaters.push({x:m.x,y:m.y-110,t:120,s:'DÉTRUITE! +'+(10000+tb),c:'#ffd800'});}}}
function drawBonusM(){const m=bonusM,i=OBJ.machine,r=Math.max(0,m.hp/m.max);if(m.shakeT>0)m.shakeT--;if(m.flash>0)m.flash--;const x=m.x-camX+(m.shakeT>0?Math.sin(m.shakeT*2.5)*3:0),y=m.y,rot=m.shakeT>0?Math.sin(m.shakeT*1.9)*.02:0;
 shadow(x,y,64,10,.55);if(!ok(i))return;const w=i.width/2,h=i.height/2;X.save();X.translate(x,y);X.rotate(rot);
 if(m.hp<=0){X.scale(1,.55);X.drawImage(i,-w/2,-h,w,h);X.globalAlpha=.75;X.drawImage(darkOf(i),-w/2,-h,w,h);X.restore();if(tick%5===0)fx.push({x:m.x+(Math.random()-.5)*60,y:y-40,vx:0,vy:-.6,t:40,c:'rgba(50,50,50,.7)',s:14,smoke:1});return;}
 X.drawImage(i,-w/2,-h,w,h);if(r<1){X.globalAlpha=(1-r)*.55;X.drawImage(darkOf(i),-w/2,-h,w,h);X.globalAlpha=1;}
 if(m.flash>0&&(m.flash>>1)%2){X.globalAlpha=.6;X.drawImage(whiteOf(i),-w/2,-h,w,h);X.globalAlpha=1;}
 const cr=[[r<.8,[[-30,-70],[-22,-55],[-28,-44],[-18,-34]]],[r<.55,[[20,-80],[12,-62],[22,-50],[14,-36]]],[r<.3,[[-6,-88],[0,-72],[-8,-60],[2,-48],[-4,-40]]]];
 cr.forEach(([on,pts])=>{if(!on)return;X.strokeStyle='rgba(10,5,5,.9)';X.lineWidth=2;X.beginPath();pts.forEach(([a,b],j)=>j?X.lineTo(a,b):X.moveTo(a,b));X.stroke();X.strokeStyle='rgba(255,140,60,.5)';X.lineWidth=1;X.stroke();});X.restore();
 if(r<.6&&tick%(r<.3?3:8)===0)for(let k=0;k<3;k++)fx.push({x:m.x+(Math.random()-.5)*70,y:y-30-Math.random()*60,vx:(Math.random()-.5)*4,vy:-Math.random()*3,t:12,c:Math.random()<.5?'#ffe060':'#fff',spark:1});
 if(tick%(r<.3?3:r<.7?7:16)===0)fx.push({x:m.x+(Math.random()<.5?-22:22),y:y-h+6,vx:(Math.random()-.5)*.6,vy:-.8,t:50,c:r<.5?'rgba(40,40,40,.7)':'rgba(140,140,140,.55)',s:10,smoke:1});
 bar(m.x-camX-40,y-h-8,80,4,r,'#ffe060','#e08000');}
const NEWE=['drone','lob','chair','mega','san','qr','snitch','soldier','para','mech'];let SEEN=new Set(),newBan=null;
function startGame(two){bonusDone=false;SEEN=new Set();newBan=null;score=0;STATS={time:0,ko:0,maxc:0,loon:0,loonS:0,cont:0,maxStage:0};contLeft=D().cont;players=[newPlayer(0)];if(two)players.push(newPlayer(1));SFX.confirm();STATS.wave=0;if(gameMode==='survie')startSurvival();else goStage(0);}
function startStage(n){stage=n;NUKE.broken=0;camX=0;camLock=null;waveIdx=0;enemies=[];fx=[];floaters=[];hazards=[];stageTime=0;goT=0;stageDmg=0;stageStartScore=score;
 // fewer heals on harder settings (deterministic per stage so runs are comparable)
 items=STAGES[n].items.filter(([x,k],i)=>k==='syrup'||k==='stick'||k==='shovel'||k==='puck'||((i*37+n*11)%100)/100<D().heal).map(([x,k])=>({x,y:172+((x*7)%30),k,taken:0}));
 breakables=STAGES[n].brk.map(([x,k],i)=>({x,y:162+((x*13)%40),k,hp:2,flash:0,drop:i%3===1&&Math.random()<D().heal?'coffee':'loonie'}));
 players.forEach((p,i)=>{p.x=60+i*30;p.y=170+i*20;p.z=0;p.inv=120;p.atk=0;p.hurtT=0;p.held=0;if(!p.alive&&p.lives>0)p.alive=true;});state='card';stateT=0;playSong(STAGES[n].song);SFX.stinger();setAmbience([0,0,1,2,3,4,5][n]);}

// ---------- UPDATE ----------
const inp=(p,a)=>keys['p'+(p.id+1)+a],prs=(p,a)=>pressed['p'+(p.id+1)+a];
function hurtPlayer(t,dmg,dir,knock){if(t.inv>0||t.hurtT>0||!t.alive||t.z>18||t.spin>0)return false;if(t.marked>0)dmg*=1.25;if(t.H&&t.H.armor)dmg*=t.H.armor;t.frz=0;rumble(t.id,knock?.8:.3,knock?.5:.6,knock?220:90);t.hp-=dmg;stageDmg+=dmg;t.flash=10;knock=knock||t.hp<=0;t.hurtT=knock?70:18;t.knocked=knock;t.inv=0;t.afterHit=knock?0:36;t.x+=dir*(knock?14:6);t.atk=0;t.held=0;t.hits=0;shake=Math.max(shake,knock?7:4);if(knock)hitstop=5;if(isTouch&&navigator.vibrate)try{navigator.vibrate(knock?60:25)}catch(e){}if(t.hp<=0)SFX.death(t.x);else if(knock)SFX.pdown(t.x);else SFX.hurt(t.x);spark(t.x,t.y-48);floaters.push({x:t.x,y:t.y-80,t:30,s:'-'+Math.round(dmg),c:'#f66',small:1});return true;}
function updatePlayer(p){
 if(!p.alive)return;const H=p.H,f0=p.face;
 for(const q of players)if(q!==p&&!q.alive&&q.lives<=0&&Math.abs(q.x-p.x)<32&&Math.abs(q.y-p.y)<18){q.rev=(q.rev||0)+1;if(q.rev>=120){q.alive=true;q.lives=1;q.hp=Math.round(q.maxhp*.5);q.inv=150;q.rev=0;q.hurtT=0;q.held=0;q.frz=0;q.pose='idle';floaters.push({x:q.x,y:q.y-100,t:60,s:'RÉANIMÉ!',c:'#7f7'});SFX.oneup();}}p.anim++;if(p.wcomboT>0)p.wcomboT--;if(p.inv>0)p.inv--;if(p.flash>0)p.flash--;if(p.cd>0)p.cd--;if(p.comboT>0)p.comboT--;else p.combo=0;if(p.power>0)p.power--;if(p.hitsT>0)p.hitsT--;else p.hits=0;if(p.tapT>0)p.tapT--;
 if(p.z>0||p.vz){p.z+=p.vz;p.vz-=.32;if(p.z<=0){p.z=0;p.vz=0;SFX.land(p.x);if(p.atkType==='jkick'){p.atk=0;p.pose='idle';p.atkType='';}if(p.atkType==='pound'){doPound(p);p.atk=8;p.atkType='weapon_end';p.pose='punch';p.cd=16;}}}
 if(p.marked>0)p.marked--;
 if(p.frz>0){p.frz--;p.pose='hurt';if(prs(p,'punch')||prs(p,'kick'))p.frz-=6;if(p.frz<=0){p.frz=0;p.inv=30;if(p.frzK==='ice')breakIce(p);}return;}
 if(p.held>0){p.held--;p.pose='hurt';if((inp(p,'left')||inp(p,'right'))&&(prs(p,'punch')||prs(p,'kick')))p.held-=8;if(p.held<=0)p.inv=40;return;}
 if(p.hurtT>0){p.hurtT--;p.chargeT=0;p.dashT=0;p.pose=p.knocked&&p.hurtT<56?'down':'hurt';
  if(p.hurtT===0){if(!p.knocked&&p.afterHit)p.inv=p.afterHit-18;if(p.hp<=0){p.lives--;p.weapon=null;if(p.lives>0){p.hp=p.maxhp;p.inv=150;poof(p.x,p.y);}else{p.alive=false;poof(p.x,p.y);}}else if(p.knocked)p.inv=70;p.knocked=false;}return;}
 if(p.spin>0){p.spin--;p.pose='special';if(H.special==='horn'){if(p.spin===22)doHorn(p);}else if(p.spin===24)(H.special==='wheat'?doWheat:doFlash)(p);p.inv=Math.max(p.inv,2);return;}
 let dx=(inp(p,'right')?1:0)-(inp(p,'left')?1:0),dy=(inp(p,'down')?1:0)-(inp(p,'up')?1:0);if(p.scram>0){p.scram--;dx=-dx;}
 // hero special (punch+kick together or SPECIAL button)
 if(prs(p,'throw')&&p.z===0&&p.atk<=0&&p.cd<=0){if(p.weapon){throwWeapon(p);return;}const g=enemies.find(e=>!e.dead&&!e.boss&&Math.abs(e.x-p.x)<28&&Math.abs(e.y-p.y)<10&&!(e.alt>0));if(g){p.atkType='throw';p.atk=18;p.cd=20;p.pose='punch';p.grab=g;SFX.grab(g.x);g.x=p.x+p.face*16;g.hurtT=Math.max(g.hurtT,20);g.atk=0;return;}}
 if(p.weapon&&p.z===0&&p.atk<=0&&((prs(p,'punch')&&inp(p,'kick'))||(prs(p,'kick')&&inp(p,'punch')))){throwWeapon(p);return;}
 if(p.z===0&&(prs(p,'special')||(prs(p,'punch')&&inp(p,'kick'))||(prs(p,'kick')&&inp(p,'punch')))){if(p.hp>10){p.hp-=8;p.spin=30;p.atk=0;p.atkType='';p.chargeT=0;
  rumble(p.id,.6,.9,300);if(H.special==='horn')floaters.push({x:p.x,y:p.y-100,t:45,s:'KLAXON DU CONVOI!',c:'#fa2'});else if(H.special==='wheat'){floaters.push({x:p.x,y:p.y-100,t:45,s:'TORNADE DE BLÉ!',c:'#fd4'});SFX.whoosh(p.x,1);}else{floaters.push({x:p.x,y:p.y-100,t:45,s:'SCOOP EN DIRECT!',c:'#7cf'});SFX.shutter();}return;}}
 if(p.atk>0&&p.atkType!=='jkick'&&p.atkType!=='pound'){p.atk--;if(p.atkType==='weapon'){p.wwind=p.atk>(p.wk==='stick'?11:18);if(p.atk===(p.wk==='stick'?11:18)&&p.wk==='shovel')SFX.whoosh(p.x,1);else if(p.atk===11)SFX.whoosh(p.x);}const hitAt=p.atkType==='weapon_end'?99:p.atkType==='weapon'?(p.wk==='stick'?10:17):({kick:8,throw:10,charge:6,mic:99}[p.atkType]||5);if(p.atk===hitAt)doHit(p);if(p.atk===0)p.pose='idle';return;}
 // reporter dash: double-tap a direction
 if(p.dashT>0){p.dashT--;p.x+=p.face*5;p.pose='walk';if(p.dashT%3===0)fx.push({x:p.x-p.face*10,y:p.y-30,vx:0,vy:0,t:10,c:'rgba(150,200,255,.5)',s:10,smoke:1});
  if(prs(p,'punch')||prs(p,'kick')){p.dashT=0;p.atkType='kick';p.atk=H.kickT;p.cd=10;p.pose='kick';p.dashHit=1;SFX.kickW(p.x);return;}}
 else if((H.special==='flash'||H.special==='wheat')&&p.z===0)for(const d of[-1,1]){if(pressed['p'+(p.id+1)+(d<0?'left':'right')]){if(p.tapT>0&&p.tapDir===d){p.dashT=14;p.face=d;p.tapT=0;SFX.dash(p.x);}else{p.tapT=14;p.tapDir=d;}}}
 const sp=H.spd*(p.power?1.35:1)*(p.weapon&&p.weapon.k==='shovel'?.85:1);if(!p.dashT){p.x+=dx*sp;p.y+=dy*sp*.7;if(dx)p.face=dx;}
 const minX=camX+12,maxX=camLock!=null?camLock+W-12:camX+W-12;p.x=Math.max(minX,Math.min(maxX,p.x));p.y=Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,p.y));
 if(p.atkType==='pound'){p.pose='punch';p.vz=Math.min(p.vz,-3);return;}
 if(p.atkType==='jkick'){p.pose='kick';if(p.atk>0){p.atk--;doHit(p);}return;}
 if(p.z>0){if((prs(p,'punch')||prs(p,'kick'))&&p.weapon&&p.weapon.k==='shovel'){p.atkType='pound';p.wk='shovel';p.wwind=false;p.atk=99;p.pose='punch';p.vz=Math.min(p.vz,1);SFX.whoosh(p.x,1);floaters.push({x:p.x,y:p.y-110,t:24,s:'PELLETÉE!',c:'#cef',small:1});return;}if(prs(p,'punch')||prs(p,'kick')){p.atkType='jkick';p.atk=14;p.pose='kick';SFX.jkick(p.x);}else p.pose=p.vz>0?'walk':'idle';return;}
 if(!p.dashT)p.pose=(dx||dy)?'walk':'idle';
 if(prs(p,'jump')){p.vz=5.2;p.z=.1;p.dashT=0;SFX.jump(p.x);return;}
 // trucker charged punch: hold punch, release when charged
 if(H.special==='horn'){if(inp(p,'punch')&&!inp(p,'kick')){p.chargeT++;if(p.chargeT>36&&p.chargeT%4===0)fx.push({x:p.x+p.face*14+(Math.random()-.5)*16,y:p.y-50+(Math.random()-.5)*16,vx:0,vy:-.6,t:12,c:'#fa2',s:3});if(p.chargeT===37)SFX.warn(p.x);}
  else{if(p.chargeT>36&&p.cd<=0){p.chargeT=0;p.atkType='charge';p.atk=14;p.cd=18;p.pose='punch';SFX.kickW(p.x);return;}p.chargeT=0;}}
 if(p.cd<=0&&(prs(p,'punch')||prs(p,'kick'))){
  const k=prs(p,'kick');
  // pick up a weapon you are standing on
  if(!k){const pk=items.find(it=>it.k==='puck'&&!it.taken&&!(it.z>0)&&Math.abs(it.x-p.x)<18&&Math.abs(it.y-p.y)<12);if(pk){pk.taken=1;projs.push({kind:'puck',owner:p,x:p.x+p.face*16,y:p.y,vx:p.face*8.5,t:0,hit:new Set(),bounced:0});p.atk=12;p.atkType='mic';p.cd=16;p.pose='punch';SFX.kickW(p.x);floaters.push({x:p.x,y:p.y-95,t:30,s:'LANCER FRAPPÉ!',c:'#fff'});return;}}
  if(!k&&!p.weapon){const wi=items.find(it=>(it.k==='stick'||it.k==='shovel'||it.k==='chair')&&!it.taken&&!(it.z>0)&&Math.abs(it.x-p.x)<18&&Math.abs(it.y-p.y)<12);if(wi){wi.taken=1;p.weapon={k:wi.k,uses:wi.k==='stick'?8:wi.k==='shovel'?5:1};SFX.grab(p.x);floaters.push({x:p.x,y:p.y-95,t:40,s:{stick:'BÂTON DE HOCKEY!',shovel:'PELLE À NEIGE!',chair:'CHAISE DE BUREAU!'}[wi.k],c:'#fff'});p.cd=10;return;}}
  const g=!k&&enemies.find(e=>!e.dead&&!e.boss&&e.hurtT>0&&!e.knock&&Math.abs(e.x-p.x)<26&&Math.abs(e.y-p.y)<10);
  if(g){p.atkType='throw';p.atk=18;p.cd=20;p.pose='punch';p.grab=g;SFX.grab(g.x);g.x=p.x+p.face*16;return;}
  if(!k&&p.weapon&&(p.weapon.k==='chair'||(dx===-f0&&dx!==0))){if(dx)p.face=dx;throwWeapon(p);return;}
  // reporter mic throw: back + punch
  if(!k&&H.special==='flash'&&dx===-f0&&dx!==0&&!projs.some(m=>m.owner===p&&!m.kind)){p.face=dx;projs.push({owner:p,x:p.x+p.face*14,y:p.y,ox:p.x,vx:p.face*6,t:0,hit:new Set()});p.atk=12;p.atkType='mic';p.cd=22;p.pose='punch';SFX.whoosh(p.x);return;}
  if(p.weapon&&!k){p.atkType='weapon';p.wk=p.weapon.k;p.wwind=true;p.atk=p.wk==='stick'?16:25;p.cd=p.wk==='stick'?Math.round(4*H.cd):10;p.pose='punch';return;}
  p.atkType=k?'kick':'punch';p.atk=k?H.kickT:H.punchT;p.cd=Math.round((k?14:8)*H.cd);p.pose=k?'kick':'punch';k?SFX.kickW(p.x):SFX.punch(p.x);}
}
let projs=[];
function breakWeaponFX(k,x,y){SFX.smash('crate',x);const n=k==='chair'?null:'w_'+k,i=n&&OBJ[n];if(ok(i))[0,1].forEach(j=>chunk(n,x,y-40,j*i.width/2,0,i.width/2,i.height,{vx:(j?1:-1)*(1.5+Math.random()),vy:-4-Math.random()*2,vr:(j?.4:-.4),t:55,floor:y+4}));
 floaters.push({x,y:y-100,t:40,s:'CASSÉ!',c:'#f88'});for(let q=0;q<8;q++)fx.push({x,y:y-40,vx:(Math.random()-.5)*4,vy:-Math.random()*3,t:30,c:k==='stick'?'#c8a060':'#888',s:3,grav:1});}
function throwWeapon(p){const k=p.weapon.k;p.weapon=null;projs.push({kind:'wthrow',wk:k,owner:p,x:p.x+p.face*16,y:p.y,vx:p.face*(k==='chair'?6:7.5),t:0,hit:new Set(),n:0});p.atk=12;p.atkType='mic';p.cd=16;p.pose='punch';SFX.throwW(p.x);floaters.push({x:p.x,y:p.y-100,t:24,s:'LANCER!',c:'#fff',small:1});}
function snowBurst(x,y,n=16){for(let i=0;i<n;i++)fx.push({x:x+(Math.random()-.5)*24,y:y-2,vx:(Math.random()-.5)*4,vy:-1-Math.random()*3.5,t:26+Math.random()*12|0,c:i%3?'#fff':'#cfe8ff',s:2+Math.random()*3|0,grav:1});for(let i=0;i<5;i++)fx.push({x:x+(Math.random()-.5)*30,y:y-6,vx:(Math.random()-.5),vy:-.4,t:30,c:'rgba(240,248,255,.75)',s:10,smoke:1});}
function canHitFly(e,ok){return e.type!=='drone'||e.alt<22||ok;}
function doPound(p){const H=p.H;snowBurst(p.x+p.face*20,p.y,30);SFX.crunch(p.x);SFX.stamp(p.x);shake=9;hitstop=6;fx.push({x:p.x,y:p.y-30,vx:0,vy:0,t:18,ring:1,r:6,c:'#dff'});let any=false;
 for(const e of enemies)if(!e.dead&&Math.abs(e.x-p.x)<66*(e.sc||1)&&Math.abs(e.y-p.y)<26&&canHitFly(e,true)){any=true;p.face=e.x>p.x?1:-1;damageEnemy(p,e,22*H.dmg,!e.boss);if(!e.boss)e.vz=4.2;}
 hitBreakables(p,0,true);if(bonusM)hitBonus(p,70);if(p.weapon&&any){p.weapon.uses--;if(p.weapon.uses<=0){p.weapon=null;breakWeaponFX('shovel',p.x+p.face*16,p.y);}}}
function stepProjs(){for(const m of projs){if(m.kind==='wthrow'){m.t++;m.x+=m.vx;const o=m.owner;for(const e of enemies)if(!e.dead&&!m.hit.has(e)&&Math.abs(e.x-m.x)<18*(e.sc||1)&&Math.abs(e.y-m.y)<14){m.hit.add(e);m.n++;damageEnemy(o,e,(m.wk==='chair'?26:20)*o.H.dmg,!e.boss);}
   hitBreakables({x:m.x-Math.sign(m.vx)*8,y:m.y,face:Math.sign(m.vx)},20);if(m.n>=3||m.t>80||m.x<camX-20||m.x>camX+W+20){m.done=1;if(m.x>camX-10&&m.x<camX+W+10)breakWeaponFX(m.wk,m.x,m.y);}continue;}if(m.kind==='puck'){m.t++;m.x+=m.vx;const o=m.owner;for(const e of enemies)if(!e.dead&&!m.hit.has(e)&&Math.abs(e.x-m.x)<16*(e.sc||1)&&Math.abs(e.y-m.y)<14){m.hit.add(e);damageEnemy(o,e,14*o.H.dmg,!e.boss);if(!m.bounced){m.bounced=1;m.vx=-m.vx*.7;SFX.bounce(m.x);}}
   const L=camX+4,R=(camLock!=null?camLock:camX)+W-4;if(!m.bounced&&(m.x<L||m.x>R)){m.bounced=1;m.vx=-m.vx*.7;m.hit.clear();SFX.bounce(m.x);}else if(m.bounced&&(m.x<L-20||m.x>R+20))m.done=1;if(m.t>140)m.done=1;continue;}
  m.t++;if(m.t===12)m.vx=-m.vx;m.x+=m.vx;const o=m.owner;
  for(const e of enemies)if(!e.dead&&!m.hit.has(e)&&Math.abs(e.x-m.x)<16&&Math.abs(e.y-m.y)<14){m.hit.add(e);damageEnemy(o,e,9*o.H.dmg,false);e.stun=Math.max(e.stun||0,40);}
  if(m.t>12&&Math.abs(m.x-o.x)<10)m.done=1;if(m.t>40)m.done=1;}projs=projs.filter(m=>!m.done);}
function doHorn(p){SFX.honk(p.x);SFX.honk(p.x);SFX.crunch(p.x);shake=12;hitstop=6;fx.push({x:p.x,y:p.y-30,vx:0,vy:0,t:28,ring:1,r:10,c:'#fa2'});fx.push({x:p.x,y:p.y-30,vx:0,vy:0,t:22,ring:1,r:4,c:'#fff'});
 floaters.push({x:p.x,y:p.y-120,t:40,s:'HOOONK!',c:'#ff0'});
 for(const e of enemies)if(!e.dead&&Math.abs(e.x-p.x)<95*(e.sc||1)&&Math.abs(e.y-p.y)<30){p.face=e.x>p.x?1:-1;damageEnemy(p,e,18,!e.boss);e.vx=p.face*(e.boss?2:7);}hitBreakables(p,0,true);}
function doFlash(p){SFX.shutter();flashT=18;for(const e of enemies)if(!e.dead&&e.x>camX-10&&e.x<camX+W+10){e.stun=e.boss?60:120;e.atk=0;e.dash=0;e.flash=10;e.hp-=10*p.H.dmg;if(e.hp<=0&&!e.dead){damageEnemy(p,e,1,true);}}
 floaters.push({x:p.x,y:p.y-120,t:40,s:'FLASH!',c:'#fff'});}
let flashT=0;
function addHit(p){p.hits++;p.hitsT=100;STATS.maxc=Math.max(STATS.maxc,p.hits);if(isTouch&&navigator.vibrate)try{navigator.vibrate(12)}catch(e){}if(p.hits>=3)SFX.tick(p.hits);}
function damageEnemy(p,e,dmg,heavy){
 if(e.type==='para'&&e.alt>20)return;
 if(damageNew(p,e,heavy))return;
 if(e.invT>0){spark(e.x,e.y-60);if(tick%6===0)SFX.block(e.x);floaters.push({x:e.x,y:e.y-100,t:20,s:'IMMUNITÉ!',c:'#aaf',small:1});return;}
 // blocking (from stage 3, never during attacks or when stunned)
 if(!e.boss&&!(e.stun>0)&&SD()>=2&&e.atk===0&&e.hurtT===0&&!heavy&&Math.random()<D().block+SD()*.03){e.block=14;e.face=-p.face;e.vx=p.face*.8;fx.push({x:e.x-p.face*10,y:e.y-50,vx:0,vy:0,t:6,star:1,blue:1});floaters.push({x:e.x,y:e.y-96,t:24,s:'BLOQUÉ',c:'#9cf',small:1});SFX.block(e.x);return;}
 if(e.type==='lob'&&!heavy&&e.atk===0&&!e.bribeT&&!e.carry&&e.hurtT===0&&Math.random()<.3){e.y=Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y+(e.y<(FLOOR_TOP+FLOOR_BOT)/2?16:-16)));e.x-=p.face*6;floaters.push({x:e.x,y:e.y-96,t:24,s:'ESQUIVE!',c:'#fd4',small:1});SFX.whoosh(e.x);fx.push({x:e.x,y:e.y-40,vx:0,vy:0,t:10,c:'rgba(150,80,200,.5)',s:16,smoke:1});return;}
 if(e.shout>0){e.shout=0;e.stun=90;floaters.push({x:e.x,y:e.y-104,t:40,s:'INTERROMPU!',c:'#7f7',small:1});}
 if(e.bribeT>0){e.bribeT=0;floaters.push({x:e.x,y:e.y-104,t:30,s:'CORRUPTION STOPPÉE!',c:'#7f7',small:1});}
 e.las=0;e.chT=0;if(e.charging){e.charging=0;e.cd=60;}
 if(e.type==='lob'){if(e.carry){items.push({x:e.x,y:e.y,k:e.carry,taken:0,vz:3,z:0});e.carry=null;}if(e.coins<3&&Math.random()<.4){e.coins++;STATS.loonS++;items.push({x:e.x,y:e.y,k:'loonie',taken:0,vz:3,z:0});}}
 addHit(p);
 SFX.grunt(GRUNT[e.type]||e.type,e.x);if(heavy)SFX.crunch(e.x);else SFX.impact(e.x,dmg>=12);e.hp-=dmg;e.flash=10;e.hurtT=heavy||e.hp<=0?44:16;e.knock=(heavy&&!e.boss)||e.hp<=0?1:0;e.vx=p.face*(heavy?5:1.6)*(p.H?p.H.kb:1);if(e.knock&&!e.boss)e.vz=3.2;else if(e.knock)e.vz=1.5;e.face=-p.face;e.atk=0;e.dash=0;
 shake=Math.max(shake,heavy?7:3);hitstop=heavy?7:3;spark(e.x,e.y-48*(e.sc||1));floaters.push({x:e.x+(Math.random()*10-5),y:e.y-90*(e.sc||1),t:28,s:String(Math.round(dmg)),c:heavy?'#ff0':'#fff',small:1});
 if(e.boss&&e.hp>0&&e.hp<e.max*e.nextInv){e.nextInv-=.25;e.invT=70;SFX.shield(e.x);e.hurtT=20;e.knock=0;floaters.push({x:e.x,y:e.y-120,t:50,s:'RÈGLEMENT D\'URGENCE!',c:'#aaf'});}
 if(e.boss&&heavy&&p&&p.player)rumble(p.id,.5,.3,120);
 if(e.hp<=0&&!e.dead){e.dead=1;STATS.ko++;score+=e.pts;if(p&&p.player)p.score=(p.score||0)+e.pts;floaters.push({x:e.x,y:e.y-70,t:50,s:'+'+e.pts,c:'#fff'});
  if(e.boss){SFX.ko();slowmo=100;hitstop=0;shake=12;}
  if(!e.boss&&Math.random()<.45){items.push({x:e.x,y:e.y,k:'loonie',taken:0,vz:3,z:0});STATS.loonS++;}else if(!e.boss&&Math.random()<.07)items.push({x:e.x,y:e.y,k:['stick','shovel','puck'][Math.random()*3|0],taken:0,vz:3,z:0});if(e.boss)for(let i=0;i<4;i++,STATS.loonS++)items.push({x:e.x-30+i*20,y:e.y,k:'loonie',taken:0,vz:3+i*.5,z:0});}
}
function hitBreakables(p,reach,around){for(const b of breakables){const dx=(b.x-p.x)*p.face;if((around?Math.abs(b.x-p.x)<60:dx>-6&&dx<reach)&&Math.abs(b.y-p.y)<14){b.hp--;b.flash=8;SFX.impact(b.x);shake=3;
 if(b.hp<=0){b.gone=1;SFX.smash(b.k,b.x);breakFX(b);items.push({x:b.x,y:b.y,k:b.drop,taken:0,vz:3,z:0});score+=50;}}}breakables=breakables.filter(b=>!b.gone);}
function leaves(p){for(let i=0;i<3;i++){const a=Math.random()*6.28;fx.push({x:p.x+Math.cos(a)*30,y:p.y-30-Math.random()*40,vx:Math.cos(a+1.6)*2.5,vy:-Math.random()*1.2,t:26,leaf:1,rot:Math.random()*6});}}
function doSpecial(p){for(const e of enemies)if(!e.dead&&Math.abs(e.x-p.x)<58*(e.sc||1)&&Math.abs(e.y-p.y)<18){p.face=e.x>p.x?1:-1;damageEnemy(p,e,10*(p.power?1.6:1),!e.boss);}hitBreakables(p,0,true);SFX.whoosh(p.x,1);}
function doWeaponHit(p,wp,reach,yr){const H=p.H,st=wp.k==='stick';hitBreakables(p,reach);if(bonusM)hitBonus(p,reach);
 if(!st){snowBurst(p.x+p.face*44,p.y,18);shake=Math.max(shake,6);SFX.stamp(p.x);}
 const tg=enemies.filter(e=>{const juggle=e.knock&&e.z>4&&!e.dead;if(e.dead||(e.hurtT>12&&!juggle))return false;const sc=e.sc||1,dx=(e.x-p.x)*p.face;return dx>-8&&dx<reach*(sc>1?1.1:1)&&Math.abs(e.y-p.y)<yr*sc&&canHitFly(e,st);}).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
 const hit=st?tg.slice(0,2):tg;if(!hit.length){if(st)p.wcombo=0;return;}
 let fin=false;if(st){p.wcombo=p.wcomboT>0?(p.wcombo||0)+1:1;p.wcomboT=60;fin=p.wcombo>=3;if(fin)p.wcombo=0;}
 for(const e of hit){if(st){damageEnemy(p,e,(fin?24:12)*H.dmg,fin&&!e.boss);if(fin&&!e.boss){e.vz=5.5;e.vx=p.face*4.5;}}else{damageEnemy(p,e,22*H.dmg,!e.boss);if(!e.boss)e.vz=3.5;}}
 if(fin){floaters.push({x:p.x+p.face*30,y:p.y-110,t:36,s:'LANCER FRAPPÉ!',c:'#ffd800'});shake=8;SFX.crunch(p.x);}
 hitstop=Math.max(hitstop,st?(fin?8:4):7);
 wp.uses--;if(wp.uses<=0){p.weapon=null;breakWeaponFX(wp.k,p.x+p.face*16,p.y);}}
function doHit(p){const H=p.H;
 if(p.atkType==='throw'){const g=p.grab;p.grab=null;if(g&&!g.dead){g.x=p.x+p.face*10;g.invT=0;damageEnemy(p,g,22*H.dmg*(p.power?1.6:1),true);g.vx=p.face*6*H.kb;g.vz=4.5;g.thrown=1;SFX.throwW(g.x);if(H.special==='wheat'){floaters.push({x:p.x,y:p.y-100,t:30,s:'BOTTE DE FOIN!',c:'#fd4'});for(let i=0;i<14;i++)fx.push({x:g.x,y:g.y-40,vx:(Math.random()-.5)*4,vy:-Math.random()*3,t:30,c:i%2?'#e8c050':'#c09030',s:3,grav:1});}
   for(const o of enemies)if(o!==g&&!o.dead&&Math.abs(o.y-g.y)<14&&(o.x-p.x)*p.face>0&&Math.abs(o.x-g.x)<60)damageEnemy(p,o,10,true);}return;}
 const jk=p.atkType==='jkick',wp=p.atkType==='weapon'?p.weapon:null,ch=p.atkType==='charge';
 const reach=(jk?52:p.atkType==='kick'?56:wp?(wp.k==='stick'?80:62):ch?56:48)*H.reach,yr=wp?(wp.k==='stick'?20:30):14;let any=false;
 if(wp){doWeaponHit(p,wp,reach,yr);return;}
 const nc=p.comboT>0?p.combo+1:1,lau=(H.chain===4&&nc===3)||nc>=H.chain;
 if(H.special==='wheat'&&p.atkType==='punch'&&nc>=H.chain&&!jk&&!ch){fourche(p);return;}
 hitBreakables(p,reach);if(bonusM)hitBonus(p,reach);
 for(const e of enemies){const juggle=e.knock&&e.z>4&&!e.dead;if(e.dead||(e.hurtT>12&&!juggle)||(jk&&e.jkHit===p.anim))continue;const sc=e.sc||1,dx=(e.x-p.x)*p.face;if(dx>-6&&dx<reach*(sc>1?1.1:1)&&Math.abs(e.y-p.y)<yr*sc){if(!canHitFly(e,jk||ch||lau||juggle)){if(tick%20<3)floaters.push({x:e.x,y:e.y-90,t:24,s:'TROP HAUT!',c:'#9cf',small:1});continue;}any=true;
  if(juggle){damageEnemy(p,e,8*H.dmg,true);e.vz=3.6;e.vx=p.face*1.5;if(jk){e.jkHit=p.anim;p.atk=0;}floaters.push({x:e.x,y:e.y-100,t:24,s:'JONGLAGE!',c:'#7f7',small:1});continue;}
  if(jk){e.jkHit=p.anim;damageEnemy(p,e,16*H.dmg*(p.power?2:1),!e.boss);p.atk=0;continue;}
  if(ch){damageEnemy(p,e,34*H.dmg*(p.power?1.5:1),true);e.vx=p.face*8;e.vz=4;floaters.push({x:e.x,y:e.y-110,t:30,s:'COUP CHARGÉ!',c:'#fa2'});continue;}
  if(wp){damageEnemy(p,e,(wp.k==='stick'?14:22)*H.dmg,wp.k==='shovel'||Math.random()<.3);continue;}
  p.combo=p.comboT>0?p.combo+1:1;p.comboT=50;const fin=p.combo>=H.chain;const dmg=(p.atkType==='kick'?12:8)*H.dmg*(p.power?2:1)*(fin?1.6:1);
  const launch=H.chain===4&&p.combo===3&&!e.boss;score+=10*p.combo;damageEnemy(p,e,dmg*(launch?1.3:1),fin&&!e.boss||fin&&e.hp<dmg||launch||!!p.dashHit);if((fin||launch)&&!e.boss){e.vz=launch?4.6:5;e.vx*=launch?.35:1;}if(fin){p.combo=0;}}}
 p.dashHit=0;
 if(wp&&any){wp.uses--;if(wp.uses<=0){p.weapon=null;SFX.smash('crate',p.x);{const i=OBJ['w_'+wp.k];if(ok(i))[0,1].forEach(k=>chunk('w_'+wp.k,p.x+p.face*16,p.y-40,k*i.width/2,0,i.width/2,i.height,{vx:(k?1:-1)*(1.5+Math.random()),vy:-4-Math.random()*2,vr:(k?.4:-.4),t:55,floor:p.y+4}));}floaters.push({x:p.x,y:p.y-100,t:40,s:'CASSÉ!',c:'#f88'});for(let i=0;i<8;i++)fx.push({x:p.x+p.face*20,y:p.y-40,vx:(Math.random()-.5)*4,vy:-Math.random()*3,t:30,c:wp.k==='stick'?'#c8a060':'#888',s:3,grav:1});}}
}
// attack kinds: windup (frames before the hit) and telegraph flag
function attackers(){return enemies.filter(o=>!o.dead&&!o.boss&&(o.atk>0||o.dash>0||o.las>0||o.chT>0||o.charging||o.shout>0)).length;}
function startAttack(e,kind){if(!e.boss&&attackers()>=D().tokens){e.cd=15+Math.random()*20;return;}const D0=D();const base={jab:22,stamp:40,dash:26,arc:30,throw:30,brief:34,grab:30,shock:40,slam:44,spray:26,report:30,directive:34,stayhome:40,ice:36,button:44,cannon:40,barrage:40}[kind];e.atk=Math.round(base*(kind==='jab'?D0.wind:Math.max(.8,D0.wind)));e.atkMax=e.atk;e.atkKind=kind;e.tele=kind!=='jab';if(e.tele)SFX.warn(e.x);if(kind==='arc')setTimeout(()=>SFX.swing(e.x),Math.max(0,(e.atk-10)*16));}
function updateEnemy(e){
 e.anim++;if(e.gold>0){e.gold--;if(e.gold===0)e.dmg/=1.5;}if(e.stun>0&&e.hurtT===0&&!e.dead){e.stun--;e.pose='hurt';if(e.holding){e.holding.held=0;e.holding=null;}if(tick%10===0)fx.push({x:e.x+(Math.random()-.5)*20,y:e.y-(e.boss?120:90),vx:0,vy:-.3,t:16,c:'#ff0',s:3});return;}if(e.flash>0)e.flash--;if(e.invT>0)e.invT--;if(e.block>0){e.block--;e.x+=e.vx;e.vx*=.85;e.pose='hurt';return;}
 if(e.z>0||e.vz){e.z+=e.vz;e.vz-=.3;if(e.z<=0){e.z=0;e.vz=0;}}
 if(e.hurtT>0){e.hurtT--;if(e.alt>0&&(e.knock||e.dead)){e.alt=Math.max(0,e.alt-1.3);e.spinR=(e.spinR||0)+.35;if(tick%3===0)fx.push({x:e.x,y:e.y-e.alt-20,vx:(Math.random()-.5)*.6,vy:-.8,t:30,c:'rgba(40,40,40,.7)',s:8,smoke:1});}if(e.knock&&e.hurtT===32&&e.type!=='drone')SFX.fall(e.x);e.x+=e.vx;e.vx*=.93;e.pose=e.knock&&e.hurtT<32?'down':'hurt';
  // bounce off screen edges when sent flying
  if((e.x<camX+8&&e.vx<0)||(e.x>camX+W-8&&e.vx>0)){if(Math.abs(e.vx)>1.5){e.vx=-e.vx*.6;e.vz=Math.max(e.vz,2);spark(e.x,e.y-30);shake=4;SFX.bounce(e.x);}else e.vx=0;}
  if(e.thrown&&Math.abs(e.vx)>2)for(const o of enemies)if(o!==e&&!o.dead&&o.hurtT===0&&Math.abs(o.x-e.x)<20&&Math.abs(o.y-e.y)<12){o.hp-=8;o.hurtT=40;o.knock=1;o.vz=3;o.vx=Math.sign(e.vx)*3;o.flash=10;spark(o.x,o.y-40);if(o.hp<=0&&!o.dead){o.dead=1;score+=o.pts;}}
  if(e.hurtT===0){e.thrown=0;if(e.dead){e.gone=1;deathFX(e);}else{e.pose='idle';e.knock=0;e.cd=Math.max(e.cd,20);}}return;}
 if(e.dead){e.gone=1;deathFX(e);return;}
 const live=players.filter(p=>p.alive);if(!live.length){e.pose='idle';return;}
 let t=live.reduce((a,b)=>Math.abs(a.x-e.x)+Math.abs(a.y-e.y)<Math.abs(b.x-e.x)+Math.abs(b.y-e.y)?a:b);
 const sc=e.sc*(e.spr==='boss'?1.2:e.spr==='final'?1.3:1);
 if(NEWE.includes(e.type)&&aiNew(e,t,live))return;
 if(aiNew2(e,t,live))return;
 if(e.boss&&(e.doc||e.pm||e.reset||e.gen||e.onfoot)&&aiBoss(e,t,live))return;
 // boss phases
 if(e.final){const ph=e.hp<e.max*.25?3:e.hp<e.max*.5?2:1;if(ph>e.phase){e.phase=ph;e.spd*=1.35;SFX.siren();shake=10;
   floaters.push({x:camX+W/2,y:70,t:120,s:ph===2?'PHASE 2: POUVOIRS D\'URGENCE!':'PHASE 3: ÉTAT D\'EXCEPTION!',c:'#f44',fixed:1});
   const add=ph===2?['drone','bot']:['drone','lob'];add.forEach((k,i)=>enemies.push(newEnemy(k,camX+(i%2?-20:W+20),FLOOR_TOP+15+i*20)));}
  if(--e.special<=0&&e.atk===0){e.special=[0,200,140,100][e.phase];startAttack(e,'shock');}}
 else if(e.brief&&!e.summoned&&e.hp<e.max*.5&&e.atk===0){e.summoned=1;SFX.coins(e.x);floaters.push({x:camX+W/2,y:70,t:100,s:'LOBBYISTES, À MOI!',c:'#fd4',fixed:1});(e.type==='boss2'?['lob']:['lob','lob']).forEach((k,i)=>enemies.push(newEnemy(k,camX+(i?-20:W+20),FLOOR_TOP+20+i*30)));}
 else if(e.boss&&--e.special<=0&&e.atk===0){e.special=e.brief?150:190;const r=Math.random();startAttack(e,e.brief&&r<.6?'brief':Math.abs(t.x-e.x)<80?'grab':'slam');}
 if(e.dash>0){e.dash--;e.x+=e.face*4.2;e.pose='attack';if(Math.abs(t.x-e.x)<26&&Math.abs(t.y-e.y)<12&&hurtPlayer(t,e.dmg*1.2,e.face,true))e.dash=0;e.x=Math.max(camX-10,Math.min(camX+W+10,e.x));if(!e.dash)e.cd=60*D().cd+30;return;}
 if(e.atk>0){e.atk--;const k=e.atkKind,hitAt=k==='jab'?8:6;e.pose=e.atk<hitAt+6?'attack':'idle';
  if(e.atk===hitAt){const dx=(t.x-e.x)*e.face;
   if(k==='shock'){SFX.shock(e.x);shake=6;const n=e.phase;for(let i=0;i<n;i++)hazards.push({kind:'denied',x:e.x+e.face*30,y:e.y+(i-(n-1)/2)*22,vx:e.face*(3.2-i*.4),t:200,delay:i*14});}
   else if(k==='throw'){hazards.push({kind:'paper',x:e.x+e.face*20,y:e.y,z:40,vx:e.face*3.4,t:120});SFX.paper(e.x);}
   else if(k==='brief'){for(let i=0;i<(e.hp<e.max/2?3:2);i++)hazards.push({kind:'brief',x:e.x+e.face*20,y:e.y+(i-1)*14,z:50,vx:e.face*(3+i*.3),t:140,delay:i*10});SFX.brief(e.x);}
   else if(atkNew(e,t,k)){}
   else if(k==='grab'){if(dx>-6&&dx<60*sc&&Math.abs(t.y-e.y)<14&&t.inv<=0&&!t.hurtT&&t.z<10){t.held=70;e.holding=t;e.holdT=70;floaters.push({x:t.x,y:t.y-100,t:50,s:'←→ + J !',c:'#ff0'});}}
   else{const ranges={jab:[44,12],stamp:[52,12],arc:[62,30],slam:[70,18]}[k]||[44,12];const r=ranges[0]*sc;
    if(dx>-10&&dx<r&&Math.abs(t.y-e.y)<ranges[1]*sc)hurtPlayer(t,e.dmg*(k==='stamp'||k==='slam'?1.6:k==='arc'?1.2:1),e.face,k==='stamp'||k==='slam'||k==='arc');if(k!=='jab'){shake=Math.max(shake,4);if(k==='stamp')SFX.stamp(e.x);else if(k!=='arc')SFX.impact(e.x,1);}}}
  if(e.atk===0)e.cd=(e.boss?40:70)*D().cd*(1-SD()*.06)+Math.random()*40;return;}
 if(e.holding){const h=e.holding;e.holdT--;e.pose='attack';h.x=e.x+e.face*22;h.y=e.y;h.z=0;
  if(e.holdT%20===0&&h.held>0){const d=e.dmg*.45;h.hp-=d;stageDmg+=d;h.flash=8;SFX.impact(h.x);SFX.grunt('p',h.x);spark(h.x,h.y-50);floaters.push({x:h.x,y:h.y-80,t:24,s:'-'+Math.round(d),c:'#f66',small:1});if(h.hp<=0)h.held=0;}
  if(h.held<=0||e.holdT<=0||!h.alive){const escaped=e.holdT>0&&h.hp>0;h.held=0;e.holding=null;
   if(escaped){e.hurtT=30;e.flash=10;e.vx=-e.face*2;h.inv=40;floaters.push({x:h.x,y:h.y-90,t:30,s:'LIBRE!',c:'#7f7'});}else{h.inv=0;h.hurtT=0;hurtPlayer(h,e.dmg,e.face,true);}}return;}
 // flanking: alternate sides so enemies surround instead of queueing
 if(--e.think<=0){e.think=40+Math.random()*40;const left=enemies.filter(o=>!o.dead&&o!==e&&o.x<t.x).length,right=enemies.filter(o=>!o.dead&&o!==e&&o.x>=t.x).length;e.side=left<right?-1:left>right?1:(e.x<t.x?-1:1);e.ty=(Math.random()-.5)*16;}
 const pref=e.type==='taxman'?90:e.type==='mega'?130:e.type==='qr'?110:44;const gx=t.x+e.side*pref*sc,gy=t.y+e.ty*(e.type==='taxman'||e.type==='mega'||e.type==='qr'?0:1);const dx=gx-e.x,dy=gy-e.y;e.face=t.x<e.x?-1:1;
 for(const o of enemies)if(o!==e&&!o.dead&&Math.abs(o.x-e.x)<16&&Math.abs(o.y-e.y)<8){e.y+=o.y<e.y?.5:-.5;}
 if(Math.abs(dx)>3||Math.abs(dy)>3){e.x+=Math.sign(dx)*Math.min(Math.abs(dx),e.spd);e.y+=Math.sign(dy)*Math.min(Math.abs(dy),e.spd*.7);e.pose='walk';}else e.pose='idle';
 e.y=Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y));if(camLock!=null){if(e.x<camX+14)e.x+=1;if(e.x>camX+W-14)e.x-=1;}
 if(e.cd>0){e.cd--;return;}
 const adx=Math.abs(t.x-e.x),ady=Math.abs(t.y-e.y);
 if(e.type==='taxman'&&adx>60&&adx<200&&ady<8){startAttack(e,'throw');return;}
 if((e.type==='bot'||e.type==='para')&&adx>50&&adx<150&&ady<8&&Math.random()<.5&&attackers()<D().tokens){e.dash=28;e.face=t.x<e.x?-1:1;SFX.dash(e.x);fx.push({x:e.x,y:e.y-90,vx:0,vy:0,t:20,bang:1});e.cd=10;return;}
 if(adx<48*sc&&ady<(e.type==='insp'?26:10)*sc){startAttack(e,e.type==='bureau'&&Math.random()<.6?'stamp':e.type==='insp'||(e.type==='soldier'&&Math.random()<.35)?'arc':e.boss?(Math.random()<.5?'slam':'jab'):'jab');}
}
function deathFX(e){if(deathNew(e))return;if(e.type==='drone'){SFX.crunch(e.x);SFX.smash('can',e.x);shake=Math.max(shake,5);for(let i=0;i<14;i++)fx.push({x:e.x,y:e.y-14,vx:(Math.random()-.5)*6,vy:-1-Math.random()*4,t:40,c:['#888','#bbb','#555','#e33'][i%4],s:3,grav:1});for(let i=0;i<8;i++)fx.push({x:e.x+(Math.random()-.5)*20,y:e.y-14,vx:(Math.random()-.5),vy:-.6,t:40,c:i%2?'rgba(255,150,40,.8)':'rgba(40,40,40,.8)',s:12,smoke:1});return;}
 poof(e.x,e.y,e.sc);SFX.poof(e.x);if(e.type==='chair')items.push({x:e.x,y:e.y,k:'chair',taken:0,vz:2,z:0});if(e.carry)items.push({x:e.x,y:e.y,k:e.carry,taken:0,vz:3,z:0});}
function hitPlayers(e,fn){for(const p of players)if(p.alive)fn(p);}
// special behaviour for the four new enemy types; returns true when it handled the frame
function aiNew(e,t,live){const adx=Math.abs(t.x-e.x),ady=Math.abs(t.y-e.y),tok=!(attackers()>=D().tokens);
 if(e.type==='drone'){const tgt=e.lowT>0?12:34;e.alt+=(tgt-e.alt)*.05;if(e.lowT>0)e.lowT--;if(e.anim%70===0&&e.x>camX&&e.x<camX+W)SFX.buzz(e.x);
  if(e.las>0){e.las--;e.pose='attack';e.y=e.ly;if(e.las===14)SFX.laser(e.x);
   if(e.las<14&&e.las>2)hitPlayers(e,p=>{if(Math.abs(p.y-e.ly)<9&&p.z<12&&(p.x-e.x)*e.face>0)hurtPlayer(p,e.dmg*.8,e.face,false);});
   if(e.las===0){e.cd=(150+Math.random()*70)*D().cd;e.lowT=110;}return true;}
  if(--e.think<=0){e.think=60+Math.random()*40;e.side=e.x<t.x?-1:1;if(t.x-120<camX+20)e.side=1;if(t.x+120>camX+W-20)e.side=-1;if(Math.random()<.25&&e.lowT<=0)e.lowT=90;}
  const gx=t.x+e.side*120,gy=t.y,dx=gx-e.x,dy=gy-e.y;e.face=t.x<e.x?-1:1;if(Math.abs(dx)>3)e.x+=Math.sign(dx)*Math.min(Math.abs(dx),e.spd);if(Math.abs(dy)>2)e.y+=Math.sign(dy)*Math.min(Math.abs(dy),e.spd*.6);e.pose='idle';
  e.y=Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y));e.x=Math.max(camX+10,Math.min(camX+W-10,e.x));
  if(e.cd>0){e.cd--;return true;}if(ady<6&&adx>34&&e.lowT<=0&&tok){e.las=54;e.ly=e.y;SFX.laserCharge(e.x);}return true;}
 if(e.type==='lob'){
  if(e.bribeT>0){e.bribeT--;e.pose='attack';const o=e.bribeTo;if(!o||o.dead){e.bribeT=0;return true;}if(tick%5===0)fx.push({x:e.x+e.face*14,y:e.y-50,vx:(o.x-e.x)/30,vy:-1,t:30,c:'#ffd800',s:3,grav:1});
   if(e.bribeT===0){if(!o.gold)o.dmg*=1.5;o.gold=600;SFX.coins(o.x);floaters.push({x:o.x,y:o.y-100,t:50,s:'POT-DE-VIN! +DÉGÂTS',c:'#fd4',small:1});e.cd=40;}return true;}
  if(e.carry){const dir=e.x<camX+W/2?-1:1;e.face=dir;e.x+=dir*e.spd*1.9;e.pose='walk';if(e.x<camX-30||e.x>camX+W+30){e.gone=1;floaters.push({x:camX+W/2,y:80,t:60,s:'LE LOBBYISTE A VOLÉ UN BONUS!',c:'#f88',fixed:1});}return true;}
  if(--e.bribeCD<=0){e.bribeCD=400+Math.random()*200;const o=enemies.find(o=>o!==e&&!o.dead&&!o.boss&&o.type!=='lob'&&!o.gold&&Math.abs(o.x-e.x)<150);if(o){e.bribeT=70;e.bribeTo=o;e.face=o.x<e.x?-1:1;floaters.push({x:e.x,y:e.y-100,t:40,s:'$$$',c:'#fd4',small:1});SFX.coins(e.x);return true;}}
  if(!e.stealT&&Math.random()<.004){const it=items.find(i=>!i.taken&&!(i.z>0)&&['coffee','syrup','donuts'].includes(i.k)&&Math.abs(i.x-e.x)<160);if(it)e.stealT=it;}
  if(e.stealT){const it=e.stealT;if(it.taken){e.stealT=null;return false;}const dx=it.x-e.x,dy=it.y-e.y;e.face=dx<0?-1:1;e.x+=Math.sign(dx)*Math.min(Math.abs(dx),e.spd*1.4);e.y+=Math.sign(dy)*Math.min(Math.abs(dy),e.spd);e.pose='walk';
   if(Math.abs(dx)<8&&Math.abs(dy)<6){it.taken=1;e.carry=it.k;e.stealT=null;SFX.coins(e.x);floaters.push({x:e.x,y:e.y-100,t:40,s:'À MOI!',c:'#fd4',small:1});}return true;}
  return false;}
 if(e.type==='chair'){
  if(e.chT>0){e.chT--;e.face=(e.chT>>2)%2?1:-1;e.pose='idle';if(e.chT===0){e.face=t.x<e.x?-1:1;e.charging=1;SFX.vroom(e.x);}return true;}
  if(e.charging){e.x+=e.face*5.2;e.pose='attack';if(tick%3===0)fx.push({x:e.x-e.face*20,y:e.y-6,vx:-e.face,vy:-.3,t:14,c:'rgba(220,220,220,.5)',s:6,smoke:1});
   hitPlayers(e,p=>{if(Math.abs(p.y-e.y)<10&&Math.abs(p.x-e.x)<22&&p.z<14)hurtPlayer(p,e.dmg,e.face,true);});
   if(e.x<camX-30||e.x>camX+W+30){e.charging=0;e.face=-e.face;e.cd=(80+Math.random()*50)*D().cd;e.x=Math.max(camX-30,Math.min(camX+W+30,e.x));}return true;}
  if(e.cd<=0&&ady<10&&adx>60&&tok){e.chT=42;floaters.push({x:e.x,y:e.y-100,t:40,s:'VROUM!',c:'#ff8'});SFX.spinUp(e.x);return true;}
  return false;}
 if(e.type==='mega'){
  if(e.shout>0){e.shout--;e.pose=e.shout>40&&(e.shout>>2)%2?'idle':'attack';if(e.shout===40)SFX.mega(e.x);
   if(e.shout<=40&&e.shout%7===0)hazards.push({kind:'wave',x:e.x+e.face*26,y:e.y,vx:e.face*3.4,r:5,t:46,hit:e.shoutHit});
   if(e.shout===0)e.cd=(120+Math.random()*60)*D().cd;return true;}
  if(e.cd<=0&&ady<18&&adx>55&&adx<210&&tok){e.shout=70;e.shoutHit=new Set();e.face=t.x<e.x?-1:1;floaters.push({x:e.x,y:e.y-104,t:30,s:'!',c:'#ff0'});return true;}
  return false;}
 return false;}
function spark(x,y){for(let i=0;i<8;i++)fx.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,t:12,c:i%2?'#ff0':'#fff',s:2});fx.push({x,y,vx:0,vy:0,t:5,star:1});}
function poof(x,y,sc=1){for(let i=0;i<22;i++)fx.push({x:x+(Math.random()-.5)*40*sc,y:y-5-Math.random()*70*sc,vx:(Math.random()-.5)*1.4,vy:-Math.random()*.9,t:30+Math.random()*20,c:['#eee','#ccc','#aaa','#fff'][i%4],s:(6+Math.random()*8)*sc,smoke:1});}
function rankOf(){const secs=stageTime/60,d=stageDmg/Math.max(1,players.length);let pts=0;pts+=d<25?3:d<70?2:d<150?1:0;pts+=secs<110?2:secs<170?1:0;pts+=diffIdx;return pts>=5?'S':pts>=4?'A':pts>=2?'B':'C';}
function endGame(){setAmbience(null);const mk=modeKey(),L=HS[mk],pos=L.findIndex(s=>score>s[1]);tableMode=mk;if(pos>=0&&score>0){entry={letters:[0,0,0],i:0,pos,mode:mk};state='entry';stateT=0;SFX.entry();}else{state='table';stateT=0;}}
const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.';
function saveScores(){try{localStorage.tndHS=JSON.stringify(HS);}catch(e){}hi=Math.max(hi,hiOf());}

function update(){pollPads();
 tick++;stateT++;
 if(slowmo>0){slowmo--;if(slowmo%3){clr();return;}}
 if(state==='loading'){if(LOAD.done>=LOAD.n||stateT>600){state='intro';stateT=0;introT=0;}}
 else if(state==='intro'){playSong('title');if(stateT%3===0&&introT<INTRO.length){introT++;if(INTRO[introT-1]!==' '&&INTRO[introT-1]!=='\n')SFX.type();}if(stateT>INTRO.length*3+240||(stateT>10&&Object.keys(pressed).length)){state='title';stateT=0;}}
 else if(state==='select'){selUpdate();}
 else if(state==='stats'){if(stateT>60&&pressed.start)endGame();}
 else if(state==='title'){playSong('title');if(pressed.p1up||pressed.p2up){diffIdx=(diffIdx+2)%3;SFX.blip();}if(pressed.p1down||pressed.p2down){diffIdx=(diffIdx+1)%3;SFX.blip();}
  if(stateT>600){state='table';stateT=0;tableMode=MODES[(MODES.indexOf(tableMode)+1)%4];entry=null;}
  if(pressed.p1left||pressed.p1right||pressed.p2left||pressed.p2right){gameMode=gameMode==='survie'?'arcade':'survie';SFX.blip();stateT=Math.max(stateT,81);}
  if(pressed.start||pressed.p1punch){twoStart=false;state='select';stateT=0;SFX.confirm();}else if(pressed.p2punch){twoStart=true;state='select';stateT=0;SFX.confirm();}}
 else if(state==='table'){if(stateT>240&&!(entry&&entry.done)&&stateT%240===0)tableMode=MODES[(MODES.indexOf(tableMode)+1)%4];if(stateT>(entry&&entry.done?420:960)||pressed.start||pressed.p1punch){state='title';stateT=100;entry=null;}}
 else if(state==='entry'){const e=entry;if((pressed.p1left||pressed.p2left||pressed.p1kick||pressed.p2kick)&&e.i>0){e.i--;SFX.blip();}if(typedKey){const ix=ABC.indexOf(typedKey);if(ix>=0){e.letters[e.i]=ix;pressed.p1punch=1;}typedKey=null;}if(pressed.p1up||pressed.p2up)e.letters[e.i]=(e.letters[e.i]+1)%ABC.length;if(pressed.p1down||pressed.p2down)e.letters[e.i]=(e.letters[e.i]+ABC.length-1)%ABC.length;
  if(pressed.p1punch||pressed.start||pressed.p2punch||pressed.p1right){e.i++;SFX.confirm();if(e.i>=3){HS[e.mode].splice(e.pos,0,[e.letters.map(l=>ABC[l]).join(''),score]);HS[e.mode]=HS[e.mode].slice(0,10);saveScores();state='table';stateT=0;entry.done=1;}}}
 else if(state==='bonus'){if(pressed.pause){paused=!paused;SFX.pause();pauseSel=0;clr();return;}if(paused){pauseMenu();clr();return;}if(hitstop>0){hitstop--;clr();return;}stepWorld();players.forEach(p=>{if(Math.abs(p.x-bonusM.x)<60&&Math.abs(p.y-bonusM.y)<12&&bonusM.hp>0)p.x=bonusM.x+(p.x<bonusM.x?-60:60);});
  if(!bonusEnd){bonusT--;if(bonusT<=0){bonusEnd=1;floaters.push({x:bonusM.x,y:bonusM.y-110,t:120,s:'TEMPS ÉCOULÉ!',c:'#fff'});SFX.go();}}else if(++bonusEnd>200){bonusM=null;camLock=null;goStage(3);}}
 else if(state==='card'){if(stateT>150||(stateT>30&&pressed.start))state='play';}
 else if(state==='cut'){cutUpdate();}
 else if(state==='play'){if(pressed.pause){paused=!paused;SFX.pause();pauseSel=0;clr();return;}if(paused){pauseMenu();clr();return;}if(bannerT>0){bannerT--;clr();return;}if(hitstop>0){hitstop--;if(shake>0)shake--;clr();return;}
  stageTime++;STATS.time++;
  if(pressed.p2punch&&players.length<2){const p=newPlayer(1);p.x=camX+40;players.push(p);floaters.push({x:p.x,y:p.y-90,t:60,s:'2P!',c:'#6cf'})}
  stepWorld();
  const S=STAGES[stage];
  {const lv=enemies.filter(e=>!e.dead),bs=lv.find(e=>e.boss);setMusicIntensity(bs?.45+(1-Math.max(0,bs.hp)/bs.max)*.55:Math.min(1,lv.length/5)*.75+(players.some(p=>p.alive&&p.hp<35)?.2:0));}
  if(gameMode==='survie')survUpdate();else{if(camLock==null&&waveIdx<S.waves.length&&camX>=S.waves[waveIdx].at){const w=S.waves[waveIdx];camLock=camX;goT=0;
   const list=w.e.slice();if(!w.boss)for(let i=0;i<D().extra+(players.length>1?1:0)&&list.length<7;i++)list.push(POOLS[stage][(i+waveIdx)%POOLS[stage].length]);else if(diffIdx>0)list.push(POOLS[stage][0]);
   list.forEach(t=>{if(NEWE.includes(t)&&!SEEN.has(t)){SEEN.add(t);newBan={name:EN[t].name,t:170,spr:EN[t].spr};SFX.stinger&&SFX.stinger();}});list.forEach((t,i)=>{const side=i%2?-1:1,boss=EN[t].boss;const ne=newEnemy(t,camX+(boss?W+30:side>0?W+20+i*12:-20-i*12),boss?178:FLOOR_TOP+12+((i*29)%50));if(t==='para'){ne.x=camX+70+((i*97)%(W-140));ne.alt=150+i*30;}enemies.push(ne);});
   if(w.boss){SFX.siren();playSong(bossSong(w.e[0]));bannerT=130;bannerName=EN[w.e[0]].name;}waveIdx++;}
  if(camLock!=null&&enemies.length===0){camLock=null;if(waveIdx>=S.waves.length){state='clear';stateT=0;hazards=[];playSong('jclear');
    const tb=Math.max(0,180-Math.floor(stageTime/60))*20,hb=players.reduce((a,p)=>a+(p.alive?Math.max(0,p.hp):0),0)*10,rank=rankOf(),rb={S:5000,A:2500,B:1000,C:0}[rank];tally={tb,hb:Math.round(hb),rank,rb,shown:0,total:Math.round(tb+hb+rb)};}
   else{goT=180;playSong(S.song);SFX.go();}}
  if(camLock==null&&state==='play'){const lead=Math.max(...players.filter(p=>p.alive).map(p=>p.x),0);const target=Math.min(S.len,Math.max(camX,lead-W*.55));camX+=(target-camX)*.1;}}
  if(goT>0)goT--;
  if(players.every(p=>!p.alive)){if(contLeft>0&&gameMode!=='survie'){state='cont';stateT=0;playSong('cont');}else{state='over';stateT=0;playSong('jover');setAmbience(null);}}
 }
 else if(state==='clear'){stepWorld();if(stateT===50&&tally)SFX.rank(tally.rank);if(stateT>60&&tally.shown<tally.total){const st=Math.min(tally.total-tally.shown,Math.ceil(tally.total/80)+1);tally.shown+=st;score+=st;if(stateT%3===0)SFX.tally();}
  if(stateT>360||(stateT>140&&pressed.start&&tally.shown>=tally.total)){score+=tally.total-tally.shown;tally.shown=tally.total;if(stage===3&&!bonusDone)startBonus();else if(stage<STAGES.length-1)goStage(stage+1);else{STATS.won=1;state='victory';stateT=0;typeT=0;playSong('win');}}}
 else if(state==='cont'){if(pressed.start){contLeft--;STATS.cont++;players.forEach(p=>{p.alive=true;p.lives=D().lives;p.hp=p.maxhp;p.inv=180;p.hurtT=0;p.held=0;});state='play';playSong(enemies.some(e=>e.boss&&!e.dead)?bossSong(enemies.find(e=>e.boss&&!e.dead).type):STAGES[stage].song);SFX.confirm();}
  else if(stateT%60===1)SFX.count(10-Math.floor(stateT/60));
  else if(stateT>600){state='over';stateT=0;playSong('jover');setAmbience(null);}}
 else if(state==='victory'){if(stateT%3===0&&typeT<VMSG.length){typeT++;if(VMSG[typeT-1]!==' ')SFX.type();}if(stateT>VMSG.length*3+200||(pressed.start&&typeT>=VMSG.length)){state='tbc';stateT=0;}}
 else if(state==='tbc'||state==='over'){if(stateT>90&&pressed.start){state='stats';stateT=0;SFX.confirm();}}
 clr();
}
function clr(){for(const k in pressed)delete pressed[k];}
function stepWorld(){
 players.forEach(p=>{if(!p.alive)p.x=Math.max(p.x,camX+16);});players.forEach(updatePlayer);stepProjs();if(flashT>0)flashT--;enemies.forEach(updateEnemy);enemies=enemies.filter(e=>!e.gone);
 if(STAGES[stage].war&&state==='play'&&camLock!=null&&!enemies.some(e=>e.boss)&&Math.random()<1/240){const lv=players.filter(p=>p.alive);if(lv.length){const p=lv[Math.random()*lv.length|0];hazards.push({kind:'arty',x:p.x+(Math.random()-.5)*30,y:Math.max(FLOOR_TOP+8,Math.min(FLOOR_BOT,p.y+(Math.random()-.5)*16)),vx:0,t:80});SFX.warn(p.x);}}
 for(const h of hazards){if(h.delay>0){h.delay--;continue;}h.x+=h.vx;h.t--;
  if(hazNew(h))continue;
  if(h.kind==='wave'){h.r+=.55;for(const p of players)if(p.alive&&!h.hit.has(p)&&Math.abs(p.x-h.x)<h.r*.6+6&&Math.abs(p.y-h.y)<h.r*.45+6&&p.z<24&&p.inv<=0){h.hit.add(p);p.x+=Math.sign(h.vx)*12;p.scram=60;if(p.hurtT<=0)hurtPlayer(p,2*D().dmg,Math.sign(h.vx),false);floaters.push({x:p.x,y:p.y-100,t:30,s:'???',c:'#ff0',small:1});}continue;}
  const r=h.kind==='denied'?14:10,ry=h.kind==='denied'?9:10,dmg=(h.kind==='denied'?14:h.kind==='brief'?11:6)*D().dmg;
  for(const p of players)if(p.alive&&Math.abs(p.x-h.x)<r&&Math.abs(p.y-h.y)<ry&&(h.kind==='denied'?p.z<14:p.z<28)){if(hurtPlayer(p,dmg,Math.sign(h.vx),h.kind!=='paper')&&h.kind!=='denied'){h.t=0;if(h.kind==='brief')SFX.briefHit(p.x);}}
  if(h.kind==='denied'&&tick%4===0)fx.push({x:h.x,y:h.y-4,vx:0,vy:-.5,t:14,c:'#f33',s:4});}
 hazards=hazards.filter(h=>h.t>0&&h.x>camX-40&&h.x<camX+W+40);
 breakables.forEach(b=>{if(b.flash>0)b.flash--;});if(stage>=1&&stage<=3&&state==='play'&&Math.random()<1/700)SFX.honk(camX+Math.random()*W);
 for(const it of items){if(it.vz!==undefined&&(it.z>0||it.vz)){it.z+=it.vz;it.vz-=.3;if(it.z<=0){it.z=0;it.vz=0;}}
  if(!it.taken&&!(it.z>0)&&it.k!=='stick'&&it.k!=='shovel'&&it.k!=='puck'&&it.k!=='chair')for(const p of players)if(p.alive&&p.z<10&&Math.abs(p.x-it.x)<18&&Math.abs(p.y-it.y)<12){it.taken=1;
   if(it.k==='coffee'){p.hp=Math.min(p.maxhp,p.hp+35);SFX.coffee(it.x);floaters.push({x:it.x,y:it.y-40,t:50,s:'DOUBLE-DOUBLE! +35',c:'#fc6'})}
   else if(it.k==='syrup'){p.power=600;SFX.syrup();floaters.push({x:it.x,y:it.y-40,t:50,s:'SIROP D\'ÉRABLE!',c:'#f80'})}
   else if(it.k==='donuts'){if(p.hp>=p.maxhp){p.lives++;floaters.push({x:it.x,y:it.y-40,t:60,s:'1UP!',c:'#6f6'})}else floaters.push({x:it.x,y:it.y-40,t:50,s:'BOÎTE DE BEIGNES!',c:'#fc6'});p.hp=p.maxhp;SFX.oneup();}
   else{score+=500;STATS.loon++;SFX.coin(it.x);floaters.push({x:it.x,y:it.y-30,t:40,s:'+500',c:'#ffd800'})}
   if(it.k!=='loonie')score+=50;break;}}
 items=items.filter(i=>!i.taken);
 fx.forEach(f=>{f.x+=f.vx;f.y+=f.vy;if(f.grav)f.vy+=.2;if(f.vr)f.rot+=f.vr;if(f.floor&&f.y>f.floor&&f.vy>0){f.y=f.floor;f.vy*=-.35;f.vx*=.6;f.vr*=.5;}f.t--;if(f.smoke){f.s+=.25;f.vx*=.97;}});fx=fx.filter(f=>f.t>0);if(fx.length>220)fx.splice(0,fx.length-220);floaters.forEach(f=>{f.t--;if(!f.fixed)f.y-=.4});floaters=floaters.filter(f=>f.t>0);
 if(shake>0)shake--;
}
const VMSG='VICTOIRE ! Le bouton rouge est brisé.\n\nLes confinements sont levés, les comptes\ndégelés, la Coalition Globale dissoute.\nLe Canada respire enfin : la paix règne\nd\'un océan à l\'autre !\n\nLes double-doubles sont offerts !';

// ---------- RENDER ----------
// Blended background strips: panels overlap by K device px with a gradient so joins are invisible.
const STRIPS={},K=200;
function strip(S){const key=S.panels.join();if(STRIPS[key])return STRIPS[key];const imgs=S.panels.map(n=>IMG[n]);if(!imgs.every(i=>i.complete&&i.width))return null;
 const pw=768,P=pw-K,n=imgs.length,c=document.createElement('canvas');c.width=P*n+K;c.height=432;const x=c.getContext('2d');
 const masked=img=>{const m=document.createElement('canvas');m.width=pw;m.height=432;const mc=m.getContext('2d');mc.drawImage(img,0,0,pw,432);mc.globalCompositeOperation='destination-in';const g=mc.createLinearGradient(0,0,K,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'#000');mc.fillStyle=g;mc.fillRect(0,0,pw,432);return m;};
 // single-panel stages: blend the panel with its own other half for the wrap
 x.drawImage(imgs[0],0,0,pw,432);for(let i=1;i<n;i++)x.drawImage(masked(imgs[i]),P*i,0);x.drawImage(masked(imgs[0]),P*n,0);
 return STRIPS[key]={c,period:P*n};}
function drawBG(){const S=STAGES[stage],st=strip(S);if(st){const per=st.period/2,o=((camX%per)+per)%per;for(let x=-o;x<W;x+=per)X.drawImage(st.c,K,0,st.period,432,Math.round(x),0,st.period/2+.5,H);}
 drawArena(S);if(S.snow)snowFX(stage===4?25:45);}
function snowFX(n){X.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<n;i++){const x=((i*73+tick*(.3+i%3*.2))-(camX*.8))%W,y=(i*41+tick*(.5+i%4*.2))%H;X.fillRect((x+W)%W,y,1,1);}}
function frameFor(f){const hero=!!f.player;if(hero&&f.wk&&f.atk>0&&(f.atkType==='pound'||(f.atkType==='weapon'&&!f.wwind)||f.atkType==='weapon_end')&&f.wk!=='chair'&&f.pose!=='hurt'&&f.pose!=='down')return f.wk;if(hero&&f.atkType==='weapon'&&f.wwind&&f.atk>0)return'idle';if(hero&&f.pose==='special')return'special';if(hero&&f.z>2&&f.atkType==='jkick'&&f.pose==='kick')return'jumpkick';if(hero&&f.z>2&&f.pose!=='hurt'&&f.pose!=='down')return'walk';if(f.pose==='down')return'down';if(f.pose==='hurt')return'hit';if(f.pose==='punch'||f.pose==='kick'||f.pose==='attack')return hero?f.pose:'attack';if(f.pose==='walk'&&hero)return(f.anim>>3)%2?'walk':'idle';return'idle';}
function drawFighter(f,sx,sy){const c=f.spr,hero=c.startsWith('hero');let fr=frameFor(f);if(!SPR[c][fr])fr=fr==='down'?'hit':'punch';const img=SPR[c][fr];if(!img||!img.complete||!img.width)return;if(c==='gen'&&fr!=='down'){genLegs(f,sx,sy);sy-=16;}
 const sc=f.sc||1,w=img.width/2*sc,h=img.height/2*sc;let by=0,sqy=1;
 if(f.pose==='walk'&&!hero){by=-Math.abs(Math.sin(f.anim*.3))*2;}else if(f.pose==='idle')sqy=1+Math.sin(f.anim*.08)*.012;
 let flip=hero?f.face<0:f.face>0;const wob=f.type==='chair'&&f.hurtT>0&&!f.knock?Math.sin(f.hurtT*.9)*.12:f.chT>0?Math.sin(f.chT*.8)*.05:0;const air=hero&&f.z>2&&fr==='walk';if(air)sqy=.93;X.save();X.translate(Math.round(sx),Math.round(sy+by));if(air)X.rotate(-f.face*.12);if(wob)X.rotate(wob);X.scale(1,sqy);
 let ox=-w/2;if(fr==='punch'||fr==='kick'||fr==='attack'||fr==='stick'||fr==='shovel'){const iw=SPR[c].idle.width/2*sc;ox=hero?-iw/2:-(w-iw/2);}
 if(f.invT>0&&(tick>>2)%2)X.globalAlpha=.55;if(f.pal)X.filter='hue-rotate(160deg) saturate(1.2)';
 if(flip)X.drawImage(flipOf(img),-ox-w,-h,w,h);else X.drawImage(img,ox,-h,w,h);X.filter='none';if(f.flash>0&&(f.flash>>1)%2){X.globalAlpha=.75;if(flip)X.scale(-1,1);X.drawImage(whiteOf(img),ox,-h,w,h);if(flip)X.scale(-1,1);}X.globalAlpha=1; if(f.weapon&&f.pose!=='down'&&f.pose!=='hurt'&&fr!=='stick'&&fr!=='shovel'){const k=f.weapon.k,wind=f.atkType==='weapon'&&f.wwind&&f.atk>0,walkB=fr==='walk'?1:0;
  if(k==='chair'){obj('o_chair',0,-h+10,1,Math.PI*.9+Math.sin(f.anim*.1)*.05,.5,.5);}
  else{X.save();if(k==='stick')X.translate(f.face*13,-h*(.44+walkB*.02));else X.translate(f.face*4,-h*.6);X.scale(-f.face,1);
   const A=k==='stick'?(wind?-2.3:.42+Math.sin(f.anim*.15)*(fr==='walk'?.08:.02)):(wind?-3.25:-2.55+Math.sin(f.anim*.1)*.03);
   if(wind)for(let q=1;q<3;q++){X.save();X.globalAlpha=.18;X.rotate(A+q*.18);drawWeapon(k);X.restore();}
   X.rotate(A);drawWeapon(k);X.restore();}}
X.restore();}
function drawEnt(f){const x=f.x-camX,s=(f.sc||1)*(f.spr==='boss'?1.4:f.spr==='final'?1.5:1);const zs=Math.max(.5,1-(f.z||0)/80);
 const al=f.alt?f.alt+(f.dead||f.knock?0:Math.sin(f.anim*.12)*3):0,as=al?Math.max(.45,1-al/70):1;
 X.fillStyle='rgba(0,0,0,.45)';X.beginPath();X.ellipse(x,f.y,18*s*zs*as,4.5*s*zs*as,0,0,7);X.fill();
 if(f.las>0){drawLaser(f,x,al);X.filter='none';}
 if(f.player&&!f.alive){if(players.length>1&&f.lives<=0&&players.some(o=>o.alive))drawDowned(f,x);return;}if(f.player&&f.inv>0&&f.hurtT<=0&&f.spin<=0&&(tick>>2)%2)return;
 if(f.spin>0){X.strokeStyle='rgba(255,200,60,.7)';X.lineWidth=2;X.beginPath();X.ellipse(x,f.y-30,40,12,0,0,7);X.stroke();X.strokeStyle='rgba(255,255,255,.5)';X.beginPath();X.ellipse(x,f.y-50,34,9,0,0,7);X.stroke();}
 if(f.gold>0){X.save();X.shadowColor=(tick>>2)%2?'rgba(255,215,0,1)':'rgba(255,240,120,1)';X.shadowBlur=10;}if(f.type==='pm'&&f.atk>0&&f.atkKind==='ice'){X.save();X.shadowColor='rgba(140,230,255,1)';X.shadowBlur=14;drawFighter(f,x,f.y-(f.z||0)-al);X.restore();}else if(f.spinR&&f.alt>0){X.save();X.translate(x,f.y-al-20);X.rotate(f.spinR);X.translate(-x,-(f.y-al-20));drawFighter(f,x,f.y-(f.z||0)-al);X.restore();}else drawFighter(f,x,f.y-(f.z||0)-al);if(f.gold>0){X.restore();if(tick%6===0)fx.push({x:f.x+(Math.random()-.5)*30,y:f.y-20-Math.random()*60,vx:0,vy:-.6,t:16,c:'#ffd800',s:2});}
 drawEntNew(f,x,al);
 if(f.player&&f.scram>0)text('???',x,f.y-f.z-96+Math.sin(tick*.3)*2,(tick>>2)%2?'#ff0':'#f80',9,'center',OUT);
 if(f.chT>0)text('VROUM!',x+Math.sin(tick)*2,f.y-82,'#ff8',8,'center',OUT);
 if(f.shout>40)text('!',x,f.y-96,(tick>>2)%2?'#ff0':'#f40',12,'center',OUT);
 // telegraph for heavy attacks
 if(!f.player&&f.atk>0&&f.tele&&f.atk>6){const hy=f.y-(f.spr==='final'?120:f.boss?115:85)*(f.sc||1);X.fillStyle=(tick>>2)%2?'#ff0':'#f40';X.fillRect(x-3,hy,6,12);X.fillRect(x-3,hy+15,6,5);}
 if(f.player&&f.power>0&&tick%6<3){X.fillStyle='#fa2';X.fillRect(x-16,f.y-60-f.z,3,3);X.fillRect(x+14,f.y-40-f.z,3,3);X.fillRect(x-4,f.y-80-f.z,3,3);}}
function drawLaser(f,x,al){const qr=f.type==='qr',mx=x+f.face*(qr?40:26),my=qr?f.ly-58:f.ly-al-12,ex=f.face>0?W+10:-10,ey=qr?f.ly-58:f.ly-30;if(qr)X.filter='hue-rotate(110deg)';
 if(f.las>14){X.strokeStyle=(tick>>1)%2?'rgba(255,60,60,.95)':'rgba(255,0,0,.45)';X.lineWidth=1;X.setLineDash([4,3]);X.lineDashOffset=-tick;X.beginPath();X.moveTo(mx,my);X.lineTo(ex,ey);X.stroke();X.setLineDash([]);X.fillStyle='rgba(255,40,40,.8)';X.beginPath();X.arc(mx,my,2+(tick%6)/2,0,7);X.fill();X.fillStyle='rgba(255,60,60,.25)';X.beginPath();X.ellipse((mx+ex)/2,f.ly,Math.abs(ex-mx)/2,4,0,0,7);X.fill();}
 else if(f.las>2){X.save();X.globalCompositeOperation='lighter';X.strokeStyle='rgba(255,30,30,.55)';X.lineWidth=7;X.beginPath();X.moveTo(mx,my);X.lineTo(ex,ey);X.stroke();X.strokeStyle='rgba(255,200,200,.95)';X.lineWidth=2;X.stroke();X.restore();if(tick%2===0)fx.push({x:f.x+f.face*26+(Math.random()-.5)*4,y:f.ly-al-12,vx:(Math.random()-.5)*2,vy:-Math.random()*2,t:8,c:'#f88',spark:1});}}
function drawBreakable(b){const x=Math.round(b.x-camX),y=Math.round(b.y),n={crate:'b_crate',barrel:'b_barrel',can:'b_can'}[b.k]||'b_crate';shadow(x,y,17,4.5);
 const sh=b.flash>0?Math.sin(b.flash*2.2)*2.5:0,rot=b.flash>0?Math.sin(b.flash*1.7)*.06:0;obj(n,x+sh,y,1,rot);
 if(b.flash>0&&(b.flash>>1)%2){const i=OBJ[n];if(ok(i)){const w=i.width/2,h=i.height/2;X.save();X.globalAlpha=.7;X.translate(x+sh,y);X.rotate(rot);X.drawImage(whiteOf(i),-w/2,-h,w,h);X.restore();}}
 if(b.hp===1&&b.flash<=0){X.strokeStyle='rgba(20,10,5,.7)';X.beginPath();X.moveTo(x-6,y-24);X.lineTo(x-1,y-15);X.lineTo(x-5,y-8);X.stroke();}}
// debris chunk from an object sprite
function chunk(n,x,y,sx,sy,sw,sh,o={}){fx.push(Object.assign({x,y,vx:(Math.random()-.5)*5,vy:-2-Math.random()*3,t:40+Math.random()*15|0,img:n,sx,sy,sw,sh,rot:0,vr:(Math.random()-.5)*.5,grav:1,floor:y+14},o));}
function breakFX(b){const n={crate:'b_crate',barrel:'b_barrel',can:'b_can'}[b.k],i=OBJ[n];if(!ok(i))return;const W2=i.width,H2=i.height;
 if(b.k==='crate'){fx.push({x:b.x,y:b.y-14,vx:0,vy:0,t:16,img:'p_splinter',burst:1,rot:0,vr:0});for(let k=0;k<7;k++)chunk(n,b.x,b.y-14,(k%3)*W2/3,(k/3|0)*H2/3,W2/3,H2/3);for(let k=0;k<6;k++)chunk('p_splinter',b.x,b.y-14,Math.random()*30,Math.random()*30,18,18,{sc:.5});}
 else{for(let k=0;k<8;k++)chunk(n,b.x,b.y-14,(k%2)*W2/2,(k/2|0)*H2/4,W2/2,H2/4,{dark:Math.random()*.5});
  if(b.k==='can')chunk(n,b.x,b.y-28,0,0,W2,H2*.24,{vx:(Math.random()<.5?-1:1)*2,vy:-6,vr:.35,t:70});else for(let k=0;k<6;k++)fx.push({x:b.x,y:b.y-14,vx:(Math.random()-.5)*3,vy:-Math.random()*2,t:30,c:'rgba(30,30,40,.7)',s:8,smoke:1});}
 for(let k=0;k<6;k++)fx.push({x:b.x,y:b.y-16,vx:(Math.random()-.5)*2,vy:-Math.random(),t:24,c:'rgba(230,230,230,.6)',s:6,smoke:1});}
function drawItem(it){const x=it.x-camX;if(it.k==='chair'){shadow(x,it.y,14,3.5);obj('o_chair',x,it.y-(it.z>0?it.z:0),1,.25);glint(x+4,it.y-30,tick+it.x|0);return;}if(it.k==='stick'||it.k==='shovel'||it.k==='puck'){const b=it.z>0?it.z:0;shadow(x,it.y,it.k==='puck'?8:20,3.5);if(it.k==='puck')obj('w_puck',x,it.y-b,1);else obj('w_'+it.k,x,it.y-4-b,.95,it.k==='stick'?.78:1.0,.5,.5);glint(x+4,it.y-8-b,tick+it.x|0);return;}const img=ITEM[it.k];if(!img.complete)return;const b=it.z>0?it.z:Math.sin(tick*.12+it.x)*1.5+1.5;shadow(x,it.y,9,2.8);
 const w=img.width/2,h=img.height/2;X.drawImage(img,x-w/2,it.y-h-b,w,h);glint(x+3,it.y-h-b+3,tick+(it.x|0)*7);}
function drawWeapon(k){const i=OBJ['w_'+k];if(!ok(i))return;const w=i.width/2,h=i.height/2;// grip (top-right of art) at origin, head pointing down/forward after mirroring
 X.drawImage(i,-w*.9,-h*.1,w,h);}
function drawMic(m){const x=m.x-camX;if(m.kind==='puck'){shadow(x,m.y,7,2.2);trail('w_puck',x,m.y-20,m.vx,1.2,0);glowObj('w_puck',x,m.y-20,1.2,0);return;}
 if(m.kind==='wthrow'){shadow(x,m.y,12,3);const n=m.wk==='chair'?'o_chair':'w_'+m.wk,r=m.t*.45*Math.sign(m.vx);trail(n,x,m.y-40,m.vx,1,r-.4);glowObj(n,x,m.y-40,1,r);return;}
 const o=m.owner,y=m.y-52,hx=o.x-camX+o.face*30,hy=o.y-64;X.strokeStyle=OUT;X.lineWidth=2;X.beginPath();X.moveTo(hx,hy);X.quadraticCurveTo((x+hx)/2,Math.max(y,hy)+12,x,y);X.stroke();X.strokeStyle='#555';X.lineWidth=1;X.stroke();
 shadow(x,m.y,6,2);const mr=(m.vx>0?1:-1)*(1.2+Math.sin(m.t*.6)*.3);trail('p_mic',x,y,m.vx,1.1,mr);glowObj('p_mic',x,y,1.1,mr);}
function drawHazard(h){if(h.delay>0)return;const x=h.x-camX;
 if(drawHazNew(h,x))return;
 if(h.kind==='wave'){const a=Math.min(1,h.t/16),d=Math.sign(h.vx);X.save();X.translate(x,h.y-46);X.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const r=h.r+k*4;X.strokeStyle=k?`rgba(255,220,80,${.5*a})`:`rgba(255,255,200,${.9*a})`;X.lineWidth=k?1.5:2.5;X.beginPath();X.ellipse(0,0,r*.55,r,0,d>0?-1.1:Math.PI-1.1+2.2-2.2,d>0?1.1:Math.PI+1.1);X.stroke();}X.restore();return;}
 X.save();X.translate(x,h.y);
 if(h.kind==='denied'){const t=tick;X.save();X.globalCompositeOperation='lighter';const g=X.createRadialGradient(0,0,2,0,0,30);g.addColorStop(0,'rgba(255,120,40,.7)');g.addColorStop(1,'rgba(255,0,0,0)');X.fillStyle=g;X.scale(1,.3);X.beginPath();X.arc(0,0,30,0,7);X.fill();X.restore();
  X.save();X.globalCompositeOperation='lighter';for(let L=0;L<2;L++){X.beginPath();X.moveTo(-26,0);for(let i=0;i<=12;i++){const px=-26+i*52/12,hh=(i%2?1:.35)*(L?14:22)*(0.7+0.3*Math.sin(t*.7+i*1.9));X.lineTo(px,-hh);}X.lineTo(26,0);X.closePath();X.fillStyle=L?'rgba(255,230,120,.85)':'rgba(255,40,20,.6)';X.fill();}X.restore();
  if(t%2===0)fx.push({x:h.x+(Math.random()-.5)*40,y:h.y-Math.random()*6,vx:(Math.random()-.5)*1.5,vy:-1-Math.random()*2,t:14,c:Math.random()<.5?'#ff8':'#f42',spark:1});
  const k=1+Math.sin(t*.5)*.08,lb=h.label||'DENIED',lw=lb.length*5+10;X.scale(k,k);panel(-lw/2,-36,lw,14,{r:4,c1:h.col||'#ff3a2a',c2:'#8a0808',bd:'#fff',a:1,studs:false});text(lb,0,-34,'#fff',8,'center',OUT);}
 else{shadow(0,0,8,2.2);X.translate(0,-(h.z||40));
  if(h.kind==='paper'){const fl=Math.sin(tick*.5+h.x);X.rotate(fl*.5+Math.sign(h.vx)*.2);X.scale(1,.75+.25*Math.abs(Math.cos(tick*.35)));obj('p_invoice',0,0,1,0,.5,.5);}
  else{X.rotate(tick*.3*Math.sign(h.vx));X.restore();X.save();X.translate(x,h.y-(h.z||40));const br=tick*.3*Math.sign(h.vx);trail('p_brief',0,0,h.vx,1,br);glowObj('p_brief',0,0,1,br,'rgba(255,220,120,.95)');}}
 X.restore();}
function portrait(i,x,y){const img=SPR[(players[i]&&players[i].spr)||(i?'hero2':'hero1')].idle;if(!img.complete)return;const sw=img.width*.42,sx=img.width*.29;X.drawImage(img,sx,0,sw,sw,x,y,18,18);}
function hud(){
 if(newBan&&newBan.t>0){newBan.t--;const a=Math.min(1,newBan.t/15,(170-newBan.t)/10),y=34;X.save();X.globalAlpha=a;panel(W/2-120,y,240,30,{r:5,c1:'#b01818',c2:'#3a0606',bd:'#ffd800'});text('NOUVEL ENNEMI :',W/2,y+4,'#ffd800',7,'center',OUT);text(newBan.name,W/2,y+14,'#fff',9,'center',OUT);const im=SPR[newBan.spr]&&SPR[newBan.spr].idle;if(ok(im)){const ih=24,iw=im.width/im.height*ih;X.drawImage(im,W/2-118,y+3,Math.min(iw,40),ih);}X.restore();}
 players.forEach((p,i)=>{const x=i?W-92:4,y=4;panel(x,y,88,27,{r:4,c1:'rgba(40,50,110,.95)',c2:'rgba(8,10,30,.95)',bd:i?'#7cf':'#f77',a:.9,studs:false});rr(x+1.5,y+1.5,18,18,3);X.fillStyle='#223';X.fill();X.save();rr(x+1.5,y+1.5,18,18,3);X.clip();portrait(i,x+1.5,y+1.5);X.restore();rr(x+1.5,y+1.5,18,18,3);X.strokeStyle='#ffd800';X.lineWidth=1;X.stroke();
  X.font='bold 6px monospace';X.textAlign='left';X.textBaseline='top';X.fillStyle=i?'#7cf':'#f77';X.fillText((i?'2P ':'1P ')+p.name+'  x'+Math.max(0,p.lives),x+22,y+2);
  {const pw=p.power>0&&tick%8<4,lo=p.hp<=30;bar(x+22,y+11,62,5,Math.max(0,p.hp)/p.maxhp,pw?'#ffd070':lo?'#ff8060':'#fff27a',pw?'#e07000':lo?'#c01010':'#e0a000');}
  if(players.length>1){X.font='bold 5px monospace';X.fillStyle='#fff';X.textAlign='left';X.fillText(String(p.score||0).padStart(7,'0'),x+22,y+19);}
  if(p.hits>=3){const s=Math.min(1.4,1+(p.hitsT>90?.4:0));X.save();X.translate(x+(i?40:10),y+44);X.scale(s,s);text(p.hits+' COUPS!',0,0,p.hits>=10?'#f80':'#ffd800',12,i?'center':'left',OUT);X.restore();}});
 X.font='bold 7px monospace';X.textAlign='center';X.textBaseline='top';X.fillStyle='#fff';X.fillText(String(score).padStart(7,'0'),W/2,5);X.font='bold 5px monospace';X.fillStyle=D().col;X.fillText(gameMode==='survie'?'SURVIE · VAGUE '+SURV.wave+(SURV.mult>1?' · ×'+SURV.mult:''):'NIVEAU '+(stage+1)+' · '+D().name,W/2,14);
 if(players.length<2&&state==='play'&&(tick>>5)%2&&!isTouch){X.font='6px monospace';X.fillStyle='#7cf';X.fillText('2P: ,',W-20,27);}
 const b=enemies.find(e=>e.boss&&!e.dead);if(b){panel(W/2-86,H-22,172,19,{r:4,c1:'rgba(90,10,10,.9)',c2:'rgba(20,0,0,.9)',bd:'#f66',a:.85,studs:false});X.font='bold 7px monospace';X.textAlign='center';X.fillStyle='#fdd';X.fillText(b.name,W/2,H-20);{const c=b.invT>0?['#ccf','#66f']:b.phase>=3?['#f8f','#a0a']:b.phase===2?['#fc6','#c60']:['#f66','#900'];bar(W/2-80,H-11,160,5,Math.max(0,b.hp)/b.max,c[0],c[1],'#200');}}
 else{const e=enemies.find(e=>e.flash>0);if(e){X.font='bold 6px monospace';X.fillStyle='#ddd';X.fillText(e.name,W/2,22);}}
 if(goT>0&&(tick>>4)%2){text('GO',W-56,82,'#ffd800',16,'left',OUT);X.fillStyle='#ffd800';X.beginPath();X.moveTo(W-30,82);X.lineTo(W-14,92);X.lineTo(W-30,102);X.fill();}
 floaters.forEach(f=>{if(f.blink&&(tick>>3)%2)return;text(f.s,f.fixed?W/2:Math.max(f.s.length*2.6+4,Math.min(W-f.s.length*2.6-4,f.x-camX)),f.y,f.c,f.fixed?10:f.small?7:8,'center')});
 if(paused){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);panel(W/2-110,18,220,166,{r:6});text('PAUSE',W/2,26,'#ffd800',16,'center',OUT);PBTN=[];
  ['REPRENDRE','RECOMMENCER','MENU'].forEach((n,i)=>{const y=58+i*18,sel=pauseSel===i;panel(W/2-60,y-3,120,15,{r:4,c1:sel?'#e0302a':'rgba(255,255,255,.14)',c2:sel?'#7a0808':'rgba(255,255,255,.04)',bd:sel?'#ffd800':'rgba(255,255,255,.3)',a:1,studs:false});text(n,W/2,y,sel?'#ffd800':'#ddd',9,'center');PBTN.push({x:W/2-60,y:y-3,w:120,h:15,f:()=>{pauseSel=i;pauseAct(i);}});});
  [['MUSIQUE','music'],['EFFETS','sfx']].forEach(([n,k],i)=>{const y=122+i*20,sel=pauseSel===3+i;text(n,96,y,sel?'#ffd800':'#aaa',8);
   for(let j=0;j<10;j++){const on=j<Math.round(VOL[k]*10);rr(176+j*8,y,6,9,1.5);X.fillStyle=OUT;X.fill();rr(176.5+j*8,y+.5,5,8,1.5);const g=X.createLinearGradient(0,y,0,y+9);g.addColorStop(0,on?(sel?'#fff07a':'#bbb'):'#333');g.addColorStop(1,on?(sel?'#e09000':'#666'):'#1a1a1a');X.fillStyle=g;X.fill();}
   [['−',160,-1],['+',260,1]].forEach(([c,bx,dd])=>{panel(bx-7,y-3,14,14,{r:7,c1:'#3a4a9a',c2:'#141a40',bd:'#9cf',a:1,studs:false});text(c,bx,y-1,'#fff',10,'center');PBTN.push({x:bx-9,y:y-5,w:18,h:18,f:()=>{pauseSel=3+i;setVol(k,VOL[k]+dd*.1);SFX.blip();}});});});
  text(muted?'SON COUPÉ (M)':(isTouch?'touche un choix':'↑↓ choisir · ←→ volume · J valider · P reprendre'),W/2,170,'#7cf',6,'center');}}
function pauseAct(i){if(i===0){paused=false;SFX.confirm();}else if(i===1){paused=false;SFX.confirm();const two=players.length>1;startGame(two);}else if(i===2){paused=false;state='title';stateT=100;setAmbience(null);SFX.confirm();}}
function pauseMenu(){if(pressed.p1up||pressed.p2up){pauseSel=(pauseSel+4)%5;SFX.blip();}if(pressed.p1down||pressed.p2down){pauseSel=(pauseSel+1)%5;SFX.blip();}
 const d=(pressed.p1right||pressed.p2right?1:0)-(pressed.p1left||pressed.p2left?1:0);if(d&&pauseSel>=3){const k=pauseSel===3?'music':'sfx';setVol(k,VOL[k]+d*.1);SFX.blip();}
 if((pressed.p1punch||pressed.start)&&pauseSel<3)pauseAct(pauseSel);}
let PBTN=[];function pauseTap(lx,ly){for(const b of PBTN)if(lx>=b.x&&lx<=b.x+b.w&&ly>=b.y&&ly<=b.y+b.h){b.f();return true;}return false;}
function titleBG(){X.fillStyle='#000';X.fillRect(0,0,W,H);if(IMG.stage1_a.complete)X.drawImage(IMG.stage1_a,0,0,W,H);X.fillStyle='rgba(0,0,25,.66)';X.fillRect(0,0,W,H);snowFX(50);}
function drawTitle(){titleBG();
 const j=Math.min(1,stateT/45),hy=208-Math.sin(j*Math.PI)*70-(1-j)*140;
 [[86,1],[298,-1]].forEach(([x,fc],i)=>drawFighter({player:1,spr:i?'hero2':'hero1',face:fc,pose:stateT<45?(i?'punch':'kick'):'idle',anim:tick,flash:0},x,hy));
 const ty=Math.min(4,-110+Math.max(0,stateT-40)*4);drawLogo(W/2,ty,124);
 if(stateT>80){
  text((gameMode==='survie'?'◀ MODE SURVIE ▶':'◀ MODE ARCADE ▶'),W/2,101,gameMode==='survie'?'#f84':'#ffd800',9,'center',OUT);text('DIFFICULTÉ',W/2,113,'#aaa',6,'center');
  DIFFS.forEach((d,i)=>{const y=123+i*12,sel=i===diffIdx;if(sel)panel(W/2-48,y-2,96,11,{r:3,c1:'rgba(50,60,120,.85)',c2:'rgba(0,0,20,.85)',bd:d.col,a:1,studs:false});text((sel?'▶ ':'  ')+d.name+(sel?' ◀':''),W/2,y,sel?d.col:'#777',8,'center');});
  text(['3 VIES · 3 CONTINUS','2 VIES · 1 CONTINU','1 VIE · 0 CONTINU'][diffIdx],W/2,160,'#ccc',6,'center');
  if((tick>>4)%2)text(isTouch?'TOUCHE POUR JOUER':'APPUIE SUR DÉMARRER (ENTRÉE)',W/2,172,'#fff',9,'center');
  if(!isTouch)text('←→ mode · ↑↓ difficulté · , ou manette 2 = 2 JOUEURS',W/2,186,'#7cf',6,'center');
  text('RECORD '+hi+'  ©2026 PASSCOOL STUDIO · SATIRE FICTIVE',W/2,203,'#aaa',6,'center');}}
function drawTable(title){titleBG();text(title||'MEILLEURS SCORES',W/2,22,'#ffd800',16,'center',OUT);
 text(MODEN[tableMode],W/2,40,'#7cf',8,'center',OUT);HS[tableMode].forEach((s,i)=>{const y=54+i*14,me=entry&&entry.done&&entry.mode===tableMode&&i===entry.pos;text((i+1)+(i?'E':'ER'),118,y,me?'#fff':'#f77',8);text(s[0],172,y,me&&(tick>>3)%2?'#fff':me?'#ffd800':'#fff',8);text(String(s[1]).padStart(8,'0'),272,y,me?'#ffd800':'#7cf',8,'right');});
 if((tick>>4)%2)text('DÉMARRER',W/2,198,'#aaa',7,'center');}
function drawEntry_old(){titleBG();text('NOUVEAU RECORD!',W/2,30,'#ffd800',16,'center',OUT);text('SCORE '+score,W/2,56,'#fff',10,'center');text('ENTRE TES INITIALES',W/2,80,'#aaa',8,'center');
 for(let i=0;i<3;i++){const x=W/2-30+i*30,sel=i===entry.i;panel(x-11,100,22,28,{r:4,c1:sel?'#e0302a':'#3a3a4a',c2:sel?'#6a0606':'#111',bd:sel?'#ffd800':'#666',a:1,studs:false});text(ABC[entry.letters[i]],x,104,sel&&(tick>>3)%2?'#fff':'#ffd800',20,'center',OUT);}
 text('↑↓ lettre · J/ENTRÉE valider',W/2,146,'#7cf',7,'center');}
function render(){
 X.save();if(shake)X.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 if(state==='loading')drawLoading();else if(state==='intro')drawIntro();else if(state==='select')drawSelect();else if(state==='stats')drawStats();else if(state==='title')drawTitle();else if(state==='table')drawTable();else if(state==='entry')drawEntry();else if(state==='cut')drawCut();
 else if(state==='victory'||state==='tbc'){if(IMG.ending.complete)X.drawImage(IMG.ending,0,0,W,H);
  [0,1,2].forEach(i=>drawFighter({player:1,spr:HEROES[i],face:i===1?-1:1,pose:(tick>>4)%2?'punch':'idle',anim:tick,flash:0},110+i*84,212));
  if(state==='victory'){panel(24,8,W-48,80,{r:6,c1:'#2848c8',c2:'#08104a',bd:'#fff'});VMSG.slice(0,typeT).split('\n').forEach((l,i)=>text(l,36,16+i*9.5,i===0?'#ffd800':'#fff',8));}
  else{X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);drawCredits();text('SCORE FINAL '+score,W/2,H-22,'#fff',8,'center',OUT);if(stateT>90&&(tick>>4)%2)text('DÉMARRER',W-8,H-10,'#aaa',6,'right');}}
 else{drawBG();drawNuke();const all=[...items.map(i=>({y:i.y,it:i})),...breakables.map(b=>({y:b.y,br:b})),...enemies,...players,...(bonusM&&state==='bonus'?[{y:bonusM.y-1,bm:1}]:[])].sort((a,b)=>a.y-b.y);
  hazards.filter(h=>h.kind==='denied').forEach(drawHazard);all.forEach(o=>o.bm?drawBonusM():o.it?drawItem(o.it):o.br?drawBreakable(o.br):drawEnt(o));projs.forEach(drawMic);hazards.filter(h=>h.kind!=='denied').forEach(drawHazard);
  fx.forEach(f=>{const x=f.x-camX;if(f.img){const i=OBJ[f.img];if(!ok(i))return;X.save();X.globalAlpha=Math.min(1,f.t/12);X.translate(x,f.y);X.rotate(f.rot);if(f.burst){const k=1+(16-f.t)*.06;X.scale(k,k);X.drawImage(i,-i.width/4,-i.height/4,i.width/2,i.height/2);}else{const sc=(f.sc||1)/2;X.drawImage(i,f.sx,f.sy,f.sw,f.sh,-f.sw*sc/2,-f.sh*sc/2,f.sw*sc,f.sh*sc);if(f.dark){X.globalAlpha*=f.dark;X.drawImage(darkOf(i),f.sx,f.sy,f.sw,f.sh,-f.sw*sc/2,-f.sh*sc/2,f.sw*sc,f.sh*sc);}}X.restore();return;}if(f.spark){X.save();X.globalCompositeOperation='lighter';X.strokeStyle=f.c;X.globalAlpha=Math.min(1,f.t/8);X.beginPath();X.moveTo(x,f.y);X.lineTo(x-f.vx*2,f.y-f.vy*2);X.stroke();X.restore();return;}if(f.ring){f.r+=6;X.strokeStyle=f.c;X.globalAlpha=Math.min(1,f.t/12);X.lineWidth=4;X.beginPath();X.ellipse(x,f.y+30,f.r,f.r*.35,0,0,7);X.stroke();X.lineWidth=2;X.beginPath();X.ellipse(x,f.y,f.r*.8,f.r*.6,0,0,7);X.stroke();X.lineWidth=1;X.globalAlpha=1;return;}if(f.star){X.fillStyle=f.blue?'#9cf':'#fff';X.fillRect(x-8,f.y-1,16,3);X.fillRect(x-1,f.y-8,3,16);X.fillRect(x-4,f.y-4,9,9);return;}
   if(f.bang){text('!',x,f.y,'#f40',14,'center',OUT);return;}
   if(f.leaf){f.rot+=.3;X.save();X.translate(x,f.y);X.rotate(f.rot);X.globalAlpha=Math.min(1,f.t/10);leafBig(-4,-4,1,f.t%6<3?'#e02020':'#ff4030');X.restore();X.globalAlpha=1;return;}
   if(f.smoke){X.globalAlpha=Math.min(.9,f.t/25);X.fillStyle=f.c;X.beginPath();X.arc(x,f.y,f.s/2,0,7);X.fill();X.globalAlpha=1;}else{X.fillStyle=f.c;X.fillRect(x-1,f.y-1,f.s,f.s);}});
  if(slowmo>0){X.fillStyle=`rgba(255,255,255,${Math.max(0,(slowmo-80)/40)})`;X.fillRect(0,0,W,H);if(slowmo>20)text('K.O.!',W/2,70,'#ffd800',28,'center',OUT);}
  if(flashT>0){X.fillStyle=`rgba(255,255,255,${flashT/18})`;X.fillRect(0,0,W,H);}
  hud();
  if(state==='bonus'){text('BONUS : DÉNEIGEMENT DES PERMIS',W/2,30,'#ffd800',9,'center',OUT);text(String(Math.ceil(bonusT/60)),W/2,42,bonusT<600&&tick%20<10?'#f44':'#fff',16,'center',OUT);if(stateT<120)text('DÉTRUIS LA MACHINE À PAPERASSE !',W/2,70,'#fff',9,'center',OUT);}
  if(bannerT>0&&!paused)drawBanner();
  if(state==='card'){const a=stateT<20?stateT/20:stateT>130?Math.max(0,(150-stateT)/20):1;X.fillStyle=`rgba(0,0,0,${.85*Math.min(1,stateT<20?1:a)})`;X.fillRect(0,0,W,H);X.globalAlpha=a;
   {const g=X.createLinearGradient(0,76,0,138);g.addColorStop(0,'rgba(176,16,16,.0)');g.addColorStop(.15,'rgba(150,10,10,.85)');g.addColorStop(.85,'rgba(60,0,0,.85)');g.addColorStop(1,'rgba(176,16,16,0)');X.fillStyle=g;X.fillRect(0,76,W,62);X.fillStyle='#ffd800';X.fillRect(0,78,W,1);X.fillRect(0,135,W,1);leafBig(W/2-130,92,2,'#ffd800');leafBig(W/2+112,92,2,'#ffd800');}text(gameMode==='survie'?'SURVIE · ARÈNE '+(SURV.arena+1):'NIVEAU '+(stage+1),W/2,84,'#ffd800',22,'center',OUT);text(STAGES[stage].title,W/2,112,'#fff',12,'center',OUT);if(STAGES[stage].sub)text(STAGES[stage].sub,W/2,126,'#ffd800',7,'center',OUT);X.globalAlpha=1;}
  if(state==='clear'){panel(50,40,W-100,128,{r:6});text('NIVEAU '+(stage+1)+' TERMINÉ!',W/2,46,'#ffd800',13,'center',OUT);
   if(tally){text('BONUS TEMPS',80,70,'#fff',8);text(String(tally.tb),W-140,70,'#fff',8,'right');text('BONUS SANTÉ',80,84,'#fff',8);text(String(tally.hb),W-140,84,'#fff',8,'right');text('BONUS RANG',80,98,'#fff',8);text(String(tally.rb),W-140,98,'#fff',8,'right');text('SCORE',80,122,'#7cf',9);text(String(score),W-140,122,'#7cf',9,'right');
    if(stateT>50){const rc={S:'#ffd800',A:'#f84',B:'#7cf',C:'#aaa'}[tally.rank],s=Math.max(1,3-(stateT-50)/10);X.save();X.translate(W-92,92);X.scale(s,s);text('RANG',0,-30,'#fff',7,'center');text(tally.rank,0,-20,rc,36,'center',OUT);X.restore();}}}
  if(state==='cont'){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);panel(W/2-90,46,180,98,{r:6,c1:'#3a1050',c2:'#0a0218'});text('CONTINUER ?',W/2,58,'#ffd800',20,'center',OUT);text(String(Math.max(0,10-Math.floor(stateT/60))),W/2,90,'#fff',30,'center',OUT);text('CRÉDITS: '+contLeft,W/2,128,'#7cf',8,'center');if((tick>>4)%2)text(isTouch?'TOUCHE POUR CONTINUER':'DÉMARRER',W/2,146,'#aaa',8,'center');}
  if(state==='over'){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);panel(W/2-100,66,200,80,{r:6,c1:'#501010',c2:'#120000',bd:'#f44'});text('PARTIE TERMINÉE',W/2,80,'#f44',20,'center');if(stateT>90)text('DÉMARRER',W/2,130,'#fff',8,'center');}}
 drawToast();X.restore();}

// ---------- NEW SCREENS ----------
const INTRO='CANADA, 2026.\nCONFINEMENTS, PASSEPORTS, DÉLATEURS...\nPUIS LE MINISTÈRE A PRIS LE CONTRÔLE :\nTAXES, PAPERASSE ET CENSURE PARTOUT.\nET LA GUERRE MONDIALE GRONDE...\n\nTROIS HÉROS SE LÈVENT : LE CAMIONNEUR,\nLE REPORTER ET LA FERMIÈRE D\'ALBERTA.\n\nTOUT COMMENCE DANS LES RUES CONFINÉES...';
function drawLoading(){X.fillStyle='#05060f';X.fillRect(0,0,W,H);text('CHARGEMENT...',W/2,88,'#ffd800',10,'center',OUT);const p=LOAD.n?LOAD.done/LOAD.n:0;panel(W/2-86,102,172,16,{r:5,studs:false});bar(W/2-80,106,160,8,p,'#ff6a5a','#a00010','#1a0a0a');text(Math.round(p*100)+'%',W/2,120,'#aaa',7,'center');leafBig(W/2-9,50,2,'#d4202a');}
function drawIntro(){const img=IMG.intro,t=stateT/60,z=1.12-Math.min(.12,t*.008),pan=Math.min(1,t/20);X.fillStyle='#000';X.fillRect(0,0,W,H);
 if(img.complete&&img.width){const w=W*z,h=H*z;X.globalAlpha=Math.min(1,stateT/60);X.drawImage(img,-(w-W)*pan,-(h-H)*.5,w,h);X.globalAlpha=1;}
 const g=X.createLinearGradient(0,H*.45,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.85)');X.fillStyle=g;X.fillRect(0,0,W,H);
 const lines=INTRO.slice(0,introT).split('\n');lines.forEach((l,i)=>text(l,20,H-100+i*11,i===0?'#ffd800':'#fff',8,'left',OUT));
 if((tick>>5)%2)text(isTouch?'TOUCHE POUR PASSER':'UNE TOUCHE POUR PASSER',W-8,6,'#aaa',6,'right');}
let shineC=null;
function drawLogo(cx,y,w){if(!LOGO.complete||!LOGO.width)return;const h=w*LOGO.height/LOGO.width;
 if(!shineC){shineC=document.createElement('canvas');shineC.width=LOGO.width;shineC.height=LOGO.height;}
 const c=shineC.getContext('2d');c.globalCompositeOperation='source-over';c.clearRect(0,0,shineC.width,shineC.height);c.drawImage(LOGO,0,0);
 const p=((tick%180)/120)*1.6-.3;if(p<1.3){c.globalCompositeOperation='source-atop';const gx=p*shineC.width,g=c.createLinearGradient(gx-80,0,gx+80,shineC.height*.4);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,shineC.width,shineC.height);}
 X.drawImage(shineC,cx-w/2,y,w,h);}
function drawStats(){titleBG();text('BILAN DE MISSION',W/2,18,'#ffd800',16,'center',OUT);const secs=Math.floor(STATS.time/60);
 [['TEMPS',Math.floor(secs/60)+' min '+String(secs%60).padStart(2,'0')+' s'],['ENNEMIS VAINCUS',STATS.ko],['COMBO MAX',STATS.maxc+' coups'],['HUARDS RAMASSÉS',STATS.loon],['DIFFICULTÉ',D().name],['SCORE FINAL',score]].forEach(([k,v],i)=>{const y=40+i*17;text(k,80,y,'#fff',9);text(String(v),W-80,y,i===5?'#ffd800':'#7cf',9,'right');});
 const M=[['SANS CONTINUER',STATS.cont===0&&STATS.won],['COMBO 30+',STATS.maxc>=30],['TOUS LES HUARDS',STATS.loonS>0&&STATS.loon>=STATS.loonS],['CHASSE-PAPERASSE',!!STATS.bonusKO]];
 text('MÉDAILLES',W/2,158,'#ffd800',8,'center',OUT);M.forEach(([n,ok],i)=>{const cx=W/2-132+i*88,y=180,show=stateT>40+i*15;if(!show)return;X.fillStyle=OUT;X.beginPath();X.arc(cx,y,9,0,7);X.fill();X.fillStyle=ok?'#ffd800':'#444';X.beginPath();X.arc(cx,y,8,0,7);X.fill();X.fillStyle=ok?'#b01010':'#222';X.fillRect(cx-3,y-12,6,5);
  if(ok){X.fillStyle='#fff8a0';X.fillRect(cx-3,y-4,2,2);}text(ok?'★':'?',cx,y-4,ok?'#b01010':'#777',8,'center');text(n,cx,y+11,ok?'#fff':'#666',5,'center');});
 if(stateT>60&&(tick>>4)%2)text('DÉMARRER',W/2,204,'#aaa',8,'center');}
function drawBanner(){const t=130-bannerT,a=Math.min(1,t/10,bannerT/15);X.fillStyle=`rgba(0,0,0,${.45*a})`;X.fillRect(0,0,W,H);
 if((tick>>3)%2){X.fillStyle=`rgba(255,0,0,${.18*a})`;X.fillRect(0,0,W,H);}
 const sx=Math.max(0,1-t/12)*W;X.globalAlpha=a;X.fillStyle='#b01010';X.fillRect(sx,70,W,46);X.fillStyle='#ffd800';X.fillRect(sx,68,W,2);X.fillRect(sx,116,W,2);
 for(let i=0;i<12;i++){X.fillStyle='#000';X.fillRect(((i*40-t*3)%(W+40)+W+40)%(W+40)-40,58,20,8);X.fillRect(((i*40+t*3)%(W+40)+W+40)%(W+40)-40,120,20,8);}
 if((tick>>3)%2)text('⚠ ATTENTION ⚠',W/2,74,'#fff',10,'center',OUT);text(bannerName,W/2-sx,90,'#ffd800',14,'center',OUT);X.globalAlpha=1;}
let last=performance.now(),acc=0,simMode=false;
function loop(now){acc+=Math.min(100,now-last);last=now;if(!simMode)while(acc>=1000/60){update();acc-=1000/60;}else acc=0;X.setTransform(2,0,0,2,0,0);X.imageSmoothingEnabled=true;render();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
window.__game={get state(){return state},get curStage(){return stage},startGame,get players(){return players},get enemies(){return enemies},get camX(){return camX},keys,pressed,
 setDiff(i){diffIdx=i;},DIFFS,get hazards(){return hazards},get breakables(){return breakables},get score(){return score},get contLeft(){return contLeft},
 char(i){charSel=i;SEL=[HEROES[i]];},sel(a){SEL=a;SELS=null;},selS(o){SELS=o},setEntry(o){entry=o},setCut(n){goStage(n)},hs(){return HS},surv(){return SURV},mode(m){gameMode=m},cutT(){return cut},newEnemy,get dbg(){return {paused,bannerT,hitstop,slowmo,camLock,simMode}},get projs(){return projs},get bonusM(){return bonusM},bonus(){if(!players.length)startGame(false);stage=3;startBonus();},cam(x){camX=x;camLock=x;},get NUKE(){return NUKE},get items(){return items},get STATS(){return STATS},
 stage(n){if(!players.length)startGame(false);startStage(Math.max(0,Math.min(STAGES.length-1,n-1)));state='play';},
 boss(){const S=STAGES[stage];state='play';enemies=[];camLock=null;waveIdx=S.waves.length-1;camX=S.waves[waveIdx].at;players.forEach((p,i)=>{p.x=camX+90+i*20;p.y=178;p.inv=0;p.hurtT=0;p.alive=true;});},
 win(){state='victory';stateT=0;typeT=0;playSong('win');setAmbience(null);},
 // run n frames synchronously (for automated playtests), calling ai() before each frame
 sim(n,ai){simMode=true;for(let i=0;i<n;i++){if(ai)ai();update();}return state;},real(){simMode=false;},
 set(o){if('two'in o)twoStart=o.two;if('tm'in o)tableMode=o.tm;if('score'in o)score=o.score;if('stateT'in o)stateT=o.stateT;if(o.state)state=o.state;}};

// ===== LEVEL 1 (CONFINEMENT) & LEVEL 7 (TROISIÈME GUERRE MONDIALE) — all characters are fictional satirical archetypes =====
const GRUNT={san:'bureau',qr:'insp',snitch:'taxman',doc:'boss',pm:'boss',reset:'final',soldier:'insp',para:'insp',mech:'bot',general:'bot',gen:'boss'};
const NUKE={broken:0};
function summon(list){list.forEach((k,i)=>{const e=newEnemy(k,camX+(i%2?-20:W+20),FLOOR_TOP+14+((i*31)%44));if(k==='para'){e.x=camX+80+((i*110)%(W-160));e.alt=150+i*20;}enemies.push(e);});}
function say(s,c='#f44',t=120){floaters.push({x:camX+W/2,y:66,t,s,c,fixed:1});}
function aiNew2(e,t,live){const adx=Math.abs(t.x-e.x),ady=Math.abs(t.y-e.y),tok=!(attackers()>=D().tokens);
 if(e.type==='para'&&e.alt>0){e.alt=Math.max(0,e.alt-1.3);e.pose='idle';e.x+=Math.sign(t.x-e.x)*.4+Math.sin(e.anim*.05)*.3;e.x=Math.max(camX+20,Math.min(camX+W-20,e.x));if(e.alt===0){SFX.land(e.x);e.cd=30;for(let i=0;i<6;i++)fx.push({x:e.x+(Math.random()-.5)*30,y:e.y-4,vx:(Math.random()-.5),vy:-.4,t:20,c:'rgba(120,110,90,.6)',s:8,smoke:1});}return true;}
 if(e.type==='qr'){
  if(e.las>0){e.las--;e.pose=e.las<16?'attack':'idle';e.y=e.ly;if(e.las===14)SFX.laser(e.x);
   if(e.las<14&&e.las>2)hitPlayers(e,p=>{if(Math.abs(p.y-e.ly)<9&&p.z<16&&(p.x-e.x)*e.face>0&&!(p.frz>0)&&p.inv<=0&&p.hurtT<=0){if(hurtPlayer(p,e.dmg*.6,e.face,false)){p.frz=45;p.frzK='qr';floaters.push({x:p.x,y:p.y-100,t:40,s:'PASSEPORT REQUIS!',c:'#7f7',small:1});}}});
   if(e.las===0)e.cd=(130+Math.random()*60)*D().cd;return true;}
  if(e.cd<=0&&e.atk===0&&ady<7&&adx>50&&adx<260&&tok){e.face=t.x<e.x?-1:1;e.las=54;e.ly=e.y;SFX.laserCharge(e.x);return true;}return false;}
 if(e.type==='san'){if(e.cd<=0&&e.atk===0&&ady<12&&adx>28&&adx<85&&tok){e.face=t.x<e.x?-1:1;startAttack(e,'spray');return true;}return false;}
 if(e.type==='snitch'){if(e.cd<=0&&e.atk===0&&ady<20&&adx>60&&adx<170&&!(t.marked>0)&&Math.random()<.02){e.face=t.x<e.x?-1:1;e.repT=t;startAttack(e,'report');return true;}return false;}
 return false;}
function atkNew(e,t,k){const f=e.face;
 if(k==='spray'){hazards.push({kind:'mist',x:e.x+f*34,y:e.y,vx:f*1.3,t:34,r:10,hit:new Set()});SFX.whoosh(e.x);return true;}
 if(k==='report'){const p=e.repT||t;fx.push({x:e.x+f*26,y:e.y-62,vx:0,vy:0,t:10,c:'#fff',s:14,smoke:1});SFX.shutter();if(p.alive){p.marked=420;floaters.push({x:p.x,y:p.y-104,t:50,s:'DÉNONCÉ!',c:'#f66',small:1});}return true;}
 if(k==='directive'){const n=e.phase>1?4:3;for(let i=0;i<n;i++)hazards.push({kind:'directive',x:e.x+f*24,y:Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y+(i-(n-1)/2)*16)),z:44,vx:f*(2.8+i*.25),t:140,delay:i*8});SFX.paper(e.x);return true;}
 if(k==='stayhome'){SFX.shock(e.x);shake=6;const n=e.phase>1?2:1;for(let i=0;i<n;i++)hazards.push({kind:'denied',label:'RESTEZ CHEZ VOUS',col:'#2a7aff',x:e.x+f*30,y:Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y+(i-(n-1)/2)*24)),vx:f*(2.8-i*.3),t:200,delay:i*16});return true;}
 if(k==='ice'){SFX.shock(e.x);SFX.smash('can',e.x);const n=e.phase>1?3:1;for(let i=0;i<n;i++)hazards.push({kind:'ice',x:e.x+f*30,y:Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,e.y+(i-(n-1)/2)*22)),vx:f*3,t:160,delay:i*6});floaters.push({x:e.x,y:e.y-110,t:40,s:'GEL DES COMPTES!',c:'#9ef'});return true;}
 if(k==='button'){SFX.stamp(e.x);SFX.shock(e.x);shake=8;const nd=enemies.filter(o=>o.type==='drone'&&!o.dead).length,add=[];for(let i=nd;i<Math.min(3,nd+2);i++)add.push('drone');summon(add);hazards.push({kind:'denied',label:'RÉINITIALISATION',col:'#777',x:e.x+f*30,y:e.y,vx:f*3,t:200});floaters.push({x:e.x,y:e.y-120,t:40,s:'GRANDE RÉINITIALISATION!',c:'#ddd'});return true;}
 if(k==='cannon'){SFX.impact(e.x,1);SFX.crunch(e.x);shake=8;const n=e.phase>1?2:1;for(let i=0;i<n;i++)hazards.push({kind:'cannon',x:e.x+f*80,y:Math.max(FLOOR_TOP+6,Math.min(FLOOR_BOT,i?t.y:e.y)),z:56,vx:f*4.2,t:150,delay:i*18});for(let i=0;i<10;i++)fx.push({x:e.x+f*84,y:e.y-70,vx:f*Math.random()*3,vy:(Math.random()-.5)*2,t:20,c:i%2?'rgba(255,180,60,.9)':'rgba(60,60,60,.8)',s:10,smoke:1});return true;}
 if(k==='barrage'){SFX.siren();for(const p of players.filter(p=>p.alive))for(let i=0;i<(e.phase>2?3:2);i++)hazards.push({kind:'arty',x:p.x+(Math.random()-.5)*90,y:Math.max(FLOOR_TOP+8,Math.min(FLOOR_BOT,p.y+(Math.random()-.5)*30)),vx:0,t:80+i*20});say('FRAPPE D\'ARTILLERIE !','#f84',80);return true;}
 return false;}
function aiBoss(e,t,live){e.special=999;const adx=Math.abs(t.x-e.x);if(e.atk>0||e.dash>0||e.holding)return false;
 if(e.doc){if(e.phase===1&&e.hp<e.max*.5){e.phase=2;SFX.siren();shake=8;say('NOUVELLES DIRECTIVES !');summon(['san','snitch']);}
  if(e.shieldT>0){e.shieldT--;e.pose='idle';e.face=t.x<e.x?-1:1;if(e.shieldT%55===30)startAttack(e,'directive');return true;}
  if(--e.sp2<=0){e.sp2=(e.phase>1?110:150)*D().cd+40;e.face=t.x<e.x?-1:1;const r=Math.random();if(r<.3){e.shieldT=120;floaters.push({x:e.x,y:e.y-120,t:50,s:'POINT DE PRESSE!',c:'#9cf'});SFX.shield(e.x);return true;}startAttack(e,r<.65?'directive':'stayhome');return true;}
  return false;}
 if(e.pm){if(e.phase===1&&e.hp<e.max*.5){e.phase=2;e.spd*=1.3;SFX.siren();shake=12;say('MESURES D\'URGENCE !');summon(['qr','san']);}
  if(--e.sp2<=0){e.sp2=(e.phase>1?100:150)*D().cd+40;e.face=t.x<e.x?-1:1;if(Math.random()<.6||adx>90)startAttack(e,'ice');else{floaters.push({x:e.x,y:e.y-120,t:40,s:'SELFIE!',c:'#fff'});fx.push({x:e.x,y:e.y-100,vx:0,vy:0,t:8,c:'#fff',s:20,smoke:1});SFX.shutter();startAttack(e,'arc');}return true;}
  return false;}
 if(e.reset){if(!e.mono){e.mono=1;e.px=(camLock!=null?camLock:camX)+W-96;e.py=Math.min(FLOOR_BOT-6,Math.max(FLOOR_TOP+20,e.y-4));say('VOUS NE POSSÉDEREZ RIEN ET SEREZ HEUREUX','#ddd',220);}
  if(e.goBtn){const tx=e.px+30,ty=e.py+3,dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<4||e.goBtn++>150){e.goBtn=0;e.face=-1;startAttack(e,'button');}else{e.x+=dx/d*2.4;e.y+=dy/d*1.6;e.face=dx<0?-1:1;e.pose='walk';e.anim++;}return true;}
  if(e.phase===1&&e.hp<e.max*.45){e.phase=2;SFX.siren();shake=10;say('LA GRANDE RÉINITIALISATION !');summon(['lob','snitch']);}
  if(--e.sp2<=0){e.sp2=(e.phase>1?130:170)*D().cd+40;e.goBtn=1;return true;}
  return false;}
 if(e.gen){const ph=e.hp<e.max*.33?3:e.hp<e.max*.66?2:1;if(ph>e.phase){e.phase=ph;SFX.siren();shake=12;say(ph===2?'PHASE 2 : PLUIE DE MISSILES !':'PHASE 3 : ASSAUT TOTAL !');summon(ph===2?['para','soldier']:['para','para','mech']);}
  if(--e.sp2<=0){e.sp2=(e.phase>2?90:e.phase>1?120:150)*D().cd+30;e.face=t.x<e.x?-1:1;startAttack(e,e.phase>1&&Math.random()<.4?'barrage':(adx>70||Math.random()<.5)?'cannon':'slam');return true;}
  return false;}
 if(e.onfoot){const bx=nukeX()-20,by=FLOOR_TOP+14,dx=bx-e.x,dy=by-e.y;
  if(Math.abs(dx)>6||Math.abs(dy)>4){e.face=dx<0?-1:1;e.x+=Math.sign(dx)*Math.min(Math.abs(dx),e.spd);e.y+=Math.sign(dy)*Math.min(Math.abs(dy),e.spd*.7);e.pose='walk';e.arm=0;return true;}
  e.face=1;e.pose=(e.anim>>3)%2?'attack':'idle';e.arm++;if(e.arm%60===1){floaters.push({x:e.x,y:e.y-110,t:50,s:'LANCEMENT : '+(4-Math.floor(e.arm/60)),c:'#f44'});SFX.warn(e.x);}
  if(e.arm>=240){e.arm=0;flashT=18;shake=16;SFX.ko();say('ALERTE NUCLÉAIRE ! ARRÊTEZ-LE !','#f44',100);players.forEach(p=>{if(p.alive){p.inv=0;p.hurtT=0;hurtPlayer(p,22*D().dmg,p.x<e.x?-1:1,true);}});e.x-=40;}
  return true;}
 return false;}
function damageNew(p,e,heavy){if(e.onfoot)e.arm=0;
 if(e.doc&&e.shieldT>0&&!(p.z>6)&&e.face===-p.face){spark(e.x+e.face*18,e.y-40);SFX.block(e.x);if(heavy){e.shieldT=0;floaters.push({x:e.x,y:e.y-120,t:40,s:'PODIUM BRISÉ!',c:'#ff0'});SFX.smash('crate',e.x);for(let i=0;i<10;i++)fx.push({x:e.x+e.face*18,y:e.y-30,vx:(Math.random()-.5)*5,vy:-2-Math.random()*3,t:30,c:i%2?'#3a5fb0':'#ddd',s:3,grav:1});}else floaters.push({x:e.x,y:e.y-110,t:20,s:'PAS DE QUESTIONS!',c:'#9cf',small:1});return true;}
 if(e.type==='mech'&&!heavy&&e.atk===0&&e.face===-p.face&&!(e.stun>0)&&Math.random()<.5){spark(e.x+e.face*20,e.y-50);SFX.block(e.x);floaters.push({x:e.x,y:e.y-110,t:20,s:'BOUCLIER!',c:'#9cf',small:1});e.vx=p.face*.6;return true;}
 return false;}
function scrap(x,y,n){const i=OBJ.p_scrap;if(!ok(i))return;for(let k=0;k<n;k++)fx.push({img:'p_scrap',x:x+(Math.random()-.5)*60,y:y-40,vx:(Math.random()-.5)*5,vy:-3-Math.random()*3,grav:1,t:60,rot:0,vr:(Math.random()-.5)*.4,floor:y,sx:0,sy:0,sw:i.width,sh:i.height,sc:.7});}
function deathNew(e){
 if(e.type==='general'){explode(e.x,e.y,2);explode(e.x-40,e.y-40,1.4);scrap(e.x,e.y,8);const g=newEnemy('gen',e.x,e.y);g.cd=20;g.hurtT=0;enemies.push(g);say('IL S\'ENFUIT VERS LE BOUTON ROUGE !','#ff0',150);SFX.siren();return true;}
 if(e.type==='gen'){NUKE.broken=1;poof(e.x,e.y,1.5);SFX.smash('can',e.x);say('BOUTON DÉSAMORCÉ — LA PAIX EST SAUVÉE !','#7f7',220);flashT=18;return true;}
 if(e.type==='mech'){explode(e.x,e.y,1);scrap(e.x,e.y,4);return true;}
 return false;}
function breakIce(p){SFX.smash('can',p.x);for(let i=0;i<8;i++)fx.push({x:p.x+(Math.random()-.5)*24,y:p.y-30-Math.random()*40,vx:(Math.random()-.5)*4,vy:-2-Math.random()*2,t:30,c:i%2?'#cff':'#8df',s:3,grav:1});}
function explode(x,y,s){SFX.crunch(x);SFX.impact(x,1);shake=Math.max(shake,8*s);for(let i=0;i<18;i++)fx.push({x:x+(Math.random()-.5)*30*s,y:y-Math.random()*30*s,vx:(Math.random()-.5)*3,vy:-Math.random()*2.5,t:30+Math.random()*20,c:i%3===0?'rgba(50,50,50,.8)':i%3===1?'rgba(255,200,60,.9)':'rgba(255,90,20,.85)',s:10*s,smoke:1});for(let i=0;i<10;i++)fx.push({x,y:y-6,vx:(Math.random()-.5)*6,vy:-2-Math.random()*4,t:30,c:['#fd4','#f80','#444'][i%3],s:2,grav:1});}
function hazNew(h){
 if(h.kind==='mist'){h.r+=.6;h.vx*=.97;for(const p of players)if(p.alive&&!h.hit.has(p)&&Math.abs(p.x-h.x)<h.r+6&&Math.abs(p.y-h.y)<10&&p.z<20){h.hit.add(p);if(hurtPlayer(p,3*D().dmg+2,Math.sign(h.vx),false)){p.frz=24;p.frzK='qr';floaters.push({x:p.x,y:p.y-100,t:30,s:'DÉSINFECTÉ!',c:'#bdf',small:1});}}return true;}
 if(h.kind==='ice'){h.rot=(h.rot||0)+.2*Math.sign(h.vx);if(tick%3===0)fx.push({x:h.x,y:h.y-8,vx:-h.vx*.2,vy:-.4,t:16,c:'#cff',s:2});for(const p of players)if(p.alive&&Math.abs(p.x-h.x)<14&&Math.abs(p.y-h.y)<9&&p.z<14){if(hurtPlayer(p,7*D().dmg,Math.sign(h.vx),false)){p.frz=70;p.frzK='ice';floaters.push({x:p.x,y:p.y-104,t:40,s:'COMPTE GELÉ!',c:'#9ef',small:1});SFX.smash('can',p.x);}h.t=0;}return true;}
 if(h.kind==='directive'){for(const p of players)if(p.alive&&Math.abs(p.x-h.x)<10&&Math.abs(p.y-h.y)<10&&p.z<28){if(hurtPlayer(p,6*D().dmg,Math.sign(h.vx),false))h.t=0;}return true;}
 if(h.kind==='cannon'){if(tick%2===0)fx.push({x:h.x-h.vx*3,y:h.y-h.z,vx:0,vy:-.3,t:18,c:'rgba(90,90,90,.6)',s:6,smoke:1});for(const p of players)if(p.alive&&Math.abs(p.x-h.x)<16&&Math.abs(p.y-h.y)<10&&p.z<30){if(hurtPlayer(p,13*D().dmg,Math.sign(h.vx),true)){h.t=0;explode(h.x,h.y,.8);}}return true;}
 if(h.kind==='arty'){if(h.t===1){explode(h.x,h.y,1);for(const p of players)if(p.alive&&Math.abs(p.x-h.x)<30&&Math.abs(p.y-h.y)<14)hurtPlayer(p,11*D().dmg,p.x<h.x?-1:1,true);for(const e of enemies)if(!e.dead&&!e.boss&&!(e.alt>0)&&Math.abs(e.x-h.x)<30&&Math.abs(e.y-h.y)<14){e.hp-=10;e.hurtT=40;e.knock=1;e.vz=3;e.vx=e.x<h.x?-3:3;if(e.hp<=0){e.dead=1;score+=e.pts;}}}return true;}
 return false;}
function drawHazNew(h,x){
 if(h.kind==='mist'){X.save();for(let k=0;k<4;k++){X.globalAlpha=Math.min(1,h.t/12)*.35;X.fillStyle=k%2?'#e8f8ff':'#bfe6ff';X.beginPath();X.arc(x+Math.sin(tick*.2+k)*4+k*Math.sign(h.vx)*4,h.y-50+Math.cos(tick*.25+k*2)*4,h.r*.6+k*2,0,7);X.fill();}X.restore();return true;}
 if(h.kind==='ice'){shadow(x,h.y,12,3);X.save();X.translate(x,h.y-14);X.rotate(h.rot||0);glowObj('p_ice',0,0,1.1,0,'rgba(160,230,255,.95)');X.restore();return true;}
 if(h.kind==='directive'){shadow(x,h.y,8,2.2);X.save();X.translate(x,h.y-(h.z||40));const fl=Math.sin(tick*.5+h.x);X.rotate(fl*.5);X.scale(1,.75+.25*Math.abs(Math.cos(tick*.35)));obj('p_directive',0,0,1.1,0,.5,.5);X.restore();return true;}
 if(h.kind==='cannon'){shadow(x,h.y,10,2.5);X.save();X.translate(x,h.y-h.z);const r=-Math.PI/2*Math.sign(h.vx);trail('p_shell',0,0,h.vx,1.3,r);glowObj('p_shell',0,0,1.3,r,'rgba(255,160,60,.95)');X.restore();return true;}
 if(h.kind==='arty'){const p=1-h.t/80;X.save();X.globalAlpha=.45+.4*((tick>>2)%2);X.strokeStyle='#f22';X.lineWidth=1.5;X.beginPath();X.ellipse(x,h.y,30,9,0,0,7);X.stroke();X.beginPath();X.moveTo(x-8,h.y);X.lineTo(x+8,h.y);X.moveTo(x,h.y-4);X.lineTo(x,h.y+4);X.stroke();X.globalAlpha=.3;X.fillStyle='#f22';X.beginPath();X.ellipse(x,h.y,30*p,9*p,0,0,7);X.fill();X.restore();if(h.t<26)obj('p_shell',x,h.y-h.t*7,1.3,0,.5,1);return true;}
 return false;}
function drawEntNew(f,x,al){
 if(f.type==='para'&&f.alt>0){const cy=f.y-al-118;X.save();X.strokeStyle='rgba(30,30,30,.8)';X.lineWidth=1;for(const dx of[-24,-8,8,24]){X.beginPath();X.moveTo(x+dx,cy+4);X.lineTo(x+(dx>0?6:-6),cy+58);X.stroke();}const g=X.createLinearGradient(0,cy-24,0,cy+6);g.addColorStop(0,'#8a8f7a');g.addColorStop(1,'#4a4f3a');X.fillStyle=g;X.beginPath();X.ellipse(x,cy+4,30,24,0,Math.PI,0);X.closePath();X.fill();X.strokeStyle=OUT;X.lineWidth=1.5;X.stroke();X.fillStyle='rgba(0,0,0,.25)';X.fillRect(x-1,cy-19,2,23);X.fillRect(x-16,cy-12,2,16);X.fillRect(x+14,cy-12,2,16);X.restore();}
 if(f.doc&&f.shieldT>0){const px=x+f.face*20;X.fillStyle='#222';X.fillRect(px-6,f.y-58,2,12);X.fillRect(px+4,f.y-58,2,12);X.fillStyle='#666';X.fillRect(px-7,f.y-61,4,5);X.fillRect(px+3,f.y-61,4,5);panel(px-15,f.y-48,30,46,{r:3,c1:'#3a5fb0',c2:'#0e1e4a',bd:'#ddd',studs:false});text('SANTÉ',px,f.y-38,'#fff',6,'center',OUT);text('+',px,f.y-28,'#f44',10,'center',OUT);}
 if(f.player&&f.frz>0){if(f.frzK==='ice'){X.save();X.globalAlpha=.6;obj('p_ice',x,f.y+4,4,0,.5,1);X.restore();}else if(tick%8===0)fx.push({x:f.x+(Math.random()-.5)*20,y:f.y-90,vx:0,vy:-.3,t:16,c:'#ff0',s:3});}
 if(f.player&&f.marked>0&&!(f.scram>0))text('DÉNONCÉ',x,f.y-f.z-94,(tick>>3)%2?'#f66':'#fcc',6,'center',OUT);
 if(f.onfoot&&f.arm>0)bar(x-20,f.y-122,40,4,f.arm/240,'#f44','#a00');}
function genLegs(f,sx,sy){const k=f.pose==='walk'?Math.sin(f.anim*.3)*5:0;X.fillStyle='#23233a';X.fillRect(sx-15+k,sy-20,12,18);X.fillRect(sx+3-k,sy-20,12,18);X.fillStyle='#b0102a';X.fillRect(sx-15+k,sy-20,2,18);X.fillRect(sx+13-k,sy-20,2,18);X.fillStyle='#111';X.fillRect(sx-17+k,sy-4,15,4);X.fillRect(sx+2-k,sy-4,15,4);}
function drawNuke(){for(const e of enemies)if(e.reset&&e.px!=null&&!e.dead)obj('o_pedestal',e.px-camX,e.py,1);const S=STAGES[stage];if(!S||!S.war||(gameMode==='survie'&&!enemies.some(e=>e.onfoot||e.gen)))return;const bx=nukeX()-camX;if(bx<-60||bx>W+60)return;shadow(bx,FLOOR_TOP+10,22,5);obj(NUKE.broken?'o_nuke_broken':'o_nuke',bx,FLOOR_TOP+10,1.4,0,.5,1);if(!NUKE.broken&&enemies.some(e=>e.onfoot)&&(tick>>3)%2)text('!',bx,FLOOR_TOP-62,'#f44',14,'center',OUT);}
const CREDITS=['FIN','','LA PAIX EST SAUVÉE','LE CANADA EST LIBRE !','','TRUE NORTH DRAGONS','','HÉROS :','LE CAMIONNEUR · LE REPORTER','LA FERMIÈRE','','VILAINS (TOUS FICTIFS) :','LA DOCTEURE EN CHEF','LE PREMIER MINISTRE SELFIE','LE GRAND RÉINITIALISEUR','LE MÉGA-RÉGULATEUR','LE MINISTÈRE','LE GÉNÉRAL APOCALYPSE','','SATIRE POLITIQUE — PERSONNAGES','ET ÉVÉNEMENTS IMAGINAIRES.','TOUTE RESSEMBLANCE SERAIT FORTUITE.','','MERCI D\'AVOIR JOUÉ !'];
function drawCredits(){const y0=H-10-stateT*.35;CREDITS.forEach((l,i)=>{const y=y0+i*13;if(y<6||y>H-34)return;text(l,W/2,y,i===0?'#ffd800':i<4?'#7f7':'#fff',i===0?18:8,'center',OUT);});if(y0+CREDITS.length*13<0)text('FIN',W/2,80,'#ffd800',22,'center',OUT);}
function nukeX(){if(gameMode==='survie')return (camLock!=null?camLock:camX)+W-40;const S=STAGES[stage];return S.waves[S.waves.length-1].at+W-40;}
// ===== GAMEPADS (Gamepad API, up to 2 pads: pad 1 -> 1P, pad 2 -> 2P) =====
const PADS={prev:[{},{}],idx:[],toast:null};
const PADMAP={0:'jump',2:'punch',1:'kick',3:'special',5:'throw',4:'throw',9:'start',8:'pause',12:'up',13:'down',14:'left',15:'right'};
function pollPads(){let gp=[];try{gp=navigator.getGamepads?Array.from(navigator.getGamepads()):[];}catch(e){}const list=gp.filter(g=>g&&g.connected).slice(0,2);
 list.forEach((g,slot)=>{if(!PADS.idx.includes(g.index)){PADS.idx.push(g.index);PADS.toast={s:'MANETTE CONNECTÉE ('+(PADS.idx.indexOf(g.index)+1)+'P)',t:180};SFX.blip();}
  const sl=PADS.idx.indexOf(g.index);if(sl>1)return;const P='p'+(sl+1),st={};g.buttons.forEach((b,i)=>{const a=PADMAP[i];if(a&&(b.pressed||b.value>.5))st[a]=1;});const ax=g.axes[0]||0,ay=g.axes[1]||0;if(ax<-.45)st.left=1;if(ax>.45)st.right=1;if(ay<-.45)st.up=1;if(ay>.45)st.down=1;
  const pv=PADS.prev[sl]||{};for(const a of['jump','punch','kick','special','throw','up','down','left','right','start','pause']){const k=a==='start'||a==='pause'?a:P+a,on=!!st[a];if(on&&!pv[a]){pressed[k]=1;if(a==='start'&&(state==='play'||state==='bonus'))pressed.pause=1;}if(on)keys[k]=1;else if(pv[a])keys[k]=0;}
  PADS.prev[sl]=st;});
 for(const i of PADS.idx.slice())if(!list.some(g=>g.index===i)){const sl=PADS.idx.indexOf(i);PADS.idx.splice(sl,1);PADS.prev.splice(sl,1);PADS.prev.push({});PADS.toast={s:'MANETTE DÉCONNECTÉE',t:150};}}
function padOf(slot){try{const gp=navigator.getGamepads();return gp&&gp[PADS.idx[slot]];}catch(e){return null;}}
function rumble(slot,s,w,ms){if(slot==null)return;const g=padOf(slot);try{if(g&&g.vibrationActuator&&g.vibrationActuator.playEffect)g.vibrationActuator.playEffect('dual-rumble',{duration:ms,strongMagnitude:s,weakMagnitude:w});}catch(e){}}
function drawToast(){const t=PADS.toast;if(!t||t.t<=0)return;t.t--;const a=Math.min(1,t.t/20,(180-t.t)/10);X.save();X.globalAlpha=a;const w=t.s.length*5+30;panel(W/2-w/2,28,w,16,{r:5,c1:'#1f6a2a',c2:'#06200a',bd:'#7f7',a:1,studs:false});text('🎮',W/2-w/2+5,30,'#fff',8);text(t.s,W/2+6,31,'#fff',7,'center',OUT);X.restore();}
// ===== LA FERMIÈRE =====
function fourche(p){const H=p.H;let any=0;hitBreakables(p,0,true);for(const e of enemies){if(e.dead||(e.hurtT>12&&!(e.knock&&e.z>4)))continue;const dx=e.x-p.x;if(Math.abs(dx)<66*(e.sc||1)&&Math.abs(e.y-p.y)<18*(e.sc||1)&&canHitFly(e,true)){any=1;const f0=p.face;p.face=dx>=0?1:-1;damageEnemy(p,e,15*H.dmg*(p.power?2:1),!e.boss);p.face=f0;if(!e.boss){e.vz=4.5;e.vx=(dx>=0?1:-1)*4;}}}
 p.combo=0;p.comboT=0;SFX.whoosh(p.x,1);if(any){floaters.push({x:p.x,y:p.y-108,t:36,s:'FOURCHE TOURNANTE!',c:'#fd4'});shake=Math.max(shake,6);hitstop=Math.max(hitstop,6);}
 for(let i=0;i<14;i++){const a=i/14*6.28;fx.push({x:p.x+Math.cos(a)*40,y:p.y-34+Math.sin(a)*12,vx:Math.cos(a+1.6)*2,vy:-.4,t:16,c:i%2?'#ffe070':'#c8a040',s:3});}}
function doWheat(p){SFX.whoosh(p.x,1);SFX.whoosh(p.x);shake=9;for(const e of enemies)if(!e.dead&&Math.abs(e.x-p.x)<92*(e.sc||1)&&Math.abs(e.y-p.y)<28){const f0=p.face;p.face=e.x>p.x?1:-1;damageEnemy(p,e,16*(p.power?1.6:1),!e.boss);p.face=f0;if(!e.boss){e.vz=6;e.vx=(e.x>p.x?1:-1)*2.5;}}hitBreakables(p,0,true);
 for(let i=0;i<40;i++){const a=Math.random()*6.28,r=20+Math.random()*70;fx.push({x:p.x+Math.cos(a)*r,y:p.y-10-Math.random()*90,vx:Math.cos(a+1.6)*3,vy:-1-Math.random()*2,t:30+Math.random()*20,c:['#ffe070','#e8c050','#fff2a0','#c8a040'][i%4],s:i%3?3:5});}}
function drawDowned(f,x){X.save();X.globalAlpha=.65+.2*Math.sin(tick*.2);drawFighter(Object.assign({},f,{pose:'down',flash:0,weapon:null,z:0,atk:0,wk:null}),x,f.y);X.restore();if((tick>>4)%2)text('AIDE !',x,f.y-40,'#ff8',8,'center',OUT);text('RESTE PRÈS DE MOI',x,f.y-30,'#fff',5,'center',OUT);if(f.rev>0)bar(x-20,f.y-22,40,4,f.rev/120,'#7f7','#2a2');}
// ===== CHARACTER SELECT (1P / 2P, 3 heroes; same hero for 2P = alternate colours) =====
function selUpdate(){playSong('select');const n=twoStart?2:1;if(!SELS)SELS={c:[charSel,(charSel+1)%3],ok:[0,0]};
 for(let i=0;i<n;i++){const P='p'+(i+1);if(SELS.ok[i]){if(pressed[P+'kick']){SELS.ok[i]=0;SFX.blip();}continue;}if(pressed[P+'left']||pressed[P+'right']){SELS.c[i]=(SELS.c[i]+(pressed[P+'left']?2:1))%3;SFX.blip();}
  if(stateT>15&&(pressed[P+'punch']||pressed[P+'jump']||(i===0&&pressed.start))){SELS.ok[i]=1;SFX.confirm();}}
 if(!twoStart&&pressed.p2punch&&!isTouch){twoStart=true;SFX.blip();}
 if(SELS.ok.slice(0,n).every(x=>x)){charSel=SELS.c[0];SEL=SELS.c.slice(0,n).map(k=>HEROES[k]);SELS=null;startGame(twoStart);}}
function drawSelect(){titleBG();text('CHOISIS TON HÉROS',W/2,10,'#ffd800',13,'center',OUT);const S0=SELS||{c:[charSel,1],ok:[0,0]},n=twoStart?2:1;
 [['hero1','LE CAMIONNEUR','Puissant · Blindé'],['hero2','LE REPORTER','Rapide · Micro d\'acier'],['hero3','LA FERMIÈRE','Allonge · Fourche']].forEach(([sp,nm,d],i)=>{const cx=W/2+(i-1)*124,s1=S0.c[0]===i,s2=n>1&&S0.c[1]===i,sel=s1||s2;
  panel(cx-58,30,116,152,{r:6,c1:sel?'rgba(200,30,30,.75)':'rgba(30,30,60,.6)',c2:sel?'rgba(60,0,0,.75)':'rgba(0,0,10,.6)',bd:s1&&s2?'#fff':s1?'#f77':s2?'#7cf':'#556',a:1});
  const pose=sel&&(tick>>4)%2?'punch':'idle';drawFighter({player:1,spr:sp,face:1,pose,anim:tick,flash:0,pal:s2&&s1?1:0},cx-(pose==='punch'?14:0),156);
  text(nm,cx,158,sel?'#ffd800':'#ccc',8,'center',OUT);text(d,cx,168,'#aaa',6,'center');
  if(s1)text(S0.ok[0]?'1P PRÊT!':'1P',cx-50,34,'#f77',7,'left',OUT);if(s2)text(S0.ok[1]?'2P PRÊT!':'2P',cx+50,34,'#7cf',7,'right',OUT);if(s1&&s2)text('COULEURS ALT. 2P',cx,46,'#fff',5,'center',OUT);
  const H=HERO[sp],st=[['FORCE',Math.round(5*H.dmg/1.35)],['VITESSE',Math.round(5*H.spd/1.85)],['PORTÉE',H.special==='flash'?4:H.special==='wheat'?5:3]];
  st.forEach(([k,v],j)=>{const y=184+j*7;text(k,cx-56,y,'#fff',5);for(let q=0;q<5;q++){const on=q<v,c=j===0?['#f99','#c11']:j===1?['#aef','#07a']:['#bfb','#2a2'];bar(cx-13+q*14,y+.5,11,4,on?1:0,c[0],c[1],'#222');}});});
 text(isTouch?'touche un héros puis DÉMARRER':n>1?'1P : A/D + J · 2P : ←→ + , (ou manettes) · K annuler':'←→ choisir · J / ENTRÉE valider · , = ajouter 2P',W/2,207,'#7cf',6,'center');}
// ===== HIGH-SCORE ENTRY (keyboard typing / pad / touch) =====
let typedKey=null;function onKeyTyped(e){if(state==='entry'&&e.key&&e.key.length===1&&/[a-z0-9]/i.test(e.key)&&!KM[e.code])typedKey=e.key.toUpperCase();}
function entryTap(lx,ly){const e=entry;if(!e||e.done)return false;for(let i=0;i<3;i++){const x=W/2-30+i*30;if(Math.abs(lx-x)<13&&ly>86&&ly<142){e.i=i;if(ly<114)e.letters[i]=(e.letters[i]+1)%ABC.length;else e.letters[i]=(e.letters[i]+ABC.length-1)%ABC.length;SFX.blip();return true;}}
 if(Math.abs(lx-W/2)<30&&ly>150&&ly<168){pressed.p1punch=1;e.i=Math.max(e.i,2);return true;}return true;}
function drawEntry(){titleBG();text('NOUVEAU RECORD!',W/2,22,'#ffd800',16,'center',OUT);text(MODEN[entry.mode]+' · '+(entry.pos+1)+(entry.pos?'E':'ER')+' PLACE',W/2,44,'#7cf',7,'center',OUT);text('SCORE '+score,W/2,56,'#fff',10,'center');text('ENTRE TES INITIALES',W/2,74,'#aaa',7,'center');
 for(let i=0;i<3;i++){const x=W/2-30+i*30,sel=i===entry.i;text('▲',x,88,sel?'#ffd800':'#555',7,'center');panel(x-11,98,22,28,{r:4,c1:sel?'#e0302a':'#3a3a4a',c2:sel?'#6a0606':'#111',bd:sel?'#ffd800':'#666',a:1,studs:false});text(ABC[entry.letters[i]],x,102,sel&&(tick>>3)%2?'#fff':'#ffd800',20,'center',OUT);text('▼',x,130,sel?'#ffd800':'#555',7,'center');}
 panel(W/2-28,152,56,15,{r:4,c1:'#2a7a2a',c2:'#0a300a',bd:'#7f7',a:1,studs:false});text('OK',W/2,155,'#fff',9,'center',OUT);
 text(isTouch?'touche ▲▼ pour changer · OK pour valider':'↑↓ lettre (ou tape-la) · J / A valider · K / B retour',W/2,178,'#7cf',6,'center');}
// ===== ARENAS: checkpoint / bunker background during boss fights =====
function drawArena(S){const A=S.arena;if(!A)return;const im=IMG[A.img];if(!ok(im))return;let al=0;S.waves.forEach((w,i)=>{if(!w.boss||(A.last&&i!==S.waves.length-1))return;al=Math.max(al,Math.min(1,(camX-(w.at-140))/110,A.last||i===S.waves.length-1?1:((w.at+250)-camX)/110));});
 if(gameMode==='survie')al=0;if(al<=0)return;X.globalAlpha=Math.min(1,al);X.drawImage(im,0,0,W,H);X.globalAlpha=1;}
// ===== MODE SURVIE =====
let SURV={wave:0,mult:1,t:0,phase:'rest',arena:0,pend:0};function survHP(){return 1+SURV.wave*.06;}
const SURVPOOL=['snitch','taxman','san','bureau','qr','chair','bot','insp','lob','mega','drone','soldier','para','mech'];
const SURVBOSS=['doc','bigbur','pm','mech','boss','reset','boss2','general'];
function startSurvival(){SURV={wave:0,mult:1,t:70,phase:'rest',arena:0,pend:0};survArena(0);}
function survArena(i){const n=[0,1,2,4,5,6,3][i%7];startStage(n);const S=STAGES[n];camX=Math.round(250+((i*577)%Math.max(1,S.len-700)));camLock=camX;waveIdx=S.waves.length;items=[];breakables=[];hazards=[];players.forEach((p,j)=>{p.x=camX+90+j*36;p.y=172+j*16;});}
function survUpdate(){if(camLock==null)camLock=camX;camX=camLock;const S=STAGES[stage];
 if(SURV.phase==='fight'){if(!enemies.length){SURV.phase='rest';SURV.t=170;STATS.wave=SURV.wave;const b=SURV.wave*150*SURV.mult;score+=b;players.forEach(p=>{if(p.alive){p.hp=Math.min(p.maxhp,p.hp+Math.round(p.maxhp*.3));p.score=(p.score||0)+b;}});floaters.push({x:camX+W/2,y:90,t:100,s:'VAGUE '+SURV.wave+' TERMINÉE !  +'+b+'  · SOINS',c:'#7f7'});SFX.oneup();if(SURV.wave%3===0)items.push({x:camX+W/2,y:185,k:SURV.wave%5===0?'syrup':'coffee',taken:0,vz:3,z:0});playSong(S.song);}return;}
 if(SURV.pend){SURV.pend=0;survSpawn();return;}
 if(--SURV.t<=0){SURV.wave++;SURV.mult=1+Math.floor((SURV.wave-1)/5)*.5;if(SURV.wave>1&&SURV.wave%4===1){SURV.arena++;survArena(SURV.arena);SURV.pend=1;return;}survSpawn();}}
function survSpawn(){SURV.phase='fight';const n=SURV.wave,boss=n%5===0,list=[];if(boss)list.push(SURVBOSS[(n/5-1)%SURVBOSS.length]);
 const cnt=Math.max(1,Math.min(7,2+Math.floor(n/2)+(players.length>1?1:0))-(boss?3:0)),pool=SURVPOOL.slice(0,Math.min(SURVPOOL.length,4+n));for(let i=0;i<cnt;i++)list.push(pool[(Math.random()*pool.length)|0]);
 list.forEach((t,i)=>{if(NEWE.includes(t)&&!SEEN.has(t)){SEEN.add(t);newBan={name:EN[t].name,t:170,spr:EN[t].spr};}const side=i%2?-1:1,b=EN[t].boss;const e=newEnemy(t,camX+(b?W+30:side>0?W+20+i*12:-20-i*12),b?178:FLOOR_TOP+12+((i*29)%50));if(t==='para'){e.x=camX+70+((i*97)%(W-140));e.alt=150+i*20;}if(b){e.hp*=.6;e.max=e.hp;}e.pts=Math.round(e.pts*SURV.mult);enemies.push(e);});
 if(boss){SFX.siren();playSong(bossSong(list[0]));bannerT=130;bannerName='MINI-BOSS · '+EN[list[0]].name;}
 floaters.push({x:camX+W/2,y:64,t:80,s:'VAGUE '+n+(SURV.mult>1?'   SCORE ×'+SURV.mult:''),c:'#ffd800'});SFX.go();}
// ===== COMIC CUTSCENES & STORY CARDS =====
const CUTS={
 0:{img:'cut1',pan:1,lines:[['NARRATEUR','Ottawa. Les rues sont vides. Les camions, eux, sont pleins.'],['LE CAMIONNEUR','On me dit de rester chez nous ? Ma maison, c\'est mon camion.'],['LE REPORTER','Et moi, je filme tout. En direct. Sans autorisation préalable.'],['LA FERMIÈRE','Moi j\'ai une fourche. Pis j\'ai pas peur de m\'en servir.']]},
 1:{img:'cut2',pan:-1,lines:[['LE GRAND RÉINITIALISEUR','Ceci n\'est qu\'un report ! Vous ne posséderez rien... même pas ma piste !'],['LA FERMIÈRE','Il se sauve en hélico avec nos taxes carbone dans les poches !'],['LE CAMIONNEUR','Laisse-le voler. On a la route, nous.']]},
 2:{bg:2,title:'LA COLLINE DU PARLEMENT',lines:[['NARRATEUR','Mille fonctionnaires. Zéro réponse. Délai de traitement : 18 à 36 mois.'],['LE REPORTER','Parfait. J\'ai toujours rêvé d\'une conférence de presse sans questions.']]},
 3:{bg:3,title:'LE PONT AMBASSADOR',lines:[['NARRATEUR','La frontière est fermée... sauf pour les formulaires en triple exemplaire.'],['LE CAMIONNEUR','Klaxon prêt. Convoi prêt. Bureaucrates, attachez vos tuques.']]},
 4:{bg:4,title:'LES CHAMPS PÉTROLIFÈRES',lines:[['LA FERMIÈRE','Chez nous en Alberta, le pétrole coule... et les taxes aussi.'],['NARRATEUR','Le Méga-Régulateur veut sa revanche. Et un permis pour respirer.']]},
 5:{img:'cut4',pan:1,lines:[['NARRATEUR','La tour du Ministère. L\'Œil voit tout. Surtout ce que tu penses.'],['L\'ŒIL','CITOYENS : VOTRE OPINION A ÉTÉ VÉRIFIÉE... ET REFUSÉE.'],['LE REPORTER','Une entrevue exclusive avec un œil géant ? J\'embarque.']]},
 6:{img:'cut5',pan:-1,lines:[['LE GÉNÉRAL APOCALYPSE','Un seul bouton et tout recommence à zéro ! HA HA HA !'],['LE CAMIONNEUR','Pas si on klaxonne avant toi, mon général.'],['NARRATEUR','Dernière mission : empêcher la Troisième Guerre mondiale.']]}};
let cut=null;
function goStage(n){const c=CUTS[n];if(c&&gameMode!=='survie'&&!simMode){cut=Object.assign({t:0,i:0,ty:0,hold:0,n},c);cut.next=()=>{cut=null;startStage(n);};state='cut';stateT=0;playSong(n===6?'final':n===5?'s5':'select');}else startStage(n);}
function cutUpdate(){const c=cut;if(!c){state='play';return;}c.t++;const L=c.lines[c.i];const was=Math.floor(c.ty);c.ty=Math.min(L[1].length,c.ty+.6);if(Math.floor(c.ty)!==was&&was%2===0&&L[1][was]!==' ')SFX.type();if(c.ty>=L[1].length)c.hold++;
 const any=pressed.p1punch||pressed.p1kick||pressed.p1jump||pressed.p1special||pressed.p2punch||pressed.p2kick||pressed.p2jump||pressed.p1throw||pressed.p2throw;
 if(pressed.start&&c.t>15){c.next();return;}if(any||c.hold>200){if(c.ty<L[1].length)c.ty=L[1].length;else{c.hold=0;c.ty=0;if(++c.i>=c.lines.length)c.next();}}}
function wrapLines(s,max){const out=[];let cur='';for(const w of s.split(' ')){if((cur+' '+w).trim().length>max){out.push(cur);cur=w;}else cur=(cur+' '+w).trim();}if(cur)out.push(cur);return out;}
function drawCut(){const c=cut;if(!c)return;X.fillStyle='#0b0b14';X.fillRect(0,0,W,H);const img=c.img&&IMG[c.img];
 if(img&&ok(img)){const fx0=12,fy0=8,fw=W-24,fh=H-62,k=Math.min(1,c.t/1100);X.save();rr(fx0,fy0,fw,fh,3);X.clip();const z=1.08+k*.14,iw=fw*z,ih=iw*img.height/img.width,px=(c.pan||1)*(k-.5)*(iw-fw)*.8,py=(k-.5)*(ih-fh)*.5;X.drawImage(img,fx0+(fw-iw)/2-px,fy0+(fh-ih)/2-py,iw,ih);X.restore();
  X.strokeStyle='#fff';X.lineWidth=3;rr(fx0,fy0,fw,fh,3);X.stroke();X.strokeStyle='#000';X.lineWidth=1;rr(fx0-2,fy0-2,fw+4,fh+4,4);X.stroke();
  // halftone corner dots for a comic feel
  X.fillStyle='rgba(255,255,255,.08)';for(let y=fy0;y<fy0+30;y+=4)for(let x=fx0+fw-60;x<fx0+fw;x+=4)if((x+y)%8===0)X.fillRect(x,y,1.5,1.5);}
 else{const S=STAGES[c.bg],bi=S&&IMG[S.panels[0]];if(ok(bi)){X.save();X.filter='blur(4px) brightness(.62) saturate(.85)';X.drawImage(bi,-12,-12,W+24,H+24);X.restore();}const ty=Math.min(52,-20+c.t*2);text(c.title||'',W/2,ty,'#ffd800',15,'center',OUT);text('NIVEAU '+(c.n+1),W/2,ty-12,'#fff',8,'center',OUT);}
 const L=c.lines[c.i],s=L[1].slice(0,Math.floor(c.ty)),lines=wrapLines(s,62),by=img?H-50:100,bh=img?44:52,bx=img?14:24,bw=img?W-28:W-48;
 X.save();X.translate(2,2);X.fillStyle='rgba(0,0,0,.5)';rr(bx,by,bw,bh,7);X.fill();X.restore();X.fillStyle='#fffbe8';rr(bx,by,bw,bh,7);X.fill();X.strokeStyle='#111';X.lineWidth=2;rr(bx,by,bw,bh,7);X.stroke();
 if(img){const tx=c.i%2?W-90:56;X.fillStyle='#fffbe8';X.beginPath();X.moveTo(tx-8,by+1);X.lineTo(tx+4,by-11);X.lineTo(tx+8,by+1);X.closePath();X.fill();X.beginPath();X.moveTo(tx-8,by);X.lineTo(tx+4,by-11);X.lineTo(tx+8,by);X.stroke();}
 text(L[0],bx+10,by+5,L[0]==='NARRATEUR'?'#225':'#c01010',7);lines.forEach((l,i)=>text(l,bx+10,by+16+i*9,'#111',8));
 if(c.ty>=L[1].length&&(tick>>4)%2)text('▶',bx+bw-10,by+bh-10,'#c01010',7,'center');text('J/A : suite · ENTRÉE/START : passer',W-6,H-8,'#999',5,'right');}
