/* ============================ PERSISTENCE LOCALE (auto-save) ============================ */
const LS='finimetal_selecteur_v5';
function settingsToStore(){ const S=readSettings();
  return {model:S.model,radEnergy:S.radEnergy,allowTypes:S.allowTypes,Hmin:$('hMin').value,Hmax:$('hMax').value,Lmin:$('lMin').value,Lmax:$('lMax').value,
    radTe:$('radTe').value,radTs:$('radTs').value,radTolMin:$('radTolMin').value,radTolMax:$('radTolMax').value,
    ssTe:$('ssTe').value,ssTs:$('ssTs').value,ssTolMin:$('ssTolMin').value,ssTolMax:$('ssTolMax').value,
    seuil2:$('seuil2').value,criterion:S.criterion,ssModel:S.ssModel,ssEnergy:S.ssEnergy}; }
// Remet TOUS les reglages metier a leurs valeurs par defaut. Utilise a l'ouverture d'un projet sans bloc settings ET par newProject.
function resetSettingsDefaults(){
  if($('radEnergy')) $('radEnergy').value='eau';
  populateModelSelect(); toggleWaterParams();
  populateTypeChecks(); populateRangeSelects(400,600,400,2000);
  $('radTe').value=''; $('radTs').value=''; $('radTolMin').value=0; $('radTolMax').value=20;
  $('ssTe').value=''; $('ssTs').value=''; $('ssTolMin').value=0; $('ssTolMax').value=20;
  $('seuil2').value=25; $('criterion').value='thin';
  $('ssEnergy').value='eau'; populateSSModel(); updateEnergyVis();
}
function applySettings(S){
  if(!S){ resetSettingsDefaults(); return; }
  if($('radEnergy')) $('radEnergy').value = (S.radEnergy==='elec') ? 'elec' : 'eau';  // legacy 'mixte' -> eau
  populateModelSelect(S.model);
  toggleWaterParams();
  populateTypeChecks(S.allowTypes);
  populateRangeSelects(S.Hmin!=null?S.Hmin:400, S.Hmax!=null?S.Hmax:600, S.Lmin!=null?S.Lmin:400, S.Lmax!=null?S.Lmax:2000);
  // regimes/tolerances : repli sur anciens champs partages (Te/Ts/tolMin/tolMax) si projet anterieur.
  const gRadTe = S.radTe!=null?S.radTe:S.Te, gRadTs = S.radTs!=null?S.radTs:S.Ts;
  const gSsTe = S.ssTe!=null?S.ssTe:S.Te, gSsTs = S.ssTs!=null?S.ssTs:S.Ts;
  $('radTe').value=gRadTe!=null?gRadTe:''; $('radTs').value=gRadTs!=null?gRadTs:'';
  $('ssTe').value=gSsTe!=null?gSsTe:''; $('ssTs').value=gSsTs!=null?gSsTs:'';
  $('radTolMin').value = S.radTolMin!=null?S.radTolMin:(S.tolMin!=null?S.tolMin:0);
  $('radTolMax').value = S.radTolMax!=null?S.radTolMax:(S.tolMax!=null?S.tolMax:20);
  $('ssTolMin').value = S.ssTolMin!=null?S.ssTolMin:(S.tolMin!=null?S.tolMin:0);
  $('ssTolMax').value = S.ssTolMax!=null?S.ssTolMax:(S.tolMax!=null?S.tolMax:20);
  if(S.seuil2!=null)$('seuil2').value=S.seuil2;
  if(S.criterion)$('criterion').value=S.criterion;
  if(S.ssEnergy && SS_LABEL[S.ssEnergy])$('ssEnergy').value=S.ssEnergy;
  populateSSModel(S.ssModel); updateEnergyVis();
}
let _persistWarned=false;
function persist(){ try{ localStorage.setItem(LS,JSON.stringify({
    settings:settingsToStore(), current:{name:PROJECT_NAME,rooms:ROOMS,overrides} })); }
  catch(e){ if(!_persistWarned){ _persistWarned=true;
    msg('Sauvegarde automatique locale indisponible (quota ou navigateur). Enregistrez le projet en .json pour ne rien perdre.','ko'); } } }
let _persistT=null;
function schedulePersist(){ if(_persistT) clearTimeout(_persistT); _persistT=setTimeout(()=>{ _persistT=null; persist(); }, 400); }
let _renderT=null;
function scheduleRender(){ if(_renderT) clearTimeout(_renderT); _renderT=setTimeout(()=>{ _renderT=null; render(); }, 120); }
function loadStore(){ try{ return JSON.parse(localStorage.getItem(LS))||{}; }catch(e){ return {}; } }
// Adopte des pieces + overrides : assure les IDs, et remappe les overrides d'anciens projets (indexes par position) vers les IDs.
function adoptProject(rooms, ovIn){
  // Etat des ids AVANT normalizeRooms (qui en assigne aux pieces sans id).
  const allNoIds = rooms.length>0 && rooms.every(r=>typeof r.id!=='number');
  normalizeRooms(rooms, null);
  // Anciens projets sans batiment -> on renseigne le nom du projet pour ne jamais laisser vide.
  rooms.forEach(r=>{ if(r.bat==null || r.bat==='') r.bat = PROJECT_NAME || 'Bâtiment 1'; });
  let ov = ovIn||{};
  if(allNoIds){
    // Projet legacy SANS aucun id : overrides indexes par POSITION -> remap vers les ids assignes.
    const remap={}; rooms.forEach((r,idx)=>{ if(ov[idx]) remap[r.id]=ov[idx]; }); ov=remap;
  } else {
    // Overrides deja indexes par id : on ne garde que ceux pointant vers une piece existante
    // (un seul id manquant ne doit PAS faire reinterpreter tous les overrides comme des index).
    const valid=new Set(rooms.map(r=>r.id)); const clean={};
    Object.keys(ov).forEach(k=>{ if(valid.has(+k)) clean[+k]=ov[k]; }); ov=clean;
  }
  return ov;
}
function restore(){
  const d=loadStore();
  if($('radEnergy')) $('radEnergy').value = (d.settings && d.settings.radEnergy==='elec') ? 'elec' : 'eau';  // legacy 'mixte' -> eau
  populateModelSelect(d.settings && d.settings.model);
  if(d.current && Array.isArray(d.current.rooms)){
    ROOMS=d.current.rooms; PROJECT_NAME=d.current.name||''; overrides=adoptProject(ROOMS, d.current.overrides); }
  applySettings(d.settings);
  toggleWaterParams();
  $('projName').value=PROJECT_NAME;
}

