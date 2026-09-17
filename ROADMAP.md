# Roadmap — Infographic Lab

Ce fichier conserve uniquement les idées volontairement sorties du périmètre **Stable 1.0.0 + Augmented V2 actuellement présents dans `main`**. Une entrée placée ici n'est pas engagée.

## Principes

- la stable 1.0.0 et Augmented V2 coexistent dans `main` avec des Docker Compose séparés ;
- Visual Campaign Studio reste isolé sur `feature/visual-campaign-studio` ;
- chaque entrée de roadmap doit être revalidée avant implémentation ;
- priorité au flux **structure → représentation** et aux usages réellement utiles aux TPE / PME.

## Intégré à Augmented V2

Les éléments suivants ne sont plus des idées futures :

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

**Statut :** isolé sur `feature/visual-campaign-studio`.

Objectif : transformer un brief structuré en asset marketing crédible autour d'un vrai canvas éditable, sans chercher à remplacer Canva comme éditeur généraliste.

La piste prioritaire reste **Fabric.js** ; Konva.js reste une alternative. Aucun code Campaign Studio ne revient dans le cœur Infographic Lab sans validation autonome.

## Import intelligent multi-source

**Statut : futur.**

Entrées envisagées : texte collé, Markdown, PDF, URL, image, fichier texte / JSON, puis éventuellement DOCX, PPTX, Notion, Google Drive, OneDrive ou SharePoint.

Principes : extraction locale lorsque fiable, IA réservée à la compréhension et à la structuration, conservation de la provenance, pas de multiplication de connecteurs cloud sans besoin validé.

## Comparaison de variantes intelligentes

**Statut : futur.**

Comparer simultanément plusieurs propositions d'un même modèle, par exemple Executive, Pédagogique, Visuelle ou Minimaliste.

Règles envisagées : maximum trois variantes, même socle factuel, aucune génération infinie, sélection explicite par l'utilisateur.

## Data avancée

**Statut : futur.**

Augmented couvre les graphiques à une série issus de valeurs explicites. Restent hors scope : séries multiples complexes, axes doubles, statistiques calculées, agrégations automatiques, import CSV/XLSX, Sankey quantitatif et dashboards multi-pages.

Règle permanente : **pas de donnée inventée pour rendre un graphique possible**.

## Slides / présentations

**Statut : hors scope actuel.**

Infographic Lab ne devient pas un éditeur bureautique généraliste.

## V3 — Provider & Model Control Center

**Statut : V3.**

Objectif : permettre à l'utilisateur de configurer les moteurs et leur routage sans modifier le code ou Docker Compose.

Providers envisagés : Vibe, Codex, Ollama, LM Studio, endpoints compatibles OpenAI et fournisseurs API configurables. Pour l'image : ComfyUI et moteurs locaux/API activés explicitement.

Règles de sécurité : aucun secret transmis au frontend, configuration locale par défaut, aucune API payante obligatoire, un provider indisponible ne doit jamais empêcher l'application de démarrer.
