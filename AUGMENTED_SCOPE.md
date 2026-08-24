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
   - modèle d'idée éditable au centre ;
   - représentation à droite ;
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
   - application au rendu et aux exports SVG/PNG/HTML.

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

## Hors périmètre de cette version

Voir `ROADMAP.md` pour les décisions reportées, notamment :

- import intelligent multi-source ;
- variantes intelligentes multiples.

## Principes de conception

- local-first ;
- pas de SaaS obligatoire ;
- pas de collaboration cloud ;
- pas de compte utilisateur ;
- pas de connecteurs externes multipliés sans besoin validé ;
- l'IA prépare et propose, l'utilisateur décide ;
- la version stable n'est pas modifiée tant que la préversion Augmented n'est pas validée.
