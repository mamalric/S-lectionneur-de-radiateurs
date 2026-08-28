# Journal

<!-- Dernière entrée en haut. Une entrée par session de travail ou par décision. Date au format AAAA-MM-JJ. -->

## 2026-08-28
- Dossier mis sous git : dépôt local initialisé sur la branche `main`, puis poussé sur le dépôt privé GitHub mamalric/S-lectionneur-de-radiateurs, qui était vide.
- Un seul commit initial reprenant tous les fichiers existants : page HTML version 3, FICHE.md, JOURNAL.md, CLAUDE.md et le dossier versions/ avec ses trois versions antérieures. Rien d'exclu, pas de .gitignore ajouté faute de fichiers générés à ignorer.
- Reste à décider : garder le dépôt privé ou le passer en public, et conserver ou non le dossier versions/ maintenant que l'historique git peut jouer ce rôle.
- Les deux commits initiaux étaient signés avec marius.amalric45@gmail.com, adresse rattachée au compte GitHub perso MarckuusS : ils s'affichaient donc sous ce profil sur le dépôt pro. Historique réécrit, auteur et committeur passés à mamalric via l'adresse noreply GitHub, force-push. Identité git fixée en local sur le dépôt pour que ça ne se reproduise pas.
- Fichier HTML monolithique de 559 Ko découpé en sources éditables sous src/ : gabarit template.html, style.css, sept vues HTML, trois fichiers de données, quinze modules JS. build.py reconstitue le livrable. Le découpage suit exactement les bandeaux de commentaires déjà présents dans le fichier, et le réassemblage a été vérifié identique à l'original octet pour octet avant d'ajouter le bandeau "fichier généré".
- Décision de méthode : pas de modules ES, mais une concaténation. L'outil s'ouvre en file://, où les modules ES sont bloqués par CORS, et les 41 handlers inline du HTML (onclick, onchange, oninput) exigent que les fonctions restent dans le scope global. Un découpage en <script src> aurait aussi transformé le livrable en dossier, alors qu'un fichier unique s'envoie par mail.
- Écart assumé avec CLAUDE.md, qui demande que l'outil tienne à la racine en un ou deux fichiers sans sous-dossier. Le découpage était demandé et le fichier était devenu inéditable. Comme le prévoit la consigne, je le signale : avec un dossier de sources, une étape de build et une publication web, cet outil est en train de devenir une application.
- Dépôt passé en public et publié sur GitHub Pages. La page renvoyait une 404 faute d'index.html à la racine : build.py génère désormais un index.html de redirection vers le fichier versionné. Rendu vérifié dans un navigateur, aucune erreur console, aucune requête externe.
- .gitattributes ajouté : core.autocrlf vaut true au niveau système sur ce poste, un clone frais aurait réécrit les sources en CRLF et fait échouer la comparaison d'octets de build.py.
- Thème repris de l'outil planif : palette papier/encre à primaire olive, variables CSS en français, rayons de 6 px, ombres douces, transitions de 0,12 s et respect de prefers-reduced-motion. Thème clair et sombre, appliqué avant le premier rendu par un script en tête de page pour éviter le flash, mémorisé dans localStorage, avec repli sur le réglage système.
- Au passage, 15 références à des variables supprimées (--bleu, --bord, --muted, --ko, --accent) et 3 couleurs en dur traînaient dans des styles inline des vues et des modules : sans ce nettoyage le thème aurait eu des trous. Toutes remappées sur les nouveaux jetons.
- Le bleu initialement repris de planif pour le bandeau "Paramètres radiateurs" a été retiré à la demande : dans planif il signale les données venant de Zoho, ce qui n'a pas de sens ici. La codification est maintenant à deux couleurs, olive pour le radiateur et ambre pour le sèche-serviette, cohérente entre les pastilles, les bandeaux de section et le bandeau de résultats.
- 42 icônes Lucide (licence ISC) embarquées dans src/modules/00-icones.js : 18 reprises telles quelles de planif pour que les deux outils se ressemblent, 24 téléchargées depuis lucide-static 1.35.0 pour le vocabulaire radiateur (thermomètre, baignoire, règle, base de données, imprimante, gouttelette, éclair). Helper ico(nom, taille) et injection automatique sur tout élément portant data-ico, ce qui évite de recopier des SVG dans le HTML des vues.
- toggle() écrivait le chevron avec textContent, ce qui aurait effacé le SVG : passé en innerHTML avec l'icône correspondante. Bascule vérifiée dans les deux sens.
- Pas de lien Google Fonts pour Inter, contrairement à planif : la pile de polices commence par Inter mais l'outil doit rester utilisable hors ligne et en file://, sans aucune requête externe. Sur Windows, Segoe UI prend le relais.
- Impression : le bloc @media print réinjecte la palette claire même quand l'écran est en thème sombre, sinon le dossier de dimensionnement sortirait sur fond noir.
- Rendu contrôlé dans un navigateur, thèmes clair et sombre : aucune couleur bleue calculée sur la page, 41 icônes posées, aucune erreur console, aucune requête externe.

## 2026-08-18
- Fiche créée à partir du modèle `outil` lors de la mise en place du catalogue. Projet existant depuis le 2026-07-07, dernière activité observée le 2026-07-09.
- Fiche modifiée depuis le gestionnaire : tags.
- Sections de la fiche rédigées par Claude Code d'après FICHE.md, JOURNAL.md, CLAUDE.md, Selectionneur_radiateurs_Finimetal_v3.html (confiance moyenne). À relire.
