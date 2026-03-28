# 📦 Guide de Déploiement - JDR Association (cPanel / O2Switch)

Ce guide détaille la procédure complète pour déployer l'application JDR Association sur un hébergement cPanel (O2Switch).

## 🏗️ Architecture de l'Application

L'application est composée de **deux parties distinctes** :

1. **Frontend React** : Application React (SPA) compilée en fichiers statiques
2. **Backend Node.js** : Serveur API Express.js pour la gestion des données

### URLs de Production

- **Frontend** : `https://jdr.mariannedev.fr`
- **Backend API** : `https://api.mariannedev.fr/api`

---

## 📋 Prérequis

### Sur votre machine locale

- Node.js 18+ installé
- npm ou yarn
- Git
- Accès au dépôt GitHub : `MariannePiquetNowak/jdr-aca`

### Sur le serveur cPanel (O2Switch)

- Accès cPanel
- Accès SSH (recommandé pour Node.js)
- Node.js installé via cPanel (Application Node.js)
- Deux domaines/sous-domaines configurés :
  - `jdr.mariannedev.fr` (Frontend)
  - `api.mariannedev.fr` (Backend)

---

## 🚀 Partie 1 : Déploiement du Backend (API Node.js)

### Étape 1.1 : Préparer les fichiers localement

```bash
# Se positionner dans le projet
cd d:\JDR_Association_Code\Code\jdr-aca

# S'assurer d'être sur la bonne branche
git checkout Antho/develop
git pull origin Antho/develop

# Vérifier que tout fonctionne en local
node server.js
```

### Étape 1.2 : Créer la structure sur le serveur

**Via SSH ou Gestionnaire de fichiers cPanel :**

```
/home/votreuser/
├── api.mariannedev.fr/
│   ├── public_html/          # Ne pas utiliser (Node.js utilise son propre dossier)
│   └── nodejs/                # Créer ce dossier
│       ├── server.js
│       ├── package.json
│       ├── node_modules/      # Sera créé après npm install
│       ├── data/              # CRÉER CE DOSSIER
│       │   ├── vera.json
│       │   ├── bernard.json
│       │   ├── etienne.json
│       │   ├── theodore.json
│       │   ├── armand.json
│       │   ├── stephane.json
│       │   ├── valentine.json
│       │   ├── data.json
│       │   ├── data-mja.json
│       │   ├── data-mjj.json
│       │   └── data-shared.json
│       └── .env               # IMPORTANT : Configurer les variables
```

### Étape 1.3 : Uploader les fichiers

**Fichiers à uploader dans `/home/votreuser/api.mariannedev.fr/nodejs/` :**

1. `server.js`
2. `package.json`
3. Dossier `data/` complet avec tous les fichiers JSON

**Créer le fichier `.env` sur le serveur :**

```bash
# Contenu du fichier .env
PORT=3002
NODE_ENV=production
```

### Étape 1.4 : Installer les dépendances

**Via SSH :**

```bash
cd /home/votreuser/api.mariannedev.fr/nodejs/
npm install
```

Dépendances installées :
- `express`
- `cors`

### Étape 1.5 : Configurer l'application Node.js dans cPanel

1. **Accéder à "Setup Node.js App"** dans cPanel
2. **Créer une nouvelle application** :
   - **Node.js version** : 18.x ou supérieur
   - **Mode** : Production
   - **Application root** : `api.mariannedev.fr/nodejs`
   - **Application URL** : `api.mariannedev.fr`
   - **Application startup file** : `server.js`
   - **Port** : Laisser cPanel attribuer automatiquement (ou spécifier 3002)

3. **Variables d'environnement** à ajouter :
   ```
   NODE_ENV=production
   PORT=3002
   ```

4. **Démarrer l'application**

### Étape 1.6 : Configurer le domaine API

**Dans cPanel > Domaines :**

1. Créer/vérifier le sous-domaine `api.mariannedev.fr`
2. Pointer vers `/home/votreuser/api.mariannedev.fr/public_html`

