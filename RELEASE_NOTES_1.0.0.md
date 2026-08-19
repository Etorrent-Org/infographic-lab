# Infographic Lab 1.0.0

Infographic Lab 1.0.0 est la première version stable distribuable de l'application local-first de transformation de texte en infographies éditables.

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
2. Créer une clé API compatible Mistral Vibe.
3. Télécharger le dépôt public `Etorrent-Org/infographic-lab`.
4. Copier `.env.example` vers `.env` et renseigner `MISTRAL_API_KEY`.
5. Exécuter `./START-INFOGRAPHIC-LAB.ps1 -Build` depuis PowerShell.
6. Ouvrir `http://127.0.0.1:3091`.

Le runner Vibe reste interne au réseau Docker et son port 7020 n'est jamais publié sur Windows.

## Limites V1

- pas de compte utilisateur, collaboration temps réel ou stockage serveur ;
- pas de base de données ;
- Sankey V1 est narratif et non quantitatif ;
- l'utilisation de Vibe nécessite un accès Mistral valide et peut entraîner des coûts selon le compte utilisé.
