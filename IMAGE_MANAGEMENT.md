# Guide de Gestion des Images

Ce document explique comment les images sont organisées et gérées dans le site web Signa Tech.

## Catégories d'Images

Le site utilise les catégories d'images suivantes:

### 1. Logo (logo)
- **Limite**: 1 image
- **Utilisation**: Logo principal affiché dans l'en-tête du site
- **Priorité**: Haute (chargement critique)

### 2. Page d'Accueil (hero)
- **Limite**: 3 images
- **Utilisation**: 
  1. Image principale (Hero) - Affichée en haut de la page d'accueil
  2. Aperçu projet 1 (Façade) - Affichée dans la section portfolio de la page d'accueil (1ère carte)
  3. Aperçu projet 2 (Artisanat) - Affichée dans la section portfolio de la page d'accueil (3ème carte)
- **Priorité**: Haute (chargement critique)

### 3. Page À Propos (about)
- **Limite**: 1 image
- **Utilisation**: Image de l'équipe utilisée dans la section histoire
- **Priorité**: Moyenne

### 4. Galerie Portfolio (portfolio)
- **Limite**: Illimitée
- **Utilisation**: Collection complète des projets pour la galerie portfolio
- **Priorité**: Basse (chargement différé)

## Instructions pour les Administrateurs

1. **Logo**: Remplacez l'image existante plutôt que d'en ajouter une nouvelle.

2. **Page d'Accueil**: 
   - Limitée à 3 images spécifiques
   - L'ordre est important:
     - Image #1: Hero principal
     - Image #2: Projet façade
     - Image #3: Projet PLV
   - Remplacez les images existantes plutôt que d'en ajouter de nouvelles

3. **Page À Propos**:
   - Limitée à 1 image de l'équipe
   - Remplacez l'image existante plutôt que d'en ajouter une nouvelle

4. **Portfolio**:
   - Ajoutez autant d'images que nécessaire
   - Ces images apparaîtront uniquement dans la galerie portfolio

## Résolution des problèmes courants

- **Image non affichée**: Vérifiez que l'image est dans la bonne catégorie
- **Trop d'images dans une catégorie**: Supprimez les images en trop et gardez uniquement le nombre requis
- **Ordre incorrect**: L'ordre des images est important, surtout pour la Page d'Accueil

## Notes techniques

- Les images sont stockées dans le dossier `server/uploads/`
- Les métadonnées des images sont stockées dans la table `site_images` de la base de données
- Le système utilise des hooks React personnalisés pour récupérer et afficher les images