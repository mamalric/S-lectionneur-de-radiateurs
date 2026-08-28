/* ============================ PHYSIQUE (methode Finimetal : moyenne arithmetique) ============================ */
function mdl(S){ return MODELS[S.model] || MODELS.compact; }
function mHeights(S){ return mdl(S).heights; }
// Longueurs REELLES disponibles par (type, hauteur) - donnee fabricant, varie selon le type et la hauteur.
function heightLens(S,type,h){ const m=mdl(S); const Lt=m.L&&m.L[type]; return (Lt&&Lt[h])? Lt[h] : []; }
function modelLengths(S){ const m=mdl(S); const set=new Set();
  (m.types||[]).forEach(t=>(m.heights||[]).forEach(h=>heightLens(S,t,h).forEach(l=>set.add(l))));
  return [...set].sort((a,b)=>a-b); }
function mLengths(S){ return modelLengths(S); }   // union (selects de plage Lmini/Lmaxi)
function idxH(S,h){ return mdl(S).heights.indexOf(+h); }
function WmOf(S,type,h){ const i=idxH(S,h); return i<0?NaN:mdl(S).Wm[type][i]; }
function nOf(S,type,h){ const i=idxH(S,h); return i<0?1.3:mdl(S).n[type][i]; }
function dtOf(Te,Ts,Ti){ return (Te+Ts)/2 - Ti; }
function factorOf(S,type,h,Ti){ const dt=dtOf(S.Te,S.Ts,Ti);
  if(!(dt>0)) return {f:NaN,dt}; return {f:Math.pow(dt/50,nOf(S,type,h)),dt}; }
function emitOf(S,type,h,len,Ti){ const {f}=factorOf(S,type,h,Ti); const wm=WmOf(S,type,h);
  if(!(f>0)||!(wm>0)) return 0; return wm*(len/1000)*f; }
function typeRank(S,t){ return mTypes(S).indexOf(t); }
function lengthsFor(S,type,h){ return heightLens(S,type,h).filter(l=>l>=S.Lmin && l<=S.Lmax); }
function allLengthsFor(S,type,h){ return h!=null? heightLens(S,type,h).slice() : mLengths(S); }

function fitLength(S,type,h,q,Ti){
  const lens=lengthsFor(S,type,h); let last=null;
  for(const len of lens){ const e=emitOf(S,type,h,len,Ti); last={length:len,emitted:e}; if(e>=q) return {length:len,emitted:e,ok:true}; }
  return last?{...last,ok:false}:null;
}
function betterCand(S,a,b,crit){
  if(!b) return true;
  const tr=c=>typeRank(S,c.type);
  const key=c=> crit==='compact'? [c.length,tr(c),c.height]
              : crit==='lowh'   ? [c.height,tr(c),c.length]
              :                    [tr(c),c.length,c.height];
  const ka=key(a),kb=key(b);
  for(let i=0;i<ka.length;i++){ if(ka[i]!==kb[i]) return ka[i]<kb[i]; }
  return false;
}
function candTypes(S){ const types=mTypes(S); const a=S.allowTypes&&S.allowTypes.length? S.allowTypes:types.slice();
  const r=types.filter(t=>a.includes(t)); return r.length? r : types.slice(); }
function candHeights(S){ let h=mHeights(S).filter(x=>x>=S.Hmin && x<=S.Hmax);
  if(!h.length) h=mHeights(S).slice(); return h.slice().sort((a,b)=>a-b); }
function baseN(S,surf){ return (S.seuil2>0 && surf>S.seuil2)?2:1; }

function autoSelect(S,Q,Ti,surf){
  const types=candTypes(S), heights=candHeights(S);
  const N0=baseN(S,surf), qmin=Q*(1+S.tolMin/100);
  for(let N=N0;N<=Math.max(N0,4);N++){
    const q=qmin/N; let best=null;
    for(const t of types) for(const h of heights){
      const r=fitLength(S,t,h,q,Ti);
      if(r&&r.ok){ const cand={type:t,height:h,length:r.length,unit:r.emitted,N};
        if(betterCand(S,cand,best,S.criterion)) best=cand; }
    }
    if(best) return best;
  }
  const t=types[types.length-1]||"33", h=heights[heights.length-1];
  const r=fitLength(S,t,h,qmin/N0,Ti) || {length:(lengthsFor(S,t,h).slice(-1)[0] || heightLens(S,t,h).slice(-1)[0] || S.Lmax)};
  return {type:t,height:h,length:r.length,unit:emitOf(S,t,h,r.length,Ti),N:N0,ok:false};
}

// Overrides indexes par ID STABLE de piece (pas l'index de tableau) -> suppression/renommage surs.
function ov(id,k){ return overrides[id]? overrides[id][k] : undefined; }
// Ti et P requise viennent UNIQUEMENT de Pleiades (non editables dans l'outil).
function reqOf(S,r){ return r.total||r.dep||0; }
function tiOf(r){ return r.Ti; }

function effOf(S,r){
  const Ti=tiOf(r), Q=reqOf(S,r);
  const auto=autoSelect(S,Q,Ti,r.surf);
  const o=overrides[r.id]||{};
  const type=o.type??auto.type;
  const height=o.height??auto.height;
  const N=o.N??auto.N;
  let length;
  // On ne garde la longueur forcee que si elle existe REELLEMENT pour ce couple type/hauteur
  // (le type/hauteur peut avoir change en auto depuis la surcharge -> sinon produit fantome).
  if(o.length && heightLens(S,type,height).includes(o.length)) length=o.length;
  else { const r2=fitLength(S,type,height,Q*(1+S.tolMin/100)/N,Ti);
    length = r2? r2.length : (lengthsFor(S,type,height).slice(-1)[0] || heightLens(S,type,height).slice(-1)[0] || S.Lmax); }
  const unit=emitOf(S,type,height,length,Ti);
  return {Ti,Q,type,height,length,N,unit,total:unit*N,manual:Object.keys(o).length>0};
}
function designation(S,type,h,len){ const m=mdl(S); return `${m.name} ${type}${m.code}${h} ${pad4(len)}`; }

