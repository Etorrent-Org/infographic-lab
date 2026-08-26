# Infographic Lab — Augmented Preview

Cette branche contient la préversion augmentée d'Infographic Lab. Elle fonctionne en parallèle de la version stable 1.0.0.

## URL de test

```text
http://127.0.0.1:3092
```

La version stable conserve son port 3091.

Pour une adresse LAN ou WireGuard, utilisez `AUGMENTED_BIND` dans `.env.augmented` plutôt qu'une exposition publique.

## Périmètre actuel

La version Augmented est recentrée sur le cœur d'Infographic Lab : **transformer une idée ou un texte en structure claire puis en représentations visuelles exploitables**.

Le module **Visual Campaign Studio n'est plus inclus dans cette version**. Son code est isolé sur la branche `feature/visual-campaign-studio` afin de repartir sur une architecture dédiée sans bloquer la finalisation d'Infographic Lab.

### Studio Structure

- Provider Gateway Vibe / Codex / Automatique
- Infographie, Mermaid, Mindmap et Markdown
- brief, modèle d'idée, blocs intelligents, preuves et sources
- profils de marque locaux
- Quality Gate
- Publication Pack
- bibliothèque locale et snapshots
- thème clair / sombre persistant

## Infographies

Le moteur s'appuie sur `@antv/infographic` et sur des rendus SVG locaux spécialisés lorsque cela apporte une représentation plus utile qu'un template générique.

Les familles disponibles couvrent notamment :

- processus et étapes ;
- roadmap / timeline ;
- checklist / listes ;
- comparaison ;
- entonnoir ;
- pyramide ;
- iceberg ;
- cycle ;
- Sankey narratif ;
- **matrice de synthèse 2×2** ;
- **architecture en couches** ;
- **carte radiale / hub d'idées** ;
- cartes, waterfall et variantes compactes AntV.

Les trois dernières représentations sont des rendus SVG locaux ajoutés pendant la finalisation. Elles utilisent le même modèle d'idée et restent exportables comme les autres infographies.

Le projet conserve `@antv/infographic` comme moteur open source principal plutôt que de réimplémenter les familles déjà couvertes en amont.

## Exports

- SVG ;
- PNG ;
- HTML autonome ;
- Markdown ;
- Mermaid `.mmd` ;
- Mindmap JSON ;
- sources ;
- projet JSON ;
- Publication Pack ZIP généré localement.

## Déploiement Augmented

Le compose Augmented peut utiliser les images Docker Hub ou des images construites localement selon `AUGMENTED_APP_IMAGE`, `AUGMENTED_CODEX_IMAGE` et `AUGMENTED_PULL_POLICY`.

Pour tester le code de la branche avant republication Docker Hub, utilisez un build local.

## Chantiers séparés

### Visual Campaign Studio

Branche : `feature/visual-campaign-studio`.

Le chantier repart séparément. La piste technique prioritaire est désormais **Fabric.js** pour disposer d'un vrai canvas éditable au lieu d'un moteur de placement marketing maison. Konva.js reste une alternative à évaluer ; Polotno Studio App et React Design Editor servent de références d'architecture / UX selon leurs licences respectives.

Le cadrage de reprise est documenté dans `CAMPAIGN_STUDIO_RESTART.md` sur la branche dédiée.

Aucun code Campaign Studio ne doit revenir dans la version Augmented avant validation autonome du module.

### V3 providers

Le Provider & Model Control Center reste hors périmètre de cette version.

## Validation

La PR Augmented reste en brouillon tant que la preview 3092 n'est pas validée fonctionnellement et que le catalogue d'infographies n'est pas finalisé.

L'image Docker Hub Augmented ne doit pas être republiée avant cette validation explicite.
