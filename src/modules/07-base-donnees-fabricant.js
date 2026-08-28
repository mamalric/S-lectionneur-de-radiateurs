/* ============================ BASE DE DONNEES FABRICANT (lecture seule) ============================ */
const DB_CAT_LABEL={rad_eau:'Radiateurs eau',rad_elec:'Radiateurs électriques',
  ss_eau:'Sèche-serviettes eau',ss_elec:'Sèche-serviettes électriques',ss_mixte:'Sèche-serviettes mixtes'};
const DB_KIND_LABEL={perMeter:'Puissance linéaire (W/m à DT50 + n)',absolute:'Puissance par pièce (W à DT50 + n)',
  perSection:'Puissance par section (W/section à DT50 + n)',capacity:'Puissance électrique fixe (W)',ulowE:'Ulow-E (basse température)'};
let _dbCur=[];
// Base de donnees : selection en 2 etapes -> forme (radiateur/SS) puis energie (eau/elec pour rad ; eau/elec/mixte pour SS).
function dbEnergiesFor(forme){ return forme==='rad'? [['eau','Eau chaude'],['elec','Électrique']] : [['eau','Eau chaude'],['elec','Électrique'],['mixte','Mixte']]; }
function initDb(){ if(typeof CATALOG==='undefined'||!$('dbForme')) return; dbPickForme(); }
function dbPickForme(){
  const forme=$('dbForme').value;
  const ens=dbEnergiesFor(forme).filter(([e])=>(CATALOG[forme+'_'+e]||[]).length);
  $('dbEnergie').innerHTML=ens.map(([e,lbl])=>`<option value="${e}">${lbl} (${CATALOG[forme+'_'+e].length})</option>`).join('');
  dbPickCat();
}
function dbPickCat(){
  const g=$('dbForme').value+'_'+$('dbEnergie').value;
  const prods=(CATALOG[g]||[]).slice().sort((a,b)=>a.name.localeCompare(b.name));
  _dbCur=prods;
  $('dbModel').innerHTML=prods.map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join('');
  $('dbSearch').value=''; renderDbTable();
}
let _dbT=null;
function dbSearchInput(){ if(_dbT) clearTimeout(_dbT); _dbT=setTimeout(()=>{ _dbT=null; renderDbTable(); }, 160); }
function renderDbTable(){
  const prods=_dbCur||[]; const p=prods[+$('dbModel').value||0];
  setLink('dbLink', p);
  if(!p){ $('dbTbl').innerHTML=''; $('dbInfo').textContent=''; return; }
  const q=($('dbSearch').value||'').trim().toLowerCase();
  const any=f=>p.groups.some(g=>g.items.some(f));
  const gLabel=t=>(t&&t!=='ungrouped')?t:'';
  const hasType=p.groups.some(g=>gLabel(g.t)), hasL=any(it=>it.l!=null), hasW=any(it=>it.w!=null),
        hasN=any(it=>it.n!=null), hasD=any(it=>it.d!=null), hasC=any(it=>it.c);
  const elec=(p.kind==='capacity');
  const cols=[]; if(hasType)cols.push('Type'); cols.push('Hauteur mm'); if(hasL)cols.push('Longueur mm');
  if(hasW)cols.push(p.kind==='perSection'?'W/section':'W/m DT50');
  cols.push(elec?'Puissance W':'P à DT50 W'); if(hasN)cols.push('n'); if(hasD)cols.push('Prof. mm'); if(hasC)cols.push('Code');
  let html='<thead><tr>'+cols.map(x=>`<th>${x}</th>`).join('')+'</tr></thead><tbody>'; let nr=0;
  p.groups.forEach(g=>g.items.forEach(it=>{
    if(q){ const hay=`${gLabel(g.t)} ${it.h||''} ${it.l||''} ${it.c||''}`.toLowerCase(); if(hay.indexOf(q)<0) return; }
    let td=''; if(hasType)td+=`<td>${esc(gLabel(g.t))}</td>`; td+=`<td>${it.h==null?'':it.h}</td>`;
    if(hasL)td+=`<td>${it.l==null?'':it.l}</td>`;
    if(hasW)td+=`<td>${it.w==null?'':String(it.w).replace('.',',')}</td>`;
    td+=`<td>${it.p==null?'':it.p}</td>`;
    if(hasN)td+=`<td>${it.n==null?'':String(it.n).replace('.',',')}</td>`;
    if(hasD)td+=`<td>${it.d==null?'':it.d}</td>`;
    if(hasC)td+=`<td>${esc(it.c||'')}</td>`;
    html+='<tr>'+td+'</tr>'; nr++;
  }));
  if(!nr) html+='<tr><td class="empty" colspan="'+cols.length+'">Aucune référence ne correspond au filtre.</td></tr>';
  $('dbTbl').innerHTML=html+'</tbody>';
  $('dbInfo').textContent=`${DB_KIND_LABEL[p.kind]||p.kind} - ${nr} référence(s)`;
}

