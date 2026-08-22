# Architecture

## Baseline

Infographic Lab **1.0.0** est une application locale distribuée avec Docker Compose.

- interface : React + Vite ;
- passerelle locale : Node.js ;
- structuration IA : Mistral Vibe dans un runner Docker dédié ;
- rendu : AntV Infographic ou moteur SVG local ;
- stockage : fichiers JSON et exports locaux ;
- base de données : aucune.

## Vue simple

```mermaid
flowchart LR
    U[Utilisateur] --> UI[React + Vite]
    UI --> APP[Passerelle Node locale]
    APP --> VR[Vibe runner Docker]
    VR --> M[Mistral Vibe]
    M --> VR
    VR --> APP
    APP --> UI
    UI --> R{Rendu}
    R --> A[AntV Infographic]
    R --> S[SVG local]
    UI --> F[Fichiers et exports locaux]
```

## Conteneurs

```mermaid
flowchart TB
    H[Hôte local] -->|127.0.0.1:3091| APP[infographic-lab]
    APP -->|réseau Docker interne| RUNNER[infographic-vibe-runner:7020]
    RUNNER --> V[(Volume Vibe)]
    RUNNER --> M[Mistral]
```

Le port `7020` du runner n'est pas publié sur l'hôte. La communication entre l'application et le runner utilise un token interne.

## Organisation

- `src` : interface et logique frontend ;
- `server.mjs` : passerelle Node locale ;
- `runners/vibe` : runner Mistral Vibe ;
- `docker-compose.yml` : orchestration locale ;
- `Dockerfile` : image de l'application ;
- `.github/workflows` : CI, Release GitHub et publication Docker Hub ;
- `docs/images` : visuels de documentation.

## Distribution

Les images officielles sont publiées sur Docker Hub pour `linux/amd64` et `linux/arm64` :

```text
erwanntorrent/infographic-lab:1.0.0
erwanntorrent/infographic-vibe-runner:1.0.0
```

Le fichier `docker-compose.yml` consomme directement ces images publiées.
