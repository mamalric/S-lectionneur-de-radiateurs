/* ============================ CATALOGUE UNIFIE (forme x energie, donnees Finimetal) ============================ */
// CATALOG = { rad_eau, rad_elec, ss_eau, ss_elec, ss_mixte } ; chaque produit :
// {pid,key,name,forme('rad'|'ss'),energie('eau'|'elec'|'mixte'),calc('perMeter'|'item'),kind,groups,url}
const SS_LABEL = {eau:'Eau chaude', elec:'Électrique', mixte:'Mixte'};
const SS_SHORT = {eau:'Eau', elec:'Élec', mixte:'Mixte'};
const CATALOG_GROUPS = ['rad_eau','rad_elec','ss_eau','ss_elec','ss_mixte'];
const PROD_BY_KEY = (function(){ const m={}; CATALOG_GROUPS.forEach(g=>(CATALOG[g]||[]).forEach(p=>{ m[p.key]=p; })); return m; })();
function radGroup(S){ return S.radEnergy==='elec' ? 'rad_elec' : 'rad_eau'; }
function ssGroup(S){ const e=['eau','elec','mixte'].includes(S.ssEnergy)?S.ssEnergy:'eau'; return 'ss_'+e; }
function firstOf(grp){ return (CATALOG[grp]||[])[0]; }
function radProduct(S){ const p=PROD_BY_KEY[S.model]; return (p && p.forme==='rad' && ('rad_'+p.energie)===radGroup(S)) ? p : firstOf(radGroup(S)); }
function ssProduct(S){ const p=PROD_BY_KEY[S.ssModel]; return (p && p.forme==='ss' && ('ss_'+p.energie)===ssGroup(S)) ? p : firstOf(ssGroup(S)); }
function isElec(S){ return S.radEnergy==='elec'; }
function isPerMeter(S){ const p=radProduct(S); return !!(p && p.calc==='perMeter'); }
function isBath(r){ return /salle\s*de\s*bain|salle\s*d['\s]?eau|\bsdb\b|douche/i.test(r.piece||''); }
// Emetteur : override par piece (r.emitter = 'panneau'|'ss') sinon detection auto sur le nom.
function isTowel(r){ return r.emitter ? r.emitter==='ss' : isBath(r); }

// Moteur "item" : radiateurs non-perMeter (Vertical, Kos V, decoratifs, Ulow-E), seche-serviettes, electriques.
// Chaque item porte p (P a DT50) et parfois n (exposant) : puissance = n!=null ? p*(DT/50)^n : p (fixe).
function flatItems(prod){ const a=[]; if(prod) prod.groups.forEach(g=>g.items.forEach(it=>a.push(it))); return a; }
function itemPower(S,it,Ti){ if(it.n==null) return it.p; const dt=dtOf(S.Te,S.Ts,Ti); return dt>0? it.p*Math.pow(dt/50,it.n) : 0; }
function itemAuto(S,prod,q,Ti){ const items=flatItems(prod); let best=-1,bp=Infinity;
  items.forEach((it,i)=>{ const pw=itemPower(S,it,Ti); if(pw>=q-0.5 && pw<bp){ bp=pw; best=i; } });
  if(best<0){ let mx=-1,mi=items.length?0:-1; items.forEach((it,i)=>{ const pw=itemPower(S,it,Ti); if(pw>mx){ mx=pw; mi=i; } }); return {i:mi,ok:false}; }
  return {i:best,ok:true}; }
function effItem(S,r,prod){
  const Ti=tiOf(r), Q=reqOf(S,r), o=overrides[r.id]||{}, items=flatItems(prod);
  const N=o.N??baseN(S,r.surf);
  let i = (o.it!=null && items[o.it])? o.it : itemAuto(S,prod,Q*(1+S.tolMin/100)/N,Ti).i;
  const it=items[i]||items[0]||{p:0,h:0,l:0};
  const unit=itemPower(S,it,Ti);
  return {Ti,Q,item:true,prod,it,idx:i,N,unit,total:unit*N,height:it.h,length:it.l,code:it.c,
    energy: prod?prod.energie:'', fixed: it.n==null, manual:Object.keys(o).length>0, bath: !!(prod&&prod.forme==='ss')};
}
function itemLabel(it){ if(!it) return '-'; const dims=[it.h,it.l].filter(Boolean).join('x');
  return (dims||'-')+(it.n==null?` (${nf.format(it.p)} W)`:''); }
function itemDesig(e){ const p=e.prod, it=e.it||{}; const dims=[it.h,it.l].filter(Boolean).join('x');
  return `${p?p.name:''}`+(dims?` ${dims}`:'')+(e.fixed?` - ${nf.format(it.p)} W`:''); }
function selItem(id,e,S){ const items=flatItems(e.prod); if(items.length<=1) return itemLabel(e.it);
  let o=''; items.forEach((it,i)=>o+=`<option value="${i}" ${i===e.idx?'selected':''}>${itemLabel(it)}</option>`);
  return `<select class="cell" style="max-width:180px" onchange="setOv(${id},'it',+this.value)">${o}</select>`; }

// Cache d'un cycle de rendu : eff() est appele par render + renderSynth + renderBordereau pour chaque piece.
let _effCache=null;
function effCompute(S,r){
  if(isTowel(r)) return effItem(scopeSS(S),r,ssProduct(S));
  const Sr=scopeRad(S); const p=radProduct(Sr);
  return (p && p.calc==='perMeter') ? effOf(Sr,r) : effItem(Sr,r,p);
}
function eff(S,r){
  if(_effCache){ const c=_effCache.get(r.id); if(c!==undefined) return c; }
  const e=effCompute(S,r);
  if(_effCache) _effCache.set(r.id,e);
  return e;
}

