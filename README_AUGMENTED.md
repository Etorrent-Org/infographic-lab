# Infographic Lab — Augmented Preview

Cette branche contient la préversion augmentée d'Infographic Lab. Elle est conçue pour fonctionner en parallèle de la version stable 1.0.0.

## URL de test

Par défaut :

```text
http://127.0.0.1:3092
```

La version stable conserve son port 3091.

Pour utiliser une adresse LAN ou WireGuard, renseignez `AUGMENTED_BIND` dans le fichier `.env.augmented` au lieu d'exposer le service publiquement.

## Démarrage

Depuis le dépôt de la branche `feature/infographic-lab-augmented` :

```bash
cp .env.augmented.example .env.augmented
docker compose --env-file .env.augmented -f docker-compose.augmented.yml up -d --build
```

Puis vérifier :

```bash
docker compose --env-file .env.augmented -f docker-compose.augmented.yml ps
```

## Moteurs IA

Le navigateur ne contacte jamais directement un fournisseur. L'application appelle un Provider Gateway local, qui route vers des runners utilisant le même contrat `/generate`.

### Vibe

Le compose Augmented réutilise par défaut le volume :

```text
infographic-lab_vibe_home
```

Il peut donc reprendre un profil Vibe déjà configuré.

### Codex

Le runner Codex est fourni dans `runners/codex`. Il utilise `codex exec` en mode non interactif et le profil ChatGPT/Codex stocké dans `CODEX_HOME`.

Créer le volume puis authentifier Codex une première fois si aucun volume existant n'est réutilisé :

```bash
docker volume create infographic-lab_codex_home
docker compose --env-file .env.augmented -f docker-compose.augmented.yml run --rm codex-runner codex login --device-auth
```

Si un volume Docker Codex déjà authentifié existe, renseigner son nom dans :

```text
CODEX_HOME_VOLUME=<nom-du-volume-existant>
```

Aucune clé API OpenAI n'est requise pour ce parcours lorsque Codex CLI est authentifié avec le compte ChatGPT pris en charge.

## Mode Automatique

Ordre par défaut :

```text
Vibe → Codex
```

Il peut être changé avec :

```text
AI_PROVIDER_ORDER=codex,vibe
```

Si un moteur manuel est choisi dans l'interface, aucun fallback n'est appliqué silencieusement.

## Données locales

La bibliothèque, les profils visuels et les snapshots restent dans le stockage local du navigateur. Le Publication Pack est construit dans le navigateur puis téléchargé sous forme de ZIP.

## Arrêt

```bash
docker compose --env-file .env.augmented -f docker-compose.augmented.yml down
```

Le volume d'authentification Vibe/Codex n'est pas supprimé par cette commande.
