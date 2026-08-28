/* ============================ INIT ============================ */
document.querySelectorAll('input,select').forEach(el=>{
  if(el.closest('#catTbl')||el.closest('#tbl')) return;
  if(['fileSlk','fileJson','projName','model','ssModel','ssEnergy','radEnergy'].includes(el.id)) return;
  const isTol=/Tol(Min|Max)$/.test(el.id);
  if(isTol) el.addEventListener('change',()=>{clampTol(el.id);render();});
  else el.addEventListener('change',()=>render());
  if(el.type==='number'&&!isTol) el.addEventListener('input',()=>scheduleRender());
});
$('model').addEventListener('change',onModelChange);
$('radEnergy').addEventListener('change',()=>{ populateModelSelect(); toggleWaterParams(); updateEnergyVis(); onModelChange(); });
$('allowTypes').addEventListener('change',()=>render());   // cases a cocher dynamiques (delegation)
$('ssEnergy').addEventListener('change',()=>{ populateSSModel($('ssModel').value); updateEnergyVis(); overrides={}; persist(); render(); });
$('ssModel').addEventListener('change',()=>{ overrides={}; persist(); render(); });
$('projName').addEventListener('input',()=>{ PROJECT_NAME=$('projName').value; persist(); renderProjInfo(); });
$('fileSlk').addEventListener('change',e=>{ handleFiles(e.target.files); e.target.value=''; });
$('fileJson').addEventListener('change',e=>{ handleJson(e.target.files[0]); e.target.value=''; });
(function(){ const dz=$('dropzone');
  ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.style.background='#eef6ff';dz.style.borderColor='var(--bleu2)';}));
  ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.style.background='#fbfdff';dz.style.borderColor='var(--bord)';}));
  dz.addEventListener('drop',e=>{ handleFiles(e.dataTransfer.files); });
  dz.addEventListener('click',()=>$('fileSlk').click());
})();

populateModelSelect();
restore();
updateEnergyVis();
renderCatalog();
initDb();
render();
(function(){ let v=''; try{ v=localStorage.getItem('finimetal_view')||''; }catch(e){}
  if(!v) v = ROOMS.length? 'dim' : 'projet';
  showView(v);
})();
