/* ============================ THEME ET INJECTION DES ICONES ============================ */
// Tout element portant data-ico recoit l'icone Lucide correspondante en tete de son contenu.
// Evite de recopier des SVG entiers dans le HTML des vues : un nom d'icone suffit.
function poserIcones(racine){
  (racine || document).querySelectorAll('[data-ico]').forEach(el => {
    if(el.dataset.icoPose) return;            // ne pas doubler si la fonction est rappelee
    const taille = +el.dataset.icoTaille || 16;
    el.insertAdjacentHTML('afterbegin', ico(el.dataset.ico, taille));
    el.dataset.icoPose = '1';
  });
}

// Theme clair / sombre : choix memorise, sinon reglage systeme. Le <head> applique deja le
// theme avant le premier rendu ; ici on ne gere que le bouton et les changements.
function appliquerTheme(t){
  document.documentElement.dataset.theme = t;
  const b = $('btnTheme');
  if(b){
    b.innerHTML = ico(t === 'dark' ? 'soleil' : 'lune', 16);
    b.title = t === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre';
  }
}

function themeMemorise(){ try{ return localStorage.getItem('finimetal_theme'); }catch(e){ return null; } }

function initTheme(){
  const systeme = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  appliquerTheme(themeMemorise() || systeme());
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ev => {
    if(!themeMemorise()) appliquerTheme(ev.matches ? 'dark' : 'light');
  });
  $('btnTheme').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try{ localStorage.setItem('finimetal_theme', t); }catch(e){}
    appliquerTheme(t);
  });
}

poserIcones();
initTheme();
