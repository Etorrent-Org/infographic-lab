# Infographic Lab — Augmented Preview

Cette branche contient la préversion augmentée d'Infographic Lab. Elle fonctionne en parallèle de la version stable 1.0.0.

## URL de test

```text
http://127.0.0.1:3092
```

La version stable conserve son port 3091.

Pour une adresse LAN ou WireGuard, utilisez `AUGMENTED_BIND` dans `.env.augmented` plutôt qu'une exposition publique.

## Positionnement

Infographic Lab Augmented se concentre sur le cœur **structure → représentation** : transformer une idée ou un texte en modèle clair, puis exploiter ce même modèle sous plusieurs formes sans repartir de zéro.

Le produit vise un positionnement de type **Napkin light local-first**, pas un éditeur graphique généraliste.

Visual Campaign Studio n'est plus inclus dans cette version. Son code et son redémarrage sont isolés sur `feature/visual-campaign-studio`.

## Studio Structure

- Provider Gateway Vibe / Codex / Automatique ;
- Infographie, Mermaid, Mindmap et Markdown ;
- brief, modèle d'idée, blocs intelligents, preuves et sources ;
- profils de marque locaux ;
- Quality Gate ;
- Publication Pack ;
- bibliothèque locale et snapshots ;
- thème clair / sombre persistant.

## Préférences de génération

Un panneau flottant **Génération** permet de guider le modèle avant reconstruction :

### Visuel cible

- Automatique ;
- Iceberg ;
- Cycle ;
- Sankey narratif ;
- Matrice 2×2 ;
- SWOT ;
- Impact / Effort ;
- Eisenhower ;
- Matrice de risque ;
- Architecture ;
- Hub / radial ;
- Hiérarchie / arbre ;
- Venn ;
- Table visuelle ;
- KPI ;
- Barres ;
- Colonnes ;
- Courbe ;
- Donut ;
- Waterfall chiffré.

Le visuel demandé est placé en tête des variantes lorsqu'il est compatible avec le modèle généré.

### Orientation

- Auto ;
- Portrait ;
- Paysage ;
- Carré.

Les rendus SVG spécialisés utilisent réellement le ratio demandé. Pour les familles AntV, l'orientation influence la priorité des variantes adaptées, par exemple Roadmap verticale en portrait.

### Niveau de détail

- Synthétique ;
- Équilibré ;
- Détaillé.

### Wording

- Reformuler intelligemment ;
- Rester proche du texte source.

## Catalogue d'infographies

### AntV

AntV reste le moteur open source principal pour :

- processus et étapes ;
- roadmap / timeline ;
- listes / checklist ;
- comparaison ;
- entonnoir ;
- pyramide ;
- cartes et variantes compactes.

### SVG spécialisés

Infographic Lab complète AntV avec :

- Iceberg ;
- Cycle ;
- Sankey narratif ;
- Matrix 2×2 ;
- SWOT ;
- Impact / Effort ;
- Eisenhower ;
- Matrice de risque ;
- Architecture en couches ;
- Hub / radial ;
- Hiérarchie / arbre ;
- Venn ;
- Table visuelle ;
- KPI ;
- Barres ;
- Colonnes ;
- Courbe ;
- Donut ;
- Waterfall chiffré.

### Données chiffrées

Le modèle canonique accepte désormais, de façon optionnelle et rétrocompatible :

```text
value
unit
category
series
```

Le provider ne doit renseigner ces champs que lorsqu'ils sont explicitement justifiés par le texte source.

Les variantes KPI et graphiques chiffrés ne sont affichées que lorsqu'au moins deux valeurs numériques exploitables sont présentes. Si une série est incomplète, Infographic Lab préfère ne pas afficher le graphique demandé plutôt que d'inventer les valeurs manquantes.

## Presets business

Les matrices utilisent un même moteur local avec plusieurs lectures métier :

- Matrice libre ;
- SWOT ;
- Impact / Effort ;
- Eisenhower ;
- Risque.

Cela évite de multiplier des moteurs qui ne diffèrent que par leur sémantique.

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

## Visual Campaign Studio

Branche : `feature/visual-campaign-studio`.

Le chantier marketing repart séparément autour d'un vrai canvas éditable. Il ne doit pas être réintroduit dans Augmented tant qu'il n'est pas validé de façon autonome.

## Hors périmètre immédiat

- Slides ;
- génération d'images décoratives ;
- collaboration temps réel ;
- éditeur graphique libre ;
- import intelligent multi-source ;
- Provider & Model Control Center.

Voir `ROADMAP.md`.

## Validation

La PR Augmented reste en brouillon tant que :

- la preview 3092 n'est pas validée fonctionnellement ;
- les nouvelles représentations n'ont pas été vérifiées visuellement ;
- les exports n'ont pas été vérifiés ;
- l'absence d'invention de valeurs chiffrées n'a pas été confirmée sur les cas de test.

L'image Docker Hub Augmented ne doit pas être republiée avant validation explicite.
