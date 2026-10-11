const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const S='/workspace/true-north-dragons/shots/';
const p=await b.newPage({viewport:{width:1152,height:700}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file:///workspace/true-north-dragons/index.html');await p.waitForTimeout(2500);
const shot=n=>p.locator('canvas').screenshot({path:S+n+'.png'});const ev=(f,a)=>p.evaluate(f,a);
const prep=(h,st)=>ev(([h,st])=>{const G=__game;G.char(h);G.setDiff(1);G.startGame(false);G.stage(st);G.sim(20,()=>{});G.enemies.length=0;G.hazards.length=0;const me=G.players[0];me.x=G.camX+110;me.y=180;me.inv=0;me.face=1;window.spawn=(t,dx,dy)=>{const e=G.newEnemy(t,me.x+dx,me.y+(dy||0));G.enemies.push(e);return e;};},[h,st]);
for(const h of [0,1]){
 await prep(h,1);await ev(()=>{const G=__game,me=G.players[0];me.weapon={k:'stick',uses:8};spawn('taxman',90,0).cd=999;G.sim(0);});await p.waitForTimeout(80);await shot(`60-hero${h+1}-baton-repos`);
 await ev(()=>{const G=__game,me=G.players[0];G.pressed.p1punch=1;G.sim(9,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot(`61-hero${h+1}-baton-frappe`);
}
// shovel smash
await prep(0,2);await ev(()=>{const G=__game,me=G.players[0];me.weapon={k:'shovel',uses:5};spawn('bureau',52,-10).cd=999;G.sim(0);});await p.waitForTimeout(80);await shot('62-pelle-sur-epaule');
await ev(()=>{const G=__game;G.pressed.p1punch=1;G.sim(10,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('63-pelle-smash-neige');
// ground pound
await prep(1,2);await ev(()=>{const G=__game,me=G.players[0];me.weapon={k:'shovel',uses:5};G.pressed.p1jump=1;G.sim(8,()=>{});const t=spawn('taxman',36,-8);t.cd=999;G.pressed.p1punch=1;G.sim(1,()=>{});let n=0;while(me.z>0&&n++<60)G.sim(1,()=>{});G.sim(0);window.__pd=[me.atkType,me.atk,me.pose,me.z,G.state].join();});console.log(await ev(()=>window.__pd));await p.waitForTimeout(80);await shot('64-pelle-frappe-au-sol');
// thrown weapon
await prep(0,1);await ev(()=>{const G=__game,me=G.players[0];me.weapon={k:'stick',uses:8};spawn('bureau',200,0).cd=999;G.pressed.p1punch=1;G.keys.p1kick=1;G.sim(1,()=>{G.keys.p1kick=1});G.keys.p1kick=0;G.sim(9,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('65-arme-lancee');
// drone telegraph + fire
await prep(0,3);await ev(()=>{const G=__game,me=G.players[0];const d=spawn('drone',140,0);d.las=40;d.ly=d.y;d.face=-1;d.alt=34;G.sim(0);});await p.waitForTimeout(80);await shot('66-drone-visee');
await ev(()=>{const G=__game;const d=G.enemies[0];d.las=8;G.players[0].inv=999;G.sim(0);});await p.waitForTimeout(80);await shot('67-drone-laser');
// lobbyist bribe
await prep(0,3);await ev(()=>{const G=__game;const l=spawn('lob',150,0),o=spawn('bureau',90,-14);o.cd=999;l.cd=999;l.bribeCD=0;G.sim(30,()=>{});o.gold=500;o.dmg*=1.5;G.sim(4,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('68-lobbyiste-pot-de-vin');
// chair charge
await prep(1,1);await ev(()=>{const G=__game,me=G.players[0];me.y=170;const c=spawn('chair',220,0);c.cd=0;c.chT=1;G.sim(12,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('69-chaise-charge');
await prep(1,1);await ev(()=>{const G=__game;const c=spawn('chair',150,0);c.chT=30;G.sim(0);});await p.waitForTimeout(80);await shot('70-chaise-vroum');
// crier
await prep(0,2);await ev(()=>{const G=__game,me=G.players[0];const m=spawn('mega',140,0);m.face=-1;m.shout=70;m.shoutHit=new Set();m.cd=0;G.sim(64,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('71-crieur-ondes-brouillage');
// banner + mixed wave
await ev(()=>{const G=__game;G.char(0);G.setDiff(1);G.startGame(false);G.stage(5);G.sim(1,()=>{});G.players[0].inv=9999;let n=0;while(G.enemies.length<4&&n++<4000)G.sim(1,()=>{G.keys.p1right=1});G.keys.p1right=0;G.sim(70,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('72-banniere-nouvel-ennemi');
await ev(()=>{const G=__game;G.real();G.sim(1,()=>{});let n=0;G.enemies.length=0;G.camX=0;G.stage(5);G.players[0].inv=9999;while(n++<9000){G.sim(1,()=>{G.keys.p1right=1});if(G.enemies.length>=5&&G.enemies.some(e=>e.type==='chair'))break;if(G.enemies.length&&!G.enemies.some(e=>e.type==='chair'))G.enemies.length=0;}G.keys.p1right=0;G.sim(90,()=>{});G.sim(0);});await p.waitForTimeout(80);await shot('73-grosse-vague-mixte');
console.log('errors',errs);await b.close();})();
