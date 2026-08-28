/* ============================ RENDU ============================ */
function render(){
  const S=readSettings(); _effCache=new Map(); schedulePersist(); renderLive(S); updateModelLinks(S);
  let html='<thead><tr>'+
    '<th class="l">Logement</th><th class="l">Pièce</th><th>Émetteur</th><th>Ti<br>°C</th><th>Surf.<br>m²</th>'+
    '<th>P requise<br>W</th><th>Nb</th><th>DT<br>K</th>'+
    '<th>Type</th><th>Haut.<br>mm</th><th>Long.<br>mm</th>'+
    '<th>P émise<br>W</th><th>Couv.<br>%</th><th class="noprint"></th></tr></thead><tbody>';
  if(!ROOMS.length){
    html+='<tr><td class="empty" colspan="14">Aucun projet chargé. Importez un fichier .slk (déperditions Pléiades) '+
      'ou ouvrez un projet .json.</td></tr></tbody>';
    $('tbl').innerHTML=html; renderSynth(S); renderBordereau(S); renderProjInfo(); renderRoomMgmt(); updateRegimeState(false); return;
  }
  // Ordre d'affichage groupe par (batiment, logement), stable : evite les sous-totaux dupliques
  // quand les pieces d'un meme logement ne sont pas contigues dans ROOMS.
  const disp = ROOMS.map((r,i)=>({r,i})).sort((a,b)=>{
    const ba=a.r.bat||'', bb=b.r.bat||''; if(ba!==bb) return ba<bb?-1:1;
    const pa=a.r.apt||'', pb=b.r.apt||''; if(pa!==pb) return pa<pb?-1:1;
    return a.i-b.i; }).map(x=>x.r);
  let curApt=null, aptReq=0, aptEmit=0, needRegimeAny=false;
  const flush=()=>{ if(curApt!==null){
    html+=`<tr class="sub"><td colspan="5" class="l">Sous-total ${esc(curApt)}</td>`+
          `<td>${nf.format(Math.round(aptReq))}</td><td colspan="5"></td>`+
          `<td>${nf.format(Math.round(aptEmit))}</td><td></td><td class="noprint"></td></tr>`; } };
  const multiBat = new Set(ROOMS.map(r=>r.bat||'')).size>1;
  disp.forEach((r)=>{
    const aptLabel = (multiBat && r.bat? r.bat+' - ' : '')+(r.apt||'(sans logement)');
    if(aptLabel!==curApt){ flush(); curApt=aptLabel; aptReq=0;aptEmit=0;
      html+=`<tr class="apt"><td colspan="14">${esc(aptLabel)}</td></tr>`; }
    const bath=isTowel(r);
    const e=eff(S,r);
    const regTe=roomTe(S,r), regTs=roomTs(S,r), regMissRow=!(regTe>0 && regTs>0);
    if(!e.fixed && regMissRow) needRegimeAny=true;   // fixe (electrique) -> pas de regime ; eau/mixte -> requis
    const noReg = !e.fixed && regMissRow;
    const dt = e.fixed ? NaN : dtOf(regTe,regTs,e.Ti);
    const tMin=bath?S.ssTolMin:S.radTolMin, tMax=bath?S.ssTolMax:S.radTolMax;
    const qmin=e.Q*(1+tMin/100), qmax=e.Q*(1+tMax/100);
    const cov=e.Q>0? e.total/e.Q*100:0;
    let cls='cov-ok',warn='';
    if(!noReg){ if(e.total<qmin-0.5){ cls='cov-ko'; warn=' !'; } else if(e.total>qmax+0.5){ cls='cov-hi'; } }
    aptReq+=e.Q; aptEmit+=e.total;
    const id=r.id;
    const midCells = bath
      ? `<td title="Sèche-serviette (${SS_LABEL[e.energy]||''})">${SS_SHORT[e.energy]||'SS'}</td><td>${e.height||'-'}</td><td>${selItem(id,e,S)}</td>`
      : e.item
      ? `<td title="Radiateur ${e.fixed?'électrique':'eau'}">${e.fixed?'Élec':'Eau'}</td><td>${e.height||'-'}</td><td>${selItem(id,e,S)}</td>`
      : `<td>${selType(id,e,S)}</td><td>${selHeight(id,e,S)}</td><td>${selLen(id,e,S)}</td>`;
    html+=`<tr>`+
      `<td class="l">${esc(r.apt)}</td><td class="l">${esc(r.piece)}${e.manual?' <span class="manflag" title="Choix manuel">*</span>':''}</td>`+
      `<td>${bath?`<span class="emlab em-ss">${ico('seche_serviette',12)}SS</span>`:`<span class="emlab em-rad">${ico('radiateur',12)}RAD</span>`}</td>`+
      `<td>${e.Ti}</td>`+
      `<td>${nf1.format(r.surf||0)}</td>`+
      `<td><b>${nf.format(Math.round(e.Q))}</b></td>`+
      `<td>${selN(id,e)}</td>`+
      `<td>${isFinite(dt)&&dt>0?nf1.format(dt):'-'}</td>`+
      midCells+
      `<td class="rad">${noReg?'-':nf.format(Math.round(e.total))}</td>`+
      `<td class="${cls}">${noReg?'-':nf.format(Math.round(cov))+warn}</td>`+
      `<td class="noprint">${e.manual?`<button class="btn sec mini" title="Revenir à la sélection automatique" onclick="clearOv(${id})">Auto</button>`:''}</td>`+
      `</tr>`;
  });
  flush(); html+='</tbody>';
  $('tbl').innerHTML=html;
  updateRegimeState(needRegimeAny);
  renderSynth(S); renderBordereau(S); renderProjInfo(); renderRoomMgmt();
}
function updateRegimeState(blocked){
  ['btnCsv','btnPrint'].forEach(id=>{ const b=$(id); if(!b) return;
    b.disabled=blocked; b.style.opacity=blocked?'0.5':''; b.style.cursor=blocked?'not-allowed':''; });
  const w=$('regimeWarn'); if(w) w.style.display=blocked?'':'none';
}
function attr(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
let rmSort={col:'',dir:1};
function rmSortBy(col){ if(rmSort.col===col) rmSort.dir=-rmSort.dir; else { rmSort.col=col; rmSort.dir=1; } renderRoomMgmt(); }
function rmReset(){ $('rmSearch').value=''; $('rmBat').value=''; $('rmEm').value=''; rmSort={col:'',dir:1}; renderRoomMgmt(); }
function renderRoomMgmt(){
  const S=readSettings();
  const tc=$('tabCountPieces'); if(tc){ tc.textContent=ROOMS.length||''; tc.style.display=ROOMS.length?'':'none'; }
  // Options de filtre par batiment (on preserve la selection courante)
  const bats=[...new Set(ROOMS.map(r=>r.bat||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const selBat=$('rmBat'), curBat=selBat.value;
  selBat.innerHTML='<option value="">Tous les bâtiments</option>'+bats.map(b=>`<option value="${attr(b)}">${esc(b)}</option>`).join('');
  selBat.value = bats.includes(curBat)? curBat : '';
  const q=(($('rmSearch').value)||'').trim().toLowerCase(), fbat=selBat.value, fem=$('rmEm').value;
  // Filtrage
  let disp=ROOMS.filter(r=>{
    if(fbat && (r.bat||'')!==fbat) return false;
    const tw=isTowel(r);
    if(fem==='ss' && !tw) return false;
    if(fem==='rad' && tw) return false;
    if(q){ const hay=`${r.bat||''} ${r.apt||''} ${r.piece||''}`.toLowerCase(); if(hay.indexOf(q)<0) return false; }
    return true;
  });
  // Tri
  if(rmSort.col){ const c=rmSort.col, d=rmSort.dir;
    const key=r=> c==='Ti'?(+r.Ti||0) : c==='surf'?(+r.surf||0) : c==='req'?reqOf(S,r) : c==='em'?(isTowel(r)?1:0) : String(r[c]||'').toLowerCase();
    disp=disp.slice().sort((a,b)=>{ const ka=key(a),kb=key(b); if(ka<kb) return -d; if(ka>kb) return d; return a.id-b.id; });
  }
  const cnt=$('rmCount'); if(cnt) cnt.textContent = ROOMS.length? (disp.length===ROOMS.length? `${ROOMS.length} pièce(s)` : `${disp.length} / ${ROOMS.length} pièce(s)`) : '';
  const th=(label,col,cls='')=>`<th class="${cls}${cls?' ':''}sortable${rmSort.col===col?(rmSort.dir>0?' sort-asc':' sort-desc'):''}" onclick="rmSortBy('${col}')">${label}</th>`;
  let html='<thead><tr>'+th('Bâtiment','bat','l')+th('Logement','apt','l')+th('Pièce','piece','l')+
    th('Ti °C','Ti')+th('Surf. m²','surf')+th('P requise W','req')+th('Émetteur','em')+'<th class="noprint"></th></tr></thead><tbody>';
  if(!ROOMS.length){ html+='<tr><td class="empty" colspan="8">Aucune pièce. Importez un ou plusieurs fichiers .slk.</td></tr></tbody>'; $('roomTbl').innerHTML=html; return; }
  if(!disp.length){ html+='<tr><td class="empty" colspan="8">Aucune pièce ne correspond au filtre.</td></tr></tbody>'; $('roomTbl').innerHTML=html; return; }
  disp.forEach(r=>{
    const em=r.emitter||'auto', autoss=isBath(r);
    html+='<tr>'+
      `<td class="l">${esc(r.bat||'')}</td>`+
      `<td class="l">${esc(r.apt||'')}</td>`+
      `<td class="l"><input type="text" style="width:160px" value="${attr(r.piece)}" onchange="setPiece(${r.id},this.value)"></td>`+
      `<td>${r.Ti}</td><td>${nf1.format(r.surf||0)}</td><td>${nf.format(reqOf(S,r))}</td>`+
      `<td><span class="emlab ${isTowel(r)?'em-ss':'em-rad'}" style="margin-right:6px">`+`${ico(isTowel(r)?'seche_serviette':'radiateur',12)}${isTowel(r)?'SS':'RAD'}</span>`+
      `<select class="cell" style="max-width:140px" onchange="setEmitter(${r.id},this.value)">`+
        `<option value="auto" ${em==='auto'?'selected':''}>Auto (${autoss?'sèche-serviette':'radiateur'})</option>`+
        `<option value="panneau" ${em==='panneau'?'selected':''}>Radiateur panneau</option>`+
        `<option value="ss" ${em==='ss'?'selected':''}>Sèche-serviette</option>`+
      `</select></td>`+
      `<td class="noprint"><button class="btn sec mini" onclick="delRoom(${r.id})">Suppr.</button></td></tr>`;
  });
  $('roomTbl').innerHTML=html+'</tbody>';
}
function setPiece(id,v){ const r=ROOMS.find(x=>x.id===id); if(r){ r.piece=v; persist(); render(); } }
function setEmitter(id,v){ const r=ROOMS.find(x=>x.id===id); if(!r) return;
  const was=isTowel(r); if(v==='auto') delete r.emitter; else r.emitter=v; const now=isTowel(r);
  // On ne perd les ajustements que si la FAMILLE change (radiateur <-> seche-serviette),
  // car les overrides d'un radiateur (type/hauteur/longueur/pw) n'ont pas de sens pour un SS et inversement.
  if(was!==now) delete overrides[id];
  persist(); render(); }
function delRoom(id){ const r=ROOMS.find(x=>x.id===id); if(!r) return;
  if(!confirm(`Supprimer la pièce "${r.piece}" (${r.apt||''}) ?`)) return;
  ROOMS=ROOMS.filter(x=>x.id!==id); delete overrides[id]; persist(); render(); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function selType(i,e,S){ let o=''; for(const t of mTypes(S)) o+=`<option value="${t}" ${t===e.type?'selected':''}>${t}</option>`;
  return `<select class="cell" onchange="setOv(${i},'type',this.value)">${o}</select>`; }
function selHeight(i,e,S){ let o=''; for(const h of mHeights(S)) o+=`<option value="${h}" ${h==e.height?'selected':''}>${h}</option>`;
  return `<select class="cell" onchange="setOv(${i},'height',+this.value)">${o}</select>`; }
function selLen(i,e,S){ const lens=allLengthsFor(S,e.type,e.height); let o='';
  for(const l of lens) o+=`<option value="${l}" ${l===e.length?'selected':''}>${l}</option>`;
  return `<select class="cell" onchange="setOv(${i},'length',+this.value)">${o}</select>`; }
function selN(i,e){ let o=''; for(const n of [1,2,3,4]) o+=`<option value="${n}" ${n===e.N?'selected':''}>${n}</option>`;
  return `<select class="cell" style="max-width:46px" onchange="setOv(${i},'N',+this.value)">${o}</select>`; }

function radModelName(S){ const p=radProduct(S); return p?p.name:'(aucun)'; }
function radEnergyLabel(S){ return isElec(S)?'Radiateurs électriques':'Radiateurs eau'; }
// Liens fiches produit finimetal.com (chaque produit porte son .url, extraite du sitemap officiel).
function setLink(id,prod){ const a=$(id); if(!a) return; const u=prod&&prod.url;
  if(u){ a.href=u; a.title='Ouvrir '+prod.name+' sur finimetal.com'; a.style.display=''; }
  else { a.style.display='none'; a.removeAttribute('href'); } }
function updateModelLinks(S){ setLink('modelLink', radProduct(S)); setLink('ssModelLink', ssProduct(S)); }
function renderLive(S){
  const radReg = (S.radTe>0 && S.radTs>0)? `${S.radTe}/${S.radTs} °C` : '<span style="color:var(--haute)">non saisi</span>';
  const ssReg = (S.ssTe>0 && S.ssTs>0)? `${S.ssTe}/${S.ssTs} °C` : '<span style="color:var(--haute)">non saisi</span>';
  const ssP=ssProduct(S), ssFixed=(S.ssEnergy==='elec');
  const parts=[
    `<b style="color:var(--primaire-encre)">${ico(isElec(S)?'electrique':'eau',14)} Radiateurs ${isElec(S)?'électriques':'eau'}</b> : ${esc(radModelName(S))}`+(isElec(S)?'':` - régime <b>${radReg}</b>`),
    `<b style="color:var(--moyenne)">${ico('seche_serviette',14)} Sèche-serviettes ${SS_LABEL[S.ssEnergy]||''}</b> : ${esc(ssP?ssP.name:'(aucun)')}`+(ssFixed?'':` - régime <b>${ssReg}</b>`)
  ];
  $('liveBox').innerHTML = parts.map(p=>`<div>${p}</div>`).join('');
}
function renderSynth(S){
  let req=0,emit=0,N=0,ko=0,nSS=0,nElec=0,nMan=0;
  ROOMS.forEach((r)=>{ const e=eff(S,r); req+=e.Q; emit+=e.total; N+=e.N;
    if(e.bath) nSS+=e.N; else if(e.fixed) nElec+=e.N;
    if(e.manual) nMan++;
    const tMin=e.bath?S.ssTolMin:S.radTolMin;
    if(e.total < e.Q*(1+tMin/100)-0.5) ko++; });
  const cov=req>0? emit/req*100:0, nPan=N-nSS-nElec;
  const parts=[];
  if(nPan) parts.push(`${nPan} radiateur(s) eau`);
  if(nElec) parts.push(`${nElec} radiateur(s) élec`);
  if(nSS) parts.push(`${nSS} sèche-serviette(s)`);
  $('synth').innerHTML=
    card('Puissance requise', nf.format(Math.round(req)), 'W ('+nf1.format(req/1000)+' kW)', '', 'puissance')+
    card('Puissance émise', nf.format(Math.round(emit)), 'W', '', 'radiateur')+
    card('Couverture globale', ROOMS.length?nf1.format(cov):'-', '%', '', 'synthese')+
    card('Nombre d\'émetteurs', N, parts.join(' + ')||'-', '', 'types')+
    card('Pièces en choix manuel', nMan, nMan?'ajustées à la main':'aucune', nMan?'var(--moyenne)':'', 'crayon')+
    card('Pièces hors tolérance', ko, ko?'à revoir':'OK', ko?'var(--haute)':'var(--ok)', ko?'attention':'coche_cercle');
}
function card(k,v,u,color,icone){ return `<div class="card"><div class="k">${icone?ico(icone,13):''}${k}</div>`+
  `<div class="v" ${color?`style="color:${color}"`:''}>${v}</div><div class="u">${u}</div></div>`; }
function renderBordereau(S){
  const pan={}, it={};
  // Ti dans la cle des emetteurs a eau (puissance depend du regime) ; les fixes (electriques) non.
  ROOMS.forEach((r)=>{ const e=eff(S,r);
    if(e.item){ if(!e.prod) return; const k=e.prod.key+'|'+e.idx+(e.fixed?'':'|'+e.Ti);
      if(!it[k]) it[k]={e,qty:0}; it[k].qty+=e.N; }
    else { const k=`${e.type}|${e.height}|${e.length}|${e.Ti}`;
      if(!pan[k]) pan[k]={type:e.type,height:e.height,length:e.length,qty:0,unit:e.unit}; pan[k].qty+=e.N; } });
  const prows=Object.values(pan).sort((a,b)=>typeRank(S,a.type)-typeRank(S,b.type)||a.height-b.height||a.length-b.length);
  const irows=Object.values(it).sort((a,b)=>(a.e.bath?1:0)-(b.e.bath?1:0)||a.e.prod.name.localeCompare(b.e.prod.name)||(a.e.height||0)-(b.e.height||0));
  let html='<thead><tr><th>Nature</th><th>Hauteur (mm)</th><th title="Longueur pour les radiateurs, largeur pour les sèche-serviettes">Long. rad. / larg. SS (mm)</th>'+
    '<th>P unit. émise (W)</th><th>Quantité</th><th>Code / désignation Finimetal</th></tr></thead><tbody>';
  if(!prows.length && !irows.length){ html+='<tr><td class="empty" colspan="6">Aucun émetteur.</td></tr></tbody>'; $('bordereau').innerHTML=html; return; }
  let tot=0;
  prows.forEach(x=>{ tot+=x.qty;
    html+=`<tr><td>Panneau ${x.type}${mdl(S).code}</td><td>${x.height}</td><td>${x.length}</td>`+
      `<td>${nf.format(Math.round(x.unit))}</td><td><b>${x.qty}</b></td>`+
      `<td class="l">${esc(designation(S,x.type,x.height,x.length))}</td></tr>`; });
  irows.forEach(o=>{ const e=o.e; tot+=o.qty;
    const nature = e.bath? ('Sèche-serviette '+(SS_SHORT[e.energy]||'')) : ('Radiateur '+(e.fixed?'élec.':'eau'));
    html+=`<tr><td>${nature}</td><td>${e.height||'-'}</td><td>${e.length||'-'}</td>`+
      `<td>${nf.format(Math.round(e.unit))}</td><td><b>${o.qty}</b></td>`+
      `<td class="l">${esc(itemDesig(e))}${e.code?' ('+esc(e.code)+')':''}</td></tr>`; });
  html+=`<tr class="sub"><td colspan="4" class="l">Total émetteurs</td><td><b>${tot}</b></td><td></td></tr></tbody>`;
  $('bordereau').innerHTML=html;
}

