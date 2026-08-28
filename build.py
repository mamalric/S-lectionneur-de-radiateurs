"""Reconstruit le fichier HTML autonome a partir des sources de src/.

Usage :
    python build.py              reconstruit Selectionneur_radiateurs_Finimetal_v3.html
    python build.py --verifier   controle que le fichier est a jour, sans rien ecrire

Le fichier produit est un HTML unique, sans dependance externe, qui s'ouvre par
double-clic. C'est lui le livrable ; src/ est la source editable.

Pourquoi une concatenation et pas des <script src> separes : l'outil s'ouvre en
file://, ou les modules ES sont bloques par CORS, et les 41 handlers inline du
HTML (onclick, onchange, oninput) exigent que les fonctions restent globales.
"""
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent
GABARIT = RACINE / "src" / "template.html"
SORTIE = RACINE / "Selectionneur_radiateurs_Finimetal_v3.html"

# GitHub Pages sert index.html a la racine d'une URL. Sans ce fichier, l'adresse
# https://mamalric.github.io/S-lectionneur-de-radiateurs/ renvoie une 404.
# On genere une page de redirection plutot qu'une copie : le fichier complet fait
# 550 Ko, le dupliquer alourdirait l'historique a chaque build.
INDEX = RACINE / "index.html"

MARQUEUR = "<!--@include:"
DOCTYPE = b"<!DOCTYPE html>"

BANDEAU = (
    b"<!-- FICHIER GENERE PAR build.py - NE PAS EDITER DIRECTEMENT."
    b" Toute modification se fait dans src/, puis : python build.py -->"
)


def assembler():
    """Developpe les marqueurs @include du gabarit et renvoie le HTML complet."""
    if not GABARIT.exists():
        sys.exit(f"ERREUR : gabarit introuvable ({GABARIT})")

    morceaux = []
    manquants = []

    for numero, ligne in enumerate(GABARIT.read_bytes().splitlines(keepends=True), 1):
        texte = ligne.decode("utf-8")
        if not texte.lstrip().startswith(MARQUEUR):
            morceaux.append(ligne)
            continue

        chemin = texte.split(MARQUEUR, 1)[1].split("-->")[0].strip()
        fichier = GABARIT.parent / chemin
        if not fichier.exists():
            manquants.append(f"  ligne {numero} du gabarit : {chemin}")
            continue
        morceaux.append(fichier.read_bytes())

    if manquants:
        sys.exit("ERREUR : fichiers source introuvables\n" + "\n".join(manquants))

    # Le bandeau s'insere juste apres le doctype, pour etre la premiere chose lue.
    lignes = b"".join(morceaux).splitlines(keepends=True)
    if lignes and lignes[0].rstrip() == DOCTYPE:
        fin_de_ligne = lignes[0][len(DOCTYPE):]
        lignes.insert(1, BANDEAU + fin_de_ligne)
    return b"".join(lignes)


def page_index():
    """Page de redirection vers le fichier versionne, pour GitHub Pages."""
    cible = SORTIE.name
    return (
        "<!DOCTYPE html>\n"
        "<!-- FICHIER GENERE PAR build.py - NE PAS EDITER DIRECTEMENT."
        " Toute modification se fait dans src/, puis : python build.py -->\n"
        '<html lang="fr">\n'
        "<head>\n"
        '<meta charset="utf-8">\n'
        "<title>Sélectionneur de radiateurs Finimetal</title>\n"
        f'<link rel="canonical" href="{cible}">\n'
        f'<meta http-equiv="refresh" content="0; url={cible}">\n'
        "</head>\n"
        "<body>\n"
        f'<p>Redirection vers <a href="{cible}">le sélectionneur de radiateurs</a>.</p>\n'
        "</body>\n"
        "</html>\n"
    ).encode("utf-8")


def main():
    html = assembler()
    index = page_index()

    if "--verifier" in sys.argv:
        ecarts = []
        for chemin, attendu in ((SORTIE, html), (INDEX, index)):
            if not chemin.exists():
                ecarts.append(f"  {chemin.name} : absent")
            elif chemin.read_bytes() != attendu:
                ecarts.append(f"  {chemin.name} : ne correspond plus a src/")
        if ecarts:
            sys.exit(
                "ECART :\n" + "\n".join(ecarts)
                + "\nLancer python build.py pour regenerer."
            )
        print(f"A jour : {SORTIE.name} et {INDEX.name} correspondent aux sources de src/.")
        return

    SORTIE.write_bytes(html)
    INDEX.write_bytes(index)
    nb_lignes = len(html.splitlines())
    print(f"{SORTIE.name} reconstruit : {len(html)} octets, {nb_lignes} lignes.")
    print(f"{INDEX.name} reconstruit : {len(index)} octets (redirection pour GitHub Pages).")


if __name__ == "__main__":
    main()
