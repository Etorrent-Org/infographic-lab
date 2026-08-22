# Security Policy

## Signaler une vulnérabilité

Ne publiez pas de vulnérabilité de sécurité dans une GitHub Issue publique.

Utilisez les mécanismes privés de signalement disponibles sur GitHub ou contactez directement les mainteneurs du dépôt.

## Secrets et données sensibles

Ne versionnez jamais :

- `MISTRAL_API_KEY` ;
- `RUNNER_SHARED_TOKEN` ;
- le fichier `.env` ;
- des mots de passe, jetons ou clés privées ;
- le contenu d'un profil Vibe ;
- des données ou exports confidentiels.

Le fichier `.env.example` ne doit contenir que des valeurs d'exemple.

## Exécution locale

La configuration standard limite l'application à `127.0.0.1:3091`.

Le runner Vibe reste sur le réseau Docker interne et son port `7020` n'est pas publié sur l'hôte. La communication application/runner utilise un token partagé.

Aucun Docker socket n'est monté dans les conteneurs.

## Profil Vibe

Le profil Vibe peut être conservé dans un volume Docker persistant. Ne publiez ni n'exportez le contenu de ce volume dans le dépôt.

## Images officielles

Pour une installation standard, utilisez les images référencées dans le `docker-compose.yml` du dépôt ou les artefacts publiés officiellement par Etorrent-Org.
