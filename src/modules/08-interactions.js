/* ============================ INTERACTIONS ============================ */
function setOv(id,k,v){ overrides[id]=overrides[id]||{}; overrides[id][k]=v;
  if(k==='type'||k==='height'||k==='N') delete overrides[id].length; persist(); render(); }
function clearOv(id){ delete overrides[id]; persist(); render(); }
function recalcAll(){ const n=Object.keys(overrides).length;
  if(n && !confirm(`Réinitialiser en automatique ${n} pièce(s) ajustée(s) manuellement ? Les choix manuels seront perdus.`)) return;
  overrides={}; persist(); render(); }
function toggle(h){ const b=h.nextElementSibling; const open=b.style.display!=='none';
  b.style.display=open?'none':''; h.querySelector('.chev').innerHTML=ico(open?'chevron':'chevron_bas',15); }
let CUR_VIEW='dim';
function showView(v){
  if(!['projet','pieces','dim','db'].includes(v)) v='dim';
  CUR_VIEW=v;
  document.querySelectorAll('.panel[data-view]').forEach(p=>{ p.style.display=(p.getAttribute('data-view')===v)?'':'none'; });
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active', b.getAttribute('data-view')===v));
  try{ localStorage.setItem('finimetal_view', v); }catch(e){}
}
function clampTol(id){ let v=+$(id).value; if(isNaN(v))v=0; v=Math.max(-30,Math.min(30,v)); $(id).value=v; }
function setRegimeFields(p,te,ts){ $(p+'Te').value=te; $(p+'Ts').value=ts; render(); }
// Le regime d'eau n'apparait que si l'energie l'exige : radiateur eau ; SS eau ou mixte (jamais en electrique).
function updateEnergyVis(){
  const radW = radEnergyUI()!=='elec';
  document.querySelectorAll('.radRegime').forEach(el=>el.style.display=radW?'':'none');
  const ssW = ($('ssEnergy')?$('ssEnergy').value:'eau')!=='elec';
  document.querySelectorAll('.ssRegime').forEach(el=>el.style.display=ssW?'':'none');
}

