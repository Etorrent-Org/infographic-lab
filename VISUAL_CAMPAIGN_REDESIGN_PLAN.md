# Visual Campaign Studio — Creative Refresh

## Objectif

Faire de Visual Campaign Studio un générateur d'assets de communication crédibles face aux outils généralistes du marché, sans refaire l'interface du studio.

La refonte s'inspire des codes visuels dominants observés en 2026 : grilles éditoriales plus assumées, narration en couches, contraste plus fort, texture légère, simplicité structurée et production multi-format orientée marque.

## Décisions

- suppression totale de la fonctionnalité Mockup ;
- recentrage sur quatre familles créatives fortes ;
- 3 layouts minimum par famille ;
- conservation du pipeline local SVG / PNG / JPG et du Campaign Pack ;
- aucune dépendance à un moteur image externe ;
- l'image Docker Hub Augmented n'est pas republiée avant validation visuelle.

## Familles créatives

### Editorial Premium

Usage : offre B2B, expertise, vision, positionnement.

Langage : grille éditoriale, matière légère, grands blancs, typographie structurante, split hero, cover et composition typographique.

Layouts :
- `editorial-split`
- `editorial-cover`
- `editorial-typographic`

### Campaign Bold

Usage : lancement, annonce, événement, recrutement, social ads.

Langage : contraste élevé, diagonales, affichisme, rythme, CTA immédiatement visible.

Layouts :
- `impact-diagonal`
- `impact-poster`
- `impact-split-blast`

### Product / Offer Spotlight

Usage : produit, service, solution, fonctionnalité.

Langage : sujet central, hero clair, bénéfices courts, preuve et offre lisibles rapidement.

Layouts :
- `spotlight-center-stage`
- `spotlight-split-hero`
- `spotlight-full-bleed`

### Clean Retail / Promo

Usage : prix, promo, bundle, offre limitée.

Langage : prix et avantage immédiatement visibles, densité contrôlée, CTA fort, lecture en deux secondes.

Layouts :
- `retail-offer-hero`
- `retail-shelf`
- `retail-flyer`

## Garde-fous

L'assistant copy demande désormais :
- accroche : 8 à 10 mots ;
- sous-message : 18 à 24 mots ;
- 3 bénéfices courts ;
- CTA : 3 mots maximum.

Le moteur continue cependant à afficher le texte saisi manuellement sans le tronquer : il adapte la taille, choisit un layout plus dense si nécessaire et conserve un rendu de secours en cas d'échec structurel.

Le Quality Gate refuse en priorité :
- texte en overflow ;
- titre occupant une part excessive du canvas ;
- hero trop faible ;
- zone morte trop importante ;
- densité excessive ;
- SVG structurellement invalide.

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

## Critères de validation visuelle

- [ ] aucun texte coupé ou illisible ;
- [ ] les 4 familles sont immédiatement différenciables ;
- [ ] Editorial Premium peut être publié tel quel sur un cas B2B simple ;
- [ ] Campaign Bold possède une présence d'affiche / campagne ;
- [ ] Spotlight met réellement le sujet ou l'offre au premier plan ;
- [ ] Retail communique prix / avantage / CTA en moins de 2 secondes ;
- [ ] un asset importé est intégré à la composition et non simplement collé ;
- [ ] les cas sans image restent intentionnels et graphiquement crédibles ;
- [ ] au moins 70 % des cas examinés sont publiables sans retouche majeure ;
- [ ] aucun retour de page blanche en cas d'erreur de rendu.

## Déploiement

La PR reste en draft jusqu'à validation visuelle sur la preview 3092. La publication Docker Hub reste bloquée jusque-là.
