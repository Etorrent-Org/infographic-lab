# Changelog

Toutes les évolutions notables d'Infographic Lab sont documentées ici.

## [Unreleased]

### Augmented — structure → représentation

- Visual Campaign Studio retiré du périmètre Augmented et isolé sur `feature/visual-campaign-studio` ;
- gateway multi-provider Vibe / Codex avec mode Automatique ;
- vues Infographie, Mermaid, Mindmap et Markdown depuis un modèle d'idée commun ;
- bibliothèque locale, snapshots, Brand Kit, Quality Gate et Publication Pack ;
- catalogue enrichi avec Matrice, Architecture et Hub ;
- Iceberg rendu explicitement sélectionnable comme visuel cible ;
- ajout de Table visuelle, Hiérarchie / arbre et Venn ;
- ajout des presets business SWOT, Impact / Effort, Eisenhower et Matrice de risque ;
- ajout des rendus KPI, Barres, Colonnes, Courbe, Donut et Waterfall chiffré ;
- modèle canonique étendu de façon rétrocompatible avec `value`, `unit`, `category` et `series` ;
- graphiques chiffrés activés uniquement lorsque des valeurs numériques réelles sont disponibles ;
- préférences de génération locales : visuel cible, orientation, niveau de détail et conservation du wording source ;
- le prompt interdit explicitement d'inventer des valeurs pour compléter une série.

### Distribution stable

- installation standard basée sur les images publiées sur Docker Hub ;
- publication multi-architecture `linux/amd64` et `linux/arm64` ;
- récupération automatique des images par `START-INFOGRAPHIC-LAB.ps1` ;
- possibilité de sélectionner un autre tag publié avec `INFOGRAPHIC_LAB_IMAGE_TAG`.

### Maintenance

- la chaîne de release vérifie que le tag Git correspond à la version de `package.json` ;
- les notes de Release sont générées depuis la section de version du `CHANGELOG.md` ;
- documentation du dépôt alignée sur la séparation Stable / Augmented / Campaign Studio.

### Documentation

- clarification de la configuration Mistral Vibe : clé API pour une première installation ou réutilisation d'un profil Vibe existant ;
- ajout du périmètre fonctionnel Augmented, des nouvelles familles de visuels et des garde-fous sur les données.

## [1.0.0] - 2026-08-19

### Ajouté

- génération structurée via Mistral Vibe et rendu local-first ;
- types Auto, Processus, Comparaison, Timeline et Liste ;
- styles V1 Clean, Soft, Dark, Sketch et Chalk ;
- variantes AntV auditées avec garde-fous de longueur ;
- rendus SVG locaux Iceberg, Cycle et Sankey simple ;
- templates prêts à l'emploi, pictogrammes locaux et personnalisation de couleur/densité ;
- édition manuelle des titres, sous-titres et blocs ;
- ajout, suppression et réordonnancement local des blocs ;
- retouche Vibe ciblée d'un bloc avec avant/après et annulation ;
- sauvegarde/reprise de projets JSON v2 avec lecture des anciens projets v1 ;
- exports SVG, PNG et HTML autonome ;
- menu Projet, état Modifié/Enregistré et protections avant remplacement ;
- packaging GitHub Release et génération automatisée de captures de documentation.

### Sécurité

- runner Vibe non exposé sur le réseau hôte ;
- token interne entre l'application et le runner ;
- schémas JSON validés avant rendu ;
- aucun Docker socket, aucune base de données et aucun compte utilisateur.

### Compatibilité

- les styles historiques Zen, Pro, Minimal et Tech restent lisibles à l'ouverture et sont normalisés vers leur équivalent V1.
