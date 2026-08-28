/* ============================ PROJET JSON (1 projet = 1 fichier) ============================ */
function projectData(){ return {app:'finimetal-selecteur-radiateurs',version:APP.formatProjet,
  name:PROJECT_NAME, rooms:ROOMS, overrides, settings:settingsToStore()}; }
function loadProjectData(d){
  if(!d || !Array.isArray(d.rooms)) throw new Error("fichier projet invalide (pas de pièces).");
  ROOMS=d.rooms; PROJECT_NAME=d.name||'Projet'; overrides=adoptProject(ROOMS, d.overrides);
  populateModelSelect(); applySettings(d.settings); $('projName').value=PROJECT_NAME;
  renderCatalog(); persist(); render(); showView('dim');
}
async function saveProject(){
  const json=JSON.stringify(projectData(),null,1);
  try{
    if(fileHandle && fileHandle.createWritable){
      const w=await fileHandle.createWritable(); await w.write(json); await w.close();
      msg(`Projet enregistré et synchronisé avec "${fileHandle.name}".`,'ok'); return; }
    if(window.showSaveFilePicker){
      fileHandle=await window.showSaveFilePicker({suggestedName:slug(PROJECT_NAME)+'.json',
        types:[{description:'Projet radiateurs',accept:{'application/json':['.json']}}]});
      const w=await fileHandle.createWritable(); await w.write(json); await w.close();
      msg(`Projet enregistré dans "${fileHandle.name}" (synchronisation active).`,'ok'); return; }
  }catch(e){ if(e.name==='AbortError') return; }
  const blob=new Blob([json],{type:'application/json'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=slug(PROJECT_NAME)+'.json'; a.click();
  msg('Projet téléchargé (.json).','ok');
}
async function openProject(){
  if(window.showOpenFilePicker){
    try{ const [h]=await window.showOpenFilePicker({types:[{description:'Projet radiateurs',accept:{'application/json':['.json']}}]});
      fileHandle=h; const f=await h.getFile(); loadProjectData(JSON.parse(await f.text()));
      msg(`Projet "${PROJECT_NAME}" ouvert et synchronisé avec "${h.name}".`,'ok');
    }catch(e){ if(e.name!=='AbortError') msg("Ouverture impossible : "+e.message,'ko'); }
    return; }
  $('fileJson').click();
}
function handleJson(file){ if(!file) return;
  file.text().then(txt=>{ try{ loadProjectData(JSON.parse(txt)); fileHandle=null;
    msg(`Projet "${PROJECT_NAME}" chargé.`,'ok'); }catch(e){ msg("Fichier projet illisible : "+e.message,'ko'); } }); }
function newProject(){ if(ROOMS.length && !confirm("Démarrer un nouveau projet vide ? Le projet courant non enregistré sera perdu.")) return;
  ROOMS=[]; overrides={}; PROJECT_NAME=''; fileHandle=null; $('projName').value='';
  resetSettingsDefaults();   // remet regime, tolerances, seuil, critere, modele, energie, SS aux defauts
  persist(); render(); msg("Nouveau projet vide.",'muted'); }

