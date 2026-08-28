/* ============================ CATALOGUE UI ============================ */
function renderItemCatalog(prod){
  const items=flatItems(prod);
  let html='<thead><tr><th>Hauteur mm</th><th>Long. mm</th><th>P à DT50 W</th><th>n (Pente)</th><th>Code article</th></tr></thead><tbody>';
  if(!items.length){ html+='<tr><td class="empty" colspan="5">Aucune référence.</td></tr>'; }
  else items.forEach(it=>{ html+=`<tr><td>${it.h||'-'}</td><td>${it.l||'-'}</td><td><b>${nf.format(it.p)}</b></td><td>${it.n==null?'fixe':String(it.n).replace('.',',')}</td><td class="l">${esc(it.c||'')}</td></tr>`; });
  $('catTbl').innerHTML=html+'</tbody>';
}
function renderCatalog(){
  const S=readSettings();
  if(!isPerMeter(S)){ renderItemCatalog(radProduct(S)); return; }
  const m=mdl(S);
  let html='<thead><tr><th>Type</th><th>Grandeur</th>';
  m.heights.forEach(h=>html+=`<th>H ${h}</th>`); html+='</tr></thead><tbody>';
  (m.types||TYPE_ORDER).forEach(t=>{
    html+=`<tr><td rowspan="2"><b>${t}${m.code}</b></td><td class="l">W/m à DT50</td>`;
    m.Wm[t].forEach(v=>html+=`<td>${v==null?'-':v}</td>`);
    html+='</tr><tr><td class="l">n (Pente)</td>';
    m.n[t].forEach(v=>html+=`<td>${v==null?'-':String(v).replace('.', ',')}</td>`);
    html+='</tr>';
  });
  $('catTbl').innerHTML=html+'</tbody>';
}