**Créer un fichier `.htaccess` dans `/home/votreuser/api.mariannedev.fr/public_html/` :**

```apache
# Rediriger toutes les requêtes vers l'application Node.js
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3002/$1 [P,L]

# Headers CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### Étape 1.7 : Vérifier le Backend

Tester l'API :
```bash
curl https://api.mariannedev.fr/api/vera
```

Devrait retourner les données JSON de Vera.

---

## 🎨 Partie 2 : Déploiement du Frontend (React)

### Étape 2.1 : Configurer les variables d'environnement

**Modifier le fichier `.env` en local :**

```env
REACT_APP_BASE_URL_API=https://api.mariannedev.fr/api
REACT_APP_BASE_URL=https://jdr.mariannedev.fr
```

### Étape 2.2 : Builder l'application

```bash
# En local dans le dossier du projet
npm run build
```

Cela crée un dossier `build/` contenant tous les fichiers statiques optimisés.

### Étape 2.3 : Structure sur le serveur

```
/home/votreuser/
├── jdr.mariannedev.fr/
│   └── public_html/           # UPLOADER TOUT LE CONTENU DU DOSSIER BUILD ICI
│       ├── index.html
│       ├── favicon.ico
│       ├── manifest.json
│       ├── robots.txt
│       ├── static/
│       │   ├── css/
│       │   ├── js/
│       │   └── media/
│       ├── images/            # IMPORTANT : Copier depuis public/images
│       │   ├── global/
│       │   ├── armand/
│       │   ├── bernard/
│       │   ├── etienne/
│       │   ├── stephane/
│       │   ├── theodore/
│       │   ├── valentine/
│       │   └── vera/
│       └── .htaccess          # CRÉER CE FICHIER (voir ci-dessous)
```

### Étape 2.4 : Uploader les fichiers

1. **Uploader tout le contenu du dossier `build/`** vers `/home/votreuser/jdr.mariannedev.fr/public_html/`
2. **Copier manuellement le dossier `public/images/`** (non inclus dans build) vers `/home/votreuser/jdr.mariannedev.fr/public_html/images/`

### Étape 2.5 : Créer le fichier .htaccess

**Dans `/home/votreuser/jdr.mariannedev.fr/public_html/.htaccess` :**

```apache
# Configuration pour React Router (SPA)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Ne pas rediriger les fichiers existants
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rediriger toutes les autres requêtes vers index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Sécurité et performance
<IfModule mod_headers.c>
  # CORS - Autoriser les requêtes de l'API
  Header set Access-Control-Allow-Origin "*"
  
  # Cache des ressources statiques
  <FilesMatch "\.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf|woff|woff2|ttf)$">
    Header set Cache-Control "max-age=31536000, public"
  </FilesMatch>
  
  # Pas de cache pour le HTML
  <FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Protection
