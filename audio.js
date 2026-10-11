'use strict';
// ===== TRUE NORTH DRAGONS audio engine: synthesized 16-bit arcade SFX, music, ambience (Web Audio) =====
let RENDER=0,DEMO=0,AC=null,muted=false,BUS=null,SCHED=0,curSong=null,musicStep=0,nextNote=0,ambNodes=null,voices=0;
const VOL={music:+(localStorage.tndMus??.7),sfx:+(localStorage.tndSfx??.9)};
const MAXV=28;let NB=null,DIST=null,DIST2=null;
function mkGraph(ctx){
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.003;comp.release.value=.2;
 const lim=ctx.createDynamicsCompressor();lim.threshold.value=-3;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.08;
 const master=ctx.createGain();master.gain.value=muted?0:.9;comp.connect(lim);lim.connect(master);master.connect(ctx.destination);
 const music=ctx.createGain(),duckG=ctx.createGain(),sfx=ctx.createGain(),amb=ctx.createGain();music.gain.value=VOL.music*.55;sfx.gain.value=VOL.sfx;amb.gain.value=VOL.sfx*.35;
 music.connect(duckG);duckG.connect(comp);sfx.connect(comp);amb.connect(comp);
 // short room reverb
 const rv=ctx.createConvolver(),len=ctx.sampleRate*.5|0,ib=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
 rv.buffer=ib;const rvG=ctx.createGain();rvG.gain.value=.22;rv.connect(rvG);rvG.connect(sfx);
 // shared noise buffer + distortion curves
 const n=ctx.sampleRate*2|0;NB=ctx.createBuffer(1,n,ctx.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const curve=k=>{const c=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;c[i]=(1+k)*x/(1+k*Math.abs(x));}return c;};DIST=curve(8);DIST2=curve(40);
 return{ctx,master,music,duck:duckG,sfx,amb,rv,comp};}
function audio(){
 if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();BUS=mkGraph(AC);}catch(e){return;}}
 if(AC.state==='suspended')AC.resume();
 // iOS unlock: play a silent buffer inside the gesture
 if(!audio.unlocked){try{const s=AC.createBufferSource();s.buffer=AC.createBuffer(1,1,22050);s.connect(AC.destination);s.start(0);audio.unlocked=true;}catch(e){}}
}
['touchstart','touchend','pointerdown','keydown','mousedown'].forEach(ev=>addEventListener(ev,audio,{passive:true}));
function now(){return BUS.ctx.currentTime+SCHED;}
const J=(v,a=.08)=>v*(1+(Math.random()*2-1)*a);
let PANX=null;function panOf(x){if(x==null)return 0;const sx=x-(typeof camX!=='undefined'?camX:0);return Math.max(-.8,Math.min(.8,(sx/384)*1.6-.8));}
function out(node,pan,rev){const B=BUS,c=B.ctx;let n=node;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;n.connect(p);n=p;}n.connect(B.sfx);if(rev){const g=c.createGain();g.gain.value=rev;n.connect(g);g.connect(B.rv);}}
function voice(d){if(typeof OfflineAudioContext!=='undefined'&&BUS.ctx instanceof OfflineAudioContext)return true;if(voices>=MAXV)return false;voices++;setTimeout(()=>voices--,Math.max(30,(d+SCHED)*1000));return true;}
// oscillator layer: f0->f1 pitch sweep, ADSR-ish env, optional filter & distortion
function O(type,f0,f1,d,v,o={}){if(!BUS||(!o.force&&!voice(d)))return;const c=BUS.ctx,t=now()+(o.t||0),os=c.createOscillator(),g=c.createGain();os.type=type;os.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)os.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d*(o.sw||1));
 if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=f0*.03;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.05);}
 const at=o.a||.003;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.exponentialRampToValueAtTime(.0008,t+d);let n=os;
 if(o.dist){const w=c.createWaveShaper();w.curve=o.dist>1?DIST2:DIST;n.connect(w);n=w;}
 if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,t);if(o.lp1)f.frequency.exponentialRampToValueAtTime(o.lp1,t+d);n.connect(f);n=f;}
 n.connect(g);out(g,o.pan,o.rev);os.start(t);os.stop(t+d+.03);}
