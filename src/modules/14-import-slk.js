/* ============================ IMPORT SLK (SYLK Pléiades) ============================ */
function cleanName(name,partie){ let n=String(name==null?'':name); partie=String(partie==null?'':partie).trim();
  if(partie && n.indexOf(partie)===0) n=n.slice(partie.length);
  n=n.replace(/^[\s\-]+/,'').replace(/_/g,' ').trim(); return n||String(name||''); }
function toNum(v){ if(typeof v==='number')return v; if(v==null)return 0;
  const x=parseFloat(String(v).replace(',','.')); return isNaN(x)?0:x; }
function parseSLK(buf){
  const text=new TextDecoder('windows-1252').decode(buf);
  const lines=text.split(/\r?\n/); const grid={}; let cx=null,cy=null,maxY=0,maxX=0;
  for(const ln of lines){
    if(ln[0]!=='C' || ln[1]!==';') continue;
    const fields=ln.split(';'); let x=null,y=null,val,hasK=false;
    for(let i=1;i<fields.length;i++){ const f=fields[i]; if(!f) continue;
      const tag=f[0], rest=f.slice(1);
      if(tag==='X') x=parseInt(rest,10); else if(tag==='Y') y=parseInt(rest,10);
      else if(tag==='K'){ hasK=true; let raw=fields.slice(i).join(';').slice(1).trim();
        if(raw[0]==='"') val=raw.replace(/^"|"$/g,'').replace(/""/g,'"');
        else { const num=parseFloat(raw); val=isNaN(num)?raw:num; } break; } }
    if(x!=null)cx=x; if(y!=null)cy=y;
    if(hasK && cx!=null && cy!=null){ grid[cy+'|'+cx]=val; if(cy>maxY)maxY=cy; if(cx>maxX)maxX=cx; } }
  const get=(y,x)=>grid[y+'|'+x];
  let hy=null;
  for(let y=1;y<=maxY && hy===null;y++){ let hasP=false,hasC=false;
    for(let x=1;x<=maxX;x++){ const v=get(y,x);
      if(typeof v==='string'){ const t=v.trim(); if(/^pi[eè]ces?$/i.test(t))hasP=true; if(/consigne/i.test(t))hasC=true; } }
    if(hasP&&hasC) hy=y; }
  if(hy===null) throw new Error("tableau 'Bilan des déperditions par pièce' introuvable.");
  const col={};
  for(let x=1;x<=maxX;x++){ const v=get(hy,x); if(typeof v!=='string')continue; const t=v.trim();
    if(/^partie$/i.test(t))col.partie=x; else if(/^pi[eè]ces?$/i.test(t))col.piece=x;
    else if(/consigne/i.test(t))col.Ti=x; else if(/^surface/i.test(t))col.surf=x;
    else if(/^d[eé]perditions$/i.test(t))col.dep=x; else if(/^total$/i.test(t))col.total=x; }
  if(col.piece==null) throw new Error("colonne 'Pièce' introuvable.");
  const rooms=[]; let blanks=0;
  // Titre d'une section suivante (Bilan des debits, Parois deperditives...) : marque la FIN du
  // tableau "Puissance par piece". Pleiades ecrit cet intitule dans la colonne Partie (X1),
  // c'est pourquoi on teste Partie ET Piece (sinon on continuait a lire les tableaux annexes,
  // d'ou des pieces en double avec 0 W - un debit d'infiltration lu comme une consigne).
  const isTitle=s=>/^(bilan|parois|puissance|d[eé]perditions?|total\b)/i.test(String(s==null?'':s).trim());
  for(let y=hy+1;y<=maxY;y++){
    const piece=get(y,col.piece), partie=col.partie?get(y,col.partie):'';
    const eP=(piece==null||piece===''), eA=(partie==null||partie==='');
    if(isTitle(piece) || isTitle(partie)) break;
    // Une ligne vide isolee ne stoppe PLUS l'import (Pleiades intercale parfois des lignes vides
    // entre logements) : on tolere les trous et on ne stoppe qu'apres une longue serie de lignes vides.
    if(eP&&eA){ if(++blanks>=8) break; continue; }
    blanks=0; if(eP) continue;
    const Ti=col.Ti?Math.round(toNum(get(y,col.Ti))):20; if(!(Ti>=5&&Ti<=40)) continue;
    const surf=col.surf?Math.round(toNum(get(y,col.surf))*100)/100:0;
    const dep=col.dep?Math.round(toNum(get(y,col.dep))):0;
    const total=col.total?Math.round(toNum(get(y,col.total))):dep;
    // Garde-fou : une "piece" sans surface ET sans puissance n'est pas un emetteur reel
    // (residu d'un tableau annexe) - on l'ignore.
    if(surf<=0 && (total||dep)<=0) continue;
    rooms.push({apt:String(partie||'').trim(),piece:cleanName(piece,partie),Ti,surf,dep,total:total||dep}); }
  if(!rooms.length) throw new Error("aucune pièce exploitable trouvée.");
  return rooms;
}
// Ajout CUMULATIF : les pieces d'un .slk (= un batiment) s'ajoutent au projet courant.
function appendSlk(name,rooms){ normalizeRooms(rooms,name); ROOMS.push(...rooms);
  if(!PROJECT_NAME) PROJECT_NAME=name; }
function handleFiles(files){
  files=[...(files||[])]; if(!files.length) return;
  const jsons=files.filter(f=>/\.json$/i.test(f.name));
  const slk=files.filter(f=>/\.slk$/i.test(f.name));
  if(jsons.length){                                        // un projet .json remplace le projet courant
    if(jsons.length>1){ msg("Un seul projet .json peut être ouvert à la fois.",'ko'); return; }
    if(slk.length) msg("Fichiers .slk ignorés : un projet .json a été ouvert (ne mélangez pas .json et .slk dans un même dépôt).",'ko');
    handleJson(jsons[0]); return;
  }
  if(!slk.length){ msg("Format non reconnu : .slk (déperditions Pléiades) ou .json (projet).",'ko'); return; }
  Promise.all(slk.map(f=>f.arrayBuffer()
    .then(buf=>{ try{ return {name:f.name.replace(/\.slk$/i,''), rooms:parseSLK(buf)}; }
                 catch(e){ return {name:f.name, err:e.message}; } })
    .catch(e=>({name:f.name, err:'lecture impossible ('+e.message+')'}))))
  .then(results=>{
    let added=0; const errs=[];
    results.forEach(r=>{ if(r.err){ errs.push(`${r.name} : ${r.err}`); return; }
      appendSlk(r.name, r.rooms); added+=r.rooms.length; });
    fileHandle=null; $('projName').value=PROJECT_NAME; persist(); render();
    const nbBat=new Set(ROOMS.map(x=>x.bat||'')).size;
    if(added){ msg(`${added} pièces ajoutées (${nbBat} bâtiment(s), ${ROOMS.length} pièces au total).`+(errs.length?' Erreurs : '+errs.join(' ; '):''), errs.length?'ko':'ok'); showView('pieces'); }
    else msg('Aucune pièce importée. '+errs.join(' ; '),'ko');
  });
}
function handleFile(file){ handleFiles(file?[file]:[]); }
function msg(t,kind){ const el=$('importMsg'); el.textContent=t;
  el.style.color=kind==='ko'?'var(--ko)':(kind==='ok'?'var(--ok)':'var(--muted)'); }

