# V5
## Idées pour le moniteur V5

1. Parcourir les serveurs
   1. Hacker le serveur si possible
   1. Le serveur n'a pas d'argent, on passe au serveur suivant
   1. Verifier que le serveur n'est pas déjà en cour de traitement.
   1. Le serveur a de l'argent
      1. calculer le nombre de thread optimum pour le script H/G/W
      1. Le serveur a de la ram
         1. lancer le script de H/G/W sur le serveur avec le nombre de thread
         1. si le nombre de thread est trop important, chercher des serveur sans argent pour lancer le script H/G/W pour completer le nombre de thread.
      1. Le serveur n'a pas de ram
         1. chercher des serveurs sans argent pour lancer le script H/G/W pour completer le nombre de thread.
1. Parcourir les serveur sans ram
   1. choisir un serveur cible à W&G : < critere à definir >
   1. lancer le script W&G pour améliorer le serveur cible

### Nombre de thread optimum

C'est le nombre de thread du script de H/G/W permettant d'être toujours au dessus de 75% du max d'argent et à +10% du minimum de niveau de sécurité.