// filtered noise layer: band/low/highpass with frequency sweep
function Nz(d,v,ft,f0,f1,o={}){if(!BUS||(!o.force&&!voice(d)))return;const c=BUS.ctx,t=now()+(o.t||0),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=NB;s.loop=true;f.type=ft;f.Q.value=o.q||1;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+d);
 const at=o.a||.002;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);if(o.hold)g.gain.setValueAtTime(v,t+o.hold);g.gain.exponentialRampToValueAtTime(.0008,t+d);let n=s;if(o.dist){const w=c.createWaveShaper();w.curve=DIST;n.connect(w);n=w;}
 n.connect(f);f.connect(g);out(g,o.pan,o.rev);s.start(t,Math.random()*1.5);s.stop(t+d+.03);}
function duck(amt=.45,d=.25){if(!BUS)return;const g=BUS.duck.gain,t=BUS.ctx.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(amt,t);g.linearRampToValueAtTime(1,t+d);}
const pick=a=>a[Math.random()*a.length|0];
function notes(list,type='square',v=.18,o={}){list.forEach(([f,t,d])=>O(type,f,f,d||.12,v,Object.assign({t,force:1},o)));}
const SFX={
 // --- player attacks ---
 whoosh(x,big){const p=panOf(x);Nz(big?.2:.13,big?.7:.55,'bandpass',J(big?900:1400),J(big?300:500),{q:1.5,pan:p,a:.02});},
 punch(x){this.whoosh(x);},
 kickW(x){this.whoosh(x,1);},
 impact(x,heavy){const p=panOf(x);Nz(.06,.7,'lowpass',J(3000),400,{pan:p,dist:1});O('square',J(heavy?140:220),heavy?45:70,heavy?.16:.09,heavy?.55:.4,{pan:p,dist:1,lp:1800});if(heavy){O('sine',J(90),35,.25,.7,{pan:p});duck(.6,.2);}},
 crunch(x){const p=panOf(x);Nz(.18,.8,'lowpass',5000,300,{pan:p,dist:1,rev:.3});O('sawtooth',J(160),40,.25,.5,{pan:p,dist:2,lp:2500});O('sine',70,30,.35,.8,{pan:p});duck(.45,.35);},
 jump(x){O('square',J(240),620,.12,.12,{pan:panOf(x),lp:2400});},
 land(x){Nz(.08,.25,'lowpass',600,120,{pan:panOf(x)});},
 jkick(x){this.whoosh(x,1);O('square',J(500),900,.08,.08,{pan:panOf(x)});},
 // --- enemies ---
 buzz(x){const p=panOf(x);O('sawtooth',J(150),160,.35,.05,{pan:p,vib:38,lp:900});O('square',J(300),310,.3,.025,{pan:p,vib:45,lp:1400});},
 laserCharge(x){const p=panOf(x);O('sine',300,1800,.6,.08,{pan:p,vib:20});O('square',600,2400,.6,.03,{pan:p,lp:3000});},
 laser(x){const p=panOf(x);O('sawtooth',J(2200),180,.28,.22,{pan:p,dist:1,lp:5000});O('square',J(1100),90,.25,.15,{pan:p});Nz(.2,.25,'highpass',3000,1500,{pan:p});},
 coins(x){const p=panOf(x);[0,.05,.1,.16].forEach((t,i)=>O('square',J(1800+i*240,.03),2600+i*200,.08,.09,{pan:p,t}));},
 spinUp(x){const p=panOf(x);O('triangle',200,900,.6,.12,{pan:p,vib:14});Nz(.6,.15,'bandpass',600,2400,{q:4,pan:p});},
 vroom(x){const p=panOf(x);O('sawtooth',J(90),220,.5,.3,{pan:p,dist:1,lp:1400,vib:9});Nz(.5,.3,'lowpass',1500,400,{pan:p});},
 mega(x){const p=panOf(x);O('square',J(420),380,.55,.22,{pan:p,dist:2,lp:2600,vib:7});O('sawtooth',J(210),190,.55,.18,{pan:p,dist:1,lp:1800,vib:6});Nz(.5,.18,'bandpass',1800,1200,{q:2,pan:p});duck(.6,.4);},
 grunt(type,x){const p=panOf(x);
  if(type==='bot'||type==='final'){O('square',J(1800),900,.05,.25,{pan:p,dist:1});Nz(.12,.3,'bandpass',J(3500),1500,{q:8,pan:p});O('sawtooth',J(110),70,.15,.2,{pan:p,lp:900});return;}
  if(type==='drone'){O('square',J(2400),1200,.06,.2,{pan:p,dist:1});Nz(.1,.25,'bandpass',J(4000),2000,{q:6,pan:p});return;}
  if(type==='mega'){O('square',J(330),250,.16,.25,{pan:p,dist:2,lp:2200});return;}
  if(type==='lob'){O('sawtooth',J(340),520,.12,.22,{pan:p,lp:2000,dist:1});this.coins(x);return;}
  const base={taxman:260,bureau:190,insp:230,boss:140,boss2:130,bigbur:160,giantinsp:150,chair:150}[type]||220,f=J(base,.12);
  // vocal-ish "ugh": saw through sweeping bandpass (formant) + breath
  O('sawtooth',f,f*.7,.17,.28,{pan:p,lp:J(1400),lp1:500,dist:1});Nz(.12,.12,'bandpass',J(900),500,{q:3,pan:p});},
 fall(x){const p=panOf(x);Nz(.25,.6,'lowpass',900,90,{pan:p});O('sine',J(80),40,.25,.6,{pan:p});Nz(.15,.3,'lowpass',500,100,{pan:p,t:.12});},
 poof(x){const p=panOf(x);Nz(.45,.5,'bandpass',J(2500),300,{q:.7,pan:p,a:.01,rev:.4});O('sine',J(400),100,.2,.15,{pan:p});},
 // --- player damage ---
 hurt(x){const p=panOf(x);this.impact(x);O('sawtooth',J(330),200,.22,.3,{pan:p,lp:1600,lp1:600,dist:1,t:.02});},
 pdown(x){this.hurt(x);this.fall(x);duck(.4,.4);},
 death(x){const p=panOf(x);O('sawtooth',300,60,.9,.35,{pan:p,lp:1800,lp1:200,force:1});O('square',150,40,.9,.2,{pan:p,force:1,t:.05});Nz(.6,.3,'lowpass',2000,100,{force:1});duck(.3,1);},
 grab(x){const p=panOf(x);Nz(.08,.4,'lowpass',1500,400,{pan:p});O('square',J(180),140,.08,.25,{pan:p,lp:1200});},
 throwW(x){const p=panOf(x);Nz(.32,.4,'bandpass',600,2200,{q:1.2,pan:p,a:.08});O('sawtooth',J(200),90,.2,.2,{pan:p,lp:1200,t:.05});},
 bounce(x){const p=panOf(x);this.impact(x,1);O('square',J(600),300,.1,.2,{pan:p});},
 block(x){const p=panOf(x);O('triangle',J(2400,.04),2400,.18,.3,{pan:p,rev:.4});O('square',J(3600,.04),3600,.06,.12,{pan:p});},
 warn(x){const p=panOf(x);O('square',1568,1568,.07,.18,{pan:p});O('square',2093,2093,.1,.18,{pan:p,t:.08});},
 paper(x){const p=panOf(x);for(let i=0;i<4;i++)Nz(.05,.18,'bandpass',J(4000,.3),2500,{q:4,pan:p,t:i*.045});},
 brief(x){const p=panOf(x);Nz(.25,.3,'bandpass',500,1500,{q:1,pan:p,a:.05});},
 briefHit(x){const p=panOf(x);this.impact(x,1);O('square',J(320),300,.12,.25,{pan:p,lp:900});Nz(.1,.4,'bandpass',1200,800,{q:6,pan:p});},
 stamp(x){const p=panOf(x);O('square',J(900),400,.05,.25,{pan:p});Nz(.05,.5,'highpass',2500,0,{pan:p});O('sine',J(110),40,.3,.9,{pan:p,t:.07});Nz(.25,.7,'lowpass',1200,80,{pan:p,t:.07,dist:1,rev:.3});duck(.55,.3);},
 shutter(){Nz(.04,.5,'highpass',3000,0,{force:1});O('square',2400,1800,.02,.12,{force:1});setTimeout(()=>{try{Nz(.05,.35,'bandpass',2000,0,{force:1});O('sine',3000,3000,.25,.06,{force:1,rev:.4})}catch(e){}},70);},
 dash(x){const p=panOf(x);O('sawtooth',J(300),1400,.25,.2,{pan:p,lp:3000});Nz(.3,.25,'bandpass',800,3000,{q:2,pan:p,a:.05});},
 swing(x){const p=panOf(x);Nz(.32,.4,'bandpass',300,1600,{q:1.5,pan:p,a:.12});O('triangle',J(180),120,.25,.15,{pan:p});},
 shock(x){const p=panOf(x);O('sine',90,28,1.2,.9,{pan:p,force:1});O('sawtooth',55,30,1,.35,{pan:p,lp:400,dist:1,force:1});Nz(1.4,.6,'lowpass',800,60,{pan:p,a:.02,hold:.3,force:1,rev:.4});duck(.35,1);},
 siren(){for(let i=0;i<3;i++){O('sawtooth',500,900,.35,.18,{t:i*.7,force:1,lp:2500,sw:1});O('sawtooth',900,500,.35,.18,{t:i*.7+.35,force:1,lp:2500});}},
 shield(x){const p=panOf(x);O('sine',220,220,.8,.25,{pan:p,vib:12,a:.08,force:1});O('triangle',440,445,.8,.12,{pan:p,vib:7,a:.1,force:1});},
 ko(){O('sine',70,25,2.2,1,{force:1});Nz(2.2,.7,'lowpass',1800,40,{force:1,rev:.6,hold:.2});O('sawtooth',110,30,1.6,.3,{lp:500,dist:1,force:1});notes([[262,.6,.3],[330,.75,.3],[392,.9,.6]],'square',.12);duck(.2,2);},
 spinStart(x){const p=panOf(x);for(let i=0;i<4;i++)Nz(.14,.35,'bandpass',J(700),2200,{q:2,pan:p,t:i*.12,a:.04});O('sawtooth',300,1200,.5,.12,{pan:p,lp:2500});},
 spinHit(x){this.crunch(x);},
 // --- pickups / breakables ---
 coffee(x){const p=panOf(x);Nz(.25,.3,'bandpass',600,1800,{q:3,pan:p});notes([[1047,.22,.1],[1568,.3,.25]],'triangle',.25,{pan:p});},
 syrup(){notes([[523,0],[659,.07],[784,.14],[1047,.21],[1319,.28],[1568,.35,.3]],'square',.13);notes([[262,0,.45]],'triangle',.25);},
 oneup(){notes([[784,0],[988,.1],[1175,.2],[1568,.3],[1319,.42],[1568,.54,.4]],'square',.15);notes([[392,0,.3],[523,.3,.5]],'triangle',.25);},
 coin(x){const p=panOf(x);O('square',988,988,.07,.17,{pan:p,force:1});O('square',1319,1319,.35,.17,{pan:p,t:.07,force:1});Nz(.05,.15,'highpass',6000,0,{pan:p,t:.07});},
 smash(k,x){const p=panOf(x);this.impact(x,1);if(k==='crate'){for(let i=0;i<5;i++)Nz(.06,.35,'bandpass',J(1200,.4),600,{q:3,pan:p,t:i*.03});}
  else if(k==='barrel'){O('triangle',J(180),160,.5,.35,{pan:p,rev:.3});O('triangle',J(410),400,.4,.15,{pan:p});}
  else{O('square',J(700),650,.3,.15,{pan:p,lp:3000,rev:.3});O('square',J(1050),1000,.25,.1,{pan:p});Nz(.3,.3,'highpass',3000,0,{pan:p});}},
 // --- UI ---
 blip(){O('square',880,880,.05,.14,{force:1});},
 confirm(){notes([[523,0,.08],[784,.06,.08],[1047,.12,.2]],'square',.17);},
 pause(){notes([[1047,0,.06],[784,.07,.06],[1047,.14,.12]],'square',.14);},
 stinger(){O('sawtooth',110,110,.7,.3,{lp:1200,force:1});notes([[440,0,.12],[440,.14,.12],[659,.28,.5]],'square',.16);Nz(.6,.4,'lowpass',3000,200,{force:1,rev:.4});O('sine',80,40,.4,.6,{force:1});},
 go(){O('square',1319,1319,.08,.15,{force:1});O('square',1760,1760,.1,.15,{t:.1,force:1});},
 tick(n){O('square',800+Math.min(n,30)*40,800+Math.min(n,30)*40,.04,.1);},
 tally(){O('square',J(1500,.02),1500,.03,.08);},
 clear(){notes([[523,0],[523,.12],[523,.24],[659,.36,.2],[784,.6],[698,.72],[784,.84,.5]],'square',.16);notes([[262,0,.36],[349,.36,.24],[392,.6,.7]],'triangle',.28);},
 rank(r){if(r==='S'){notes([[784,0],[988,.08],[1175,.16],[1568,.24],[1976,.32],[2349,.4,.5]],'square',.14);O('sine',60,30,.6,.6,{force:1});Nz(.8,.3,'highpass',5000,0,{force:1,rev:.6});}else{O('sine',70,35,.4,.6,{force:1});notes([[r==='C'?392:659,0,.25]],'square',.16);}},
 count(n){O('square',n===0?440:880,n===0?440:880,.12,.18,{force:1});},
 gameover(){notes([[392,0,.3],[370,.3,.3],[349,.6,.3],[330,.9,1]],'square',.16);notes([[98,0,1.9]],'triangle',.3);},
 entry(){notes([[659,0],[784,.1],[1047,.2],[1319,.3,.4]],'square',.15);},
 type(){O('square',J(1200,.1),1200,.02,.07);Nz(.015,.08,'highpass',4000,0);},
 honk(x){const p=panOf(x)*.5,f=pick([185,207,233]);O('sawtooth',f,f,.55,.12,{pan:p,lp:1500,a:.02,force:1,rev:.5});O('sawtooth',f*1.26,f*1.26,.55,.08,{pan:p,lp:1500,a:.02,force:1,rev:.5});},
 // back-compat names used by older code paths
 start(){this.confirm();},kick(x){this.kickW(x);},hit(x){this.impact(x);},heavy(x){this.impact(x,1);},whiff(x){this.whoosh(x);},pick(){this.coffee();},boss(){this.siren();},wave(x){this.shock(x);}};
