# Visual Campaign Studio — plan d’exécution de la refonte visuelle

## Objectif

Refondre intégralement le moteur de rendu de Visual Campaign Studio pour produire des visuels marketing réellement publiables, désirables et différenciés, sans modifier l’UI existante.

La cible n’est plus un rendu simplement propre. La cible est un rendu qui puisse soutenir la comparaison avec un bon template Canva utilisé correctement.

## Contraintes non négociables

- Ne pas modifier l’UI de Visual Campaign Studio.
- Ne pas modifier la navigation, les panneaux, les boutons, les champs ni les styles d’interface.
- Conserver les 8 formats, les 5 directions créatives, le Brand Kit, les exports SVG/PNG/JPG, les mockups et le Campaign Pack.
- Aucun débordement de texte, aucune ligne coupée, aucun contenu hors zone sûre.
- Aucun secret ni moteur externe obligatoire.
- `main` reste intact tant que la préversion 3092 n’est pas explicitement validée.
- Ne pas republier l’image Docker Hub `augmented-v2` avant validation visuelle explicite.

## Fichiers UI à considérer comme gelés pendant cette refonte

Sauf correction strictement nécessaire au branchement du moteur, ne pas modifier :

- `src/MarketingStudio.tsx`
- `src/marketing.css`
- `src/ui-audit*.css`
- `src/StudioSuite.tsx`
- les composants de navigation et de formulaire.

Le travail doit rester concentré sur le moteur de rendu, ses helpers et ses tests.

---

# Lots d’exécution

## Lot 0 — Baseline, cas de test et règles de qualité

### Objectif

Créer une base de validation reproductible avant toute nouvelle direction artistique.

### Travaux

- Constituer un jeu de campagnes de référence :
  - titre court ;
  - titre moyen ;
  - titre long ;
  - sous-titre long ;
  - avec et sans image ;
  - avec prix ;
  - avec badge ;
  - avec 3 bénéfices ;
  - avec mention légale.
- Tester les 5 directions sur les 8 formats.
- Ajouter des contrôles automatiques de structure SVG :
  - absence de `NaN` ;
  - absence de `undefined` ;
  - largeur/hauteur cohérentes ;
  - texte contenu dans des zones bornées ;
  - pas d’élément volontairement positionné hors viewport.
- Introduire un rapport de contrôle par rendu.

### Critères de validation

- [ ] 40 rendus minimum couvrant 5 directions × 8 formats.
- [ ] Aucun SVG invalide.
- [ ] Aucun texte hors zone de sécurité sur le jeu de référence.
- [ ] Aucun rendu avec `NaN`, `undefined`, `Infinity` ou dimensions négatives.

---

## Lot 1 — Nouveau moteur de composition et sélection automatique de layout

### Objectif

Sortir de la logique « un template fixe par direction ».

### Travaux

- Introduire une notion explicite de `layout variant`.
- Prévoir au minimum 3 layouts par direction créative.
- Sélectionner automatiquement le layout selon :
  - ratio du format ;
  - longueur du titre ;
  - longueur du sous-message ;
  - présence d’un asset ;
  - présence d’un prix ;
  - présence d’un badge ;
  - densité globale du contenu.
- Mettre en place des zones de composition bornées :
  - marque ;
  - hero ;
  - headline ;
  - subheadline ;
  - offer ;
  - benefits ;
  - CTA ;
  - legal.
- Faire calculer la typographie à partir de la zone réellement disponible et non d’un ratio global arbitraire.

### Critères de validation

- [ ] Aucun layout ne dépend d’un titre surdimensionné pour remplir l’espace.
- [ ] Un titre long provoque un changement de taille ou de layout, jamais un débordement.
- [ ] Un format paysage et un format portrait ne partagent pas artificiellement la même composition.
- [ ] Le moteur choisit une variante de façon déterministe à contenu identique.

---

## Lot 2 — Editorial Premium

### Objectif

