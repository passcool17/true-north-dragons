'use strict';
// TRUE NORTH DRAGONS — table de traduction FR/EN (une seule table pour toute l'interface et l'histoire).
// Le texte source du jeu est en français ; T(s) renvoie la version anglaise quand LANG==='en'.
// Pour ajouter une traduction : ajoute une paire 'FRANÇAIS':'ENGLISH' dans STR, ou une règle dans RULES.
(function(){
let LANG='fr';
try{const s=localStorage.tndLang;if(s==='fr'||s==='en')LANG=s;else LANG=/^fr/i.test(navigator.language||'')?'fr':'en';}catch(e){LANG=/^fr/i.test(navigator.language||'')?'fr':'en';}
const STR={
 // --- difficultés / modes ---
 'NORMAL':'NORMAL','DIFFICILE':'HARD','CAUCHEMAR':'NIGHTMARE',
 'ARCADE · NORMAL':'ARCADE · NORMAL','ARCADE · DIFFICILE':'ARCADE · HARD','ARCADE · CAUCHEMAR':'ARCADE · NIGHTMARE','MODE SURVIE':'SURVIVAL MODE',
 '◀ MODE SURVIE ▶':'◀ SURVIVAL MODE ▶','◀ MODE ARCADE ▶':'◀ ARCADE MODE ▶','DIFFICULTÉ':'DIFFICULTY',
 'VAGUES INFINIES · MINI-BOSS TOUTES LES 5 VAGUES':'ENDLESS WAVES · MINI-BOSS EVERY 5 WAVES',
 '3 VIES · 4 CONTINUS':'3 LIVES · 4 CONTINUES','2 VIES · 1 CONTINU':'2 LIVES · 1 CONTINUE','1 VIE · 0 CONTINU':'1 LIFE · 0 CONTINUES',
 // --- écran titre / menus ---
 'APPUIE SUR UNE TOUCHE OU TOUCHE L\'ÉCRAN POUR LE SON 🔊':'PRESS A KEY OR TAP THE SCREEN FOR SOUND 🔊',
 'TOUCHE POUR JOUER':'TAP TO PLAY','APPUIE SUR DÉMARRER (ENTRÉE)':'PRESS START (ENTER)',
 '←→ mode · ↑↓ difficulté · , ou manette 2 = 2 JOUEURS':'←→ mode · ↑↓ difficulty · , or pad 2 = 2 PLAYERS',
 'MEILLEURS SCORES':'HIGH SCORES','DÉMARRER':'START','NOUVEAU RECORD!':'NEW HIGH SCORE!','ENTRE TES INITIALES':'ENTER YOUR INITIALS',
 '↑↓ lettre · J/ENTRÉE valider':'↑↓ letter · J/ENTER confirm',
 'touche ▲▼ pour changer · OK pour valider':'tap ▲▼ to change · OK to confirm',
 '↑↓ lettre (ou tape-la) · J / A valider · K / B retour':'↑↓ letter (or type it) · J / A confirm · K / B back',
 'PAUSE':'PAUSE','REPRENDRE':'RESUME','RECOMMENCER':'RESTART','MENU':'MENU','MUSIQUE':'MUSIC','EFFETS':'SOUND FX',
 'QUITTER PLEIN ÉCRAN':'EXIT FULL SCREEN','⛶ PLEIN ÉCRAN':'⛶ FULL SCREEN','SON COUPÉ (M)':'SOUND OFF (M)','touche un choix':'tap a choice',
 '↑↓ choisir · ←→ volume · J valider · P reprendre · T langue':'↑↓ select · ←→ volume · J confirm · P resume · T language',
 'LANGUE : FRANÇAIS':'LANGUAGE: FRENCH','LANGUE : ANGLAIS':'LANGUAGE: ENGLISH',
 'CHOISIS TON HÉROS':'CHOOSE YOUR HERO','Puissant · Blindé':'Powerful · Armoured','Rapide · Micro d\'acier':'Fast · Steel mic','Allonge · Fourche':'Long reach · Pitchfork',
 '1P PRÊT!':'1P READY!','2P PRÊT!':'2P READY!','COULEURS ALT. 2P':'2P ALT. COLOURS','FORCE':'POWER','VITESSE':'SPEED','PORTÉE':'REACH',
 'touche un héros puis DÉMARRER':'tap a hero, then START',
 '1P : A/D + J · 2P : ←→ + , (ou manettes) · K annuler':'1P: A/D + J · 2P: ←→ + , (or pads) · K cancel',
 '←→ choisir · J / ENTRÉE valider · , = ajouter 2P':'←→ choose · J / ENTER confirm · , = add 2P',
 'OK':'OK','GO':'GO','CHARGEMENT...':'LOADING...','TOUCHE POUR PASSER':'TAP TO SKIP','UNE TOUCHE POUR PASSER':'PRESS ANY KEY TO SKIP',
 'TOUCHE : suite · DOUBLE-TOUCHE : passer':'TAP: next · DOUBLE-TAP: skip','J/A : suite · ENTRÉE/START : passer':'J/A: next · ENTER/START: skip',
 'CONTINUER ?':'CONTINUE?','TOUCHE POUR CONTINUER':'TAP TO CONTINUE','PARTIE TERMINÉE':'GAME OVER',
 'BONUS TEMPS':'TIME BONUS','BONUS SANTÉ':'HEALTH BONUS','BONUS RANG':'RANK BONUS','SCORE':'SCORE','RANG':'RANK',
 'BILAN DE MISSION':'MISSION REPORT','TEMPS':'TIME','ENNEMIS VAINCUS':'ENEMIES DEFEATED','COMBO MAX':'MAX COMBO','HUARDS RAMASSÉS':'LOONIES COLLECTED','SCORE FINAL':'FINAL SCORE',
 'SANS CONTINUER':'NO CONTINUES','COMBO 30+':'30+ COMBO','TOUS LES HUARDS':'ALL THE LOONIES','CHASSE-PAPERASSE':'PAPER CHASER','MÉDAILLES':'MEDALS',
 'BONUS : DÉNEIGEMENT DES PERMIS':'BONUS: PERMIT SNOW REMOVAL','DÉTRUIS LA MACHINE À PAPERASSE !':'SMASH THE RED-TAPE MACHINE!',
 'NOUVELLE ENNEMIE :':'NEW ENEMY:','NOUVEL ENNEMI :':'NEW ENEMY:','⚠ ATTENTION ⚠':'⚠ WARNING ⚠','K.O.!':'K.O.!',
 'MANETTE DÉCONNECTÉE':'CONTROLLER DISCONNECTED','AIDE !':'HELP!','RESTE PRÈS DE MOI':'STAY CLOSE TO ME',
 'NARRATEUR':'NARRATOR',
 // --- comment jouer ---
 'COMMENT JOUER':'HOW TO PLAY','Déplacer':'Move','Coup':'Punch','Pied':'Kick','Saut':'Jump','Spécial (coûte 8 PV)':'Special (costs 8 HP)',
 'Saisir / lancer':'Grab / throw','Pause':'Pause','Langue FR/EN':'Language FR/EN','Croix':'D-pad',
 'P2 : appuie sur , pour joindre':'P2: press , to join','Manette : A saut · X coup · B pied · Y spécial · RB saisir':'Gamepad: A jump · X punch · B kick · Y special · RB grab',
 'Maintiens COUP puis relâche = coup chargé':'Hold PUNCH then release = charged punch',
 '2× direction = sprint · arrière + COUP = micro lancé':'Double-tap direction = sprint · back + PUNCH = mic throw',
 '2× direction = ruée à la fourche':'Double-tap direction = pitchfork dash',
 'Armes au sol : COUP dessus pour les ramasser':'Weapons on the ground: PUNCH them to pick up',
 'APPUIE SUR UNE TOUCHE POUR COMMENCER':'PRESS ANY KEY TO START','TOUCHE L\'ÉCRAN POUR COMMENCER':'TAP THE SCREEN TO START',
 'Coup chargé':'Charged punch','Sprint':'Sprint','Ruée':'Dash',
 'J coup · K pied · L saut · Espace spécial · U saisir · P pause · T FR/EN · Entrée démarrer · M muet':'J punch · K kick · L jump · Space special · U grab · P pause · T FR/EN · Enter start · M mute',
 // --- héros ---
 'CAMIONNEUR':'TRUCKER','REPORTER':'REPORTER','FERMIÈRE':'FARMER','LE CAMIONNEUR':'THE TRUCKER','LE REPORTER':'THE REPORTER','LA FERMIÈRE':'THE FARMER',
 'LE CAMIONNEUR · LE REPORTER':'THE TRUCKER · THE REPORTER',
 // --- ennemis ---
 'PERCEPTEUR DE TAXE CARBONE':'CARBON TAX COLLECTOR','LA GARDIENNE DES PRONOMS':'THE PRONOUN GUARDIAN','LE GARDIEN DES PRONOMS':'THE PRONOUN GUARDIAN',
 'ROBOT-CENSEUR':'CENSOR-BOT','DRONE DE SURVEILLANCE':'SURVEILLANCE DRONE','LOBBYISTE':'LOBBYIST','LA MILITANTE CLIMAT':'THE CLIMATE ACTIVIST','LE MILITANT CLIMAT':'THE CLIMATE ACTIVIST',
 'CRIEUR OFFICIEL':'OFFICIAL TOWN CRIER','LA FONCTIONNAIRE DU TÉLÉTRAVAIL':'THE WORK-FROM-HOME BUREAUCRAT','LE FONCTIONNAIRE DU TÉLÉTRAVAIL':'THE WORK-FROM-HOME BUREAUCRAT',
 'LE CONSEILLER MUNICIPAL CORROMPU':'THE CORRUPT CITY COUNCILLOR','LE MAIRE DU TRAMWAY':'THE TRAMWAY MAYOR','LA VICE-PREMIÈRE MINISTRE DES FINANCES':'THE DEPUTY PM OF FINANCE',
 'LE BANQUIER CENTRAL':'THE CENTRAL BANKER','SOUS-SOUS-MINISTRE ADJOINT':'ASSISTANT DEPUTY SUB-SUB-MINISTER','LE MÉGA-RÉGULATEUR':'THE MEGA-REGULATOR',
 'LE GRAND INSPECTEUR DES PERMIS':'THE GRAND PERMIT INSPECTOR','LE MINISTÈRE':'THE MINISTRY','AGENT SANITAIRE':'HEALTH OFFICER','INSPECTEUR DU PASSEPORT':'PASSPORT INSPECTOR',
 'LA MILITANTE AU TÉLÉPHONE':'THE PHONE-WAVING ACTIVIST','LE MILITANT AU TÉLÉPHONE':'THE PHONE-WAVING ACTIVIST','LA DOCTEURE EN CHEF':'THE CHIEF DOCTOR',
 'LE PREMIER MINISTRE SELFIE':'THE SELFIE PRIME MINISTER','LE GRAND RÉINITIALISEUR':'THE GREAT RESETTER','SOLDAT DE LA COALITION':'COALITION SOLDIER',
 'PARACHUTISTE':'PARATROOPER','MÉCHA ANTI-ÉMEUTE':'RIOT MECH','LE GÉNÉRAL APOCALYPSE':'GENERAL APOCALYPSE','LE GÉNÉRAL APOCALYPSE (À PIED)':'GENERAL APOCALYPSE (ON FOOT)','L\'ŒIL':'THE EYE',
 // --- niveaux ---
 'CONFINEMENT':'LOCKDOWN','RESTEZ CHEZ VOUS... OU PAS !':'STAY HOME... OR NOT!','OTTAWA, LA NUIT':'OTTAWA BY NIGHT','LE BUDGET EST VIDE... PAS VOS POCHES !':'THE BUDGET IS EMPTY... YOUR POCKETS AREN\'T!',
 'LA COLLINE DU PARLEMENT':'PARLIAMENT HILL','LA PLANCHE À BILLETS TOURNE À PLEIN RÉGIME':'THE MONEY PRINTER GOES BRRRR','LES CHAMPS PÉTROLIFÈRES':'THE OIL FIELDS','LE PÉTROLE COULE, LES TAXES AUSSI':'THE OIL FLOWS, AND SO DO THE TAXES',
 'QUÉBEC · LE CHANTIER DU TRAMWAY':'QUEBEC CITY · THE TRAMWAY WORKSITE','LIVRAISON PRÉVUE : UN JOUR, PEUT-ÊTRE':'EXPECTED DELIVERY: SOMEDAY, MAYBE',
 'MINISTÈRE DES NOUVELLES APPROUVÉES':'MINISTRY OF APPROVED NEWS','L\'ŒIL VOIT TOUT':'THE EYE SEES ALL','TROISIÈME GUERRE MONDIALE':'WORLD WAR III','ARRÊTEZ LE BOUTON ROUGE !':'STOP THE RED BUTTON!',
 // --- textes de combat ---
 'FOURCHE ÉMOUSSÉE':'PITCHFORK DULLED','RÉANIMÉ!':'REVIVED!','KLAXON DU CONVOI!':'CONVOY HORN!','TORNADE DE BLÉ!':'WHEAT TORNADO!','SCOOP EN DIRECT!':'LIVE SCOOP!',
 'PELLETÉE!':'SHOVELFUL!','LANCER FRAPPÉ!':'SLAP SHOT!','FOURCHE AIGUISÉE! (+10 s)':'SHARP PITCHFORK! (+10 s)','FOURCHE AIGUISÉE!':'SHARP PITCHFORK!','BÂTON DE HOCKEY!':'HOCKEY STICK!',
 'PELLE À NEIGE!':'SNOW SHOVEL!','CHAISE!':'CHAIR!','CASSÉ!':'BROKEN!','LANCER!':'THROW!','HOOONK!':'HOOONK!','FLASH!':'FLASH!','IMMUNITÉ!':'IMMUNITY!','BLOQUÉ':'BLOCKED',
 'ESQUIVE!':'DODGED!','INTERROMPU!':'INTERRUPTED!','CORRUPTION STOPPÉE!':'CORRUPTION STOPPED!','RÈGLEMENT D\'URGENCE!':'EMERGENCY REGULATION!','BOTTE DE FOIN!':'HAY BALE!',
 'TROP HAUT!':'TOO HIGH!','JONGLAGE!':'JUGGLE!','COUP CHARGÉ!':'CHARGED PUNCH!','PHASE 2: POUVOIRS D\'URGENCE!':'PHASE 2: EMERGENCY POWERS!','PHASE 3: ÉTAT D\'EXCEPTION!':'PHASE 3: STATE OF EXCEPTION!',
 'LOBBYISTES, À MOI!':'LOBBYISTS, TO ME!','LIBRE!':'FREE!','POT-DE-VIN! +DÉGÂTS':'BRIBE! +DAMAGE','LE LOBBYISTE A VOLÉ UN BONUS!':'THE LOBBYIST STOLE A BONUS!','À MOI!':'MINE!',
 'VROUM!':'VROOM!','TEMPS ÉCOULÉ!':'TIME\'S UP!','DOUBLE-DOUBLE! +35':'DOUBLE-DOUBLE! +35','SIROP D\'ÉRABLE!':'MAPLE SYRUP!','1UP!':'1UP!','BOÎTE DE BEIGNES!':'BOX OF DONUTS!',
 'PASSEPORT REQUIS!':'PASSPORT REQUIRED!','DÉNONCÉ!':'REPORTED!','VÉRIFIE TES PRIVILÈGES!':'CHECK YOUR PRIVILEGE!','PRIVILÈGE!':'PRIVILEGE!','CONTRAT':'CONTRACT',
 'CONTRAT SANS APPEL D\'OFFRES!':'NO-BID CONTRACT!','POT-DE-VIN!':'BRIBE!','PELLETÉE DE PREMIÈRE!':'FIRST SHOVELFUL!','LE TRAMWAY ARRIVE !':'THE TRAMWAY IS COMING!','DÉFICIT':'DEFICIT','DÉFICIT!':'DEFICIT!',
 'BUDGET D\'URGENCE':'EMERGENCY BUDGET','TAXE CARBONE!':'CARBON TAX!','PLUIE DE PIÈCES!':'RAINING COINS!','RESTEZ CHEZ VOUS':'STAY HOME','GEL DES COMPTES!':'ACCOUNTS FROZEN!',
 'RÉINITIALISATION':'RESET','GRANDE RÉINITIALISATION!':'GREAT RESET!','FRAPPE D\'ARTILLERIE !':'ARTILLERY STRIKE!','DÉPASSEMENT DE COÛTS !':'COST OVERRUN!','BUDGET D\'URGENCE !':'EMERGENCY BUDGET!',
 'PLANCHE À BILLETS !':'MONEY PRINTER!','NOUVELLES DIRECTIVES !':'NEW GUIDELINES!','POINT DE PRESSE!':'PRESS BRIEFING!','MESURES D\'URGENCE !':'EMERGENCY MEASURES!','SELFIE!':'SELFIE!',
 'VOUS NE POSSÉDEREZ RIEN ET SEREZ HEUREUX':'YOU WILL OWN NOTHING AND BE HAPPY','LA GRANDE RÉINITIALISATION !':'THE GREAT RESET!','PHASE 2 : PLUIE DE MISSILES !':'PHASE 2: MISSILE RAIN!',
 'PHASE 3 : ASSAUT TOTAL !':'PHASE 3: ALL-OUT ASSAULT!','SABRE!':'SABRE!','ALERTE NUCLÉAIRE ! ARRÊTEZ-LE !':'NUCLEAR ALERT! STOP HIM!','PODIUM BRISÉ!':'PODIUM SMASHED!',
 'PAS DE QUESTIONS!':'NO QUESTIONS!','BOUCLIER!':'SHIELD!','IL S\'ENFUIT VERS LE BOUTON ROUGE !':'HE\'S RUNNING FOR THE RED BUTTON!','BOUTON DÉSAMORCÉ — LA PAIX EST SAUVÉE !':'BUTTON DEFUSED — PEACE IS SAVED!',
 'ACHETÉ!':'BOUGHT!','NID-DE-POULE!':'POTHOLE!','EN RETARD... MAIS ÇA FRAPPE!':'LATE... BUT IT HITS!','DÉSINFECTÉ!':'DISINFECTED!','COMPTE GELÉ!':'ACCOUNT FROZEN!','CAFÉ CHAUD!':'HOT COFFEE!',
 'SOUPE!':'SOUP!','⚠ TRAMWAY ⚠':'⚠ TRAMWAY ⚠','TRAMWAY · EN RETARD':'TRAMWAY · RUNNING LATE','TAXE':'TAX','PRIVILÈGE':'PRIVILEGE','COLLÉE!':'GLUED!','SANTÉ':'HEALTH','ARRÊT':'STOP',
 'DÉNONCÉ':'REPORTED','DÉCOLLÉE':'UNGLUED','FOURCHE TOURNANTE!':'SPINNING PITCHFORK!','DENIED':'DENIED',
 // --- générique de fin ---
 'FIN':'THE END','LA PAIX EST SAUVÉE':'PEACE IS SAVED','LE CANADA EST LIBRE !':'CANADA IS FREE!','HÉROS :':'HEROES:','VILAINS (TOUS FICTIFS) :':'VILLAINS (ALL FICTIONAL):',
 'ET LEURS TROUPES :':'AND THEIR TROOPS:','MILITANT·E·S CLIMAT':'CLIMATE ACTIVISTS','GARDIEN·NE·S DES PRONOMS':'PRONOUN GUARDIANS','FONCTIONNAIRES DU TÉLÉTRAVAIL':'WORK-FROM-HOME BUREAUCRATS',
 'MILITANTE AU TÉLÉPHONE':'PHONE-WAVING ACTIVIST','PERCEPTEURS DE TAXE CARBONE':'CARBON TAX COLLECTORS','CONSEILLERS MUNICIPAUX CORROMPUS':'CORRUPT CITY COUNCILLORS',
 'SATIRE POLITIQUE — PERSONNAGES':'POLITICAL SATIRE — CHARACTERS','ET ÉVÉNEMENTS IMAGINAIRES.':'AND EVENTS ARE IMAGINARY.','TOUTE RESSEMBLANCE SERAIT FORTUITE.':'ANY RESEMBLANCE IS COINCIDENTAL.',
 'MERCI D\'AVOIR JOUÉ !':'THANKS FOR PLAYING!',
 // --- histoire ---
 'CANADA, 2026.\nCONFINEMENTS, PASSEPORTS, MILITANTS PARTOUT...\nBUDGETS VIDES, PLANCHE À BILLETS, INFLATION.\nPUIS LE MINISTÈRE A PRIS LE CONTRÔLE :\nTAXES, PERMIS ET CENSURE.\nÀ QUÉBEC, LE TRAMWAY N\'ARRIVE JAMAIS...\nET LA GUERRE MONDIALE GRONDE...\n\nTROIS HÉROS SE LÈVENT : LE CAMIONNEUR,\nLE REPORTER ET LA FERMIÈRE D\'ALBERTA.\n\nSEPT MISSIONS. UN SEUL CONVOI.\nTOUT COMMENCE DANS LES RUES CONFINÉES...':
 'CANADA, 2026.\nLOCKDOWNS, PASSPORTS, ACTIVISTS EVERYWHERE...\nEMPTY BUDGETS, MONEY PRINTERS, INFLATION.\nTHEN THE MINISTRY TOOK CONTROL:\nTAXES, PERMITS AND CENSORSHIP.\nIN QUEBEC CITY, THE TRAMWAY NEVER ARRIVES...\nAND A WORLD WAR IS RUMBLING...\n\nTHREE HEROES RISE: THE TRUCKER,\nTHE REPORTER AND THE ALBERTA FARMER.\n\nSEVEN MISSIONS. ONE CONVOY.\nIT ALL STARTS IN THE LOCKED-DOWN STREETS...',
 'VICTOIRE ! Le bouton rouge est brisé.\n\nLes confinements sont levés, les comptes\ndégelés, la planche à billets éteinte,\nla Coalition Globale dissoute.\nLe Canada respire enfin : la paix règne\nd\'un océan à l\'autre !\n\nLes double-doubles sont offerts !':
 'VICTORY! The red button is broken.\n\nThe lockdowns are lifted, the accounts\nunfrozen, the money printer switched off,\nthe Global Coalition dissolved.\nCanada can finally breathe: peace reigns\nfrom sea to sea!\n\nDouble-doubles are on the house!',
 'Ottawa. Les rues sont vides. Les camions, eux, sont pleins.':'Ottawa. The streets are empty. The trucks, though, are full.',
 'On me dit de rester chez nous ? Ma maison, c\'est mon camion.':'They tell me to stay home? My truck IS my home.',
 'Et moi, je filme tout. En direct. Sans autorisation préalable.':'And I\'m filming everything. Live. Without prior authorization.',
 'Militantes et militants masqués patrouillent, téléphone à la main.':'Masked activists patrol the streets, phones in hand.',
 'Moi j\'ai une fourche. Pis j\'ai pas peur de m\'en servir.':'Well, I\'ve got a pitchfork. And I ain\'t afraid to use it.',
 'Ceci n\'est qu\'un report ! Vous ne posséderez rien... même pas ma piste !':'This is merely a postponement! You will own nothing... not even my runway!',
 'Il se sauve en hélico avec nos taxes carbone dans les poches !':'He\'s escaping by chopper with our carbon taxes in his pockets!',
 'Ce soir à Ottawa, la Vice-Première ministre des Finances présente son budget. Il est vide.':'Tonight in Ottawa, the Deputy PM of Finance presents her budget. It\'s empty.',
 'Laisse-le voler. On a la route, nous.':'Let him fly. We\'ve got the road.',
 'Sur la Colline, le Banquier central fait tourner la planche à billets.':'On the Hill, the Central Banker keeps the money printer spinning.',
 'Mon sac de semences coûte le prix d\'un tracteur. Merci, l\'inflation.':'A bag of seed costs as much as a tractor. Thanks, inflation.',
 'Imprimer de l\'argent pour combattre l\'inflation ? Génial.':'Printing money to fight inflation? Brilliant.',
 'Chez nous en Alberta, le pétrole coule... et les taxes aussi.':'Back home in Alberta, the oil flows... and so do the taxes.',
 'Les militants climat se collent aux pipelines. Le Méga-Régulateur exige un permis pour chaque goutte... et chaque épi de blé.':'Climate activists are gluing themselves to pipelines. The Mega-Regulator demands a permit for every drop... and every ear of wheat.',
 'Québec. Le tramway est annoncé depuis si longtemps que les cônes orange ont pris leur retraite.':'Quebec City. The tramway was announced so long ago the orange cones have retired.',
 'Première pelletée ! Deuxième première pelletée ! Troisième première pelletée !':'First shovelful! Second first shovelful! Third first shovelful!',
 'Le budget a doublé. Les rails, eux, sont toujours dans la boîte.':'The budget has doubled. The rails are still in the box.',
 'Avec ce budget-là, j\'aurais acheté un tracteur pour chaque citoyen.':'With that budget, I could\'ve bought every citizen a tractor.',
 'La tour du Ministère. L\'Œil voit tout. Surtout ce que tu penses.':'The Ministry tower. The Eye sees everything. Especially what you think.',
 'CITOYENS : VOTRE OPINION A ÉTÉ VÉRIFIÉE... ET REFUSÉE.':'CITIZENS: YOUR OPINION HAS BEEN FACT-CHECKED... AND REJECTED.',
 'Une entrevue exclusive avec un œil géant ? J\'embarque.':'An exclusive interview with a giant eye? I\'m in.',
 'Un seul bouton et tout recommence à zéro ! HA HA HA !':'One button and everything starts over from zero! HA HA HA!',
 'Pas si on klaxonne avant toi, mon général.':'Not if we honk first, General.',
 'Dernière mission : empêcher la Troisième Guerre mondiale.':'Final mission: stop World War III.',
 // --- HTML ---
 'COUP':'PUNCH','PIED':'KICK','SAUT':'JUMP','SPÉCIAL':'SPECIAL','TOURNE TON TÉLÉPHONE':'ROTATE YOUR PHONE','Le jeu se joue à l\'horizontale':'The game is played in landscape',
 'Pour le plein écran :<br>Partager <b>⎙</b> → <b>Sur l\'écran d\'accueil</b>':'For full screen:<br>Share <b>⎙</b> → <b>Add to Home Screen</b>'
};
const ORD=n=>n+(n%10===1&&n%100!==11?'ST':n%10===2&&n%100!==12?'ND':n%10===3&&n%100!==13?'RD':'TH');
// règles pour les textes composés (nombres, noms…)
const RULES=[
 [/^NIVEAU (\d+) TERMINÉ!$/,m=>'LEVEL '+m[1]+' CLEAR!'],
 [/^NIVEAU (\d+) · (.+)$/,m=>'LEVEL '+m[1]+' · '+T(m[2])],
 [/^NIVEAU (\d+)$/,m=>'LEVEL '+m[1]],
 [/^SURVIE · VAGUE (.+)$/,m=>'SURVIVAL · WAVE '+m[1]],
 [/^SURVIE · ARÈNE (\d+)$/,m=>'SURVIVAL · ARENA '+m[1]],
 [/^VAGUE (\d+) TERMINÉE ! {2}\+(\d+) {2}· SOINS$/,m=>'WAVE '+m[1]+' CLEARED!  +'+m[2]+'  · HEALED'],
 [/^VAGUE (.+)$/,m=>'WAVE '+m[1]],
 [/^MINI-BOSS · (.+)$/,m=>'MINI-BOSS · '+T(m[1])],
 [/^(\d+) COUPS!$/,m=>m[1]+' HITS!'],
 [/^(\d+) coups$/,m=>m[1]+' hits'],
 [/^COMBO$/,()=>'COMBO'],
 [/^RECORD (\d+) {2}©2026 PASSCOOL STUDIO · SATIRE FICTIVE$/,m=>'HI-SCORE '+m[1]+'  ©2026 PASSCOOL STUDIO · FICTIONAL SATIRE'],
 [/^SCORE FINAL (\d+)$/,m=>'FINAL SCORE '+m[1]],
 [/^CRÉDITS: (\d+)$/,m=>'CREDITS: '+m[1]],
 [/^DÉTRUITE! \+(\d+)$/,m=>'DESTROYED! +'+m[1]],
 [/^LANCEMENT : (\d+)$/,m=>'LAUNCH IN: '+m[1]],
 [/^MANETTE CONNECTÉE \((\d)P\)$/,m=>'CONTROLLER CONNECTED ('+m[1]+'P)'],
 [/^([12]P) (.+?) {2}x(\d+)$/,m=>m[1]+' '+T(m[2])+'  x'+m[3]],
 [/^(\d+)(ER|E)$/,m=>ORD(+m[1])],
 [/^(.+) · (\d+)(ER|E) PLACE$/,m=>T(m[1])+' · '+ORD(+m[2])+' PLACE'],
 // décor autour d'un texte connu : « ▶ NORMAL ◀ », etc.
 [/^([\s▶◀]+)(.+?)([\s▶◀]*)$/,m=>STR[m[2]]!==undefined?m[1]+STR[m[2]]+m[3]:null],
 [/^(.+?)([\s▶◀]+)$/,m=>STR[m[1]]!==undefined?STR[m[1]]+m[2]:null]
];
const CACHE=new Map(),HAS=/[A-Za-zÀ-ÿ]/;
function T(s){if(LANG==='fr'||typeof s!=='string'||!HAS.test(s))return s;let r=CACHE.get(s);if(r!==undefined)return r;
 r=STR[s];if(r===undefined){for(const [re,f] of RULES){const m=re.exec(s);if(m){const o=f(m);if(o!=null){r=o;break;}}}}if(r===undefined)r=s;
 if(CACHE.size>4000)CACHE.clear();CACHE.set(s,r);return r;}
// petit texte choisi directement selon la langue : L('français','english')
function L(fr,en){return LANG==='en'?en:fr;}
function applyHTML(){document.documentElement.lang=LANG;document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');el.textContent=LANG==='en'?(STR[k]!==undefined?STR[k]:k):k;});}
function setLang(l){LANG=l==='en'?'en':'fr';try{localStorage.tndLang=LANG;}catch(e){}CACHE.clear();applyHTML();}
window.I18N={T,L,setLang,applyHTML,toggle(){setLang(LANG==='en'?'fr':'en');},get lang(){return LANG;},STR,RULES};
window.T=T;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyHTML);else applyHTML();
})();