// wrap: every SFX call no-ops safely when audio is locked/muted
for(const k in SFX){const f=SFX[k];SFX[k]=function(...a){if(!BUS||muted||VOL.sfx<=0||(RENDER&&!DEMO))return;try{return f.apply(SFX,a);}catch(e){}};}

// music lives in music.js
// ---------- AMBIENCE ----------
function setAmbience(st){if(!BUS)return;if(ambNodes){ambNodes.forEach(n=>{try{n.stop();}catch(e){}});ambNodes=null;}if(st==null||st<0)return;
 const c=BUS.ctx,t=c.currentTime,nodes=[];const src=()=>{const s=c.createBufferSource();s.buffer=NB;s.loop=true;nodes.push(s);return s;};
 const lfo=(target,rate,depth,base)=>{const l=c.createOscillator(),g=c.createGain();l.frequency.value=rate;g.gain.value=depth;l.connect(g);g.connect(target);target.value=base;l.start(t);nodes.push(l);};
 const chain=(s,type,f,q,v)=>{const fl=c.createBiquadFilter(),g=c.createGain();fl.type=type;fl.Q.value=q;g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(BUS.amb);s.start(t);return{fl,g};};
 if(st===0||st===3){const w=chain(src(),'bandpass',500,.8,.5);lfo(w.fl.frequency,.13,300,500);lfo(w.g.gain,.07,.25,.4);}
 if(st===1||st===2){const cr=chain(src(),'bandpass',900,.5,.18);lfo(cr.g.gain,.3,.08,.16);const lo=chain(src(),'lowpass',200,.7,.25);}
 if(st===3){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=48;f.type='lowpass';f.frequency.value=180;g.gain.value=.12;o.connect(f);f.connect(g);g.connect(BUS.amb);o.start(t);nodes.push(o);lfo(g.gain,.5,.08,.12);}
 if(st===4){const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=60;g.gain.value=.025;o.connect(g);g.connect(BUS.amb);o.start(t);nodes.push(o);const o2=c.createOscillator(),g2=c.createGain();o2.type='sine';o2.frequency.value=7200;g2.gain.value=.01;o2.connect(g2);g2.connect(BUS.amb);o2.start(t);nodes.push(o2);const hm=chain(src(),'bandpass',3000,6,.06);lfo(hm.g.gain,2.3,.04,.05);}
 ambNodes=nodes;}
