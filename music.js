'use strict';
// ===== TRUE NORTH DRAGONS music engine =====
// 16-bit arcade soundtrack: lookahead step sequencer on the AudioContext clock, persistent mono synths
// (FM-ish lead with portamento/vibrato/echo, filtered bass, square arp), per-chord pads, noise drums,
// song structure (intro / A / B / loop), crossfades and an intensity layer driven by the game.
const MUS={players:[],cur:null,int:0,cache:{}};
const mtof=n=>440*Math.pow(2,(n-69)/12);
const PCN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pnote(s){const m=/^([A-G])(#|b)?(-?\d)$/.exec(s);return m?12*(+m[3]+1)+PCN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0):null;}
// lead notation: "E5:2 ~G5:2 .:4" = note:steps, '~' = portamento slide, '.' = rest, '|' ignored
function parseLead(str,tr=0){const map={};let st=0;for(let tk of (str||'').split(/\s+/)){if(!tk||tk==='|')continue;let slide=false;if(tk[0]==='~'){slide=true;tk=tk.slice(1);}const[nm,dd]=tk.split(':'),d=dd?+dd:1;if(nm!=='.'){const n=pnote(nm);if(n!=null)map[st]={d,n:n+tr,slide};}st+=d;}return{map,len:st};}
const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],dim:[0,3,6],'5':[0,7,12],sus:[0,5,7],m6:[0,3,7,9],add9:[0,4,7,14]};
function pchord(s,tr){const m=/^([A-G])(#|b)?(.*)$/.exec(s);return{pc:(PCN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+tr+120)%12,iv:QUAL[m[3]]||QUAL['']};}
function parseChords(str,bars,tr=0){const out=[],bs=str.trim().split(/\s+/);for(let b=0;b<bars;b++){const parts=bs[b%bs.length].split(','),per=16/parts.length;for(const p of parts){const c=pchord(p,tr);for(let i=0;i<per;i++)out.push(c);}}return out;}
// bass pattern chars: R root, O octave, 2,m(b3),3(chord 3rd),4,b(b5),5,6,7(chord 7th),x muted, '-' tie, '.' rest
const BIV={R:0,O:12,'2':2,m:3,'4':5,b:6,'5':7,'6':9,x:0};
function parseBass(p){const ev=[];for(let i=0;i<p.length;i++){const c=p[i];if(c==='.'||c==='-')continue;let d=1;while(p[i+d]==='-')d++;ev[i]={c,d};}return{ev,len:p.length};}
const DK={
 house:{k:'X...x...X...x...',c:'....X.......X...',h:'..x...x...x...x.',o:'..g...g...g...g.'},
 funk:{k:'X..x..x...xx..x.',s:'....X..g.g..X..g',h:'x.xgx.x.x.xgx.x.'},
 groove:{k:'X..x...xX.x.....',s:'....X.......X...',h:'xxgxxxgxxxgxxxgx',c:'....x.......x...'},
 march:{k:'X.......x.......',s:'X.gXg.x.X.gxXggx',h:'x...x...x...x...'},
 drive:{k:'X...x...X...x..x',s:'....X.......X...',h:'gxgxgxgxgxgxgxgx',o:'..x...x...x...x.'},
 rock:{k:'X.....x.X.x.....',s:'....X.......X...',h:'x.x.x.x.x.x.x.x.'},
 dark:{k:'X..x..X...X..x..',s:'....X.......X..g',h:'gxgxgxgxgxgxgxgx',c:'............X...'},
 boss:{k:'X.x.X.x.X.x.X.xx',s:'....X.......X.X.',h:'xxxxxxxxxxxxxxxx'},
 epic:{k:'X...X...X..xX...',s:'....X.......X...',h:'..x...x...x...x.',t:'..............xx'},
 bouncy:{k:'X...X...X...X...',s:'....X.......X...',h:'x.xxx.xxx.xxx.xx',c:'....x.......x...'},
 half:{k:'X.......X.......',s:'........X.......',h:'x...x...x...x...'},
 intro:{k:'X.......X.......',h:'..x...x...x...x.'},
 build:{k:'X...X...X...X...',s:'........X.X.XXXX',h:'x.x.x.x.x.x.x.x.'},
 tick:{h:'X...x...X...x...',k:'X...............'},
 none:{}};
const FILL={a:{k:'X...X...X.X.X.X.',s:'....X.X.XgXgXXXX',t:'..........x.x.xx'},b:{k:'X.......X.......',s:'XgXgXgXgXXXXXXXX'},c:{k:'X..X..X.X.X.X.X.',s:'....X..X.XxXXXXX',t:'........xxx.xxx.'},r:{k:'X.x.X.x.',s:'X.X.XXXX',t:'..x.xx..'}};
// ---------- SONG DATA (original compositions) ----------
const TITLE_A='D5:3 F#5:1 A5:4 D6:4 C#6:2 B5:2 | A5:6 F#5:2 E5:4 F#5:2 A5:2 | B5:3 A5:1 F#5:4 D5:2 E5:2 F#5:4 | G5:4 F#5:2 E5:2 D5:4 E5:4 | D5:3 F#5:1 A5:4 D6:4 E6:2 F#6:2 | E6:6 D6:2 C#6:4 A5:4 | B5:4 D6:4 A5:4 G5:2 F#5:2 | E5:8 ~A5:8';
const TITLE_B='D6:4 C6:2 Bb5:2 F5:4 Bb5:4 | C6:4 Bb5:2 C6:2 E6:4 G6:4 | F#6:8 E6:2 D6:2 A5:4 | D6:12 .:4 | D6:4 F6:4 E6:2 D6:2 C6:4 | E6:4 G6:4 F6:2 E6:2 D6:4 | E6:4 D6:2 B5:2 G5:4 B5:4 | A5:4 C#6:4 E6:4 A6:4';
const TITLE_I='A4:2 D5:2 F#5:2 A5:10 | B5:2 A5:2 G5:2 F#5:2 E5:8 | A4:2 D5:2 F#5:2 A5:6 B5:2 C#6:2 | D6:12 .:4';
const LEADS={
 fm:{w:'sawtooth',w2:'square',det:9,fm:1.1,ratio:2,cut:3200,vib:16,echo:.28,vol:.13},
 brass:{w:'sawtooth',w2:'sawtooth',det:14,fm:.6,ratio:1,cut:2400,vib:12,echo:.22,vol:.13},
 bell:{w:'square',w2:'triangle',det:5,fm:2.2,ratio:3.5,cut:4200,vib:10,echo:.35,vol:.11},
 fiddle:{w:'sawtooth',w2:'square',det:7,fm:.8,ratio:2,cut:3600,vib:22,echo:.2,vol:.12},
 gtr:{w:'square',w2:'sawtooth',det:18,fm:1.6,ratio:1,cut:2000,vib:20,echo:.18,vol:.13,dist:1},
 cold:{w:'square',w2:'square',det:12,fm:1.8,ratio:1.5,cut:2600,vib:8,echo:.42,vol:.11}};
const BASSES={
 slap:{w:'sawtooth',cut:520,vol:.30,dec:.09,sus:.35},
 synth:{w:'sawtooth',cut:700,vol:.28,dec:.14,sus:.55},
 round:{w:'triangle',cut:900,vol:.34,dec:.2,sus:.7},
 heavy:{w:'sawtooth',cut:420,vol:.30,dec:.18,sus:.7,dist:1,fifth:1},
 acid:{w:'square',cut:380,vol:.24,dec:.07,sus:.3,q:11}};
const SONGS={
 title:{bpm:128,lead:'brass',bass:'synth',swing:0,order:['i','a','b','a2'],loopFrom:1,secs:{
  i:{bars:4,ch:'D G A A',lead:TITLE_I,bass:'R---------------',dr:'build',arp:'pad',fill:'b'},
  a:{bars:8,ch:'D A Bm G D A G A',lead:TITLE_A,bass:'R.OR.OR.R.OR.O5.',dr:'house',arp:'both',fill:'a'},
  b:{bars:8,ch:'Bb C D D Bb C Em A',lead:TITLE_B,bass:'R.R.O.R.R.R.O.5.',dr:'epic',arp:'pad',fill:'c'},
  a2:{bars:8,ch:'D A Bm G D A G A',lead:TITLE_A,lead2:'D6:8 C#6:8 | A5:16 | F#5:8 B5:8 | B5:8 G5:8 | A5:8 D6:8 | C#6:16 | D6:8 B5:8 | C#6:16',bass:'R.OR.OR.R.OR.O5.',dr:'groove',arp:'pad',fill:'b'}}},
 select:{bpm:118,lead:'bell',bass:'slap',swing:.12,order:['a'],loopFrom:0,secs:{
  a:{bars:4,ch:'Em7 A7 Em7 A7',lead:'E5:2 G5:1 A5:1 .:2 B5:2 .:2 A5:1 G5:1 E5:4 | .:16 | D5:2 E5:1 G5:1 .:2 A5:2 .:2 G5:1 A5:1 B5:4 | .:8 A5:2 G5:2 E5:4',bass:'R..O.R.7..R.5.3.',dr:'funk',arp:'up8'}}},
 s1:{bpm:124,lead:'fm',bass:'slap',swing:.1,order:['i','a','b','a','b2'],loopFrom:1,secs:{
  i:{bars:2,ch:'Am7 Am7',lead:'',bass:'R.OR.OR.R.OR.O5.',dr:'groove',arp:'',fill:'a'},
  a:{bars:8,ch:'Am7 Am7 D7 D7 Am7 Am7 F G',lead:'A5:2 .:1 A5:1 C6:2 A5:2 G5:2 E5:2 G5:2 A5:2 | .:4 E5:1 G5:1 A5:2 C6:3 D6:1 C6:2 A5:2 | F#5:2 A5:2 .:1 A5:1 C6:2 D6:4 C6:2 A5:2 | A5:8 G5:2 F#5:2 E5:4 | A5:2 .:1 A5:1 C6:2 A5:2 G5:2 E5:2 G5:2 A5:2 | .:4 E5:1 G5:1 A5:2 C6:3 D6:1 C6:2 A5:2 | F5:2 A5:2 C6:2 A5:2 G5:4 F5:2 E5:2 | G5:4 B5:2 D6:2 ~E6:8',bass:'R.OR.OR.R.OR.O5.',dr:'groove',arp:'up',fill:'a'},
  b:{bars:8,ch:'Fmaj7 G Em7 Am7 Fmaj7 G E7 E7',lead:'A5 G5 F5 E5 F5 A5 C6 A5 G5:2 F5:2 E5:2 C5:2 | D5 E5 G5 B5 D6 B5 G5 B5 A5:4 G5:4 | E5:2 G5:2 B5:4 A5:2 G5:2 E5:4 | A5:12 .:4 | A5 G5 F5 E5 F5 A5 C6 A5 G5:2 F5:2 E5:2 C5:2 | D5 E5 G5 B5 D6 B5 G5 B5 A5:4 G5:4 | G#5:2 B5:2 D6:2 E6:2 D6:2 B5:2 G#5:2 E5:2 | E6:8 .:8',lead2:'',bass:'R..R.OR.R..R.O7.',dr:'funk',arp:'pad',fill:'c',leadSet:'fiddle'},
  b2:{bars:4,ch:'Fmaj7 G Am7 Am7',lead:'C6:4 A5:4 F5:4 A5:4 | B5:4 G5:4 D6:8 | E6:16 | .:16',bass:'R.OR.OR.R.OR.O5.',dr:'house',arp:'both',fill:'b'}}},
 s2:{bpm:108,lead:'brass',bass:'round',swing:0,order:['i','a','b'],loopFrom:1,secs:{
  i:{bars:2,ch:'Cm Cm',lead:'',bass:'R...5...R...5...',dr:'march',arp:''},
  a:{bars:8,ch:'Cm Cm Ab G Cm Cm Ab G',lead:'C5:3 C5:1 Eb5:3 Eb5:1 G5:4 F5:2 Eb5:2 | D5:2 Eb5:2 F5:2 G5:2 Ab5:4 G5:4 | Ab5:3 G5:1 F5:4 Eb5:3 D5:1 C5:4 | B4:4 D5:4 G5:8 | C5:3 C5:1 Eb5:3 Eb5:1 G5:4 F5:2 Eb5:2 | D5:2 Eb5:2 F5:2 G5:2 Ab5:4 G5:4 | C6:4 Bb5:2 Ab5:2 G5:4 F5:4 | G5:4 B5:4 D6:8',bass:'R--.5--.R--.5-R.',dr:'march',arp:'pad',fill:'b'},
  b:{bars:8,ch:'Fm Fm Cm Cm Db Db G G',lead:'F5:4 Ab5:4 C6:6 Bb5:2 | Ab5:4 G5:4 F5:8 | Eb5:4 G5:4 C6:6 D6:2 | Eb6:8 D6:4 C6:4 | Db6:6 C6:2 Ab5:4 F5:4 | Ab5:16 | G5:2 G5:2 B5:2 B5:2 D6:2 D6:2 F6:4 | G6:8 .:8',bass:'R.R.R.5.R.R.R.O.',dr:'march',arp:'up8',fill:'b'}}},
 s3:{bpm:150,lead:'fm',bass:'synth',swing:0,order:['i','a','b'],loopFrom:1,secs:{
  i:{bars:2,ch:'Em Em',lead:'',bass:'R.R.R.R.R.R.O.R.',dr:'drive',arp:'up',fill:'a'},
  a:{bars:8,ch:'Em Em C D Em Em C B',lead:'E5:2 G5:2 B5:2 E6:4 D6:2 B5:2 G5:2 | A5:2 B5:2 G5:4 E5:8 | E5:2 G5:2 C6:4 B5:2 A5:2 G5:4 | F#5:4 A5:4 D6:8 | E5:2 G5:2 B5:2 E6:4 D6:2 B5:2 G5:2 | B5:2 D6:2 E6:4 G6:8 | G6:4 E6:4 C6:4 E6:4 | D#6:8 B5:8',bass:'R.R.R.R.R.R.O.R.',dr:'drive',arp:'up',fill:'a'},
  b:{bars:8,ch:'Am Am Em Em C D Em Em',lead:'A5:4 .:2 A5:2 C6:4 E6:4 | D6:4 C6:4 B5:4 A5:4 | G5:4 .:2 G5:2 B5:4 E6:4 | E6:16 | E6:2 E6:2 D6:2 C6:2 G5:8 | F#6:2 F#6:2 E6:2 D6:2 A5:8 | B5:4 E6:4 G6:4 B6:4 | E6:16',bass:'RRORRORRRRORR5O5',dr:'house',arp:'pad',fill:'c',leadSet:'brass'}}},
 s4:{bpm:100,lead:'gtr',bass:'heavy',swing:.28,order:['i','a','b'],loopFrom:1,secs:{
  i:{bars:2,ch:'E5 E5',lead:'',bass:'R.Rm.4.b5.R.7.4.',dr:'half',arp:''},
  a:{bars:8,ch:'E5 E5 A5 E5 B5 A5 E5 B5',lead:'.:4 E5:2 G5:2 A5:2 Bb5:1 B5:5 | D6:2 B5:2 A5:2 G5:2 E5:8 | A5:2 C6:2 D6:2 Eb6:1 E6:5 D6:4 | B5:4 G5:2 E5:2 G5:8 | F#5:2 A5:2 B5:4 D6:4 B5:4 | A5:4 G5:2 E5:2 D5:4 E5:4 | E5:16 | .:8 B4:2 D5:2 E5:4',bass:'R.Rm.4.b5.R.7.4.',dr:'rock',arp:'',fill:'a'},
  b:{bars:8,ch:'C5 D5 E5 E5 C5 D5 B5 B5',lead:'G5:4 E5:4 C5:8 | A5:4 F#5:4 D5:8 | B5:4 G5:4 E6:8 | E6:2 D6:2 B5:2 A5:2 G5:2 E5:2 D5:2 B4:2 | G5:4 E5:4 C5:8 | A5:4 F#5:4 D5:8 | B5:4 D6:4 F#6:8 | F#6:4 E6:4 D#6:8',bass:'R.R.R.RO.R.R.R5.',dr:'rock',arp:'pad',fill:'c'}}},
 s5:{bpm:140,lead:'cold',bass:'acid',swing:0,order:['i','a','b'],loopFrom:1,secs:{
  i:{bars:4,ch:'F#m F#m G F#m',lead:'',bass:'R.RRR.RR.R.RR.OR',dr:'intro',arp:'up'},
  a:{bars:8,ch:'F#m F#m G F#m F#m F#m D C#',lead:'F#5:4 .:2 F#5:2 A5:4 G5:4 | F#5:2 C#6:2 .:4 B5:2 A5:2 G5:4 | G5:4 B5:4 D6:6 C#6:2 | C#6:16 | F#6:4 E6:2 C#6:2 A5:4 G5:4 | F#5:16 | D6:4 F#6:4 A6:8 | G#6:8 F6:8',bass:'R.RRR.RR.R.RR.OR',dr:'dark',arp:'up',fill:'a'},
  b:{bars:8,ch:'Bm Bm G G Em Em C# C#',lead:'B5:2 D6:2 F#6:4 E6:2 D6:2 C#6:4 | D6:8 B5:8 | G5:2 B5:2 D6:4 C#6:2 B5:2 A5:4 | B5:16 | E6:4 G6:4 F#6:4 E6:4 | D6:4 B5:4 G5:8 | F6:8 G#6:8 | C#7:8 .:8',bass:'RRORRRORRRORRRO7',dr:'house',arp:'ud',fill:'c'}}},
 boss:{bpm:160,lead:'fm',bass:'synth',swing:0,order:['i','a','b'],loopFrom:1,secs:{
  i:{bars:2,ch:'Dm A',lead:'D5:1 D5:1 .:2 D5:1 D5:1 .:2 F5:2 E5:2 D5:2 C#5:2 | A4:16',bass:'RRRRRRRRRRRRRRRR',dr:'build',arp:''},
  a:{bars:8,ch:'Dm Dm Bb A Dm Dm Eb A',lead:'D5:2 F5:2 A5:2 D6:2 C#6:2 D6:2 A5:4 | Bb5:2 A5:2 G5:2 F5:2 E5:4 A4:4 | D5:2 F5:2 Bb5:4 A5:2 G5:2 F5:4 | E5:2 G5:2 C#6:4 E6:8 | D5:2 F5:2 A5:2 D6:2 C#6:2 D6:2 A5:4 | Bb5:2 A5:2 G5:2 F5:2 E5:4 A4:4 | Eb6:4 D6:4 Bb5:4 G5:4 | A5:2 C#6:2 E6:2 G6:2 A6:8',bass:'RRORRORRRRORR7O5',dr:'boss',arp:'up',fill:'a'},
  b:{bars:8,ch:'Gm Gm Dm Dm Bb C A A',lead:'G5:4 Bb5:4 D6:6 C6:2 | Bb5:4 A5:4 G5:8 | F5:4 A5:4 D6:6 E6:2 | F6:8 E6:4 D6:4 | D6:4 F6:4 E6:2 D6:2 C6:4 | E6:4 G6:4 F6:2 E6:2 C6:4 | C#6:4 E6:4 A6:8 | A6:2 G6:2 F6:2 E6:2 D6:2 C#6:2 Bb5:2 A5:2',bass:'R.ORR.ORR.ORR.O5',dr:'drive',arp:'pad',fill:'c',leadSet:'brass'}}},
 final:{bpm:146,lead:'brass',bass:'synth',swing:0,order:['i','a','b'],loopFrom:1,secs:{
  i:{bars:4,ch:'Cm Cm Ab G',lead:'C5:16 | Eb5:16 | Ab5:16 | B5:16',bass:'R---------------',dr:'build',arp:'pad',fill:'b'},
  a:{bars:8,ch:'Cm Ab Eb Bb Cm Ab Fm G',lead:'C6:6 Eb6:2 G6:8 | F6:4 Eb6:4 C6:8 | Bb5:4 Eb6:4 G6:4 F6:4 | D6:12 Bb5:4 | C6:6 Eb6:2 G6:6 Ab6:2 | C7:8 Bb6:4 Ab6:4 | Ab6:4 G6:4 F6:4 Eb6:4 | D6:8 B5:8',bass:'R.ORR.ORR.ORR.O5',dr:'epic',arp:'both',fill:'a'},
  b:{bars:8,ch:'Ab Bb Cm Cm Ab Bb G G',lead:'Eb6:2 F6:2 G6:4 Ab6:4 G6:4 | F6:2 G6:2 Ab6:4 Bb6:4 Ab6:4 | G6:8 Eb6:4 C6:4 | G5:16 | Eb6:2 F6:2 G6:4 Ab6:4 G6:4 | F6:2 G6:2 Ab6:4 Bb6:4 Ab6:4 | B6:4 D7:4 B6:4 G6:4 | G6:16',lead2:'C5:16 | D5:16 | Eb5:16 | G4:16 | C5:16 | D5:16 | D5:16 | B4:16',bass:'RRORRRORRRORRRO7',dr:'boss',arp:'up',fill:'c',leadSet:'fm'}}},
 bonus:{bpm:172,lead:'bell',bass:'round',swing:0,order:['a','b'],loopFrom:0,secs:{
  a:{bars:8,ch:'F F Bb C F F Bb C',lead:'F5 A5 C6 A5 F5 A5 C6 A5 Bb5:2 A5:2 G5:2 F5:2 | E5:2 G5:2 C6:4 .:2 C6:2 D6:2 C6:2 | D6:2 Bb5:2 F5:2 Bb5:2 D6:2 F6:2 E6:2 D6:2 | C6:4 G5:4 E5:4 .:4 | F5 A5 C6 A5 F5 A5 C6 A5 Bb5:2 A5:2 G5:2 F5:2 | E5:2 G5:2 C6:2 E6:2 G6:4 .:4 | F6:2 D6:2 Bb5:2 D6:2 F6:2 D6:2 Bb5:2 G5:2 | E6:4 C6:4 F6:8',bass:'R.5.O.5.R.5.O.5.',dr:'bouncy',arp:'',fill:'a'},
  b:{bars:4,ch:'Dm Dm Bb C',lead:'A5:1 .:1 A5:1 .:1 D6:2 A5:2 F5:2 A5:2 D6:4 | C6:2 Bb5:2 A5:2 G5:2 A5:8 | Bb5:2 D6:2 F6:4 D6:2 Bb5:2 F5:4 | G5:2 A5:2 Bb5:2 B5:2 C6:8',bass:'R.R.O.R.R.5.O.5.',dr:'house',arp:'up',fill:'r'}}},
 win:{bpm:120,lead:'brass',bass:'round',swing:0,order:['i','a','b','o'],loopFrom:1,secs:{
  i:{bars:4,ch:'Eb Ab Bb Bb',lead:TITLE_I,tr:1,bass:'R---------------',dr:'build',arp:'pad',fill:'b'},
  a:{bars:8,ch:'Eb Bb Cm Ab Eb Bb Ab Bb',lead:TITLE_A,tr:1,bass:'R...R.5.R...R.5.',dr:'half',arp:'both',fill:'a'},
  b:{bars:8,ch:'B Db Eb Eb B Db Fm Bb',lead:TITLE_B,tr:1,bass:'R.R.O.R.R.R.O.5.',dr:'epic',arp:'pad',fill:'c'},
  o:{bars:4,ch:'Ab Bb Eb Eb',lead:'C6:8 D6:8 | Eb6:16 | .:16 | .:16',bass:'R-------R-------',dr:'half',arp:'pad'}}},
 // ---- jingles (no loop) ----
 jclear:{bpm:150,lead:'brass',bass:'synth',loop:false,order:['a'],secs:{a:{bars:3,ch:'C F,G C',lead:'C5:2 E5:2 G5:2 C6:2 E6:2 C6:2 G5:2 E5:2 | F5:2 A5:2 C6:4 G5:2 B5:2 D6:4 | C6:12 .:4',bass:'R.O.R.O.R.O.R.O.',dr:'house',arp:'up',crashEnd:1}}},
 jover:{bpm:80,lead:'cold',bass:'round',loop:false,order:['a'],secs:{a:{bars:3,ch:'Am,G F,E Am',lead:'E5:4 D5:4 C5:4 B4:4 | A4:4 G4:4 F4:4 G#4:4 | A4:14 .:2',bass:'R---R---R---R---',dr:'half',arp:'pad'}}},
 cont:{bpm:120,lead:'bell',bass:'synth',order:['a'],loopFrom:0,secs:{a:{bars:2,ch:'Dm Bb,A',lead:'D6:2 .:6 C#6:2 .:6 | D6:2 .:6 E6:2 .:6',bass:'R.R.R.R.R.R.R.R.',dr:'tick',arp:'pad'}}}};
SONGS.over=SONGS.jover;SONGS.clear=SONGS.jclear;
function compile(name){if(MUS.cache[name])return MUS.cache[name];const S=SONGS[name];if(!S)return null;const C={name,bpm:S.bpm,swing:S.swing||0,loop:S.loop!==false,order:S.order,loopFrom:S.loopFrom||0,lead:LEADS[S.lead]||LEADS.fm,bass:BASSES[S.bass]||BASSES.synth,secs:{}};
 for(const k in S.secs){const s=S.secs[k],tr=s.tr||0,L=parseLead(s.lead,tr),L2=parseLead(s.lead2||'',tr);C.secs[k]={bars:s.bars,ch:parseChords(s.ch,s.bars,tr),lead:L,lead2:L2,bass:parseBass(s.bass||''),dr:DK[s.dr]||DK.none,fill:s.fill?FILL[s.fill]:null,arp:s.arp||'',crashEnd:s.crashEnd,leadSet:s.leadSet?LEADS[s.leadSet]:null,intro:k==='i'};}
 return MUS.cache[name]=C;}
// ---------- instruments ----------
function osc(c,type,t0){const o=c.createOscillator();o.type=type;o.start(t0);return o;}
let DCURVE=null;function dcurve(){if(DCURVE)return DCURVE;const a=new Float32Array(512);for(let i=0;i<512;i++){const x=i/256-1;a[i]=Math.tanh(x*3.2);}return DCURVE=a;}
function mkPlayer(name,c,dest,t0,fade){const S=compile(name);if(!S)return null;const sp=60/S.bpm/4,P={name,S,c,sp,sec:0,bar:0,step:0,next:t0,int:MUS.int,stopAt:Infinity,osc:[],pad:[]};
 const out=c.createGain();out.gain.setValueAtTime(fade?0.0001:1,t0);if(fade)out.gain.exponentialRampToValueAtTime(1,t0+fade);out.connect(dest);P.out=out;
 const dl=c.createDelay(1.5);dl.delayTime.value=Math.min(1.4,sp*3);const fb=c.createGain();fb.gain.value=.3;const elp=c.createBiquadFilter();elp.type='lowpass';elp.frequency.value=2200;const wet=c.createGain();wet.gain.value=1;
 dl.connect(elp);elp.connect(fb);fb.connect(dl);elp.connect(wet);const pan=c.createStereoPanner?c.createStereoPanner():null;if(pan){pan.pan.value=.35;wet.connect(pan);pan.connect(out);}else wet.connect(out);
 const echoIn=c.createGain();echoIn.gain.value=S.lead.echo;echoIn.connect(dl);
 // lead: FM carrier + detuned partner, vibrato LFO, filter, mono env
 const L={},Ld=S.lead;L.o1=osc(c,Ld.w,t0);L.o2=osc(c,Ld.w2,t0);L.o2.detune.value=Ld.det;L.mod=osc(c,'sine',t0);L.mg=c.createGain();L.mg.gain.value=0;L.mod.connect(L.mg);L.mg.connect(L.o1.frequency);
 L.lfo=osc(c,'sine',t0);L.lfo.frequency.value=5.7;L.lg=c.createGain();L.lg.gain.value=0;L.lfo.connect(L.lg);L.lg.connect(L.o1.detune);L.lg.connect(L.o2.detune);
 L.f=c.createBiquadFilter();L.f.type='lowpass';L.f.frequency.value=Ld.cut;L.f.Q.value=1.2;const m2=c.createGain();m2.gain.value=.5;L.o1.connect(L.f);L.o2.connect(m2);m2.connect(L.f);L.g=c.createGain();L.g.gain.value=0;
 let ln=L.f;if(Ld.dist){const ws=c.createWaveShaper();ws.curve=dcurve();L.f.connect(ws);ln=ws;}ln.connect(L.g);L.g.connect(out);L.g.connect(echoIn);L.end=0;P.L=L;
 // bass: saw/tri + square sub (+ optional fifth) -> resonant lowpass -> env
 const B={},Bd=S.bass;B.o1=osc(c,Bd.w,t0);B.o2=osc(c,'square',t0);const bs=c.createGain();bs.gain.value=.35;B.f=c.createBiquadFilter();B.f.type='lowpass';B.f.Q.value=Bd.q||7;B.o1.connect(B.f);B.o2.connect(bs);bs.connect(B.f);
 if(Bd.fifth){B.o3=osc(c,'sawtooth',t0);const g3=c.createGain();g3.gain.value=.6;B.o3.connect(g3);g3.connect(B.f);}
 B.g=c.createGain();B.g.gain.value=0;let bn=B.f;if(Bd.dist){const ws=c.createWaveShaper();ws.curve=dcurve();B.f.connect(ws);bn=ws;}bn.connect(B.g);B.g.connect(out);P.B=B;
 // arp: square pluck
 const A={};A.o=osc(c,'square',t0);A.f=c.createBiquadFilter();A.f.type='lowpass';A.f.frequency.value=3000;A.g=c.createGain();A.g.gain.value=0;A.o.connect(A.f);A.f.connect(A.g);const ap=c.createStereoPanner?c.createStereoPanner():null;if(ap){ap.pan.value=-.3;A.g.connect(ap);ap.connect(out);}else A.g.connect(out);A.g.connect(echoIn);P.A=A;A.i=0;
 // pads bus + drums bus
 P.padF=c.createBiquadFilter();P.padF.type='lowpass';P.padF.frequency.value=1500;P.padG=c.createGain();P.padG.gain.value=.05;P.padF.connect(P.padG);P.padG.connect(out);
 P.dr=c.createGain();P.dr.gain.value=1;P.dr.connect(out);
 P.osc=[L.o1,L.o2,L.mod,L.lfo,B.o1,B.o2,A.o].concat(B.o3?[B.o3]:[]);return P;}
function leadNote(P,t,n,d,slide,Lset){const L=P.L,Ld=Lset||P.S.lead,f0=mtof(n),dur=d*P.sp,legato=slide&&L.end>=t-.01,tc=slide?.05:.002;
 L.o1.frequency.setTargetAtTime(f0,t,tc);L.o2.frequency.setTargetAtTime(f0,t,tc);L.mod.frequency.setTargetAtTime(f0*Ld.ratio,t,tc);
 const mg=L.mg.gain;mg.cancelScheduledValues(t);mg.setTargetAtTime(f0*Ld.fm,t,.002);mg.setTargetAtTime(f0*Ld.fm*.22,t+.015,.1);
 const v=Ld.vol,g=L.g.gain;g.cancelScheduledValues(t);if(!legato){g.setTargetAtTime(0,t,.002);g.setTargetAtTime(v,t+.004,.005);}else g.setTargetAtTime(v,t,.01);
 g.setTargetAtTime(v*.72,t+.06,.18);g.setTargetAtTime(0,t+Math.max(.03,dur-.035),.025);
 const lg=L.lg.gain;lg.cancelScheduledValues(t);lg.setTargetAtTime(0,t,.01);if(dur>.24)lg.setTargetAtTime(Ld.vib,t+.16,.1);
 L.f.frequency.setTargetAtTime(Ld.cut*(.8+P.int*.7),t,.05);L.end=t+dur;}
function bassNote(P,t,n,d,mute){const B=P.B,Bd=P.S.bass,f0=mtof(n);B.o1.frequency.setValueAtTime(f0,t);B.o2.frequency.setValueAtTime(f0/2,t);if(B.o3)B.o3.frequency.setValueAtTime(f0*1.4983,t);
 const cut=Bd.cut*(1+P.int*1.1),ff=B.f.frequency;ff.cancelScheduledValues(t);ff.setTargetAtTime(cut*3.4,t,.002);ff.setTargetAtTime(cut,t+.008,.07);
 const v=Bd.vol,g=B.g.gain,dur=mute?.04:d*P.sp*.9;g.cancelScheduledValues(t);g.setTargetAtTime(0,t-.004,.0015);g.setTargetAtTime(v,t,.002);g.setTargetAtTime(v*Bd.sus,t+.01,Bd.dec);g.setTargetAtTime(0,t+dur,.015);}
function arpNote(P,t,n,d,v=.055){const A=P.A;A.o.frequency.setValueAtTime(mtof(n),t);const g=A.g.gain;g.cancelScheduledValues(t);g.setTargetAtTime(0,t-.003,.001);g.setTargetAtTime(v,t,.002);g.setTargetAtTime(0,t+.02,Math.min(.25,d*P.sp*.35));A.f.frequency.setValueAtTime(2200+P.int*2600,t);}
function padChord(P,t,ch,dur){const c=P.c;for(let j=0;j<3;j++){const iv=ch.iv[j%ch.iv.length],n=55+((ch.pc+iv-7+24)%12);for(const dt of[-7,7]){const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=mtof(n);o.detune.value=dt;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.33,t+.12);g.gain.setTargetAtTime(.22,t+.2,.4);g.gain.setTargetAtTime(0,t+dur-.05,.06);o.connect(g);g.connect(P.padF);o.start(t);o.stop(t+dur+.3);}}
 P.padF.frequency.setTargetAtTime(1100+P.int*1800,t,.3);}
function noiseHit(P,t,d,v,type,f,q=1,f1){const c=P.c,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=NB;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+d);fl.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);s.connect(fl);fl.connect(g);g.connect(P.dr);s.start(t,Math.random()*1.5);s.stop(t+d+.02);}
function toneHit(P,t,f0,f1,d,v,type='sine'){const c=P.c,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d*.7);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(P.dr);o.start(t);o.stop(t+d+.02);}
const DRUM={
 k(P,t,v){toneHit(P,t,160,42,.24,.95*v);noiseHit(P,t,.012,.25*v,'highpass',3000);},
 s(P,t,v){noiseHit(P,t,.16,.42*v,'bandpass',1900,.8);noiseHit(P,t,.09,.22*v,'highpass',5000);toneHit(P,t,230,150,.08,.28*v,'triangle');},
 h(P,t,v){noiseHit(P,t,.028,.11*v,'highpass',8500);},
 o(P,t,v){noiseHit(P,t,.16,.07*v,'highpass',7500);},
 c(P,t,v){for(let i=0;i<3;i++)noiseHit(P,t+i*.011,.05+(i===2?.07:0),.3*v,'bandpass',1500,1.4);},
 t(P,t,v){toneHit(P,t,210,95,.2,.5*v);},
 x(P,t,v){noiseHit(P,t,1.2,.13*v,'highpass',5500,.7,3000);}};
