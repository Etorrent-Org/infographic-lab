# Infographic Lab Augmented — périmètre validé

Branche de travail : `feature/infographic-lab-augmented`.

La version stable `main` reste la référence publique 1.0.0. Le studio Augmented est une préversion isolée destinée aux tests sur le port 3092.

## Fonctionnalités retenues

1. **Provider Gateway multi-IA**
   - contrat runner HTTP commun ;
   - Vibe et Codex comme premiers moteurs ;
   - mode Automatique avec fallback ;
   - aucun secret exposé au navigateur.

2. **Modèle d'idée commun**
   - une seule structure sémantique ;
   - quatre représentations : Infographie, Mermaid, Mindmap et Markdown ;
   - changement de vue sans nouvel appel IA.

3. **Espace de composition structuré**
   - brief à gauche ;
   - modèle d'idée éditable ;
   - grand canvas de représentation ;
   - réorganisation, ajout, suppression et retouche ciblée des blocs.

4. **Modes d'usage**
   - Expliquer ;
   - Décider ;
   - Convaincre ;
   - Former ;
   - Synthétiser.

5. **Blocs intelligents**
   - Process ;
   - Timeline ;
   - Comparaison ;
   - Liste ;
   - Cycle ;
   - Matrice ;
   - Architecture ;
   - Synthèse.

6. **Preuves & sources**
   - distinction Fait / Interprétation / Suggestion IA ;
   - preuve textuelle attachée à un bloc ;
   - une preuve déclarée comme fait est revalidée côté serveur contre le texte source ;
   - export `sources.md`.

7. **Identité visuelle persistante**
   - profils locaux ;
   - palette, logo, typographie et footer ;
   - application au rendu et aux exports.

8. **Quality Gate**
   - contrôle local instantané ;
   - analyse IA optionnelle ;
   - score UX, problèmes ciblés et corrections textuelles proposées ;
   - aucune correction appliquée sans action utilisateur.

9. **Publication Pack**
   - SVG ;
   - PNG ;
   - HTML autonome ;
   - Markdown ;
   - Mermaid `.mmd` ;
   - Mindmap JSON ;
   - sources ;
   - projet JSON ;
   - ZIP généré localement dans le navigateur.

10. **Bibliothèque locale de projets**
    - autosave ;
    - ouvrir, dupliquer, renommer, supprimer ;
    - huit snapshots maximum par projet ;
    - restauration locale.

11. **Visual Campaign Studio**
    - espace séparé `Visuels` accessible depuis la navigation de la suite ;
    - brief marketing : objectif, cible, offre, ton, badge, prix, CTA ;
    - assistance Vibe / Codex pour optimiser l'accroche, le sous-message et les bénéfices ;
    - cinq directions visuelles natives : Editorial Luxe, Campaign Impact, Product Spotlight, Retail Promo, Zen Minimal ;
    - huit formats : LinkedIn portrait, carré, Story, bannière, flyer A4, affiche, fiche produit et kakemono ;
    - brand kit réutilisant les profils visuels locaux ;
    - ajout local d'une photo, d'un produit ou d'une illustration ;
    - exports SVG, PNG et JPG ;
    - rendu marketing calculé localement, sans upload obligatoire du visuel.

12. **Merchandising & communication**
    - mockups vectoriels : T-shirt, mug, tote bag, packaging, kakemono et vitrine / affiche ;
    - Campaign Pack multi-format ;
    - adaptation automatique d'une même création à plusieurs formats ;
    - export ZIP avec visuels SVG/PNG, copy Markdown et métadonnées de campagne.

13. **Moteurs de rendu embarqués**
    - Mermaid.js pour le diagramme réel ;
    - react-markdown + GFM pour le document Markdown réel ;
    - thème clair / sombre persistant pour l'interface.

## Hors périmètre de cette version

Voir `ROADMAP.md` pour les décisions reportées, notamment :

- import intelligent multi-source ;
- variantes intelligentes multiples ;
- panneau de configuration multi-IA ;
- Ollama / LM Studio / ComfyUI et fournisseurs configurables par l'utilisateur ;
- mockups photoréalistes génératifs.

Le **Provider & Model Control Center** est désormais ciblé explicitement pour la V3.

## Principes de conception

- local-first ;
- pas de SaaS obligatoire ;
- pas de collaboration cloud ;
- pas de compte utilisateur ;
- pas de connecteurs externes multipliés sans besoin validé ;
- l'IA prépare et propose, l'utilisateur décide ;
- les visuels marketing peuvent être produits sans moteur image génératif ;
- la version stable n'est pas modifiée tant que la préversion Augmented n'est pas validée.
