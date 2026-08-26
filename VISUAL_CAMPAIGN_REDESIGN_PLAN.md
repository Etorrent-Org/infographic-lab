# Visual Campaign Studio — Creative Refresh

## Objectif produit

Visual Campaign Studio ne cherche pas à remplacer Canva. Sa valeur vient du couple **structure + rendu** : Infographic Lab transforme d'abord une idée en contenu structuré, puis doit produire un asset marketing suffisamment crédible pour être publié avec peu ou pas de retouche.

Le seuil visé est donc **8/10 minimum** sur la perception visuelle d'un cas simple et correctement renseigné.

La direction 2026 retenue combine : grilles éditoriales assumées, narration en couches, contrastes francs, matière légère, composition asymétrique, simplicité structurée et production multi-format orientée marque.

## Décisions

- suppression totale de la fonctionnalité Mockup ;
- recentrage sur quatre familles créatives fortes ;
- 3 layouts minimum par famille ;
- utilisation réelle du brief dans la composition : cible, offre, bénéfices, prix, badge et CTA ;
- conservation du pipeline local SVG / PNG / JPG et du Campaign Pack ;
- aucune dépendance à un moteur image externe ;
- l'image Docker Hub Augmented n'est pas republiée avant validation visuelle.

## Familles créatives

### Editorial Premium

Usage : offre B2B, expertise, vision, positionnement.

Langage : contraste marque plus présent, compositions asymétriques, serif/sans-serif, contenu structurel intégré au visuel, pas de faux codes magazine décoratifs.

Layouts :
- `editorial-duotone`
- `editorial-cover`
- `editorial-architect`

### Campaign Bold

Usage : lancement, annonce, événement, recrutement, social ads.

Langage : contrastes élevés, blocs francs, diagonales, affichisme, cible et CTA immédiatement visibles.

Layouts :
- `impact-signal`
- `impact-poster`
- `impact-split-blast`

### Product / Offer Spotlight

Usage : produit, service, solution, fonctionnalité.

Langage : sujet central, profondeur légère, hero clair, bénéfices courts, cible et offre lisibles rapidement.

Layouts :
- `spotlight-center-stage`
- `spotlight-split-hero`
- `spotlight-full-bleed`

### Clean Retail / Promo

Usage : prix, promo, bundle, offre limitée.

Langage : prix et avantage immédiatement visibles, grands aplats de marque, densité contrôlée, CTA fort, lecture en deux secondes.

Layouts :
- `retail-offer-hero`
- `retail-shelf`
- `retail-flyer`

## Garde-fous

L'assistant copy demande :
- accroche : 8 à 10 mots ;
- sous-message : 18 à 24 mots ;
- 3 bénéfices courts ;
- CTA : 3 mots maximum.

Le moteur continue à afficher le texte saisi manuellement sans utiliser l'ellipsis comme rustine : il adapte la taille, sélectionne une composition compatible et conserve un rendu de secours uniquement en cas d'échec structurel.

Le Quality Gate refuse en priorité :
- texte en overflow ;
- titre occupant une part excessive du canvas ;
- hero trop faible ;
- zone morte trop importante ;
- densité excessive ;
- SVG structurellement invalide.

Un score heuristique de composition est embarqué dans le SVG. **8/10 est le seuil structurel minimum**, mais il ne remplace pas la validation artistique humaine sur 3092.

## Règles artistiques non négociables

- aucun faux `ISSUE / 01`, numéro de magazine ou décoration sans sens métier ;
- le titre ne doit pas être le seul élément qui donne de la personnalité au visuel ;
- la palette de marque doit participer réellement à la composition ;
- la cible, l'offre ou les bénéfices doivent enrichir le visuel au lieu de rester cachés dans le brief ;
- un cas sans image doit rester intentionnel, pas ressembler à un placeholder ;
- un asset importé doit être traité comme un point focal et non collé dans une carte générique ;
- les quatre familles doivent être reconnaissables sans lire leur nom.

## Mockups supprimés

Sont retirés du produit :
- T-shirt ;
- mug ;
- tote bag ;
- packaging ;
- kakemono mockup ;
- vitrine mockup ;
- bouton Création / Mockup ;
- panneau Mockups ;
- exports mockup du Campaign Pack ;
- types et renderer associés.

Les formats de communication restent disponibles indépendamment des anciens mockups.

## Baseline

La matrice structurelle couvre :
- 4 campagnes de référence ;
- 4 familles créatives ;
- 8 formats ;
- soit 128 rendus.

Le harnais rejette un cas qui :
- utilise le fallback `safe-composition` ;
- produit un SVG invalide ;
- descend sous 8/10 au score heuristique de composition.

## Grille humaine 8/10

Chaque rendu de validation est noté sur :

| Critère | Cible |
|---|---:|
| Impact visuel immédiat | ≥ 8/10 |
| Hiérarchie et lisibilité | ≥ 8/10 |
| Différenciation créative | ≥ 8/10 |
| Crédibilité « publiable » | ≥ 8/10 |
| Intégration de la marque | ≥ 8/10 |
| Cohérence avec le brief structuré | ≥ 8/10 |

La moyenne doit être **≥ 8/10** et aucun critère ne doit tomber sous 7/10.

## Critères de validation visuelle

- [ ] aucun texte coupé ou illisible ;
- [ ] les 4 familles sont immédiatement différenciables ;
- [ ] Editorial Premium atteint 8/10 sur un cas B2B simple sans image ;
- [ ] Campaign Bold atteint 8/10 sur un lancement / événement ;
- [ ] Spotlight atteint 8/10 avec et sans asset ;
- [ ] Retail atteint 8/10 avec prix / avantage / CTA ;
- [ ] un asset importé est intégré à la composition et non simplement collé ;
- [ ] les cas sans image restent intentionnels et graphiquement crédibles ;
- [ ] au moins 70 % des cas examinés sont publiables sans retouche majeure ;
- [ ] aucun retour de page blanche en cas d'erreur de rendu.

## Déploiement

La PR reste en draft jusqu'à validation visuelle sur la preview 3092. La publication Docker Hub reste bloquée jusque-là.
