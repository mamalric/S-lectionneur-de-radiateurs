/* ============================ INFO / ENTETE ============================ */
function renderProjInfo(){ const S=readSettings(); let req=0; ROOMS.forEach((r)=>req+=reqOf(S,r));
  $('projInfo').textContent= ROOMS.length? `${ROOMS.length} pièces - ${nf1.format(req/1000)} kW requis`+(fileHandle?` - lié à ${fileHandle.name}`:'') : 'Aucun projet chargé';
  $('hdrSub').textContent= PROJECT_NAME || 'Dimensionnement sur régime unique à partir des déperditions Pléiades';
  $('hdrBadge').textContent= ROOMS.length? `${ROOMS.length} pièces`+(isElec(S)?'':` - régime ${S.radTe||'?'}/${S.radTs||'?'} °C`)+` - ${radModelName(S)}` : 'Aucun projet chargé - importez un .slk ou ouvrez un .json'; }

