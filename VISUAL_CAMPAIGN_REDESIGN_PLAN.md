# Visual Campaign Studio — Creative Refresh V3

## Objectif produit

Visual Campaign Studio ne cherche pas à remplacer Canva. Sa valeur vient du flux **structure → visuel** : Infographic Lab clarifie et structure d'abord l'idée, puis doit produire un asset marketing suffisamment crédible pour être publié avec peu ou pas de retouche.

La cible de validation humaine reste **8/10 minimum** sur un cas simple et correctement renseigné.

## Décisions

- Mockups supprimés ;
- UI générale gelée ;
- 4 familles créatives ;
- 3 layouts par famille ;
- 12 compositions réelles ;
- utilisation réelle de la cible, de l'offre, des bénéfices, du prix, du badge et du CTA ;
- aucune dépendance obligatoire à un moteur image ;
- Docker Hub non republié avant validation visuelle.

## Refonte V3 après rejet du rendu 5/10

Le rendu précédent souffrait de quatre défauts : titre surdimensionné, panneau décoratif vide, bénéfices sous-exploités et sensation de template. La V3 remplace cette logique par des compositions où chaque zone visible porte une information ou un point focal utile.

### Editorial Premium

Layouts :
- `editorial-statement`
- `editorial-cover-v3`
- `editorial-modular`

Principes : titre limité, bénéfices visibles, offre et cible intégrées, palette de marque plus présente, aucun panneau vide sans fonction.

### Campaign Bold

Layouts :
- `impact-signal-v3`
- `impact-poster-v3`
- `impact-grid-v3`

Principes : contraste fort, CTA immédiatement lisible, composition d'affiche, modules d'offre et de bénéfices réellement utiles.

### Product / Offer Spotlight

Layouts :
- `spotlight-hero-v3`
- `spotlight-split-v3`
- `spotlight-proof-v3`

Principes : asset traité comme point focal lorsqu'il existe ; sans asset, le moteur utilise offre, prix et bénéfices plutôt qu'un faux visuel décoratif.

### Clean Retail / Promo

Layouts :
- `retail-price-v3`
- `retail-product-v3`
- `retail-grid-v3`

Principes : prix, avantage, offre et CTA lisibles en moins de deux secondes ; densité contrôlée ; grands aplats de marque.

## Quality Gate renforcé

Un candidat est refusé si :
- overflow texte ;
- titre > 32 % de la hauteur utile ;
- zone utile / hero < 34 % ;
- zone morte > 20 % ;
- densité > 68 % ;
- CTA absent ;
- score heuristique de composition insuffisant.

Le score automatique reste un **gate structurel**, pas une note artistique. La validation humaine sur 3092 demeure obligatoire.

## Baseline

La baseline couvre désormais :
- 5 campagnes de référence ;
- 4 familles ;
- 8 formats ;
- soit **160 rendus**.

Le cas `event-premium` reproduit volontairement le brief qui avait exposé le rendu jugé 5/10 :
- accroche longue mais raisonnable ;
- cible TPE / PME ;
- bénéfices Exclusivité / Prestige / Mémoire ;
- direction Editorial Premium ;
- cas sans image.

## Grille humaine 8/10

| Critère | Cible |
|---|---:|
| Impact visuel immédiat | ≥ 8/10 |
| Hiérarchie et lisibilité | ≥ 8/10 |
| Différenciation créative | ≥ 8/10 |
| Crédibilité publiable | ≥ 8/10 |
| Intégration de la marque | ≥ 8/10 |
| Cohérence avec le brief structuré | ≥ 8/10 |

La moyenne doit être **≥ 8/10** et aucun critère ne doit tomber sous 7/10.

## Validation à faire sur 3092

- [ ] aucun texte coupé ou illisible ;
- [ ] le cas `event-premium` sans image est nettement supérieur au rendu 5/10 ;
- [ ] Editorial Premium atteint 8/10 sur un cas B2B simple ;
- [ ] Campaign Bold atteint 8/10 sur lancement / événement ;
- [ ] Spotlight atteint 8/10 avec et sans asset ;
- [ ] Retail atteint 8/10 avec prix / avantage / CTA ;
- [ ] les 4 familles sont immédiatement différenciables ;
- [ ] au moins 70 % des cas examinés sont publiables sans retouche majeure ;
- [ ] aucun retour de page blanche.

## Déploiement

La PR reste en draft jusqu'à validation visuelle sur 3092. La publication Docker Hub reste bloquée jusque-là.
