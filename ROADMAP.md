# Roadmap — Infographic Lab Augmented

Ce fichier conserve les idées volontairement sorties du périmètre de la version Augmented en cours, afin de limiter le scope sans les perdre.

## Principes

- La version stable `main` reste inchangée tant que la version Augmented n'est pas validée.
- Les développements Augmented restent isolés sur `feature/infographic-lab-augmented`.
- Une idée placée ici n'est pas engagée pour la version en cours.
- Chaque entrée devra être revalidée avant toute implémentation future.

## Visual Campaign Studio — chantier séparé

**Statut :** extrait de la version Augmented et isolé sur `feature/visual-campaign-studio`.

**Décision du 26 août 2026 :** le module visuel marketing est retiré d'Infographic Lab Augmented. Les rendus maison successifs n'atteignent pas le seuil visuel attendu et ne doivent plus ralentir la finalisation du cœur Structure / Infographie.

### Objectif du chantier séparé

Construire un studio de campagne capable de transformer un brief structuré en asset marketing crédible, sans chercher à remplacer Canva comme éditeur généraliste.

### Règles de reprise

- repartir de l'usage et de l'architecture, pas des layouts SVG actuels ;
- réutiliser le brief, le Brand Kit et les sorties structurées d'Infographic Lab ;
- privilégier une vraie brique d'édition graphique open source plutôt qu'un moteur de composition maison ;
- conserver un fonctionnement local-first ;
- ne réintégrer le module dans Infographic Lab qu'après validation autonome.

### Briques GitHub à étudier

#### Fabric.js — piste prioritaire

Repo : `fabricjs/fabric.js`.

- bibliothèque Canvas mature ;
- TypeScript ;
- import / export SVG ;
- édition d'objets, texte, images, transformations ;
- licence MIT détectée sur GitHub ;
- bonne base pour construire un éditeur de campagne sur mesure sans réinventer le canvas.

#### Konva.js — alternative

Repo : `konvajs/konva`.

- framework Canvas interactif TypeScript ;
- drag & drop, shapes, transformations et événements ;
- écosystème React disponible ;
- licence à vérifier précisément avant intégration : GitHub ne remonte pas de SPDX exploitable sur le dépôt principal au moment du cadrage.

#### Polotno Studio App — référence à examiner, pas dépendance validée

Repo : `polotno-project/polotno-studio-app`.

- éditeur de design orienté desktop / agents IA ;
- intéressant comme référence d'architecture et d'UX ;
- aucune licence détectée sur GitHub au moment du cadrage : ne pas reprendre le code tant que les droits de réutilisation ne sont pas clarifiés.

### Première orientation technique

Commencer le prototype Campaign Studio sur **Fabric.js**, avec :

- scène éditable ;
- templates JSON structurés ;
- texte réellement redimensionnable ;
- images / assets de marque ;
- calques ;
- export SVG / PNG ;
- génération de plusieurs formats à partir d'un modèle de campagne ;
- moteur IA limité à la préparation du contenu et à la sélection d'un template, pas au placement pixel par pixel.

## À étudier après la version Augmented actuelle

### Import intelligent multi-source

**Statut :** Roadmap — non retenu pour la version Augmented actuelle.

**Objectif :** permettre à Infographic Lab d'ingérer plusieurs types de sources puis de les normaliser avant construction du modèle d'idée commun.

**Entrées envisagées :**

- texte collé ;
- Markdown ;
- PDF ;
- URL ;
- image ;
- fichier texte / JSON.

**Pistes ultérieures :**

- DOCX ;
- PPTX ;
- Notion ;
- Google Drive / OneDrive / SharePoint ;
- import de plusieurs sources dans un même projet.

**Principes techniques envisagés :**

- privilégier l'extraction locale quand elle est fiable ;
- réserver l'IA à la compréhension sémantique, à la hiérarchisation et à la reformulation ;
- conserver la provenance des contenus pour alimenter le mode preuves & sources ;
- éviter de multiplier les connecteurs cloud tant que le besoin n'est pas validé.

**Décision du 24 août 2026 :** fonctionnalité explicitement repoussée en roadmap afin de préserver un périmètre de version maîtrisé.

### Variantes intelligentes

**Statut :** Roadmap — non retenu pour la version Augmented actuelle.

**Objectif :** générer plusieurs variantes maîtrisées d'un même contenu à partir du modèle d'idée commun, sans modifier les faits ni les sources.

**Variantes envisagées :**

- Executive ;
- Pédagogique ;
- Visuelle ;
- Dense ;
- Équilibrée ;
- Minimaliste.

**Principes envisagés :**

- comparer au maximum trois variantes côte à côte ;
- faire varier la densité, le ton, le niveau de détail ou l'orientation ;
- conserver le même socle factuel et les mêmes références ;
- éviter la génération infinie de versions.

**Décision du 24 août 2026 :** fonctionnalité repoussée en roadmap pour concentrer la version Augmented actuelle sur le cœur de composition et de rendu.

## V3 — Provider & Model Control Center

**Statut :** V3 — explicitement repoussé après la finalisation du cœur Infographic Lab.

**Objectif :** permettre à l'utilisateur de configurer lui-même les moteurs IA disponibles, leurs capacités et leur routage sans modifier le code ou le Docker Compose.

### Fournisseurs texte / raisonnement envisagés

- Vibe ;
- Codex ;
- Ollama local ;
- LM Studio local ;
- endpoints compatibles OpenAI ;
- fournisseurs API configurables.

### Fournisseurs image envisagés

- ComfyUI local ;
- moteurs Stable Diffusion locaux compatibles ;
- endpoints image API lorsque l'utilisateur choisit explicitement de les activer.

### Règles de sécurité

- aucun secret transmis au frontend ;
- configuration locale par défaut ;
- aucune dépendance obligatoire à une API payante ;
- les moteurs locaux restent privilégiables ;
- un provider indisponible ne doit jamais empêcher l'application de démarrer.
