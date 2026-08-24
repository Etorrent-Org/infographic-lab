# Roadmap — Infographic Lab Augmented

Ce fichier conserve les idées volontairement sorties du périmètre de la version Augmented en cours, afin de limiter le scope sans les perdre.

## Principes

- La version stable `main` reste inchangée tant que la version Augmented n'est pas validée.
- Les développements Augmented restent isolés sur `feature/infographic-lab-augmented`.
- Une idée placée ici n'est pas engagée pour la version en cours.
- Chaque entrée devra être revalidée avant toute implémentation future.

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
