# Infographic Lab — Augmented Preview

Cette branche contient la préversion augmentée d'Infographic Lab. Elle est conçue pour fonctionner en parallèle de la version stable 1.0.0.

## URL de test

Par défaut :

```text
http://127.0.0.1:3092
```

La version stable conserve son port 3091.

Pour utiliser une adresse LAN ou WireGuard, renseignez `AUGMENTED_BIND` dans le fichier `.env.augmented` au lieu d'exposer le service publiquement.

## Les deux studios

La navigation latérale de la V2 sépare deux usages :

### Structure

- modèle d'idée commun ;
- infographie ;
- Mermaid réel via Mermaid.js ;
- mindmap ;
- Markdown réel via react-markdown + GFM ;
- sources, qualité, identité et Publication Pack.

### Visuels

Le **Visual Campaign Studio** produit des supports marketing, communication et merchandising à partir d'un brief structuré.

Fonctions disponibles :

- objectif, cible, offre, ton, badge, prix et CTA ;
- assistance Vibe / Codex pour le copywriting ;
- cinq directions visuelles : Editorial Luxe, Campaign Impact, Product Spotlight, Retail Promo et Zen Minimal ;
- formats LinkedIn portrait, carré, Story, bannière, flyer A4, affiche, fiche produit et kakemono ;
- réutilisation des profils de marque ;
- ajout local d'une photo, d'un produit ou d'une illustration ;
- exports SVG, PNG et JPG ;
- mockups T-shirt, mug, tote bag, packaging, kakemono et vitrine ;
- Campaign Pack ZIP multi-format avec copy Markdown et fichier de campagne.

Les visuels V2 sont rendus localement dans le navigateur. L'asset marketing n'est pas envoyé à un moteur image externe.

## Démarrage

Depuis le dépôt de la branche `feature/infographic-lab-augmented` :

```bash
cp .env.augmented.example .env.augmented
docker compose --env-file .env.augmented -f docker-compose.augmented.yml up -d --build
```

Puis vérifier :

```bash
docker compose --env-file .env.augmented -f docker-compose.augmented.yml ps
```

## Moteurs IA V2

Le navigateur ne contacte jamais directement un fournisseur. L'application appelle un Provider Gateway local, qui route vers des runners utilisant le même contrat `/generate`.

La V2 conserve volontairement uniquement Vibe et Codex dans l'interface. Le panneau de configuration de fournisseurs supplémentaires est prévu en V3 dans `ROADMAP.md`.

### Vibe

Le compose Augmented utilise le volume défini par :

```text
VIBE_HOME_VOLUME
```

Il peut donc reprendre ou copier un profil Vibe déjà configuré.

### Codex

Le runner Codex est fourni dans `runners/codex`. Il utilise `codex exec` en mode non interactif et le profil ChatGPT/Codex stocké dans `CODEX_HOME`.

Créer le volume puis authentifier Codex une première fois si aucun volume existant n'est réutilisé :

```bash
docker volume create infographic-lab_codex_home
docker compose --env-file .env.augmented -f docker-compose.augmented.yml run --rm codex-runner codex login --device-auth
```

Si un volume Docker Codex déjà authentifié existe, renseigner son nom dans :

```text
CODEX_HOME_VOLUME=<nom-du-volume-existant>
```

## Mode Automatique

Ordre par défaut :

```text
Vibe → Codex
```

Il peut être changé avec :

```text
AI_PROVIDER_ORDER=codex,vibe
```

Si un moteur manuel est choisi dans le Studio Structure, aucun fallback n'est appliqué silencieusement. Le Visual Campaign Studio utilise le mode Automatique pour l'assistance de copywriting.

## V3 — moteurs configurables

La V3 prévoit le **Provider & Model Control Center** pour :

- Ollama ;
- LM Studio ;
- endpoints compatibles OpenAI ;
- fournisseurs API configurables ;
- ComfyUI et moteurs image locaux ;
- routage par capacité et profils local / hybride / qualité / coût.

Ce panneau n'est pas inclus dans la V2 actuelle.

## Données locales

La bibliothèque, les profils visuels, les snapshots, le thème et le dernier brief marketing sont conservés localement dans le navigateur. Le Publication Pack et le Campaign Pack sont construits localement puis téléchargés sous forme de ZIP.

## Arrêt

```bash
docker compose --env-file .env.augmented -f docker-compose.augmented.yml down
```

Les volumes d'authentification Vibe/Codex ne sont pas supprimés par cette commande.
