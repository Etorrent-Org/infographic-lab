# Visual Campaign Studio — Restart séparé

Branche : `feature/visual-campaign-studio`

## Décision

Visual Campaign Studio est sorti d'Infographic Lab Augmented afin de ne plus bloquer la finalisation du cœur Structure / Infographie.

Les moteurs SVG successifs ont permis de valider le workflow, mais pas le niveau artistique attendu. Le chantier repart donc comme un produit/module autonome, sans rustine et sans obligation de conserver les layouts actuels.

## Positionnement

Visual Campaign Studio ne cherche pas à remplacer Canva.

Sa valeur doit venir du flux :

**brief structuré → direction créative → asset éditable → déclinaisons multi-format**

Infographic Lab apporte la structure et la compréhension du contenu. Campaign Studio doit transformer ce socle en visuel de campagne crédible.

Seuil de retour dans Infographic Lab : **validation humaine ≥ 8/10** sur les cas de référence.

## Architecture cible

### Base prioritaire : Fabric.js

Repo : `fabricjs/fabric.js`

Pourquoi :
- Canvas éditable mature ;
- TypeScript ;
- objets, texte et images manipulables ;
- transformations, calques et sélection ;
- import / export SVG ;
- licence MIT détectée sur GitHub ;
- suffisamment bas niveau pour conserver une UX spécifique à Campaign Studio.

### Alternative : Konva.js

Repo : `konvajs/konva`

Atouts :
- Canvas interactif ;
- TypeScript ;
- drag & drop, shapes, événements et transformations ;
- écosystème React.

Condition : vérifier la licence exacte avant adoption, les métadonnées GitHub inspectées ne remontant pas de SPDX exploitable.

### Référence UX / architecture : Polotno Studio App

Repo : `polotno-project/polotno-studio-app`

À utiliser comme référence d'architecture et d'expérience, pas comme dépendance ni source de code tant que les droits de réutilisation ne sont pas clarifiés.

### Référence historique : React Design Editor

Repo : `salgum1114/react-design-editor`

Éditeur basé sur Fabric.js, sous licence MIT. Intéressant pour comprendre l'assemblage canvas / outils / export, mais trop ancien pour être repris tel quel.

## Ce qui est abandonné

- moteur de placement marketing entièrement codé à la main en SVG ;
- layouts figés pilotés uniquement par heuristiques ;
- formes décoratives utilisées pour remplir les zones vides ;
- faux score artistique automatique présenté comme un indicateur de qualité visuelle ;
- dépendance du planning Infographic Lab à Campaign Studio.

Les anciens fichiers restent sur cette branche uniquement comme historique et source de besoins fonctionnels.

## MVP technique à reconstruire

### Lot 1 — Canvas éditable Fabric.js

- scène 1080×1350 ;
- sélection / déplacement / redimensionnement ;
- édition de texte ;
- images et logo ;
- calques ;
- zoom ;
- undo / redo ;
- export PNG / SVG.

### Lot 2 — Modèle de campagne

Le canvas ne reçoit pas du texte brut. Il reçoit un modèle structuré :

- marque ;
- objectif ;
- cible ;
- accroche ;
- sous-accroche ;
- bénéfices ;
- offre / prix ;
- CTA ;
- asset principal ;
- contraintes de format.

### Lot 3 — Templates JSON

Les directions créatives deviennent des templates de scène éditables et versionnés :

- zones ;
- rôles typographiques ;
- contraintes min / max ;
- placement d'asset ;
- ordre des calques ;
- règles de contraste ;
- zones sûres.

L'IA choisit et remplit un template, elle ne place pas chaque pixel.

### Lot 4 — Brand Kit

- couleurs ;
- typographies ;
- logo ;
- marges ;
- styles de boutons / badges ;
- presets locaux.

### Lot 5 — Multi-format

Décliner une campagne depuis une scène source vers :

- LinkedIn portrait ;
- carré ;
- story ;
- bannière ;
- affiche ;
- flyer / one-pager.

Chaque format dispose d'un template ou d'une adaptation contrôlée. Pas de simple resize proportionnel.

### Lot 6 — Génération assistée

L'IA peut :
- raccourcir une accroche ;
- proposer 2–3 directions ;
- sélectionner un template ;
- adapter la copy au format ;
- suggérer une hiérarchie.

Elle ne doit pas :
- inventer une mise en page pixel par pixel ;
- masquer un overflow ;
- prétendre noter artistiquement son propre rendu.

## Validation avant réintégration

Jeu de tests minimum :
- B2B premium sans image ;
- B2B avec photo ;
- lancement événement ;
- offre produit ;
- promotion prix ;
- recrutement ;
- message court ;
- message moyen ;
- déclinaison portrait / carré / story / bannière.

Grille humaine :
- impact immédiat ;
- hiérarchie / lisibilité ;
- différenciation créative ;
- crédibilité publiable ;
- intégration de marque ;
- cohérence avec le brief.

Objectif : moyenne ≥ 8/10, aucun critère < 7/10.

## Règle de réintégration

Campaign Studio ne revient pas dans `feature/infographic-lab-augmented` tant que :

1. le prototype Fabric.js n'est pas stable ;
2. les exports ne sont pas fiables ;
3. les formats ne sont pas maîtrisés ;
4. le test humain 8/10 n'est pas atteint ;
5. la réintégration n'est pas explicitement validée.