const VEL={X:1,x:.72,g:.32};
function stepPlayer(P){const S=P.S,key=S.order[P.sec],sec=S.secs[key],i=P.bar*16+P.step,st=P.step,t=P.next+(st%2?S.swing*P.sp:0);
 P.int+=(MUS.int-P.int)*.05;const I=P.int;
 const le=sec.lead.len?sec.lead.map[i%sec.lead.len]:null;if(le)leadNote(P,t,le.n,le.d,le.slide,sec.leadSet);
 const ch=sec.ch[i]||sec.ch[0],newCh=i===0||ch!==sec.ch[i-1];
 if(newCh&&(sec.arp==='pad'||sec.arp==='both')){let n=1;while(i+n<sec.ch.length&&sec.ch[i+n]===ch)n++;padChord(P,t,ch,n*P.sp);}
 const l2=sec.lead2.len?sec.lead2.map[i%sec.lead2.len]:null;
 if(l2)arpNote(P,t,l2.n,l2.d*3,.06);else if(sec.arp&&sec.arp!=='pad'){const r8=sec.arp==='up8';if(!r8||st%2===0){const tones=ch.iv.slice(0,3).map(v=>72+ch.pc+v-(ch.pc>6?12:0)),k=P.A.i++,len=tones.length;let idx=k%len;if(sec.arp==='ud'){const m=k%(len*2-2||1);idx=m<len?m:len*2-2-m;}arpNote(P,t,tones[idx]+(k%(len*2)>=len&&sec.arp!=='ud'?12:0),r8?2:1);}}
 const be=sec.bass.len?sec.bass.ev[i%sec.bass.len]:null;if(be){const root=ch.pc>=4?24+ch.pc:36+ch.pc,iv=be.c==='3'?ch.iv[1]:be.c==='7'?(ch.iv[3]!=null&&ch.iv[3]<12?ch.iv[3]:10):BIV[be.c]||0;bassNote(P,t,root+iv,be.d,be.c==='x');}
 const last=P.bar===sec.bars-1,dr=last&&sec.fill?sec.fill:sec.dr;for(const k in dr){const p=dr[k];const ch2=p[st%p.length];if(ch2&&ch2!=='.')DRUM[k](P,t,VEL[ch2]||.7);}
 if(i===0&&!sec.intro)DRUM.x(P,t,1);
 if(!sec.intro&&dr===sec.dr){if(I>.4&&!(dr.h&&dr.h[st]!=='.'&&dr.h[st]))DRUM.h(P,t,st%2?.35:.55);if(I>.6&&(st===4||st===12))DRUM.c(P,t,.7);if(I>.8){if(st%4===0&&!(dr.k&&dr.k[st]!=='.'))DRUM.k(P,t,.6);if(st%4===2)DRUM.o(P,t,.8);}}
 if(sec.crashEnd&&last&&st===8)DRUM.x(P,t,1);
 P.next+=P.sp;P.step++;if(P.step===16){P.step=0;P.bar++;if(P.bar>=sec.bars){P.bar=0;P.sec++;if(P.sec>=S.order.length){if(!S.loop){P.done=true;P.stopAt=Math.min(P.stopAt,P.next+2.5);}else P.sec=S.loopFrom;}}}}