Transformer `Editorial Luxe` en rendu réellement premium et éditorial.

### Direction artistique

- Grille forte et précise.
- Asymétrie maîtrisée.
- Espaces négatifs intentionnels.
- Typographie haut de gamme mais jamais surdimensionnée.
- Image traitée comme élément éditorial, pas comme rectangle décoratif.
- Signatures visuelles : rule lines, index, micro-labels, overlays, rythme de grille.

### Variantes minimales

1. Editorial split — texte / image.
2. Editorial cover — image dominante avec couche éditoriale.
3. Editorial typographic — sans asset, mais avec composition typographique réellement construite.

### Critères de validation

- [ ] Le mode sans image ne ressemble jamais à un placeholder.
- [ ] Le titre n’occupe jamais plus d’environ 38 % de la hauteur utile sur un portrait standard.
- [ ] Le CTA et le sous-message restent visibles sans écraser le titre.
- [ ] Le rendu doit pouvoir être confondu avec une mini-affiche éditoriale conçue manuellement.

---

## Lot 3 — Product Spotlight

### Objectif

Faire du produit ou de l’asset le vrai centre d’intérêt.

### Direction artistique

- Hero visuel central ou latéral dominant.
- Mise en scène : halo, profondeur, ombre, environnement graphique.
- Bénéfices sous forme de cartes ou points de preuve.
- CTA clair, secondaire visuellement par rapport au hero.

### Variantes minimales

1. Center stage — produit centré.
2. Split hero — produit d’un côté, message de l’autre.
3. Full bleed — asset en fond ou recadrage fort avec overlay éditorial.

### Critères de validation

- [ ] Avec asset, l’asset occupe visuellement une place dominante.
- [ ] Sans asset, le fallback est une composition graphique crédible et non une silhouette générique pauvre.
- [ ] Aucun visuel ne donne l’impression d’un bloc image collé au-dessus du texte.

---

## Lot 4 — Campaign Bold, Retail Offer et Zen Minimal

### Campaign Bold

- Contraste fort.
- Rythme graphique assumé.
- Diagonales, fragmentation, bandes, overlays ou typographie de campagne.
- Accroche dominante mais bornée.

### Retail Offer

- Priorité à l’offre et à la lisibilité commerciale.
- Prix, badge, avantage et CTA organisés comme une vraie pub retail.
- Densité assumée mais structurée.

### Zen Minimal

- Minimalisme intentionnel, pas vide.
- Typographie raffinée.
- Formes rares mais structurantes.
- Usage précis du blanc et des rythmes horizontaux/verticaux.

### Critères de validation

- [ ] Les 3 directions sont reconnaissables immédiatement sans lire leur nom.
- [ ] Retail permet d’identifier l’offre en moins de 2 secondes.
- [ ] Campaign Bold semble énergique même sans asset.
- [ ] Zen conserve une présence visuelle malgré peu d’éléments.

---

## Lot 5 — Moteur anti-laideur / Quality Gate visuel local

### Objectif

Détecter automatiquement les compositions faibles avant affichage/export.

### Règles à contrôler

- Ratio de surface occupée par le titre.
- Nombre de lignes du titre et du sous-message.
- Densité globale de texte.
- Présence d’un centre d’intérêt.
- Contraste texte/fond.
- Taille minimale du CTA.
- Zone morte excessive.
- Empilement trop dense en bas de composition.
- Hero trop petit ou inutile.
- Risque de collision entre blocs.

### Comportement attendu

Si un rendu dépasse un seuil de risque :

1. réduire la taille typographique ;
2. tenter une autre variante de layout ;
3. réduire les éléments décoratifs ;
4. réorganiser hero/texte ;
5. utiliser un fallback sûr si nécessaire.

### Critères de validation

- [ ] Un layout faible n’est pas présenté sans tentative de fallback.
- [ ] Les corrections sont déterministes et locales.
- [ ] Le Quality Gate ne modifie pas le contenu marketing lui-même.

---

