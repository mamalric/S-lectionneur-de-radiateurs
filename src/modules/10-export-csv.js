/* ============================ EXPORT CSV ============================ */
function exportCSV(){
  const S=readSettings(); _effCache=new Map(); const sep=';';
  const missReg = ROOMS.some(r=>{ const e=eff(S,r); return !e.fixed && !(roomTe(S,r)>0 && roomTs(S,r)>0); });
  if(missReg){ showView('dim'); msg("Saisissez le régime d'eau (radiateur et/ou sèche-serviette) avant d'exporter : des émetteurs à eau ne sont pas dimensionnés.",'ko'); return; }
  // Quotage RFC 4180 + neutralisation de l'injection de formule (=, +, -, @) sur les cellules texte.
  const q=v=>{ v=String(v==null?'':v);
    if(/^[=+\-@\t\r]/.test(v) && !/^-?[\d.,\s-]*$/.test(v)) v="'"+v;
    return /[;"\n\r]/.test(v)? '"'+v.replace(/"/g,'""')+'"' : v; };
  const row=arr=>arr.map(q).join(sep)+'\n';
  let out=row(['Projet', PROJECT_NAME||'(sans nom)']);
  out+=row(['Radiateur', radModelName(S), radEnergyLabel(S), isElec(S)?'':('régime '+S.radTe+'/'+S.radTs), 'tolérance', S.radTolMin+'% à '+S.radTolMax+'%']);
  out+=row(['Sèche-serviette', (ssProduct(S)?ssProduct(S).name:''), 'Énergie '+(SS_LABEL[S.ssEnergy]||''), S.ssEnergy==='elec'?'':('régime '+S.ssTe+'/'+S.ssTs), 'tolérance', S.ssTolMin+'% à '+S.ssTolMax+'%'])+'\n';
  out+=row(['Bâtiment','Logement','Pièce','Ti','Surface m²','P requise W','Nb','DT K','Nature','Hauteur mm','Larg/Long mm','P émise W','Couverture %','Code Finimetal']);
  ROOMS.forEach((r)=>{ const e=eff(S,r);
    const dt = e.fixed? NaN : dtOf(roomTe(S,r),roomTs(S,r),e.Ti);
    const cov=e.Q>0?e.total/e.Q*100:0;
    const nature = e.item ? (e.bath? ('Sèche-serviette '+(SS_SHORT[e.energy]||'')) : ('Radiateur '+(e.fixed?'élec.':'eau')))
                          : ('Panneau '+e.type+mdl(S).code);
    const haut = e.height!=null? e.height : '-';
    const larg = e.length!=null? e.length : '-';
    const code = e.item ? itemDesig(e)+(e.code?' ('+e.code+')':'') : designation(S,e.type,e.height,e.length);
    out+=row([r.bat||'',r.apt,r.piece,e.Ti,nf1.format(r.surf||0),Math.round(e.Q),e.N,(isFinite(dt)&&dt>0)?nf1.format(dt):'-',
      nature,haut,larg,Math.round(e.total),Math.round(cov),code]); });
  const blob=new Blob(['\uFEFF'+out],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='Bordereau_radiateurs_'+slug(PROJECT_NAME)+'.csv'; a.click();
}
function slug(s){ return (s||'projet').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)||'projet'; }