function killPlayer(P,t){if(P.killed)return;P.killed=1;P.osc.forEach(o=>{try{o.stop(t);}catch(e){}});setTimeout(()=>{try{P.out.disconnect();}catch(e){}},Math.max(0,(t-P.c.currentTime)*1000+200));}
// ---------- live scheduler ----------
function musicTick(){if(!BUS||RENDER)return;const c=BUS.ctx,now=c.currentTime;
 BUS.music.gain.setTargetAtTime(muted?0:VOL.music*.55*((typeof paused!=='undefined'&&paused)?.35:1),now,.05);
 for(const P of MUS.players){if(P.killed)continue;if(P.next<now-.25){const skip=Math.ceil((now-P.next)/P.sp);for(let k=0;k<skip&&!P.done;k++){P.next+=P.sp;P.step++;if(P.step===16){P.step=0;P.bar++;const sec=P.S.secs[P.S.order[P.sec]];if(P.bar>=sec.bars){P.bar=0;P.sec++;if(P.sec>=P.S.order.length){if(!P.S.loop)P.done=true;else P.sec=P.S.loopFrom;}}}}}
  while(!P.done&&P.next<now+.14&&P.next<P.stopAt)stepPlayer(P);if(now>P.stopAt||(P.done&&now>P.next+2.5))killPlayer(P,now+.05);}
 MUS.players=MUS.players.filter(p=>!p.killed);}
