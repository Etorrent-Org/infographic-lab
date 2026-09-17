# Commit convention

## Format

Every new commit in **Infographic Lab** must follow this format:

    <Porcupine Tree song title> - <what was done>

The first part must be the title of a Porcupine Tree song.
Only the song title is used, never lyrics.

The second part must briefly and clearly describe the change made by the commit. French is preferred for repository work performed in the current project.

## Examples

    Trains - enrichit le catalogue d'infographies

    Lazarus - corrige l'import des projets

    Fear of a Blank Planet - renforce la gestion des secrets

## Branches

- `main` reste la branche stable publique ;
- les changements Augmented passent par `feature/infographic-lab-augmented` et sa Pull Request en brouillon ;
- Visual Campaign Studio évolue séparément sur `feature/visual-campaign-studio`.

Ne poussez pas directement une fonctionnalité expérimentale sur `main`.

## Scope

Cette convention s'applique à tous les nouveaux commits d'Infographic Lab. Les commits historiques sont conservés inchangés.
