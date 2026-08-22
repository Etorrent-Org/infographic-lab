# Contribuer à Infographic Lab

Merci de votre intérêt pour Infographic Lab.

## Avant de proposer une modification

- vérifiez qu'une Issue ou une Pull Request similaire n'existe pas déjà ;
- gardez la modification limitée à un besoin précis ;
- ne versionnez jamais de secret, de fichier `.env` ou de donnée utilisateur.

## Développement

Installez les dépendances puis vérifiez le build :

```powershell
npm install
npm run build
```

Validez également la configuration Docker Compose :

```powershell
docker compose config --quiet
```

Pour une modification liée aux conteneurs ou au runner Vibe, vérifiez aussi le démarrage local et les healthchecks concernés.

## Pull requests

Avant d'ouvrir une Pull Request :

1. créez une branche dédiée ;
2. limitez le changement aux fichiers nécessaires ;
3. exécutez les contrôles adaptés ;
4. mettez à jour la documentation ou le changelog si le comportement utilisateur change ;
5. décrivez clairement le besoin et l'impact de la modification.

## Commits

Les nouveaux commits doivent respecter [`COMMIT_CONVENTION.md`](COMMIT_CONVENTION.md).

## Licence

En contribuant à ce dépôt, vous acceptez que votre contribution soit distribuée sous la licence MIT du projet.