## Lot 6 — Mockups et cohérence multi-format

### Objectif

Éviter qu’un bon visuel perde en qualité lors de sa mise en situation ou de sa déclinaison.

### Travaux

- Revoir les mockups T-shirt, mug, tote, packaging, kakemono et vitrine.
- Donner plus de profondeur aux objets : ombre, perspective, matériau, fond de présentation.
- Vérifier que le visuel intégré reste lisible.
- Valider les déclinaisons d’une même campagne sur :
  - LinkedIn portrait ;
  - carré ;
  - story ;
  - bannière ;
  - A4 ;
  - affiche ;
  - fiche produit ;
  - kakemono.

### Critères de validation

- [ ] Aucun mockup ne ressemble à un wireframe technique.
- [ ] Le message principal reste lisible dans la mise en situation.
- [ ] Une campagne conserve son identité visuelle sur plusieurs formats sans simplement étirer la même composition.

---

# Ordre d’implémentation

1. Lot 0 — baseline et tests.
2. Lot 1 — architecture du moteur et sélection de layout.
3. Lot 2 — Editorial Premium.
4. Lot 3 — Product Spotlight.
5. Lot 5 — Quality Gate visuel, appliqué d’abord aux deux directions prioritaires.
6. Lot 4 — Campaign Bold, Retail Offer, Zen Minimal.
7. Lot 6 — mockups et validation multi-format.

Le Quality Gate est placé avant la fin des 5 directions afin d’éviter de dupliquer de mauvaises pratiques dans les moteurs restants.

---

# Garde-fous de développement

## Interdictions

- Ne pas masquer les problèmes avec `overflow:hidden` sur du texte.
- Ne pas utiliser une ellipse automatique comme solution principale à un manque de place.
- Ne pas résoudre un vide de composition en grossissant le titre.
- Ne pas réutiliser le même layout avec uniquement un changement de couleur pour simuler une direction différente.
- Ne pas utiliser un gros bloc abstrait sans fonction comme hero par défaut.

## Principes

- Une zone de texte doit être mesurée puis typographiée.
- Un rendu sans image doit être conçu comme un vrai cas, pas comme un fallback pauvre.
- Chaque direction doit avoir une grammaire visuelle propre.
- La lisibilité prime sur le remplissage.
- Les éléments décoratifs doivent servir la composition ou disparaître.

---

# Validation finale de la refonte

La refonte ne sera pas considérée comme terminée tant que les points suivants ne sont pas validés visuellement sur la preview 3092 :

- [ ] aucun texte coupé ou débordant ;
- [ ] aucune composition visuellement cassée ;
- [ ] 5 directions réellement distinctes ;
- [ ] Editorial Premium crédible et publiable ;
- [ ] Product Spotlight met réellement le sujet en valeur ;
- [ ] Retail communique immédiatement l’offre ;
- [ ] Campaign Bold a une vraie présence de campagne ;
- [ ] Zen Minimal est raffiné et non vide ;
- [ ] mockups assez qualitatifs pour présenter un concept ;
- [ ] au moins 70 % du jeu de validation jugé publiable sans retouche majeure ;
- [ ] CI verte ;
- [ ] PR #8 toujours draft tant que cette validation n’est pas donnée ;
- [ ] image Docker Hub non republiée avant validation visuelle.

---

# Découpage recommandé des commits

Conserver la convention Porcupine Tree + description française.

Exemples :

- `Anesthetize - ajoute le harnais de validation visuelle`
- `Blackest Eyes - introduit le sélecteur de layouts marketing`
- `Trains - refond Editorial Premium`
- `Lazarus - refond Product Spotlight`
- `Open Car - ajoute le Quality Gate visuel local`
- `The Sound of Muzak - différencie les directions de campagne restantes`
- `Arriving Somewhere but Not Here - finalise les mockups et les déclinaisons`

Chaque lot doit rester testable indépendamment et la PR #8 doit rester en brouillon jusqu’à validation finale.