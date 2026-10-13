# Ollama local pour Infographic Lab Augmented

Cette branche ajoute **Ollama (Qwen local)** au choix des moteurs sans supprimer Vibe ni Codex.

## Pre-requis sur TatouneServer

Le conteneur `ollama` doit fonctionner dans le projet Compose `ollama`, sur le reseau Docker externe `ollama_default` (le compose existant dans `/opt/docker/ollama`). Le modele `qwen3.5:4b-q4_K_M` doit deja etre telecharge.

Le port Ollama reste publie uniquement sur `127.0.0.1:11434` cote hote. L'application le contacte directement sur le reseau prive Docker `ollama_default` via `http://ollama:11434`. Aucun acces Internet public requis.

## Configuration

Dans `.env.augmented` :
```dotenv
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen3.5:4b-q4_K_M
AI_PROVIDER_ORDER=ollama,vibe,codex
```

Le `docker-compose.augmented.yml` rattache **seulement le service app** au reseau externe `ollama_default`. Les runners existants sont maintenus durant la validation. Pas de nouveau conteneur.

## Controle avant migration

1. Verifier le reseau : `docker network inspect ollama_default`.
2. Valider : `docker compose -f docker-compose.augmented.yml config --quiet` (avec vos variables habituelles).
3. Reconstruire/deployer **uniquement l'application** depuis le depot : `docker compose -f docker-compose.augmented.yml up -d --no-deps --build app`. Attention : si un tag d'image ancien est force, sa politique de pull doit etre ajustee ou un tag neuf utilise pour garantir le nouveau code.
4. Verifier `/api/providers` depuis Infographic Lab : Ollama doit etre `available: true`.
5. Dans l'interface, choisir Ollama puis essayer **generation**, **retouche** et **controle qualite**. Verifier le JSON et les exports.
6. Ne supprimer aucun runner ou volume tant que les tests ne sont pas bons.

## Limites actuelles

- Generation CPU : environ 39 s pour un petit exemple, 8 tokens/s sur i5-1335U (benchmark utilisateur, pas garantie).
- Delai pour la generation Ollama porte a 360 s sur CPU (les autres moteurs conservent leur reglage). Les schemas longs peuvent rester lents ou echouer : effectuer un essai reel avant toute suppression des runners.
- Le mode Auto inclut encore Vibe et Codex comme fallback pour la compatibilite.
- Cette branche ne modifie ni n8n ni les applications autres qu'Infographic Lab.
