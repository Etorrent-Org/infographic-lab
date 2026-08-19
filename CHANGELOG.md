# Changelog

Toutes les évolutions notables d'Infographic Lab sont documentées ici.

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
