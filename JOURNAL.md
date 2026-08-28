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

## 2026-08-18
- Fiche créée à partir du modèle `outil` lors de la mise en place du catalogue. Projet existant depuis le 2026-07-07, dernière activité observée le 2026-07-09.
- Fiche modifiée depuis le gestionnaire : tags.
- Sections de la fiche rédigées par Claude Code d'après FICHE.md, JOURNAL.md, CLAUDE.md, Selectionneur_radiateurs_Finimetal_v3.html (confiance moyenne). À relire.
