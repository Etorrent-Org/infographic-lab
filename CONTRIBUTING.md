# Contribuer à Infographic Lab

Merci de votre intérêt pour Infographic Lab.

## Avant de proposer une modification

- vérifiez qu'une Issue ou une Pull Request similaire n'existe pas déjà ;
- gardez la modification limitée à un besoin précis ;
- ne versionnez jamais de secret, de fichier `.env` ou de donnée utilisateur ;
- respectez la séparation Stable / Augmented / Campaign Studio.

## Branches de travail

- `main` : version stable publique ;
- `feature/infographic-lab-augmented` : préversion structure → représentation ;
- `feature/visual-campaign-studio` : chantier autonome du studio de campagne.

Une fonctionnalité Campaign Studio ne doit pas être réintroduite dans Augmented sans validation explicite.

## Développement

Installez les dépendances puis vérifiez le build :

```powershell
npm install
npm run build
```

Validez les deux configurations Docker Compose quand vous travaillez sur Augmented :

```powershell
docker compose config --quiet
docker compose -f docker-compose.augmented.yml config --quiet
```

Pour une modification de runner, vérifiez aussi la syntaxe Python et les healthchecks concernés.

## Règles pour les représentations

- privilégiez AntV lorsqu'une famille est déjà correctement couverte ;
- réservez le SVG local aux représentations spécialisées ;
- n'ajoutez pas une nouvelle famille uniquement pour une variation décorative ;
- gardez le modèle canonique rétrocompatible ;
- une donnée chiffrée doit provenir de la source : ne créez jamais une valeur pour remplir un graphique ;
- les visuels spécialisés doivent rester exportables en SVG et PNG.

## Documentation

Tout changement de comportement utilisateur doit être reflété au minimum dans :

- `CHANGELOG.md` ;
- le README correspondant à la branche ;
- `AUGMENTED_SCOPE.md` ou `ROADMAP.md` lorsque le périmètre change ;
- `ARCHITECTURE.md` si le modèle, les runners ou les moteurs de rendu évoluent.

Les notes de release historiques ne doivent pas être réécrites comme si une fonctionnalité non publiée appartenait déjà à la V1.

## Pull requests

Avant de demander une validation :

1. utilisez une branche dédiée ;
2. limitez les changements aux fichiers nécessaires ;
3. exécutez le build et les validations Compose ;
4. vérifiez les rendus concernés sur la preview locale ;
5. mettez à jour la documentation ;
6. gardez la PR Augmented en brouillon jusqu'à validation explicite.

## Commits

Les nouveaux commits doivent respecter [`COMMIT_CONVENTION.md`](COMMIT_CONVENTION.md).

## Licence

En contribuant à ce dépôt, vous acceptez que votre contribution soit distribuée sous la licence MIT du projet.
