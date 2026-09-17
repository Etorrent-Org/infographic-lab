# Infographic Lab — Augmented V2

Augmented V2 est désormais **intégré à `main`** aux côtés de la stable 1.0.0. Les deux parcours restent séparés au runtime : stable sur `3091`, Augmented sur `3092`.

## URL de test

```text
http://127.0.0.1:3092
```

La version stable conserve son port `3091`.

Pour une adresse LAN ou WireGuard, utilisez `AUGMENTED_BIND` dans `.env.augmented` plutôt qu'une exposition publique.

## Positionnement

Infographic Lab Augmented se concentre sur le cœur **structure → représentation** : transformer une idée ou un texte en modèle clair, puis exploiter ce même modèle sous plusieurs formes sans repartir de zéro.

Le produit vise un positionnement de type **Napkin light local-first**, pas un éditeur graphique généraliste.

Visual Campaign Studio n'est pas inclus dans Augmented. Son chantier reste isolé sur `feature/visual-campaign-studio`.

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

Le panneau **Génération** permet de guider le modèle avant reconstruction :

- visuel cible : Automatique, Iceberg, Cycle, Sankey narratif, Matrice 2×2, SWOT, Impact / Effort, Eisenhower, Matrice de risque, Architecture, Hub / radial, Hiérarchie / arbre, Venn, Table visuelle, KPI, Barres, Colonnes, Courbe, Donut, Waterfall ;
- orientation : Auto / Portrait / Paysage / Carré ;
- niveau de détail : Synthétique / Équilibré / Détaillé ;
- wording : Reformuler intelligemment / Rester proche du texte source.

## Catalogue d'infographies

### AntV

AntV reste le moteur open source principal pour les processus, timelines, listes, comparaisons, entonnoirs, pyramides et cartes.

### SVG spécialisés

Infographic Lab complète AntV avec Iceberg, Cycle, Sankey narratif, Matrix 2×2, SWOT, Impact / Effort, Eisenhower, Matrice de risque, Architecture en couches, Hub / radial, Hiérarchie / arbre, Venn, Table visuelle, KPI, Barres, Colonnes, Courbe, Donut et Waterfall chiffré.

### Données chiffrées

Le modèle canonique accepte de façon optionnelle `value`, `unit`, `category` et `series`. Ces champs ne sont renseignés que lorsqu'ils sont explicitement justifiés par la source.

Les variantes KPI et graphiques chiffrés ne sont affichées que lorsqu'au moins deux valeurs numériques exploitables sont présentes. Une série incomplète reste incomplète : aucune donnée n'est inventée pour rendre un graphique possible.

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

Créer `.env.augmented` depuis `.env.augmented.example`, puis :

```powershell
docker compose -f docker-compose.augmented.yml up -d --build
```

Le compose peut utiliser des images construites localement ou configurées via les variables Augmented. Le navigateur ne reçoit aucun secret provider.

## Visual Campaign Studio

Branche : `feature/visual-campaign-studio`.

Le chantier marketing évolue séparément autour d'un vrai canvas éditable. Il ne doit pas être réintroduit dans Augmented sans validation autonome.

## Validation

La branche Augmented a été fusionnée après une passe comprenant 297 tests structurels et d'intégrité, 116 rendus Chromium, des contrôles SVG/PNG, la compilation des runners Vibe/Codex et la validation des deux Docker Compose.

La fusion dans `main` signifie que le code est intégré ; elle ne transforme pas automatiquement Augmented en nouvelle stable publique ni en image Docker Hub de production.

Voir également `AUGMENTED_SCOPE.md`, `ARCHITECTURE.md`, `ROADMAP.md` et `CHANGELOG.md`.
