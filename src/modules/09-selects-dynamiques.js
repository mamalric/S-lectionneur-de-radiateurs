/* ============================ SELECTS DYNAMIQUES ============================ */
function radEnergyUI(){ return $('radEnergy')? $('radEnergy').value : 'eau'; }
function curRadPerMeter(){ const p=PROD_BY_KEY[$('model')?$('model').value:'']; return !!(p&&p.calc==='perMeter'); }
function populateModelSelect(keep){
  const grp = radEnergyUI()==='elec'?'rad_elec':'rad_eau';
  const list = CATALOG[grp]||[];
  $('model').innerHTML=list.map(p=>`<option value="${p.key}">${esc(p.name)}</option>`).join('');
  const keys=list.map(p=>p.key);
  if(keep && keys.includes(keep)) $('model').value=keep;
  const mh=$('modelHint'); if(mh) mh.textContent = (grp==='rad_elec')?'Radiateur électrique Finimetal (puissance normalisée)':'Radiateur à eau : panneaux, verticaux et décoratifs Finimetal';
}
// Les champs Type/Hauteur/Longueur ne concernent QUE les panneaux a puissance lineaire (perMeter).
function toggleWaterParams(){ const show=curRadPerMeter();
  document.querySelectorAll('.waterOnly').forEach(el=>el.style.display=show?'':'none'); }
function fillSel(id,arr,val,fallback){ $(id).innerHTML=arr.map(v=>`<option value="${v}">${v}</option>`).join('');
  $(id).value = arr.includes(+val)? val : fallback; }
function populateRangeSelects(hMin,hMax,lMin,lMax){
  if(!curRadPerMeter()) return;   // plages non pertinentes hors panneau perMeter
  const S={model:$('model').value||'compact'};
  const hs=mHeights(S), ls=mLengths(S);
  fillSel('hMin',hs,hMin, hs[0]); fillSel('hMax',hs,hMax, hs.includes(600)?600:hs[hs.length-1]);
  if(+$('hMin').value>+$('hMax').value) $('hMax').value=$('hMin').value;
  fillSel('lMin',ls,lMin, ls[0]); fillSel('lMax',ls,lMax, ls.includes(2000)?2000:ls[ls.length-1]);
  if(+$('lMin').value>+$('lMax').value) $('lMax').value=$('lMin').value;
}
function populateTypeChecks(keep){
  if(!curRadPerMeter()) return;   // pas de types hors panneau perMeter
  const S={model:$('model').value||'compact'}; const types=mTypes(S);
  $('allowTypes').innerHTML=types.map(t=>`<label class="chip"><input type="checkbox" value="${t}" ${(!keep||keep.includes(t))?'checked':''}> Type ${t}</label>`).join('');
}
// L'energie SS (choix projet) filtre la liste : eau / electrique / mixte (groupes du catalogue).
function populateSSModel(keep){
  const en=['eau','elec','mixte'].includes($('ssEnergy').value)?$('ssEnergy').value:'eau';
  const list=CATALOG['ss_'+en]||[]; const keys=list.map(p=>p.key);
  $('ssModel').innerHTML=list.map(p=>`<option value="${p.key}">${esc(p.name)}</option>`).join('');
  $('ssModel').value = (keep && keys.includes(keep)) ? keep : (keys[0]||'');
}
function onModelChange(){ const s=readSettings(); overrides={};
  toggleWaterParams(); populateTypeChecks(); populateRangeSelects(s.Hmin,s.Hmax,s.Lmin,s.Lmax); renderCatalog(); render(); }