function setVol(k,v){VOL[k]=Math.max(0,Math.min(1,Math.round(v*10)/10));localStorage[k==='music'?'tndMus':'tndSfx']=VOL[k];}

// ---------- OFFLINE DEMO RENDER (for testing) ----------
async function renderDemo(only){const sr=44100,dur=34,oc=new OfflineAudioContext(2,sr*dur,sr);const keep=[BUS,AC,voices];RENDER=1;BUS=mkGraph(oc);voices=0;
 const seq=[['punch',[100]],['impact',[100]],['kickW',[200]],['impact',[200,1]],['crunch',[300]],['jump',[150]],['land',[150]],['jkick',[200]],['grunt',['taxman',100]],['grunt',['bureau',200]],['grunt',['bot',300]],['grunt',['insp',150]],['fall',[200]],['poof',[200]],
  ['hurt',[150]],['pdown',[150]],['death',[150]],['grab',[200]],['throwW',[200]],['bounce',[20]],['block',[250]],['warn',[300]],['paper',[300]],['brief',[300]],['briefHit',[150]],['stamp',[200]],['dash',[300]],['swing',[250]],['shock',[300]],['siren',[]],['shield',[300]],['ko',[]],
  ['spinStart',[200]],['spinHit',[200]],['coffee',[200]],['syrup',[]],['oneup',[]],['coin',[200]],['smash',['crate',200]],['smash',['barrel',200]],['smash',['can',200]],['blip',[]],['confirm',[]],['pause',[]],['stinger',[]],['go',[]],['tick',[5]],['clear',[]],['rank',['S']],['count',[3]],['gameover',[]],['entry',[]],['type',[]],['honk',[200]]];
 if(only)seq.splice(0,seq.length,...seq.filter(x=>only.includes(x[0])));const gap={siren:2.2,ko:2.4,shock:1.4,death:1,clear:1.6,gameover:2,stinger:.9,syrup:.7,oneup:.9,rank:1};let t=.1;
 DEMO=1;for(const[n,a]of seq){SCHED=t;SFX[n](...a);t+=gap[n]||.42;}DEMO=0;
 
 SCHED=0;const buf=await oc.startRendering();[BUS,AC,voices]=keep;RENDER=0;
 const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length,ab=new ArrayBuffer(44+n*4),dv=new DataView(ab);const ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
 ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
 for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}
 let b='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)b+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(b);}
