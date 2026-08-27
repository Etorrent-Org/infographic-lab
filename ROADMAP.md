# Roadmap — Infographic Lab Augmented

Ce fichier conserve uniquement les idées volontairement sorties du périmètre de la version Augmented en cours. Une entrée placée ici n'est pas engagée pour la version actuelle.

## Principes

- la version stable `main` reste inchangée tant que la version Augmented n'est pas validée ;
- les développements Augmented restent isolés sur `feature/infographic-lab-augmented` ;
- Visual Campaign Studio reste isolé sur `feature/visual-campaign-studio` ;
- chaque entrée de roadmap doit être revalidée avant implémentation ;
- priorité au flux **structure → représentation** et aux usages réellement utiles aux TPE / PME.

## Sorti de la roadmap et intégré à Augmented

Les éléments suivants ont été retenus pour la finalisation et ne sont donc plus des idées futures :

- orientation Auto / Portrait / Paysage / Carré ;
- niveau de détail Synthétique / Équilibré / Détaillé ;
- option « Rester proche du texte source » ;
- visuel cible explicite ;
- Iceberg directement sélectionnable ;
- Table visuelle ;
- Hiérarchie / arbre ;
- Venn ;
- Matrix, SWOT, Impact / Effort, Eisenhower et Matrice de risque ;
- KPI ;
- graphiques Barres, Colonnes, Courbe, Donut et Waterfall chiffré ;
- métadonnées numériques optionnelles `value`, `unit`, `category`, `series`.

## Visual Campaign Studio — chantier séparé

**Statut :** extrait de la version Augmented et isolé sur `feature/visual-campaign-studio`.

**Décision du 26 août 2026 :** le module visuel marketing ne doit plus ralentir la finalisation du cœur Structure / Infographie.

### Objectif

Construire un studio capable de transformer un brief structuré en asset marketing crédible, sans chercher à remplacer Canva comme éditeur généraliste.

### Direction technique

La piste prioritaire est **Fabric.js** pour disposer d'un vrai canvas éditable. Konva.js reste une alternative. Polotno Studio App et React Design Editor servent uniquement de références tant que leurs conditions de réutilisation ne sont pas pleinement clarifiées.

### Règle de retour

Aucun code Campaign Studio ne revient dans Augmented avant validation autonome du module et accord explicite.

## Import intelligent multi-source

**Statut :** futur — non retenu pour la version Augmented actuelle.

### Entrées envisagées

- texte collé ;
- Markdown ;
- PDF ;
- URL ;
- image ;
- fichier texte / JSON.

### Pistes ultérieures

- DOCX ;
- PPTX ;
- Notion ;
- Google Drive / OneDrive / SharePoint ;
- plusieurs sources dans un même projet.

### Principes

- extraction locale lorsque fiable ;
- IA réservée à la compréhension et à la structuration ;
- conservation de la provenance ;
- pas de multiplication de connecteurs cloud sans besoin validé.

## Comparaison de variantes intelligentes

**Statut :** futur.

L'orientation et le niveau de détail sont maintenant intégrés. Ce chantier futur concerne uniquement la **comparaison simultanée** de plusieurs propositions d'un même modèle, par exemple :

- Executive ;
- Pédagogique ;
- Visuelle ;
- Minimaliste.

Règles envisagées :

- maximum trois variantes comparées ;
- même socle factuel ;
- aucune génération infinie de versions ;
- sélection explicite par l'utilisateur.

## Data avancée

**Statut :** futur.

La version Augmented couvre les graphiques à une série issus de valeurs explicites. Sont volontairement repoussés :

- séries multiples complexes ;
- axes doubles ;
- statistiques calculées ;
- agrégations automatiques ;
- import CSV / XLSX ;
- Sankey quantitatif avec poids réels ;
- dashboards multi-pages.

Toute évolution devra conserver la règle : **pas de donnée inventée pour rendre un graphique possible**.

## Slides / présentations

**Statut :** hors scope actuel.

Napkin et d'autres outils couvrent désormais la présentation complète. Infographic Lab ne suit pas cette direction dans la version actuelle afin d'éviter de devenir un éditeur bureautique généraliste.

## V3 — Provider & Model Control Center

**Statut :** V3.

Objectif : permettre à l'utilisateur de configurer lui-même les moteurs disponibles et leur routage sans modifier le code ou le Docker Compose.

### Providers texte / raisonnement envisagés

- Vibe ;
- Codex ;
- Ollama local ;
- LM Studio local ;
- endpoints compatibles OpenAI ;
- fournisseurs API configurables.

### Providers image envisagés

- ComfyUI local ;
- moteurs Stable Diffusion locaux compatibles ;
- endpoints image API activés explicitement par l'utilisateur.

### Règles de sécurité

- aucun secret transmis au frontend ;
- configuration locale par défaut ;
- aucune dépendance obligatoire à une API payante ;
- un provider indisponible ne doit jamais empêcher l'application de démarrer.
