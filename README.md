# Infographic Lab 1.0.0

Infographic Lab transforme un texte en infographie éditable dans une application locale. Mistral Vibe structure le contenu en JSON canonique ; AntV Infographic et un moteur SVG local produisent les visuels. L'utilisateur peut ensuite modifier le contenu, le style, les pictogrammes, la structure et les exports sans relancer l'IA.

[Voir la vitrine](https://etorrent-org.github.io/infographic-lab/) · [Télécharger la dernière Release](https://github.com/Etorrent-Org/infographic-lab/releases/latest)

<p align="center">
  <img src="docs/images/infographic-lab-overview.svg" alt="Infographie du workflow Infographic Lab" width="860">
</p>

## Vue d'ensemble

Le workflow garde une séparation claire entre IA et rendu : Vibe structure le texte en JSON contrôlé, la passerelle locale valide cette structure, puis AntV ou le moteur SVG local construit le visuel. L'utilisateur peut ensuite éditer, sauvegarder et exporter sans nouvel appel IA, sauf s'il demande explicitement une retouche Vibe ciblée.

## Fonctionnalités

- génération depuis un texte avec les types `Auto`, `Processus`, `Comparaison`, `Timeline` et `Liste` ;
- styles `Clean`, `Soft`, `Dark`, `Sketch` et `Chalk` ;
- variantes AntV avec garde-fous pour les contenus trop longs ;
- rendus SVG locaux `Iceberg`, `Cycle` et `Sankey simple` ;
- templates prêts à l'emploi et 16 pictogrammes locaux ;
- édition du titre, du sous-titre et de chaque bloc ;
- ajout, suppression et réordonnancement des blocs ;
- retouche Vibe ciblée d'un seul bloc avec avant/après et annulation locale ;
- sauvegarde de projets JSON v2 ;
- exports SVG, PNG et HTML autonome.

## Prérequis

- Windows 10/11 avec PowerShell pour le script d'installation fourni ;
- Docker Desktop avec `docker compose`, ou un autre hôte Docker Compose compatible ;
- un accès Mistral Vibe configuré : soit une clé API Mistral pour une première installation, soit un profil Vibe existant dans le volume Docker utilisé.

Infographic Lab 1.0.0 utilise Mistral Vibe `2.21.0`, version validée avec cette V1.

## Images Docker Hub

Les images officielles de la V1 sont publiées sur Docker Hub en `linux/amd64` et `linux/arm64` :

```text
erwanntorrent/infographic-lab:1.0.0
erwanntorrent/infographic-vibe-runner:1.0.0
```

Le `docker-compose.yml` de la branche `main` utilise ces images publiées directement. Aucun build local n'est nécessaire pour cette installation.

## Installation rapide avec Docker Hub

1. Récupérez la branche `main` du dépôt, soit avec **Code → Download ZIP** sur GitHub, soit avec Git :

```powershell
git clone https://github.com/Etorrent-Org/infographic-lab.git
cd infographic-lab
```

2. Pour une première installation sans profil Vibe existant, créez votre configuration locale :

```powershell
Copy-Item .env.example .env
notepad .env
```

3. Dans ce cas, renseignez votre clé :

```text
MISTRAL_API_KEY=votre_cle
```

Si vous réutilisez un volume `VIBE_HOME_VOLUME` contenant déjà un profil Vibe configuré, `MISTRAL_API_KEY` peut rester vide.

4. Téléchargez les images Docker Hub et démarrez l'application :

```powershell
.\START-INFOGRAPHIC-LAB.ps1
```

5. Ouvrez `http://127.0.0.1:3091`.

Pour les lancements suivants, utilisez la même commande :

```powershell
.\START-INFOGRAPHIC-LAB.ps1
```

Le paramètre historique `-Build` reste accepté pour compatibilité mais n'est plus nécessaire : le script utilise les images publiées sur Docker Hub.

> La Release GitHub `v1.0.0` a été publiée avant cette bascule et conserve son ancien parcours de build local. Le parcours Docker Hub décrit ici correspond à la branche `main` et sera intégré à la prochaine Release.

### Docker Compose direct

Sur tout hôte Docker Compose compatible :

```bash
docker compose pull
docker compose up -d
```

Par défaut, le Compose utilise le tag `1.0.0`. Vous pouvez sélectionner explicitement un autre tag publié avec `INFOGRAPHIC_LAB_IMAGE_TAG`.

## Architecture

```mermaid
flowchart LR
    U[Utilisateur] --> UI[React + Vite]
    UI --> APP[Passerelle Node locale]
    APP --> VR[Vibe runner Docker]
    VR --> M[Mistral API]
    M --> VR
    VR --> APP
    APP --> UI
    UI --> R{Moteur de rendu}
    R --> A[AntV Infographic]
    R --> S[SVG local]
```

Le navigateur ne connaît pas le token interne du runner. Le port Vibe `7020` n'est pas publié sur l'hôte, aucun Docker socket n'est monté et aucune base de données n'est nécessaire.

## Configuration

`.env.example` contient uniquement des valeurs d'exemple. Le fichier `.env` est ignoré par Git.

Variables principales :

```text
MISTRAL_API_KEY=
INFOGRAPHIC_LAB_IMAGE_TAG=1.0.0
VIBE_HOME_VOLUME=infographic-lab_vibe_home
RUNNER_SHARED_TOKEN=
```

Si `RUNNER_SHARED_TOKEN` n'est pas fourni, le script PowerShell génère un token interne au lancement.

## Développement

Le dépôt conserve les Dockerfiles pour les builds de développement et la publication CI. Pour le frontend :

```powershell
npm install
npm run build
```

Pour arrêter la stack :

```powershell
docker compose down
```

N'utilisez pas `docker compose down -v` si vous souhaitez conserver le profil Vibe stocké dans le volume Docker.

## Sécurité

- publication réseau limitée à `127.0.0.1:3091` ;
- runner Vibe sur le réseau Docker interne ;
- token interne entre l'application et le runner ;
- agent Vibe sans outils ;
- réponses IA validées avant rendu ;
- pas de Docker socket ;
- pas de base de données ;
- pas de secret versionné.

## Limites de la V1

- le Sankey est narratif : l'épaisseur des flux n'encode pas une mesure quantitative ;
- pas de collaboration temps réel ni de bibliothèque serveur de projets ;
- la qualité factuelle dépend du texte source ;
- l'utilisation de Mistral Vibe nécessite un accès Mistral valide et peut être facturée selon le compte.

## Documentation

- [CHANGELOG.md](CHANGELOG.md)
- [RELEASE_NOTES_1.0.0.md](RELEASE_NOTES_1.0.0.md)
- [THIRD_PARTY.md](THIRD_PARTY.md)

## Licence

Infographic Lab est distribué sous licence MIT. Consultez [LICENSE](LICENSE).

Le dépôt `Etorrent-Org/infographic-lab` est la distribution publique destinée au téléchargement et aux tests de la V1.
