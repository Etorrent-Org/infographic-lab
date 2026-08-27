# Security Policy

## Signaler une vulnérabilité

Ne publiez pas de vulnérabilité de sécurité dans une GitHub Issue publique.

Utilisez les mécanismes privés de signalement disponibles sur GitHub ou contactez directement les mainteneurs du dépôt.

## Secrets et données sensibles

Ne versionnez jamais :

- `MISTRAL_API_KEY` ;
- les secrets ou profils d'authentification Vibe ;
- les secrets ou profils d'authentification Codex ;
- `RUNNER_SHARED_TOKEN`, `VIBE_RUNNER_TOKEN` ou `CODEX_RUNNER_TOKEN` ;
- les fichiers `.env` ;
- des mots de passe, jetons ou clés privées ;
- des données, projets ou exports confidentiels.

Les fichiers `.env.example` et `.env.augmented.example` ne doivent contenir que des valeurs d'exemple.

## Exécution locale

### Stable

La configuration standard limite l'application à `127.0.0.1:3091`.

Le runner Vibe reste sur le réseau Docker interne et son port 7020 n'est pas publié sur l'hôte.

### Augmented

La preview utilise le port 3092 et peut être liée à une autre interface avec `AUGMENTED_BIND` uniquement lorsque cela est nécessaire.

Les runners Vibe et Codex restent sur le réseau Docker interne. Le navigateur ne reçoit ni URL interne de runner ni token d'authentification.

Aucun Docker socket n'est monté dans les conteneurs.

## Validation des sorties IA

Les réponses des providers sont considérées comme non fiables jusqu'à validation :

- schéma JSON strict ;
- longueurs contrôlées ;
- types de blocs et statuts limités à des enums ;
- preuves factuelles revalidées contre le texte source ;
- valeurs numériques optionnelles acceptées uniquement sous forme de nombres finis ;
- consigne explicite de ne jamais inventer une valeur afin de compléter un graphique.

Les métadonnées numériques `value`, `unit`, `category` et `series` restent des données du modèle : elles ne donnent aucun droit supplémentaire au frontend ou aux runners.

## Stockage local

La bibliothèque Augmented et ses snapshots sont stockés localement dans le navigateur. Ils peuvent contenir le texte source et les données structurées du projet.

Ne partagez pas un profil navigateur, une sauvegarde ou un Publication Pack contenant des informations confidentielles sans contrôle préalable.

## Profils de providers

Les profils Vibe/Codex peuvent être conservés dans des volumes Docker persistants. Ne publiez ni n'exportez le contenu de ces volumes dans le dépôt.

## Images officielles

Pour une installation stable, utilisez les images référencées dans `docker-compose.yml` ou les artefacts publiés officiellement par Etorrent-Org.

L'image Augmented reste une préversion et ne doit pas être republiée comme stable avant validation explicite.
