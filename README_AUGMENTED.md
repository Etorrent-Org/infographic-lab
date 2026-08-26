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

Le studio Visuels conserve son UI actuelle, mais son moteur de rendu marketing a été entièrement remplacé.

Le nouveau moteur V2 comprend :

- 5 directions créatives ;
- 3 layouts minimum par direction ;
- 15 compositions distinctes ;
- sélection automatique du layout selon le format, la densité de contenu et la présence d'un asset ;
- typographie adaptative calculée à partir des zones réellement disponibles ;
- Quality Gate local pour éviter les compositions faibles ;
- cas sans image traités comme de vraies compositions ;
- mockups enrichis ;
- validation structurelle des SVG.

Variantes livrées :

- Editorial Luxe : `editorial-split`, `editorial-cover`, `editorial-typographic`
- Campaign Impact : `impact-diagonal`, `impact-poster`, `impact-split-blast`
- Product Spotlight : `spotlight-center-stage`, `spotlight-split-hero`, `spotlight-full-bleed`
- Retail Promo : `retail-offer-hero`, `retail-shelf`, `retail-flyer`
- Zen Minimal : `zen-gallery`, `zen-centered-editorial`, `zen-balanced`

Le plan et les critères de validation sont dans `VISUAL_CAMPAIGN_REDESIGN_PLAN.md`.

## Formats Visuels

- LinkedIn portrait 1080×1350
- carré 1080×1080
- Story 1080×1920
- bannière 1200×628
- flyer A4
- affiche
- fiche produit
- kakemono

## Exports

- SVG
- PNG
- JPG
- Campaign Pack ZIP

## Déploiement Augmented

Le compose Augmented peut utiliser les images Docker Hub ou des images construites localement selon `AUGMENTED_APP_IMAGE`, `AUGMENTED_CODEX_IMAGE` et `AUGMENTED_PULL_POLICY`.

Pour tester le code de la branche avant republication Docker Hub, utilisez un build local.

## Validation

La PR Augmented reste en brouillon tant que la preview 3092 n'est pas validée visuellement et fonctionnellement.

L'image Docker Hub Augmented ne doit pas être republiée avant cette validation explicite.
