# Third-party components

Infographic Lab s'appuie sur plusieurs composants tiers. Ce document décrit leur rôle ; les licences applicables restent celles publiées par leurs projets respectifs.

## Runtime stable 1.0.0

| Composant | Version | Rôle |
|---|---:|---|
| React | 19.1.1 | Interface utilisateur |
| React DOM | 19.1.1 | Rendu React navigateur |
| AntV Infographic | 0.2.19 | Gabarits et rendu d'infographies |
| Mistral Vibe | 2.21.0 validé en V1 | Structuration IA via runner Docker |
| Node.js | image Node du Dockerfile | Passerelle locale et serveur statique |
| Python | image du runner | Runtime du runner Vibe |

## Runtime Augmented

La préversion réutilise les composants de la stable et ajoute les usages suivants :

| Composant | Rôle Augmented |
|---|---|
| AntV Infographic | moteur principal des structures standard : listes, séquences, comparaisons, funnel, pyramide et variantes |
| Mermaid | diagrammes Mermaid réels à partir du modèle d'idée |
| react-markdown | rendu du document Markdown |
| remark-gfm | support GitHub Flavored Markdown |
| Mistral Vibe runner | provider de structuration disponible dans le gateway |
| OpenAI Codex runner | second provider de structuration disponible dans le gateway |

Les nouvelles familles Iceberg, Matrix, SWOT, Impact / Effort, Eisenhower, Risk Matrix, Architecture, Hub, Hiérarchie, Venn, Table, KPI et graphiques chiffrés sont rendues par du SVG local et **n'ajoutent aucune nouvelle dépendance JavaScript**.

## Outils de build

| Composant | Version du dépôt | Rôle |
|---|---:|---|
| TypeScript | 5.9.2 | Vérification de types |
| Vite | 7.1.5 | Build frontend |
| @vitejs/plugin-react | 5.0.2 | Intégration React/Vite |

## Services et providers externes

Infographic Lab n'impose pas un SaaS de rendu : les représentations, exports, projets et pictogrammes sont générés ou stockés localement.

L'accès aux moteurs IA dépend des providers que l'utilisateur configure dans les runners. Les secrets restent hors du navigateur.

## Visual Campaign Studio

Fabric.js est étudié et utilisé sur la branche séparée `feature/visual-campaign-studio`. **Fabric.js n'est pas une dépendance de la branche Augmented Infographic Lab.**

Cette séparation doit rester explicite afin de ne pas faire croire que le canvas marketing fait partie du runtime Infographic Lab actuel.

## Vérification des licences

Avant toute nouvelle dépendance :

1. vérifier la licence dans le dépôt officiel ;
2. documenter son rôle ici ;
3. éviter de reprendre du code dont les droits de réutilisation sont ambigus ;
4. préférer une brique existante à une réimplémentation uniquement lorsque sa licence et son intégration sont compatibles avec le projet.