Options -Indexes
```

### Étape 2.6 : Vérifier les permissions

```bash
# Via SSH
chmod -R 755 /home/votreuser/jdr.mariannedev.fr/public_html
chmod 644 /home/votreuser/jdr.mariannedev.fr/public_html/.htaccess
```

---

## 🔧 Partie 3 : Configuration des Données

### Structure des fichiers JSON

Tous les fichiers dans `/home/votreuser/api.mariannedev.fr/nodejs/data/` doivent avoir les **permissions correctes** :

```bash
chmod 644 *.json
```

### Fichiers de données requis

| Fichier | Description |
|---------|-------------|
| `vera.json` | Données du personnage Vera |
| `bernard.json` | Données du personnage Bernard |
| `etienne.json` | Données du personnage Etienne |
| `theodore.json` | Données du personnage Theodore |
| `armand.json` | Données du personnage Armand |
| `stephane.json` | Données du personnage Stephane |
| `valentine.json` | Données du personnage Valentine |
| `data.json` | Données génériques (obsolète ?) |
| `data-mja.json` | Données de la table MJA (Bestiaire, PNJ, Objets) |
| `data-mjj.json` | Données de la table MJJ (Bestiaire, PNJ, Objets) |
| `data-shared.json` | Bibliothèque partagée |

### Format des fichiers de table (data-mja.json, data-mjj.json)

```json
{
  "bestiaire": [],
  "pnj": [],
  "objets": []
}
```

### Format du fichier partagé (data-shared.json)

```json
{
  "bestiaire": [],
  "pnj": [],
  "objets": []
}
```

---

## 🛠️ Partie 4 : Résolution des Problèmes Courants

### Problème 1 : L'API ne répond pas (404)

**Causes possibles :**
- L'application Node.js n'est pas démarrée
- Le port n'est pas correctement configuré
- Le fichier `.htaccess` est incorrect

**Solutions :**
1. Vérifier dans cPanel > Setup Node.js App que l'application est "Running"
2. Redémarrer l'application
3. Vérifier les logs : `/home/votreuser/api.mariannedev.fr/nodejs/logs/`
4. Vérifier que le `.htaccess` utilise `[P]` (proxy) et non `[R]` (redirect)

### Problème 2 : Erreur CORS

**Symptôme :** Console du navigateur affiche "CORS policy blocked"

**Solution :**
1. Vérifier que `cors()` est bien activé dans `server.js`
2. Ajouter les headers dans le `.htaccess` de l'API
3. Vérifier que l'URL de l'API dans `.env` est correcte

### Problème 3 : React Router ne fonctionne pas (404 sur les routes)

**Symptôme :** Rafraîchir la page sur `/bestiaire` donne une erreur 404

**Solution :**
1. Vérifier que le `.htaccess` est présent dans `public_html/`
2. Vérifier que `mod_rewrite` est activé (demander au support O2Switch)
3. S'assurer que la ligne `RewriteRule ^ index.html [L]` est correcte

### Problème 4 : Les images ne s'affichent pas

**Causes possibles :**
- Le dossier `images/` n'a pas été copié
- Les chemins sont incorrects dans `.env`

**Solutions :**
1. Copier **manuellement** `public/images/` vers `public_html/images/`
2. Vérifier `REACT_APP_BASE_URL` dans `.env`
3. Vérifier les permissions : `chmod -R 755 images/`

### Problème 5 : Les modifications de données ne sont pas sauvegardées

**Causes possibles :**
- Les fichiers JSON n'ont pas les permissions d'écriture
- Le dossier `data/` n'existe pas

**Solutions :**
```bash
chmod 664 /home/votreuser/api.mariannedev.fr/nodejs/data/*.json
chmod 775 /home/votreuser/api.mariannedev.fr/nodejs/data/
```

### Problème 6 : Erreur "Payload too large"

**Symptôme :** Impossible d'ajouter des PNJ avec images

**Solution :**
1. Vérifier que `server.js` contient :
   ```javascript
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ limit: '50mb', extended: true }));
   ```
2. Redémarrer l'application Node.js après modification

---

## 📝 Partie 5 : Checklist de Déploiement

### Avant le déploiement

- [ ] Tester l'application en local (`npm start` + `node server.js`)
- [ ] Vérifier que tous les fichiers JSON de données sont à jour
- [ ] Configurer `.env` avec les URLs de production
- [ ] Faire un `npm run build` sans erreurs
- [ ] Sauvegarder les fichiers JSON actuels du serveur

### Déploiement Backend

- [ ] Créer le dossier `/nodejs/` pour l'API
- [ ] Uploader `server.js` et `package.json`
- [ ] Créer le dossier `data/` et uploader tous les JSON
- [ ] Créer le fichier `.env` sur le serveur
- [ ] Exécuter `npm install` via SSH
- [ ] Configurer l'application Node.js dans cPanel
- [ ] Créer/vérifier le sous-domaine `api.mariannedev.fr`
- [ ] Créer le `.htaccess` de l'API
- [ ] Démarrer l'application
- [ ] Tester avec `curl` ou navigateur

### Déploiement Frontend

- [ ] Builder l'application (`npm run build`)
- [ ] Vider le contenu actuel de `public_html/` (BACKUP AVANT !)
- [ ] Uploader tout le contenu du dossier `build/`
- [ ] Copier le dossier `public/images/` vers `public_html/images/`
- [ ] Créer le fichier `.htaccess` pour React Router
- [ ] Vérifier les permissions (755 pour dossiers, 644 pour fichiers)
- [ ] Tester toutes les routes principales
- [ ] Tester les fonctionnalités CRUD (création, modification, suppression)

### Tests post-déploiement

- [ ] Page d'accueil charge correctement
- [ ] Toutes les routes React fonctionnent (refresh inclus)
- [ ] Les images s'affichent
- [ ] L'API répond (`/api/vera`, `/api/bestiaire`, etc.)
- [ ] Création d'un PNJ fonctionne
- [ ] Modification d'un PNJ fonctionne
- [ ] Suppression d'un PNJ fonctionne
- [ ] Partage vers la bibliothèque fonctionne
- [ ] Import depuis la bibliothèque fonctionne
- [ ] Système de notifications Toast fonctionne
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Pas d'erreurs CORS

---

## 🔐 Partie 6 : Sécurité et Maintenance

### Sauvegardes

**Créer un script de sauvegarde des données :**

```bash
#!/bin/bash
# backup-data.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/votreuser/backups/jdr-data-$DATE"
mkdir -p $BACKUP_DIR
cp /home/votreuser/api.mariannedev.fr/nodejs/data/*.json $BACKUP_DIR/
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR
echo "Backup créé : $BACKUP_DIR.tar.gz"
```

**Automatiser avec cron :**
```bash
# Sauvegarde quotidienne à 3h du matin
0 3 * * * /home/votreuser/scripts/backup-data.sh
```

### Logs

**Accéder aux logs Node.js :**
```bash
tail -f /home/votreuser/api.mariannedev.fr/nodejs/logs/app.log
```

**Ajouter du logging dans server.js :**
```javascript
const fs = require('fs');
const logStream = fs.createWriteStream('./logs/app.log', { flags: 'a' });

// Middleware de logging
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.path}\n`;
  logStream.write(log);
  next();
});
```

### Mises à jour

**Pour mettre à jour l'application :**

1. **Backend :**
   ```bash
   cd /home/votreuser/api.mariannedev.fr/nodejs/
   # Uploader le nouveau server.js
   # Redémarrer l'app via cPanel
   ```

2. **Frontend :**
   ```bash
   # En local
   npm run build
   # Uploader le contenu de build/ vers public_html/
   ```

---

## 📞 Support et Ressources

### Documentation O2Switch
- [Guide Node.js sur cPanel](https://www.o2switch.fr/hebergement-nodejs/)
- [Configuration des applications Node.js](https://support.cpanel.net/hc/en-us/articles/360053917634-How-to-Install-a-Node-js-Application)

### Commandes utiles SSH

```bash
# Vérifier la version de Node.js
node -v

# Redémarrer l'application Node.js
touch /home/votreuser/api.mariannedev.fr/nodejs/tmp/restart.txt

# Voir les processus Node.js
ps aux | grep node

# Tester l'API en local sur le serveur
curl http://localhost:3002/api/vera
```

### Contacts

- **Support O2Switch** : support@o2switch.fr
- **Documentation React** : https://react.dev
- **Documentation Express** : https://expressjs.com

---

## 🎯 Résumé Rapide

1. **Backend** : Uploader `server.js`, `package.json`, et `data/` → Configurer dans cPanel → Démarrer
2. **Frontend** : `npm run build` → Uploader vers `public_html/` → Copier `images/` → Créer `.htaccess`
3. **Tester** : Vérifier API et Frontend, créer/modifier/supprimer des données
4. **Monitorer** : Surveiller les logs, faire des sauvegardes régulières

**L'essentiel :** Deux serveurs distincts (Frontend statique + Backend Node.js) qui communiquent via HTTPS.

---

*Document créé le 6 décembre 2025 - Version 1.0*
*Dernière mise à jour : Déploiement branche `Antho/develop`*
