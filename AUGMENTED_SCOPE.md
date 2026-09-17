# Infographic Lab Augmented — périmètre validé

Branche de travail : `feature/infographic-lab-augmented`.

La version stable `main` reste la référence publique 1.0.0. Le studio Augmented est une préversion isolée destinée aux tests sur le port 3092.

## Positionnement

Infographic Lab est recentré sur un flux simple :

**texte / idée → modèle structuré → représentation exploitable**.

L'objectif n'est pas de reproduire un éditeur graphique généraliste. Le produit doit couvrir les représentations business et pédagogiques les plus utiles, rester local-first et permettre de passer d'une vue à l'autre sans nouvel appel IA.

## Fonctionnalités retenues

1. **Provider Gateway multi-IA**
   - contrat runner HTTP commun ;
   - Vibe et Codex comme premiers moteurs ;
   - mode Automatique avec fallback ;
   - aucun secret exposé au navigateur.

2. **Modèle d'idée commun**
   - une seule structure sémantique ;
   - quatre représentations : Infographie, Mermaid, Mindmap et Markdown ;
   - changement de vue sans nouvel appel IA ;
   - métadonnées numériques optionnelles `value`, `unit`, `category`, `series` pour les graphiques et KPI.

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

5. **Préférences de génération inspirées des usages Napkin**
   - visuel cible explicite ;
   - orientation Auto / Portrait / Paysage / Carré ;
   - détail Synthétique / Équilibré / Détaillé ;
   - Reformuler intelligemment / Rester proche du texte source.

6. **Blocs intelligents**
   - Process ;
   - Timeline ;
   - Comparaison ;
   - Liste ;
   - Cycle ;
   - Matrice ;
   - Architecture ;
   - Synthèse.

7. **Preuves & sources**
   - distinction Fait / Interprétation / Suggestion IA ;
   - preuve textuelle attachée à un bloc ;
   - un fait est revalidé côté serveur contre le texte source ;
   - export `sources.md` ;
   - aucune valeur numérique absente de la source n'est inventée pour compléter un graphique.

8. **Identité visuelle persistante**
   - profils locaux ;
   - palette, logo, typographie et footer ;
   - application au rendu et aux exports.

9. **Quality Gate**
   - contrôle local instantané ;
   - analyse IA optionnelle ;
   - score UX, problèmes ciblés et corrections textuelles proposées ;
   - aucune correction appliquée sans action utilisateur.

10. **Publication Pack**
    - SVG ;
    - PNG ;
    - HTML autonome ;
    - Markdown ;
    - Mermaid `.mmd` ;
    - Mindmap JSON ;
    - sources ;
    - projet JSON ;
    - ZIP généré localement dans le navigateur.

11. **Bibliothèque locale de projets**
    - autosave ;
    - ouvrir, dupliquer, renommer, supprimer ;
    - huit snapshots maximum par projet ;
    - restauration locale.

## Catalogue d'infographies finalisé

Le catalogue privilégie des **familles utilisateur** plutôt qu'une liste interminable de templates.

### Structures standard AntV

- Process / étapes ;
- Timeline / Roadmap ;
- Liste / Checklist ;
- Comparaison ;
- Funnel / Pyramide ;
- cartes et variantes compactes.

### Représentations spécialisées locales

- Iceberg — désormais sélectionnable explicitement ;
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

Les graphiques chiffrés ne sont proposés comme variantes que lorsque le modèle contient au moins deux valeurs numériques exploitables.

## Règle de compatibilité

Les nouveaux champs sont optionnels. Un ancien projet sans `value`, `unit`, `category`, `series`, orientation ou visuel cible reste lisible.

## Module extrait : Visual Campaign Studio

Visual Campaign Studio ne fait plus partie de cette version Augmented.

- branche dédiée : `feature/visual-campaign-studio` ;
- architecture dédiée autour d'un vrai canvas éditable ;
- aucune dépendance du planning Infographic Lab à ce chantier ;
- aucune réintégration avant validation autonome.

## Hors périmètre de cette version

Voir `ROADMAP.md` :

- import intelligent multi-source ;
- comparaison simultanée de plusieurs variantes ;
- Provider & Model Control Center ;
- Ollama / LM Studio / ComfyUI et providers configurables par l'utilisateur ;
- Slides et édition graphique libre ;
- génération d'images décoratives.

## Principes de conception

- local-first ;
- pas de SaaS obligatoire ;
- pas de collaboration cloud ;
- pas de compte utilisateur ;
- l'IA structure et propose, le moteur local représente ;
- priorité au couple **structure → représentation** ;
- ne pas réimplémenter localement ce qu'une brique open source fiable couvre déjà ;
- la version stable n'est pas modifiée tant que la préversion Augmented n'est pas validée.
