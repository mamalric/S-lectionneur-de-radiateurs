/* ============================ ETAT GLOBAL ============================ */
let ROOMS   = [];        // {id, bat, apt, piece, Ti, surf, dep, total, emitter?}
let PROJECT_NAME = "";
let overrides = {};      // { roomId : {type,height,length,N,ss} }
let fileHandle = null;
let ROOM_SEQ = 1;
function nextId(){ return ROOM_SEQ++; }
// Assure id + bat pour chaque piece ; ROOM_SEQ au-dela du max existant.
function normalizeRooms(rooms, bat){
  let mx=0; rooms.forEach(r=>{ if(typeof r.id==='number' && r.id>mx) mx=r.id; });
  if(mx>=ROOM_SEQ) ROOM_SEQ=mx+1;
  rooms.forEach(r=>{ if(typeof r.id!=='number') r.id=nextId(); if(bat!=null && r.bat==null) r.bat=bat; });
  return rooms;
}

const $ = id => document.getElementById(id);
// Formatage FR "maison" : separateur de milliers = ESPACE NORMALE (U+0020), virgule decimale.
// (Intl.NumberFormat('fr-FR') injecte U+202F, espace fine insecable, interdite par la regle typographique.)
function fmtNum(n, dec){
  if(n==null || isNaN(n)) return '';
  const neg = n<0; let s = Math.abs(+n).toFixed(dec);
  if(dec>0) s = s.replace(/\.?0+$/,'');            // maximumFractionDigits : on enleve les zeros superflus
  let p = s.split('.'); let ent = p[0], frac = p[1];
  ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // espace normale U+0020
  return (neg?'-':'') + ent + (frac? (','+frac) : '');
}
const nf  = { format: n => fmtNum(n,0) };
const nf1 = { format: n => fmtNum(n,1) };
const pad4 = n => String(n).padStart(4,'0');

