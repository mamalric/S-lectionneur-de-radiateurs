/* ============================ LECTURE PARAMETRES ============================ */
function readSettings(){
  return {
    model: $('model').value || 'compact',
    radEnergy: $('radEnergy')? ($('radEnergy').value || 'eau') : 'eau',
    allowTypes: [...document.querySelectorAll('#allowTypes input:checked')].map(x=>x.value),
    Hmin:+$('hMin').value, Hmax:+$('hMax').value,
    Lmin:+$('lMin').value, Lmax:+$('lMax').value,
    // Regimes et tolerances SEPARES radiateur / seche-serviette (aucun parametre commun).
    radTe:+$('radTe').value, radTs:+$('radTs').value,
    radTolMin:+$('radTolMin').value||0, radTolMax:+$('radTolMax').value||0,
    ssTe:+$('ssTe').value, ssTs:+$('ssTs').value,
    ssTolMin:+$('ssTolMin').value||0, ssTolMax:+$('ssTolMax').value||0,
    seuil2:+$('seuil2').value||0,
    criterion: $('criterion').value,
    ssModel: $('ssModel').value || '',
    ssEnergy: $('ssEnergy').value || 'eau'
  };
}
// Portee des reglages selon l'emetteur : le moteur (effOf/effItem) lit S.Te/S.Ts/S.tolMin/S.tolMax.
function scopeRad(S){ return Object.assign({}, S, {Te:S.radTe, Ts:S.radTs, tolMin:S.radTolMin, tolMax:S.radTolMax}); }
function scopeSS(S){ return Object.assign({}, S, {Te:S.ssTe, Ts:S.ssTs, tolMin:S.ssTolMin, tolMax:S.ssTolMax}); }
function roomTe(S,r){ return isTowel(r)? S.ssTe : S.radTe; }
function roomTs(S,r){ return isTowel(r)? S.ssTs : S.radTs; }

