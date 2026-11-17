# Pilote Life Editor dans Infographic Lab Augmented (sans déploiement automatique)

Branche de démonstration : `feature/life-editor-pilot-20261117`. La version stable 3091, les moteurs d'IA, les données, la bibliothèque et les exports sont inchangés.

## Dépendance externe

Life Editor est **un service distinct** en React/Tiptap. L'application hôte n'importe aucune dépendance Tiptap. Pour cette branche pilote, la variable `VITE_LIFE_EDITOR_URL` est définie **au moment du build Vite** ; sans elle, le bouton n'apparaît pas.

- Configurez une URL absolue privée (ex. `https://life-editor.exemple-prive.fr/`) dans `VITE_LIFE_EDITOR_URL` avant compilation.
- Déclarez **l'origine exacte** d'Infographic Lab dans `LIFE_EDITOR_PARENT_ORIGINS` côté Life Editor, afin d'autoriser iframe et `postMessage`.
- Life Editor n'envoie pas de requête IA et ne conserve son brouillon que dans le navigateur. L'application hôte conserve le flux de sauvegarde et génération actuel.
- Le bouton « Life Editor » ouvre une iframe. Le bouton éclair y applique son Markdown au champ existant « Contenu source ». Il ne lance **pas** la génération ; utilisez ensuite « Construire le modèle ».
- Le champ texte historique reste disponible en permanence, y compris si l'éditeur externe est inaccessible.
- L'intégration vérifie `event.origin`, `event.source`, `documentId`, `schema` et la limite de 12 000 caractères. Les origines autorisées doivent également être configurées côté serveur éditeur.

## Validation à réaliser avant fusion

1. Construire l'image pilote avec `VITE_LIFE_EDITOR_URL` défini et vérifier l'apparition du bouton.
2. Vérifier création, édition Markdown simple, bouton éclair, sauvegarde locale du projet, réouverture, et génération existante avec un texte de 12 000 caractères.
3. Tester iframe bloquée si origine invalide ; vérifier que le bouton ne s'affiche pas sans variable.
4. Contrôler l'affichage 1440, 768, 390 px, clavier, contraste et restauration de l'image précédente.
5. Ne fusionner ni déployer avant validation explicite et CI verte.

**Aucune API externe ou clé supplémentaire n'est requise.**
