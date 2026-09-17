# Infographic Lab Augmented — périmètre validé

Augmented V2 est désormais intégré à `main`. La stable 1.0.0 reste disponible séparément sur le port `3091` ; Augmented reste un parcours distinct sur `3092`.

## Positionnement

Infographic Lab suit un flux simple :

**texte / idée → modèle structuré → représentation exploitable**.

L'objectif n'est pas de reproduire un éditeur graphique généraliste. Le produit couvre les représentations business et pédagogiques utiles, reste local-first et permet de passer d'une vue à l'autre sans nouvel appel IA.

## Fonctionnalités retenues

1. **Provider Gateway multi-IA**
   - contrat runner HTTP commun ;
   - Vibe et Codex comme premiers moteurs ;
   - mode Automatique avec fallback ;
   - aucun secret exposé au navigateur.

2. **Modèle d'idée commun**
   - une seule structure sémantique ;
   - Infographie, Mermaid, Mindmap et Markdown ;
   - changement de vue sans nouvel appel IA ;
   - métadonnées numériques optionnelles `value`, `unit`, `category`, `series`.

3. **Espace de composition structuré**
   - brief ;
   - modèle d'idée éditable ;
   - canvas de représentation ;
   - réorganisation, ajout, suppression et retouche ciblée des blocs.

4. **Modes d'usage**
   - Expliquer ;
   - Décider ;
   - Convaincre ;
   - Former ;
   - Synthétiser.

5. **Préférences de génération**
   - visuel cible explicite ;
   - orientation Auto / Portrait / Paysage / Carré ;
   - détail Synthétique / Équilibré / Détaillé ;
   - Reformuler intelligemment / Rester proche du texte source.

6. **Preuves & sources**
   - distinction Fait / Interprétation / Suggestion IA ;
   - preuve textuelle attachée à un bloc ;
   - validation côté serveur des faits contre le texte source ;
   - export `sources.md` ;
   - aucune valeur numérique absente de la source n'est inventée.

7. **Identité visuelle persistante**
   - profils locaux ;
   - palette, logo, typographie et footer ;
   - application au rendu et aux exports.

8. **Quality Gate**
   - contrôle local instantané ;
   - analyse IA optionnelle ;
   - problèmes ciblés et corrections textuelles proposées ;
   - aucune correction appliquée sans action utilisateur.

9. **Publication Pack**
   - SVG, PNG, HTML autonome, Markdown, Mermaid `.mmd`, Mindmap JSON, sources, projet JSON ;
   - ZIP généré localement.

10. **Bibliothèque locale de projets**
    - autosave ;
    - ouvrir, dupliquer, renommer, supprimer ;
    - snapshots ;
    - restauration locale.

## Catalogue finalisé

### Structures standard AntV

- Process / étapes ;
- Timeline / Roadmap ;
- Liste / Checklist ;
- Comparaison ;
- Funnel / Pyramide ;
- cartes et variantes compactes.

### Représentations spécialisées locales

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

Les graphiques chiffrés ne sont proposés que lorsque le modèle contient au moins deux valeurs numériques exploitables.

## Compatibilité

Les nouveaux champs sont optionnels. Un ancien projet sans `value`, `unit`, `category`, `series`, orientation ou visuel cible reste lisible.

## Module extrait : Visual Campaign Studio

Visual Campaign Studio ne fait pas partie d'Augmented.

- branche dédiée : `feature/visual-campaign-studio` ;
- architecture dédiée autour d'un vrai canvas éditable ;
- aucune dépendance du planning Infographic Lab à ce chantier ;
- aucune réintégration sans validation autonome.

## Hors périmètre actuel

Voir `ROADMAP.md` : import intelligent multi-source, comparaison simultanée de variantes, Provider & Model Control Center, providers configurables supplémentaires, Slides et édition graphique libre, génération d'images décoratives.

## Principes de conception

- local-first ;
- pas de SaaS obligatoire ;
- pas de collaboration cloud ;
- pas de compte utilisateur ;
- l'IA structure et propose, le moteur local représente ;
- priorité au couple **structure → représentation** ;
- ne pas réimplémenter localement ce qu'une brique open source fiable couvre déjà.
