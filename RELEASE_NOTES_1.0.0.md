# Infographic Lab 1.0.0

Infographic Lab 1.0.0 est la première version stable distribuable de l'application local-first de transformation de texte en infographies éditables.

> **Note historique :** ce document décrit uniquement la Release 1.0.0. Les fonctions de la préversion `feature/infographic-lab-augmented` — multi-provider, nouvelles familles d'infographies, graphiques de données, préférences de génération, Mermaid/Mindmap/Markdown enrichis — ne font pas partie de cette Release.

## Points forts

- génération de structure via Mistral Vibe ;
- rendu AntV et moteur SVG local complémentaire ;
- visuels Processus, Timeline, Liste, Comparaison, Iceberg, Cycle et Sankey simple ;
- styles Clean, Soft, Dark, Sketch et Chalk ;
- templates, pictogrammes et personnalisation locale ;
- retouche ciblée d'un bloc sans régénérer toute l'infographie ;
- sauvegarde de projet JSON et exports SVG, PNG et HTML autonome.

## Installation rapide

1. Installer Docker Desktop.
2. Créer une clé API compatible Mistral Vibe ou disposer d'un profil Vibe existant.
3. Télécharger le dépôt public `Etorrent-Org/infographic-lab`.
4. Copier `.env.example` vers `.env` et renseigner `MISTRAL_API_KEY` si nécessaire.
5. Suivre le parcours d'installation fourni avec la Release 1.0.0.
6. Ouvrir `http://127.0.0.1:3091`.

Le runner Vibe reste interne au réseau Docker et son port 7020 n'est jamais publié sur l'hôte.

## Limites V1

- pas de compte utilisateur, collaboration temps réel ou stockage serveur ;
- pas de base de données ;
- Sankey V1 est narratif et non quantitatif ;
- pas de graphiques de données structurés ;
- l'utilisation de Vibe nécessite un accès Mistral valide et peut entraîner des coûts selon le compte utilisé.

## Après la 1.0.0

Les travaux non publiés sont documentés séparément dans :

- [`README_AUGMENTED.md`](README_AUGMENTED.md) ;
- [`AUGMENTED_SCOPE.md`](AUGMENTED_SCOPE.md) ;
- [`ROADMAP.md`](ROADMAP.md) ;
- [`CHANGELOG.md`](CHANGELOG.md).

Cette séparation évite de présenter comme livrée une fonctionnalité encore en préversion.