setInterval(musicTick,25);
function playSong(name){if(MUS.cur===name)return;MUS.cur=name;curSong=name;if(!BUS)return;const c=BUS.ctx,now=c.currentTime;
 for(const P of MUS.players)if(!P.killed&&P.stopAt===Infinity){P.out.gain.cancelScheduledValues(now);P.out.gain.setTargetAtTime(0,now,.18);P.stopAt=now+1;}
 if(name&&SONGS[name]){const jingle=SONGS[name].loop===false;const P=mkPlayer(name,c,BUS.music,now+.06,jingle?0:.5);if(P)MUS.players.push(P);}}
// resume the wanted song once audio gets unlocked by a gesture
setInterval(()=>{if(BUS&&MUS.cur&&!MUS.players.some(p=>p.name===MUS.cur&&!p.killed)&&!(SONGS[MUS.cur]&&SONGS[MUS.cur].loop===false)){const n=MUS.cur;MUS.cur=null;playSong(n);}},500);
function setMusicIntensity(v){MUS.int=Math.max(0,Math.min(1,v));}
// ---------- offline render of excerpts (for demo/testing) ----------
async function renderMusicClip(name,secs,withSfx){const sr=44100,oc=new OfflineAudioContext(2,sr*secs|0,sr);const keep=[BUS,AC,voices];RENDER=1;BUS=mkGraph(oc);BUS.music.gain.value=VOL.music*.55;voices=0;
 const i0=MUS.int;MUS.int=withSfx==='int'?.95:0;const P=mkPlayer(name,oc,BUS.music,.05,0);while(!P.done&&P.next<secs-.5)stepPlayer(P);P.out.gain.setTargetAtTime(0,secs-1.2,.3);
 if(withSfx==='sfx'){DEMO=1;const seq=[['punch',[150]],['impact',[150]],['kickW',[200]],['impact',[200,1]],['crunch',[200]],['grunt',['taxman',200]],['honk',[200]],['coin',[200]],['stamp',[200]],['shock',[250]],['impact',[180,1]],['crunch',[180]]];let t=2;for(const[n,a]of seq){SCHED=t;SFX[n](...a);t+=.55;}SCHED=0;DEMO=0;}
 MUS.int=i0;const buf=await oc.startRendering();[BUS,AC,voices]=keep;RENDER=0;
 const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length,ab=new ArrayBuffer(44+n*4),dv=new DataView(ab);const ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
 ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
 let pk=0;for(let i=0;i<n;i++){pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}
 let b='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)b+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return{b64:btoa(b),peak:pk};}
