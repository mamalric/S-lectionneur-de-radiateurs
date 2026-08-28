---
id: 2026-07-07-selectionneur-de-radiateurs    # AAAA-MM-JJ-slug, écrit une fois, jamais modifié (même si le dossier bouge)
nom: Sélectionneur de radiateurs Finimetal
type: outil                                   # application | outil | documentation | travail | affaire
statut: termine                               # idee | actif | pause | termine | abandonne
pitch: Sélection de radiateurs Finimetal selon puissance et régime d'eau, page HTML, version 3.
cree: 2026-07-07
maj: 2026-08-28                               # AAAA-MM-JJ, mis à jour par Claude Code en fin de session
tags: [cvc, b27, chauffage, web]
entree: Selectionneur_radiateurs_Finimetal_v3.html
usage: ouvrir le fichier dans un navigateur
perime_si:
---

# Sélectionneur de radiateurs Finimetal

## Objectif
Outil d'aide au prédimensionnement des radiateurs panneaux et sèche-serviettes Finimetal (marché France) pièce par pièce : import des déperditions Pléiades (.slk, un fichier par bâtiment), choix du modèle, des types (11, 21, 22, 33), des hauteurs et longueurs admises, du régime d'eau aller/retour et des tolérances, puis sélection automatique (type le plus fin, encombrement mini ou hauteur mini) avec choix manuel possible. Méthode conforme au calculateur officiel Finimetal : DT = (Te + Ts)/2 - Ti, correction f = (DT/50)^n par type et hauteur, puissances W/m à DT50 selon EN 442. Produit une synthèse, un bordereau quantitatif par modèle exportable en CSV et une impression PDF ; un projet s'enregistre en .json.

## État actuel
Version 3 (format de projet interne version 6) fonctionnellement inchangée, mais le code est désormais découpé. Les sources éditables sont dans src/ : un gabarit template.html de 58 lignes qui donne toute la structure, la feuille de style, sept vues HTML (une par panneau), trois fichiers de données dont le catalogue fabricant de 454 Ko isolé à part, et quinze modules JS reprenant les sections d'origine. build.py reconstitue le fichier HTML autonome de la racine, qui reste le livrable portable, plus un index.html de redirection pour GitHub Pages. Le découpage a été vérifié octet pour octet contre le fichier d'origine. L'habillage reprend le thème de l'outil planif (2026-08-19_Gestion de plannification Zoho) : même palette papier/encre à primaire olive, thème clair et sombre avec bouton de bascule et mémorisation du choix, et 43 icônes Lucide embarquées dans src/modules/00-icones.js pour que l'outil garde zéro requête externe. Un engrenage en haut à droite ouvre un panneau À propos qui affiche la version, la date de dernière mise à jour et des compteurs recalculés à chaque ouverture sur le catalogue embarqué et le projet en cours. Le dépôt GitHub mamalric/S-lectionneur-de-radiateurs est public et publié sur https://mamalric.github.io/S-lectionneur-de-radiateurs/. Un dossier versions/ conserve les versions antérieures ; l'outil rappelle que les références définitives sont à valider sur le configurateur Finimetal en vigueur.

## Prochaine étape
Vérifier périodiquement l'actualité du catalogue embarqué (tarif 04/2021) par rapport à la gamme Finimetal en vigueur, et regrouper d'éventuelles corrections dans une version 4. Trancher aussi si la publication en public du catalogue fabricant doit rester en l'état, le dépôt étant passé public pour activer GitHub Pages.

## Utilisation
Pour se servir de l'outil : ouvrir Selectionneur_radiateurs_Finimetal_v3.html dans un navigateur, ou aller sur https://mamalric.github.io/S-lectionneur-de-radiateurs/ ; glisser un ou plusieurs exports Pléiades .slk (ou ouvrir un projet .json), qualifier les pièces (radiateur ou sèche-serviette), renseigner le régime d'eau et les paramètres, puis lire la sélection pièce par pièce, ajuster manuellement si besoin, exporter le bordereau CSV ou imprimer ; enregistrer le projet en .json pour le reprendre.

Pour modifier l'outil : éditer les fichiers de src/, jamais le HTML de la racine qui est régénéré, puis lancer `python build.py`. La commande `python build.py --verifier` dit si le fichier de la racine correspond encore aux sources, à lancer avant de committer.
