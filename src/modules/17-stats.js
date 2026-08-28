/* ============================ PANNEAU "A PROPOS" (engrenage) ============================ */
// Ce que contient l'outil : version, date, et le poids reel du catalogue fabricant
// embarque. Les compteurs sont calcules a l'ouverture, jamais recopies a la main,
// pour qu'ils ne puissent pas mentir apres une mise a jour du catalogue.

const LIB_GROUPES = {
  rad_eau: 'Radiateurs eau chaude',
  rad_elec: 'Radiateurs électriques',
  ss_eau: 'Sèche-serviettes eau',
  ss_elec: 'Sèche-serviettes électriques',
  ss_mixte: 'Sèche-serviettes mixtes',
};

function statsCatalogue(){
  const parGroupe = {};
  let produits = 0, references = 0;
  CATALOG_GROUPS.forEach(g => {
    const liste = CATALOG[g] || [];
    let n = 0;
    liste.forEach(p => (p.groups || []).forEach(t => n += (t.items || []).length));
    parGroupe[g] = { produits: liste.length, references: n };
    produits += liste.length; references += n;
  });
  return { produits, references, parGroupe };
}

function statsProjet(){
  if(!ROOMS.length) return null;
  const S = readSettings();
  let requis = 0;
  ROOMS.forEach(r => requis += reqOf(S, r));
  const batiments = new Set(ROOMS.map(r => r.bat || '(sans bâtiment)'));
  return { pieces: ROOMS.length, batiments: batiments.size, requis, manuels: Object.keys(overrides).length };
}

function ligne(cle, valeur){ return `<dt>${esc(String(cle))}</dt><dd>${esc(String(valeur))}</dd>`; }
function groupeStats(titre, icone, lignes){
  return `<section class="stats-groupe"><h3>${ico(icone, 13)}${esc(titre)}</h3>`
       + `<dl class="stats-liste">${lignes.join('')}</dl></section>`;
}

function renderStats(){
  const cat = statsCatalogue();
  const proj = statsProjet();
  // Poids du catalogue : ce que pese reellement la donnee fabricant dans le fichier.
  const octets = new Blob([JSON.stringify(CATALOG)]).size;
  const ko = Math.round(octets / 1024);

  const blocs = [
    groupeStats('Application', 'info', [
      ligne('Version', APP.version),
      ligne('Dernière mise à jour', APP.maj),
      ligne('Format de fichier projet', 'version ' + APP.formatProjet),
      ligne('Méthode de calcul', APP.methode),
    ]),
    groupeStats('Catalogue fabricant', 'base_donnees', [
      ligne('Source', APP.catalogueSource),
      ligne('Tarif', APP.catalogueTarif),
      ligne('Produits', cat.produits),
      ligne('Références', nf.format(cat.references)),
      ligne('Modèles à puissance linéaire', Object.keys(MODELS).length),
      ligne('Poids embarqué', nf.format(ko) + ' Ko'),
    ]),
    groupeStats('Répartition du catalogue', 'types',
      CATALOG_GROUPS.map(g => ligne(
        LIB_GROUPES[g] || g,
        `${cat.parGroupe[g].produits} produits, ${nf.format(cat.parGroupe[g].references)} réf.`
      ))),
  ];

  blocs.push(proj
    ? groupeStats('Projet en cours', 'dossier', [
        ligne('Nom', PROJECT_NAME || '(sans nom)'),
        ligne('Pièces', proj.pieces),
        ligne('Bâtiments', proj.batiments),
        ligne('Puissance requise', nf1.format(proj.requis / 1000) + ' kW'),
        ligne('Pièces en choix manuel', proj.manuels),
      ])
    : groupeStats('Projet en cours', 'dossier', [ligne('État', 'aucun projet chargé')]));

  blocs.push(groupeStats('Technique', 'reglages', [
    ligne('Icônes', APP.icones),
    ligne('Thème', document.documentElement.dataset.theme === 'dark' ? 'sombre' : 'clair'),
    ligne('Fichier', 'HTML autonome, aucune requête externe'),
  ]));

  $('statsCorps').innerHTML = blocs.join('');
}

function ouvrirStats(){ renderStats(); $('dlgStats').showModal(); }

function initStats(){
  const dlg = $('dlgStats');
  $('btnStats').addEventListener('click', ouvrirStats);
  $('btnStatsFermer').addEventListener('click', () => dlg.close());
  // Clic en dehors du panneau : la zone hors contenu appartient au <dialog> lui-meme.
  dlg.addEventListener('click', ev => { if(ev.target === dlg) dlg.close(); });
}

initStats();
