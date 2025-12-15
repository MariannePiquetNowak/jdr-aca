# Guide de Déploiement - Application JDR ACA

## Vue d'ensemble

Ce guide explique comment déployer l'application JDR ACA (Jeu de Rôle Association) avec toutes les améliorations récentes, incluant la gestion hiérarchique des trames, les grilles PNJ/Monstres, le sommaire cliquable, et la vue livre optimisée.

## Prérequis

- Node.js 16+ et npm
- Accès cPanel à votre hébergement
- API backend en JSON déjà déployée sur cPanel
- Connaissances de base en ligne de commande et FTP

## Structure du Projet

```
/jdr-aca/
├── src/
│   ├── components/
│   │   ├── BookReader.jsx          # Vue livre avec sommaire cliquable
│   │   ├── PNJCard.jsx            # Cartes PNJ avec grilles
│   │   ├── EnemyCard.jsx          # Cartes Monstres avec grilles
│   │   ├── RouteModal.jsx         # Modales pour PNJ/Monstres
│   │   └── ...
│   ├── routes/
│   │   ├── scenarios.jsx          # Éditeur de trames hiérarchiques
│   │   └── ...
│   └── services/
│       └── utils.js               # Utilitaires (remoteImage, etc.)
├── public/
│   ├── index.html
│   └── assets/                    # Images PNJ/Monstres
├── package.json
└── server.js                      # Serveur de développement (optionnel)
```

## Fonctionnalités Implémentées

### 1. Gestion Hiérarchique des Trames
- Trames principales avec sous-trames
- Édition séparée des PNJ/Monstres par niveau
- Sauvegarde automatique avec localStorage

### 2. Grilles PNJ/Monstres
- Affichage en grille responsive (minmax 80px)
- Portraits 60x60px avec espacement 10px
- Gestion des noms longs (multiligne)
- Colonnes multiples automatiques

### 3. Sommaire Intelligent
- Génération automatique avec numérotation romaine
- Liens cliquables vers les sections
- Navigation paginée dans la vue livre

### 4. Vue Livre Optimisée
- Pagination intelligente
- Sommaire coulissant
- Grilles PNJ/Monstres intégrées
- Navigation fluide entre pages

## Étapes de Déploiement

### 1. Préparation du Build

```bash
# Cloner ou accéder au répertoire du projet
cd /chemin/vers/jdr-aca

# Installer les dépendances
npm install

# Créer le build de production
npm run build
```

Cette commande crée un dossier `build/` contenant tous les fichiers optimisés.

### 2. Configuration de l'API

Assurez-vous que votre API backend est accessible :

```javascript
// Dans src/services/utils.js ou directement dans les composants
const API_BASE_URL = 'https://votredomaine.com/api';
// ou
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://votredomaine.com/api';
```

### 3. Déploiement sur cPanel

#### Option A : Via File Manager

1. **Compresser le build**
   ```bash
   cd build
   tar -czf build.tar.gz .
   ```

2. **Upload via cPanel**
   - Connectez-vous à cPanel
   - Allez dans "Files" > "File Manager"
   - Naviguez vers `public_html` ou votre sous-domaine
   - Upload `build.tar.gz`
   - Extrayez l'archive

3. **Configuration des permissions**
   ```bash
   # Via terminal cPanel ou File Manager
   chmod -R 755 /home/username/public_html/build
   chmod -R 644 /home/username/public_html/build/static/js/*.js
   chmod -R 644 /home/username/public_html/build/static/css/*.css
   ```

#### Option B : Via FTP

1. **Upload des fichiers**
   ```bash
   # Utiliser un client FTP comme FileZilla
   # Connecter à votre serveur cPanel
   # Upload le contenu du dossier build/ vers public_html/
   ```

2. **Configuration .htaccess** (si nécessaire)
   ```apache
   # Dans public_html/.htaccess
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

### 4. Configuration du Serveur

#### Variables d'environnement

Si vous utilisez des variables d'environnement :

```bash
# Créer .env.production.local
REACT_APP_API_URL=https://votredomaine.com/api
REACT_APP_BASE_URL_API=https://votredomaine.com/api
```

#### Configuration Apache (cPanel)

Assurez-vous que votre serveur supporte :
- `mod_rewrite` pour le routing React
- `mod_headers` pour les CORS si nécessaire

### 5. Test du Déploiement

1. **Vérification des fichiers**
   - Vérifiez que `index.html` existe à la racine
   - Vérifiez que les dossiers `static/js` et `static/css` sont présents

2. **Test fonctionnel**
   - Accédez à `https://votredomaine.com`
   - Vérifiez la console pour les erreurs
   - Testez les fonctionnalités :
     - Création/édition de trames
     - Affichage des grilles PNJ/Monstres
     - Navigation dans le sommaire
     - Vue livre avec pagination

3. **Test des API**
   - Vérifiez que les appels API fonctionnent
   - Testez le chargement des PNJ/Monstres
   - Vérifiez la sauvegarde automatique

## Dépannage

### Erreur 404 sur les routes React
- Vérifiez le fichier `.htaccess`
- Assurez-vous que `mod_rewrite` est activé

### Images PNJ/Monstres ne s'affichent pas
- Vérifiez les chemins dans `src/services/utils.js`
- Assurez-vous que les assets sont uploadés

### API non accessible
- Vérifiez l'URL de l'API dans la configuration
- Vérifiez les CORS sur le serveur backend

### Performance lente
- Activez la compression GZIP dans cPanel
- Optimisez les images PNJ/Monstres
- Utilisez un CDN pour les assets statiques

## Maintenance

### Mises à jour
```bash
# Pour déployer une nouvelle version
npm run build
# Upload le nouveau dossier build/
```

### Logs et monitoring
- Surveillez les erreurs JavaScript dans la console
- Vérifiez les logs d'accès cPanel
- Monitorer les appels API

## Sécurité

- Assurez-vous que l'API utilise HTTPS
- Validez les données côté serveur
- Utilisez des tokens pour l'authentification si nécessaire

## Support

En cas de problème, vérifiez :
1. Les logs de la console du navigateur
2. Les logs d'erreur cPanel
3. La configuration réseau/firewall
4. Les permissions des fichiers

Cette documentation couvre le déploiement complet de l'application JDR ACA avec toutes les fonctionnalités implémentées.</content>
<parameter name="filePath">d:\JDR_Association_Code\Code\jdr-aca\DEPLOYMENT_GUIDE.md