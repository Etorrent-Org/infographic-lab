# Infographic Lab — Augmented Preview

Cette branche contient la préversion augmentée d'Infographic Lab. Elle fonctionne en parallèle de la version stable 1.0.0.

## URL de test

```text
http://127.0.0.1:3092
```

La version stable conserve son port 3091.

Pour une adresse LAN ou WireGuard, utilisez `AUGMENTED_BIND` dans `.env.augmented` plutôt qu'une exposition publique.

## Les deux studios

### Structure

- Provider Gateway Vibe / Codex / Automatique
- Infographie, Mermaid, Mindmap et Markdown
- Brief, modèle d'idée, blocs intelligents, preuves et sources
- profils de marque locaux
- Quality Gate
- Publication Pack
- bibliothèque locale et snapshots

### Visuels — Visual Campaign Studio

Visual Campaign Studio produit des assets de communication à partir d'un brief structuré et d'une identité de marque.

Le moteur créatif est recentré sur quatre familles :

- **Editorial Premium** — B2B, expertise, vision, offre premium ;
- **Campaign Bold** — lancement, annonce, événement, social ads ;
- **Product / Offer Spotlight** — produit, service, solution, fonctionnalité ;
- **Clean Retail / Promo** — prix, promotion, bundle, offre limitée.

Chaque famille dispose de trois layouts réels, soit 12 compositions. Le moteur choisit automatiquement une variante selon le format, la densité de contenu, la présence d'un asset, d'un prix et d'un badge.

Les mockups merchandising ont été supprimés pour recentrer le produit sur des supports directement exploitables.

## Formats Visuels

- LinkedIn portrait 1080×1350
- carré 1080×1080
- Story 1080×1920
- bannière 1200×628
- flyer A4
- affiche
- visuel offre
- affiche verticale

## Exports

- SVG
- PNG
- JPG
- Campaign Pack ZIP multi-format

## Moteur créatif

Le rendu reste local et déterministe :

- 12 layouts distincts ;
- typographie adaptative ;
- grilles éditoriales, textures légères et compositions à contraste renforcé ;
- intégration d'un asset utilisateur sans upload externe ;
- Quality Gate local ;
- fallback de rendu pour éviter une page blanche si une validation SVG échoue ;
- baseline structurelle de 128 rendus.

Le cadrage détaillé est documenté dans `VISUAL_CAMPAIGN_REDESIGN_PLAN.md`.

## Déploiement Augmented

Le compose Augmented peut utiliser les images Docker Hub ou des images construites localement selon `AUGMENTED_APP_IMAGE`, `AUGMENTED_CODEX_IMAGE` et `AUGMENTED_PULL_POLICY`.

Pour tester le code de la branche avant republication Docker Hub, utilisez un build local.

## Validation

La PR Augmented reste en brouillon tant que la preview 3092 n'est pas validée visuellement et fonctionnellement.

L'image Docker Hub Augmented ne doit pas être republiée avant cette validation explicite.
