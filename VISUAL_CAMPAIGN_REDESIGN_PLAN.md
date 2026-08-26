# Visual Campaign Studio — plan d’exécution de la refonte visuelle

## Objectif

Refondre intégralement le moteur de rendu de Visual Campaign Studio pour produire des visuels marketing réellement publiables, désirables et différenciés, sans modifier l’UI existante.

La cible n’est plus un rendu simplement propre. La cible est un rendu qui puisse soutenir la comparaison avec un bon template Canva utilisé correctement.

## État d’implémentation

- [x] Lot 0 — baseline, cas de test et règles de qualité
- [x] Lot 1 — moteur de composition et sélection automatique de layout
- [x] Lot 2 — Editorial Premium
- [x] Lot 3 — Product Spotlight
- [x] Lot 5 — Quality Gate visuel local / anti-laideur
- [x] Lot 4 — Campaign Bold, Retail Offer et Zen Minimal
- [x] Lot 6 — mockups et cohérence multi-format

L’implémentation technique est terminée. La validation visuelle humaine sur la preview 3092 reste obligatoire avant publication Docker Hub et avant sortie de draft de la PR.

## Contraintes non négociables

- Ne pas modifier l’UI de Visual Campaign Studio.
- Ne pas modifier la navigation, les panneaux, les boutons, les champs ni les styles d’interface.
- Conserver les 8 formats, les 5 directions créatives, le Brand Kit, les exports SVG/PNG/JPG, les mockups et le Campaign Pack.
- Aucun débordement de texte, aucune ligne volontairement coupée, aucun contenu hors zone sûre.
- Aucun secret ni moteur externe obligatoire.
- `main` reste intact tant que la préversion 3092 n’est pas explicitement validée.
- Ne pas republier l’image Docker Hub `augmented-v2` avant validation visuelle explicite.

## Architecture livrée

### Moteur de composition

Le renderer historique monolithique a été remplacé par un moteur à variantes :

- `src/marketing-wow-v2-core.ts` : typographie adaptative, contraste, zones sûres, scoring qualité et sélection déterministe ;
- `src/marketing-wow-v2-layouts.ts` : 15 layouts distincts, soit 3 par direction ;
- `src/marketing-wow-v2-renderer.ts` : choix du meilleur candidat, mockups et rendu final ;
- `src/marketing-wow-v2-validation.ts` : contrôles structurels et Quality Gate local ;
- `src/marketing-wow-v2-baseline.ts` : matrice de validation de 160 rendus ;
- `src/marketing.ts` : API publique conservée, désormais branchée sur le nouveau moteur.

Les anciens renderers `marketing-wow-*` devenus obsolètes ont été supprimés pour éviter deux moteurs concurrents dans le dépôt.

## 15 layouts livrés

### Editorial Premium

1. `editorial-split`
2. `editorial-cover`
3. `editorial-typographic`

### Product Spotlight

1. `spotlight-center-stage`
2. `spotlight-split-hero`
3. `spotlight-full-bleed`

### Campaign Impact

1. `impact-diagonal`
2. `impact-poster`
3. `impact-split-blast`

### Retail Offer

1. `retail-offer-hero`
2. `retail-shelf`
3. `retail-flyer`

### Zen Minimal

1. `zen-gallery`
2. `zen-centered-editorial`
3. `zen-balanced`

## Sélection automatique de layout

Le moteur choisit une variante selon :

- ratio du format ;
- format paysage, carré ou très vertical ;
- longueur du titre ;
- densité du sous-message et de l’offre ;
- présence d’un asset ;
- présence d’un prix ;
- densité globale du contenu.

Le choix est déterministe pour un même contenu.

## Quality Gate local

Chaque candidat est évalué avant rendu final selon :

- risque de texte hors zone ;
- ratio de hauteur du titre ;
- taille relative du hero ;
- densité globale ;
- zone morte ;
- présence du CTA.

Le moteur privilégie un candidat acceptable puis utilise un score de pénalité pour choisir la meilleure variante. Le SVG final est également contrôlé contre `NaN`, `Infinity`, `undefined`, dimensions incohérentes et anomalies structurelles simples.

## Baseline

Le harnais `buildMarketingBaselineReport()` construit :

- 4 campagnes de référence ;
- 5 directions ;
- 8 formats ;
- soit 160 rendus structurellement contrôlables.

Les cas couvrent notamment :

- titre court ;
- titre moyen ;
- titre long ;
- sous-message long ;
- prix ;
- badge ;
- bénéfices ;
- mention légale.

## Garde-fous de développement

- Pas de `overflow:hidden` utilisé pour masquer du texte.
- Pas d’ellipsis comme stratégie principale d’ajustement.
- La typographie est réduite selon la zone disponible.
- Les rendus sans image sont conçus comme des compositions à part entière.
- Les directions ne reposent pas sur un simple changement de couleur.
- L’UI du studio reste gelée.

## Validation finale restant à effectuer sur 3092

- [ ] aucun texte coupé ou débordant sur les cas testés visuellement ;
- [ ] aucune composition visuellement cassée ;
- [ ] 5 directions réellement distinctes ;
- [ ] Editorial Premium crédible et publiable ;
- [ ] Product Spotlight met réellement le sujet en valeur ;
- [ ] Retail communique immédiatement l’offre ;
- [ ] Campaign Bold a une vraie présence de campagne ;
- [ ] Zen Minimal est raffiné et non vide ;
- [ ] mockups assez qualitatifs pour présenter un concept ;
- [ ] au moins 70 % des cas examinés jugés publiables sans retouche majeure ;
- [ ] CI verte sur le head final ;
- [ ] PR #8 sortie du draft uniquement après validation explicite ;
- [ ] image Docker Hub republiée uniquement après validation explicite.
