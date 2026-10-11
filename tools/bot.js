const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(process.env.URL||'file:///workspace/true-north-dragons/index.html');await p.waitForTimeout(1500);
await p.evaluate(([h,st,lim])=>{window.__hero=h;window.__st=st;window.__lim=lim;},[process.argv[5]||'0',process.env.ST||'',process.env.LIM||'']);const diff=+(process.argv[2]||0),runs=+(process.argv[3]||3);if(process.argv[4])await p.evaluate(o=>window.__ov=JSON.parse(o),process.argv[4]);
for(let r=0;r<runs;r++){
const res=await p.evaluate(([diff])=>{const G=__game,FLOOR_TOP=150,K=G.keys,P=G.pressed;G.setDiff(diff);G.char(+(window.__hero||0));if(window.__ov)Object.assign(G.DIFFS[diff],window.__ov);G.startGame(false);if(window.__st)G.stage(+window.__st);
 let sd={},dl={},f=0,deaths=0,lastLives=G.players[0].lives,lastHp=100,stageLog=[],conts=0,lastStage=-1,stageStart=0;
 const ai=()=>{f++;for(const k in K)K[k]=0;const st=G.state;
  if(st==='card'||st==='clear'||st==='cont'){if(f%20===0)P.start=1;if(st==='cont'&&f%20===0)conts++;return;}
  if(st==='bonus'){const me=G.players[0],m=G.bonusM;if(!m||m.hp<=0)return;const tx=m.x-56;if(Math.abs(me.y-m.y)>4){if(me.y<m.y)K.p1down=1;else K.p1up=1;}if(Math.abs(me.x-tx)>4){if(me.x<tx)K.p1right=1;else K.p1left=1;}else if(f%9===0)P[f%27===0?'p1kick':'p1punch']=1;return;}
  if(st!=='play')return;
  if(G.curStage!==lastStage){if(lastStage>=0)stageLog.push({stage:lastStage+1,secs:Math.round((f-stageStart)/60)});lastStage=G.curStage;stageStart=f;}
  const me=G.players[0];if(me&&me.hp<=0&&lastHp>0){deaths++;sd[G.curStage+1]=(sd[G.curStage+1]||0)+1;}if(me&&me.hp>0&&lastHp<=0)lastHp=me.hp;if(me&&me.hp<=0)lastHp=0;if(!me||!me.alive)return;if(me.hp<lastHp-0.5){const d=lastHp-me.hp;let src='?';const hz=G.hazards.find(h=>Math.abs(h.x-me.x)<20);if(hz)src=hz.kind;else{const e=G.enemies.filter(e=>!e.dead).sort((a,b)=>Math.abs(a.x-me.x)-Math.abs(b.x-me.x))[0];if(e)src=e.type+':'+(e.dash?'dash':e.holding?'grab':e.atkKind);}dl[src]=(dl[src]||0)+Math.round(d);}lastHp=me.hp;
  
  if(me.held>0){K.p1left=1;if(f%3===0)P.p1punch=1;return;}
  const en=G.enemies.filter(e=>!e.dead);
  // dodge projectiles / shockwaves
  for(const h of G.hazards){if(h.delay>0)continue;const dx=h.x-me.x;if(Math.sign(dx)===-Math.sign(h.vx)&&Math.abs(dx)<110&&Math.abs(h.y-me.y)<14){if(me.y>175)K.p1up=1;else K.p1down=1;return;}}
  {const dz=!en.some(o=>o.type!=='drone'&&Math.abs(o.x-me.x)<50&&Math.abs(o.y-me.y)<16)&&en.find(e=>e.las>8&&Math.abs(e.ly-me.y)<12&&(me.x-e.x)*e.face>0);if(dz){if(me.y>dz.ly||me.y<FLOOR_TOP+20)K.p1down=1;else K.p1up=1;return;}}
  {const ch=en.find(e=>(e.chT>0||e.charging)&&Math.abs(e.y-me.y)<14&&Math.abs(e.x-me.x)<160);if(ch){if(me.y>ch.y||me.y<FLOOR_TOP+20)K.p1down=1;else K.p1up=1;return;}}
  if(!en.length){K.p1right=1;return;}
  const t=en.reduce((a,b)=>Math.hypot(a.x-me.x,(a.y-me.y)*2)<Math.hypot(b.x-me.x,(b.y-me.y)*2)?a:b);
  // avoid heavy telegraphed attacks
  const danger=en.find(e=>e.atk>6&&e.tele&&Math.abs(e.x-me.x)<70&&Math.abs(e.y-me.y)<30);
  if(danger&&!danger.boss){if(me.y<danger.y)K.p1up=1;else K.p1down=1;}
  const near=en.filter(e=>Math.abs(e.x-me.x)<55&&Math.abs(e.y-me.y)<16);
  if(near.length>=2&&me.hp>35&&f%40===0){P.p1special=1;return;}
  const side=me.x<t.x?-1:1,gx=t.x+side*34*(t.sc||1)*(t.spr==='boss'||t.spr==='final'?1.3:1),dx=gx-me.x,dy=t.y-me.y;
  if(t.type==='drone'&&t.alt>22&&Math.abs(t.x-me.x)<44&&Math.abs(dy)<8){if(me.z===0&&f%4===0){P.p1jump=1;}else if(me.z>6&&me.vz<1.5)P.p1kick=1;if((me.face>0)!==(t.x>me.x)){if(t.x>me.x)K.p1right=1;else K.p1left=1;}return;}
  if(Math.abs(dy)>5){if(dy>0)K.p1down=1;else K.p1up=1;}
  if(Math.abs(dx)>6){if(dx>0)K.p1right=1;else K.p1left=1;}
  else if(Math.abs(dy)<=8){if((me.face>0)!==(t.x>me.x)){if(t.x>me.x)K.p1right=1;else K.p1left=1;}else if(f%9===0)P[f%27===0?'p1kick':'p1punch']=1;}
 };
 const out=[];const LIM=+(window.__lim||200);for(let c=0;c<LIM;c++){const s=G.sim(1800,ai);if(s==='victory'||s==='over'||s==='tbc'||s==='entry'||s==='table')break;}
 stageLog.push({stage:lastStage+1,secs:Math.round((f-stageStart)/60)});
 return {bonus:G.STATS.bonusKO||0,end:G.state,stageReached:G.curStage+1,deaths,conts:Math.round(conts/1),minutes:Math.round(f/3600*10)/10,score:Math.round(G.score),deathsPerStage:sd,stageSecs:stageLog.map(s=>s.secs),dmg:dl,me0:(()=>{const m=G.players[0];return [Math.round(m.x-G.camX),Math.round(m.y),Math.round(m.z),m.alive,m.hp,m.pose,m.atkType,m.lives,G.state,m.weapon&&m.weapon.k,m.scram|0,G.camX|0]})(),left:G.enemies.map(e=>[e.think|0,e.side,e.stun|0,e.hurtT|0,e.type,Math.round(e.x-G.camX),Math.round(e.y),Math.round(e.alt||0),Math.round(e.hp),e.las|0,e.lowT|0,e.charging|0,e.carry||'',e.stealT?1:0,Math.round(e.cd)].join(':'))};},[diff]);
console.log(JSON.stringify(res));}
console.log('errors',errs);await b.close();})();
