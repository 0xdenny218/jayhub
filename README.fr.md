# plushub4deliver · Guide d’exploitation

Le client déploie cette passerelle sur son domaine, délivre les clés API aux utilisateurs et gère les tarifs, les crédits et les remboursements. La passerelle transmet les requêtes avec la clé attribuée au client par le fournisseur. Celui-ci facture séparément la consommation enregistrée sur le compte du client.

## Déploiement et mise en service

Le fichier Compose de livraison construit le service web et API à partir de ce dépôt et démarre PostgreSQL et Redis. Les deux guides sont en chinois simplifié.

- Déployer les trois services, configurer HTTPS, créer le compte administrateur, puis gérer les sauvegardes et les mises à niveau. [Guide de déploiement](./delivery/DEPLOYMENT.zh-CN.md) · [Fichier Compose](./delivery/compose.yaml)
- Récupérer les accès du fournisseur, configurer les canaux et les tarifs, puis vérifier les appels et la facturation. [Manuel de livraison](./delivery/甲方交付手册.md)

## Pages publiques

- **Accueil (`/`).** Le catalogue permet de rechercher un modèle par nom ou fournisseur, de filtrer les résultats par type (texte, image ou vidéo) et de consulter les tarifs. Sa visibilité dépend des paramètres du site. [Aperçu de l’accueil avec des modèles et tarifs de démonstration](./assets/screenshots/delivery-home.zh-CN.png)
- **Connexion (`/sign-in`).** Le nom et le logo du site apparaissent en haut à gauche. Lorsque la connexion par mot de passe est activée, le formulaire central accepte un nom d’utilisateur ou une adresse e-mail. L’inscription et les autres modes de connexion dépendent de la configuration du site. [Aperçu de la connexion](./assets/screenshots/delivery-sign-in.zh-CN.png)

## Droits d’auteur et attribution

Cette édition repose sur [New API](https://github.com/QuantumNous/new-api) `v1.0.0-rc.51`. Copyright (c) QuantumNous and contributors. Le pied de page conserve le lien vers le projet d’origine et la mention suivante.

> Frontend design and development by New API contributors.

Le projet est distribué sous licence GNU AGPLv3. [LICENSE](./LICENSE) · [NOTICE](./NOTICE) · [Licences des tiers](./THIRD-PARTY-LICENSES.md)
