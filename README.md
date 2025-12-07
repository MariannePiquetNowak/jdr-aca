# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Fonctionnalités de l'application

### Gestion des Ressources JDR
Application de gestion de jeu de rôle permettant aux Maîtres du Jeu (MJ) de gérer leurs tables, personnages, monstres et objets.

#### Système de Bibliothèque Partagée
- **Partage de ressources** : Partagez vos PNJ, monstres (Bestiaire) et objets entre les différentes tables de jeu
- **Import sélectif** : Importez uniquement les ressources dont vous avez besoin dans votre table
- **Détection de doublons** : Le système empêche automatiquement le partage d'un élément déjà présent dans la bibliothèque
- **Badge d'import** : Indicateur visuel (✅) pour les éléments déjà importés dans votre table

#### Modes d'Affichage Multiple
Trois modes d'affichage disponibles pour toutes les pages de ressources :
- **Mode Grille** : Cartes détaillées avec toutes les informations
- **Mode Liste** : Vue compacte en ligne avec miniatures
- **Mode Galerie** : Focus sur les visuels avec overlay d'informations

#### Système de Notifications Toast
Notifications éphémères (3 secondes) pour toutes les actions :
- **Partage de ressources** : Confirmation avec nom de l'élément partagé
- **Création** : Validation de l'ajout de nouveaux éléments
- **Modification** : Confirmation des mises à jour
- **Suppression** : Retour sur les suppressions réussies
- **Erreurs** : Messages d'erreur contextuels
- **Info** : Alertes informatives (ex: élément déjà dans la bibliothèque)

Design des toasts :
- Fond semi-transparent avec effet blur (85% opacité)
- Animations fluides (slideIn, fadeOut)
- Couleurs thématiques : vert (succès), rouge (erreur), bleu (info)
- Design compact et élégant

#### Gestion des Images
- **Compression automatique** : Toutes les images de portraits sont automatiquement compressées
- **Limite de taille** : Maximum 600px de largeur/hauteur
- **Qualité JPEG** : 75% pour un équilibre taille/qualité optimal
- **Support serveur** : Limite de 50MB pour les payloads incluant les images en base64

#### Modales de Confirmation
Toutes les actions critiques utilisent des modales personnalisées :
- **Partage** : Confirmation avant de partager dans la bibliothèque
- **Suppression** : Confirmation avant de supprimer un élément
- **Import** : Confirmation avant d'importer depuis la bibliothèque

Design violet cohérent avec le thème de l'application.

#### Cohérence des Boutons d'Action
Tous les boutons d'action sont circulaires et cohérents :
- **Partager (📚)** : Fond violet (rgba(102, 126, 234, 0.8))
- **Modifier (✏️)** : Fond bleu (rgba(52, 152, 219, 0.8))
- **Supprimer (✕)** : Fond rouge (rgba(220, 53, 69, 0.8))
- Effet hover : agrandissement (scale 1.1) + ombre portée

## Recent Changes (Décembre 2025)

### 🎨 Interface Utilisateur
- **Système de notifications Toast** : Remplacement de tous les `alert()` et `window.confirm()` par des notifications modernes et élégantes
- **Modes d'affichage multiples** : Ajout des modes Grille, Liste et Galerie pour Bestiaire, PNJ, Objets et Bibliothèque Partagée
- **Cohérence visuelle** : Uniformisation des boutons d'action (partage, édition, suppression) avec design circulaire
- **Design amélioré** : Toasts semi-transparents avec effet blur pour une meilleure intégration visuelle

### 📚 Bibliothèque Partagée
- **Prévention des doublons** : Vérification automatique avant le partage pour éviter les éléments en double
- **Affichage des images** : Correction de l'affichage des portraits de PNJ et images d'objets dans tous les modes
- **Badges visuels** : Indicateur "✅ Déjà importé" pour les éléments déjà présents dans votre table
- **Notifications contextuelles** : Messages spécifiques avec nom de l'élément pour chaque action

### 🖼️ Gestion des Images
- **Compression automatique** : Toutes les images sont maintenant compressées automatiquement (600px, JPEG 75%)
- **Limite serveur augmentée** : Support de payloads jusqu'à 50MB pour les images en base64
- **Logs de débogage** : Affichage de la taille des images dans la console pour diagnostic

### ✅ Notifications et Feedback
- **Création** : Toast de confirmation lors de l'ajout de PNJ/Monstre/Objet
- **Modification** : Toast de confirmation lors de l'édition
- **Suppression** : Toast de confirmation avec nom de l'élément supprimé
- **Partage** : Toast de succès avec nom de l'élément partagé
- **Import** : Toast de confirmation lors de l'import depuis la bibliothèque
- **Erreurs** : Messages d'erreur contextuels en cas de problème
- **Info** : Alertes informatives (ex: élément déjà partagé)

### 🔧 Améliorations Techniques
- **Modales personnalisées** : Remplacement de tous les `window.confirm` par ConfirmModal
- **État séparé** : Modales de partage et de suppression gérées séparément pour éviter les conflits
- **Persistance des données** : Appel à `fetchPNJs()` après création pour assurer la cohérence des données
- **Gestion d'erreur améliorée** : Tous les catch affichent maintenant des toasts au lieu d'alerts

### 🐛 Corrections de Bugs
- **PNJ avec images** : Correction du problème de disparition des PNJ après rafraîchissement
- **Doublons en bibliothèque** : Impossibilité de partager deux fois le même élément
- **Images manquantes** : Affichage correct des portraits dans la bibliothèque partagée
- **Boutons carrés** : Uniformisation de tous les boutons d'action en forme circulaire

### 📝 Notes Importantes
- **Server.js** : Nécessite un redémarrage après modification des limites de payload
- **Images** : La compression se fait côté client avant l'envoi au serveur
- **Bibliothèque** : La vérification des doublons se fait par comparaison d'ID
- **Toasts** : z-index 10001 pour être au-dessus des modales (z-index 10000)

---

## Previous Changes

- Removed "dock" feature from the MJ (Game Master) page: player panels now render directly in the main MJ grid instead of moving to a separate dock area. This simplifies the UI and avoids duplicated panel states.
