const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:460}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(3000);
await p.evaluate(()=>{const G=__game,K=G.keys,P=G.pressed;let f=0;
window.AI=()=>{f++;for(const k in K)K[k]=0;const st=G.state;if(st!=='play'){if(f%20===0)P.start=1;return;}
 for(const me of G.players){if(me){me.hp=Math.max(me.hp,60);}}
 const me=G.players[0];if(!me||!me.alive)return;if(me.held>0){K.p1left=1;if(f%3===0)P.p1punch=1;return;}
 const en=G.enemies.filter(e=>!e.dead);if(!en.length){K.p1right=1;return;}
 const t=en.reduce((a,b)=>Math.hypot(a.x-me.x,(a.y-me.y)*2)<Math.hypot(b.x-me.x,(b.y-me.y)*2)?a:b);
 const near=en.filter(e=>Math.abs(e.x-me.x)<55&&Math.abs(e.y-me.y)<16);if(near.length>=2&&f%50===0){P.p1special=1;return;}
 const side=me.x<t.x?-1:1,gx=t.x+side*34*(t.sc||1)*(t.boss?1.3:1),dx=gx-me.x,dy=t.y-me.y;
 if(Math.abs(dy)>5){if(dy>0)K.p1down=1;else K.p1up=1;}
 if(Math.abs(dx)>6){if(dx>0)K.p1right=1;else K.p1left=1;}else if(Math.abs(dy)<=8){if((me.face>0)!==(t.x>me.x)){if(t.x>me.x)K.p1right=1;else K.p1left=1;}else if(f%9===0)P[f%27===0?'p1kick':(f%45===0?'p1jump':'p1punch')]=1;}};
window.REC=async(n,step)=>{const c=document.getElementById('c'),out=[];for(let i=0;i<n;i++){G.sim(step,AI);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));out.push(c.toDataURL('image/png'));}return out;};});
const clips=[
 ['title',`G.set({state:'title'});G.sim(30,()=>{});`,45],
 ['l1',`G.char(0);G.setDiff(1);G.startGame(false);G.stage(1);G.sim(500,AI);`,40],
 ['l2',`G.char(1);G.stage(2);G.sim(450,AI);`,40],
 ['l3',`G.char(2);G.stage(3);G.sim(450,AI);`,40],
 ['l4',`G.char(0);G.stage(4);G.sim(450,AI);`,40],
 ['l5',`G.char(1);G.stage(5);G.sim(450,AI);`,40],
 ['l6',`G.char(2);G.stage(6);G.sim(450,AI);`,40],
 ['l7',`G.char(0);G.stage(7);G.sim(450,AI);`,40],
 ['h1',`G.char(0);G.startGame(false);G.stage(2);G.sim(600,AI);G.pressed.p1special=1;`,45],
 ['h2',`G.char(1);G.startGame(false);G.stage(3);G.sim(600,AI);G.pressed.p1special=1;`,45],
 ['h3',`G.char(2);G.startGame(false);G.stage(5);G.sim(600,AI);G.pressed.p1special=1;`,45],
 ['b2',`G.char(0);G.startGame(false);G.stage(2);G.boss();G.sim(200,AI);`,40],
 ['b3',`G.char(2);G.stage(3);G.boss();G.sim(200,AI);`,40],
 ['b7',`G.char(1);G.stage(7);G.boss();G.sim(200,AI);`,40],
 ['b1',`G.char(0);G.stage(1);G.boss();G.sim(200,AI);`,30],
 ['p2',`G.sel(['hero1','hero3']);G.startGame(true);G.stage(4);G.sim(500,AI);`,45],
 ['sv',`G.mode('survie');G.char(1);G.startGame(false);G.sim(400,AI);`,45],
];
const meta={};
for(const [name,setup,n] of clips){try{await p.evaluate(s=>{const G=__game;G.real();eval(s);},setup);}catch(e){errs.push(name+':'+e.message);}
 const fr=await p.evaluate(n=>REC(n,2),n);fs.mkdirSync('frames/'+name,{recursive:true});
 fr.forEach((d,i)=>fs.writeFileSync(`frames/${name}/${String(i).padStart(4,'0')}.png`,Buffer.from(d.split(',')[1],'base64')));
 meta[name]=await p.evaluate(()=>[__game.state,__game.curStage,__game.enemies.map(e=>e.type).join(',')]);}
const m=await p.evaluate(async()=>(await renderMusicClip('boss',34,'int')).b64);fs.writeFileSync('music.wav',Buffer.from(m,'base64'));
console.log(JSON.stringify(meta),errs);await b.close();})();
