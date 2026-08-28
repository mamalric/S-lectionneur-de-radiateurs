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
Version 3 (fichier du 2026-07-09, format de projet interne version 6) apparemment terminée : quatre vues (projet et import, gestion des pièces, dimensionnement, base de données fabricant en lecture seule), catalogue Finimetal complet embarqué (tarif 04/2021, données du calculateur officiel). Un dossier versions/ conserve les versions antérieures. Le dossier est suivi en git et publié sur le dépôt privé GitHub mamalric/S-lectionneur-de-radiateurs ; pas de documentation séparée ; l'outil rappelle que les références définitives sont à valider sur le configurateur Finimetal en vigueur.

## Prochaine étape
À confirmer : rien d'indiqué. Vérifier périodiquement l'actualité du catalogue embarqué (tarif 04/2021) par rapport à la gamme Finimetal en vigueur, et regrouper d'éventuelles corrections dans une version 4.

## Utilisation
Ouvrir Selectionneur_radiateurs_Finimetal_v3.html dans un navigateur ; glisser un ou plusieurs exports Pléiades .slk (ou ouvrir un projet .json), qualifier les pièces (radiateur ou sèche-serviette), renseigner le régime d'eau et les paramètres, puis lire la sélection pièce par pièce, ajuster manuellement si besoin, exporter le bordereau CSV ou imprimer ; enregistrer le projet en .json pour le reprendre.
