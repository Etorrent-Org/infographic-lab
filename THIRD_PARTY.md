# Third-party components

Infographic Lab 1.0.0 s'appuie sur plusieurs composants tiers. Ce document décrit leur rôle ; les licences applicables restent celles publiées par leurs projets respectifs.

## Runtime applicatif

| Composant | Version V1 | Rôle |
|---|---:|---|
| React | 19.1.1 | Interface utilisateur |
| React DOM | 19.1.1 | Rendu React navigateur |
| AntV Infographic | 0.2.19 | Gabarits et rendu d'infographies |
| Mistral Vibe | 2.21.0 | Structuration IA du contenu via le runner Docker |
| Node.js | image Node du Dockerfile | Passerelle locale et serveur statique |
| Python | 3.12-slim | Runtime du runner Vibe |

## Outils de build

| Composant | Version V1 | Rôle |
|---|---:|---|
| TypeScript | 5.9.2 | Vérification de types |
| Vite | 7.1.5 | Build frontend |
| @vitejs/plugin-react | 5.0.2 | Intégration React/Vite |

## Services externes

La génération et les retouches Vibe nécessitent un accès aux modèles Mistral configuré via `MISTRAL_API_KEY` ou un profil Vibe existant. Aucun autre service externe n'est requis pour les pictogrammes, templates, rendus SVG locaux, sauvegardes JSON ou exports.
