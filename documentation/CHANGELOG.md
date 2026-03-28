# Journal des modifications - JDR ACA

## Branche : Antho/develop
**Date de création** : Décembre 2025  
**Auteur** : Développement avec GitHub Copilot

---

## 📋 Vue d'ensemble

Cette branche contient des modifications majeures de l'architecture de l'application, visant à :
1. Passer du chargement via API à un chargement local des données
2. Améliorer l'interface utilisateur (Markdown, layouts, composants)
3. Créer des interfaces MJ séparées avec données indépendantes
4. Résoudre des problèmes critiques de performance et d'UX

---

## 🔧 Modifications par catégorie

### 1. Architecture des données

#### 1.1 Migration vers données locales
**Fichiers modifiés** :
- `src/data.json` (déplacé depuis la racine vers `src/`)
- `data-mja.json` (nouveau fichier)
- `data-mjj.json` (nouveau fichier)

**Changements** :
- **AVANT** : Les données étaient chargées via API (routes non déployées)
- **APRÈS** : Chargement local via `import data from './data.json'`
- Les données partagées (règles, lore, joueurs) restent dans `src/data.json`
- Chaque MJ dispose de ses propres fichiers pour bestiaire, PNJ et objets

**Impact sur le merge** :
- ⚠️ `src/data.json` doit être déplacé de la racine vers le dossier `src/`
- ⚠️ Créer `data-mja.json` et `data-mjj.json` à la racine avec structure :
  ```json
  {
    "bestiaire": [],
    "pnj": [],
    "objets": []
  }
  ```

#### 1.2 Système de contexte MJ
**Fichiers créés** :
- `src/routes/MJA.jsx`
- `src/routes/MJJ.jsx`

**Fichiers modifiés** :
- `src/routes/MJ.jsx`
- `src/routes/bestiaire.jsx`
- `src/routes/pnj.jsx`
- `src/routes/objets.jsx`
- `server.js`
- `src/App.js`

**Changements** :
- Séparation de l'interface MJ en deux contextes indépendants (MJA et MJJ)
- Chaque MJ a son propre bestiaire, sa liste de PNJ et ses objets
- Détection automatique du contexte via `sessionStorage`
- Routes API séparées : `/api/mja/*` et `/api/mjj/*`

**Pattern de détection de contexte** :
```javascript
const getMJContext = () => {
    const referrer = sessionStorage.getItem('mjContext');
    if (referrer === 'mja') return 'mja';
    if (referrer === 'mjj') return 'mjj';
    return null;
};
const mjContext = getMJContext();
const apiPath = mjContext ? `/${mjContext}/bestiaire` : '/bestiaire';
```

**⚠️ IMPORTANT - Import manquant** :
- Dans `bestiaire.jsx`, `pnj.jsx` et `objets.jsx`, s'assurer que `useEffect` est importé depuis React :
  ```javascript
  import React, { useState, useEffect } from 'react';
  ```

**Impact sur le merge** :
- ⚠️ Vérifier que les nouvelles routes MJA/MJJ sont bien ajoutées dans `App.js`
- ⚠️ S'assurer que `server.js` contient les fonctions `readMJAFile`, `writeMJAFile`, `readMJJFile`, `writeMJJFile`
- ⚠️ Toutes les routes `/api/mja/*` et `/api/mjj/*` doivent être présentes dans `server.js`
- ⚠️ **CRITIQUE** : Vérifier l'import de `useEffect` dans bestiaire.jsx, pnj.jsx et objets.jsx

---

### 2. Composants et interface utilisateur

#### 2.1 Rendu Markdown amélioré
**Fichiers modifiés** :
- `src/services/utils.js`

**Changements** :
- Ajout du support des listes groupées (pattern `flushList`)
- Support des tableaux Markdown (pattern `flushTable`)
- Support des liens avec syntaxe `[texte](url)`
- Support des ancres avec syntaxe `[texte](#ancre)`
- Meilleur regroupement des éléments `<ul>` et `<table>`

**Impact sur le merge** :
- ✅ Peut être mergé sans conflit (amélioration isolée)
- Les fonctions `flushList` et `flushTable` sont ajoutées à `parseMarkdownToHTML`

#### 2.2 Refonte de l'affichage de la santé
**Fichiers modifiés** :
- `src/components/StateHealth.jsx`
- `src/styles/components/_mj.scss`

**Changements** :
- **AVANT** : Boutons radio verticaux pour l'état de santé
- **APRÈS** : Slider horizontal avec couleurs solides par état
- Utilisation de `data-value` attribute pour le ciblage CSS
- Sélecteur `:has()` pour les arrière-plans conditionnels

**Structure des états** :
```javascript
const healthStates = [
    { value: 0, label: 'Pleine forme' },
    { value: 1, label: 'Légèrement blessé' },
    { value: 2, label: 'Blessé' },
    { value: 3, label: 'Gravement blessé' },
    { value: 4, label: 'Critique' },
    { value: 5, label: 'Inconscient' }
];
```

**Impact sur le merge** :
- ⚠️ Si `StateHealth.jsx` a été modifié ailleurs, privilégier cette version (slider)
- ⚠️ Le CSS dans `_mj.scss` doit inclure les styles du slider et les couleurs

#### 2.3 Composants MJ spécifiques
**Fichiers créés** :
- `src/components/IdentityMJ.jsx`
- `src/components/FeaturesMJ.jsx`

**Changements** :
- `IdentityMJ` : Copie de `Identity.jsx` sans le champ "Paranormal"
- `FeaturesMJ` : Affichage des caractéristiques avec boutons +/- pour modification rapide
- Ces composants sont utilisés uniquement dans les vues MJ

**Fonctionnalités FeaturesMJ** :
- Boutons + (vert) et - (rouge) pour incrémenter/décrémenter
- Création d'événements synthétiques pour réutiliser les handlers existants
- Style défini dans `_mj.scss` (`.feature-btn-plus`, `.feature-btn-minus`)

**Impact sur le merge** :
- ✅ Nouveaux fichiers, pas de conflit attendu
- Les imports doivent être ajoutés dans `MJ.jsx`

#### 2.4 Corrections de layout
**Fichiers modifiés** :
- `src/styles/components/_mj.scss`
- `src/styles/sections/_globals.scss`
- `src/styles/sections/_identity.scss`
- `src/styles/sections/_state.scss`
- `src/styles/sections/_stuff.scss`

**Changements principaux** :
- Ajout de `!important` pour forcer le layout grid à 2 colonnes
- Suppression des conflits de `max-width` et `max-height`
- Alignement correct des cartes (margin: 0)
- Grid template : `repeat(2, 1fr)` pour affichage côte à côte

**Impact sur le merge** :
- ⚠️ Les styles avec `!important` peuvent entrer en conflit
- Vérifier que le layout grid fonctionne correctement après merge
- Tester l'affichage sur la page MJ

---

### 3. Gestion de l'état et performance

#### 3.1 Résolution du problème de perte de focus
**Fichier modifié** :
- `src/routes/MJ.jsx`

**Problème** :
- Les inputs perdaient le focus lors de la saisie à cause des mises à jour d'état

**Solutions implémentées (itérations successives)** :
1. **Tentative 1** : Ajout de `memo` sur SaveIndicator, déplacement de `setSaveStatus`
2. **Tentative 2** : Extraction de PlayerPanel avec memo, handlers stables via `useMemo`
3. **Tentative 3** : Utilisation de `useCallback` pour savePlayer, ajout de `playersDataRef`
4. **Solution finale** : Pattern `setTimeout(0)` pour différer `setSaveStatus`

**Pattern final** :
```javascript
const playersDataRef = useRef(playersData);
useEffect(() => {
    playersDataRef.current = playersData;
}, [playersData]);

const triggerSave = useCallback((key) => {
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => {
        savePlayer(key, playersDataRef.current[key]);
    }, 450);
}, [savePlayer]);
```

**Impact sur le merge** :
- ⚠️ **CRITIQUE** : Cette solution est essentielle pour l'UX
- Si `MJ.jsx` a été modifié, s'assurer de conserver :
  - `playersDataRef` avec synchronisation via useEffect
  - `triggerSave` et `triggerQuickSave` avec useCallback
  - Pattern setTimeout(0) dans les handlers

#### 3.2 Debouncing des sauvegardes
**Fichier modifié** :
- `src/routes/MJ.jsx`

**Changements** :
- Délai de 450ms pour les sauvegardes normales
- Clearance du timer précédent avant d'en créer un nouveau
- Garantit que la dernière modification est toujours sauvegardée

**Impact sur le merge** :
- ✅ Intégré dans le pattern de `triggerSave`, voir section 3.1

---

### 4. Modifications du serveur

#### 4.1 Routes API pour contextes MJ
**Fichier modifié** :
- `server.js`

**Nouvelles fonctions** :
- `readMJAFile()` : Lecture de `data-mja.json`
- `writeMJAFile(data)` : Écriture de `data-mja.json`
- `readMJJFile()` : Lecture de `data-mjj.json`
- `writeMJJFile(data)` : Écriture de `data-mjj.json`

**Nouvelles routes** :
```javascript
// Routes MJA
GET    /api/mja/bestiaire
POST   /api/mja/bestiaire
PUT    /api/mja/bestiaire/:id
DELETE /api/mja/bestiaire/:id

GET    /api/mja/pnj
POST   /api/mja/pnj
PUT    /api/mja/pnj/:id
DELETE /api/mja/pnj/:id

GET    /api/mja/objets
POST   /api/mja/objets
PUT    /api/mja/objets/:id
DELETE /api/mja/objets/:id

// Routes MJJ (identiques avec /mjj)
```

**Impact sur le merge** :
- ⚠️ **IMPORTANT** : Vérifier que toutes les routes sont présentes
- Les routes doivent être ajoutées APRÈS les routes existantes `/api/bestiaire`, etc.
- S'assurer que les fichiers `data-mja.json` et `data-mjj.json` existent

---

### 5. Modifications du contenu

#### 5.1 Réorganisation des règles
**Fichier modifié** :
- `src/data.json` (section `regles`)

**Changements** :
- Déplacement du tableau "Évaluation du style de l'incantation"
- **AVANT** : Dans la section "Enchantement"
- **APRÈS** : Dans la section "La magie"

**Impact sur le merge** :
- ⚠️ Vérifier la structure de la section `regles` dans `data.json`
- Si conflit, privilégier la version avec le tableau dans "La magie"

---

## 🔀 Guide de merge

### Étapes recommandées

#### 1. Préparation
```bash
# Sauvegarder la branche actuelle
git branch backup-antho-develop

# S'assurer d'être sur la branche Antho/develop
git checkout Antho/develop

# Mettre à jour depuis le remote
git pull origin Antho/develop
```

#### 2. Vérification des fichiers critiques

**Fichiers de données** :
- [ ] `src/data.json` existe (et non à la racine)
- [ ] `data-mja.json` existe à la racine
- [ ] `data-mjj.json` existe à la racine

**Composants critiques** :
- [ ] `src/routes/MJ.jsx` contient le pattern setTimeout(0)
- [ ] `src/routes/MJA.jsx` existe avec sessionStorage
- [ ] `src/routes/MJJ.jsx` existe avec sessionStorage
- [ ] `src/components/IdentityMJ.jsx` existe
- [ ] `src/components/FeaturesMJ.jsx` existe

**Routes API** :
- [ ] `server.js` contient les fonctions readMJAFile/writeMJAFile
- [ ] `server.js` contient les fonctions readMJJFile/writeMJJFile
- [ ] Toutes les routes `/api/mja/*` sont présentes
- [ ] Toutes les routes `/api/mjj/*` sont présentes

#### 3. Merge depuis main/master

```bash
# Merger la branche principale
git merge main  # ou master selon votre convention

# En cas de conflits
git status  # Voir les fichiers en conflit
```

#### 4. Résolution des conflits courants

**Si conflit sur `src/data.json`** :
- Conserver la structure avec regles, lore, bestiaire, pnj, objets, players
- S'assurer que "Évaluation du style de l'incantation" est dans "La magie"

**Si conflit sur `src/routes/MJ.jsx`** :
- **PRIORITÉ ABSOLUE** : Conserver le pattern `playersDataRef` + `setTimeout(0)`
- Conserver `triggerSave` et `triggerQuickSave` avec useCallback
- Conserver les imports de `IdentityMJ` et `FeaturesMJ`

**Si conflit sur `server.js`** :
- Conserver toutes les nouvelles routes `/api/mja/*` et `/api/mjj/*`
- Conserver les fonctions de lecture/écriture des fichiers MJ

**Si conflit sur `src/App.js`** :
- Conserver les routes `/MJA` et `/MJJ`
- S'assurer que `mjPages` contient `'/mja'` et `'/mjj'`

#### 5. Tests après merge

```bash
# Installer les dépendances (si package.json a changé)
npm install

# Lancer le serveur
node server.js

# Dans un autre terminal, lancer React
npm start
```

**Tests fonctionnels** :
- [ ] La page d'accueil charge correctement
- [ ] Les pages de joueurs affichent les données
- [ ] La page MJA est accessible et définit le contexte
- [ ] La page MJJ est accessible et définit le contexte
- [ ] Le Bestiaire affiche des données différentes selon le contexte MJ
- [ ] Les PNJ affichent des données différentes selon le contexte MJ
- [ ] Les Objets affichent des données différentes selon le contexte MJ
- [ ] Les inputs dans MJ ne perdent pas le focus lors de la saisie
- [ ] Les boutons +/- dans FeaturesMJ fonctionnent
- [ ] Le slider de santé affiche les bonnes couleurs
- [ ] Les modifications sont bien sauvegardées

#### 6. Validation finale

```bash
# Vérifier qu'il n'y a pas d'erreurs
npm run build

# Committer le merge
git add .
git commit -m "Merge main into Antho/develop - Résolution des conflits"

# Pousser vers le remote
git push origin Antho/develop
```

---

## ⚠️ Points d'attention particuliers

### Critique - Ne pas perdre ces modifications

1. **Pattern de perte de focus** (`MJ.jsx`)
   - Sans `playersDataRef` + `setTimeout(0)`, les inputs perdront le focus
   - C'est le résultat de plusieurs itérations, ne pas revenir en arrière

2. **Système de contexte MJ**
   - Les trois fichiers (bestiaire, pnj, objets) doivent tous utiliser `getMJContext()`
   - Les composants MJA/MJJ doivent définir `sessionStorage.setItem('mjContext', ...)`

3. **Routes API serveur**
   - Chaque route doit utiliser le bon fichier (data-mja.json ou data-mjj.json)
   - Les IDs doivent être gérés correctement pour éviter les doublons

### Important - Vérifier après merge

1. **Styles CSS**
   - Les `!important` dans `_mj.scss` peuvent causer des problèmes
   - Tester le layout sur différentes tailles d'écran

2. **Markdown rendering**
   - Vérifier que les listes et tableaux s'affichent correctement
   - Tester avec différents contenus de règles

3. **Performance**
   - Le debouncing à 450ms peut être ajusté si nécessaire
   - Surveiller les re-renders inutiles

---

## 📝 Notes de développement

### Décisions techniques

1. **Pourquoi `setTimeout(0)` ?**
   - Permet à React de terminer le cycle de rendu avant de déclencher l'indicateur
   - Alternative plus propre que `flushSync` qui force les renders synchrones

2. **Pourquoi `playersDataRef` ?**
   - Évite les problèmes de closure dans les callbacks setTimeout
   - Garantit toujours l'accès aux données les plus récentes

3. **Pourquoi des fichiers JSON séparés ?**
   - Chaque MJ doit avoir ses propres données isolées
   - Évite les conflits lors de modifications simultanées
   - Structure plus claire et maintenable

4. **Pourquoi `sessionStorage` et pas `localStorage` ?**
   - Le contexte MJ est spécifique à la session de navigation
   - Évite les problèmes si plusieurs onglets sont ouverts
   - Se réinitialise automatiquement à la fermeture du navigateur

### Améliorations futures possibles

1. **Authentification**
   - Ajouter un système de login pour différencier MJA et MJJ
   - Remplacer `sessionStorage` par un token JWT

2. **Synchronisation temps réel**
   - Utiliser WebSocket pour synchroniser les données entre MJ et joueurs
   - Notifications en temps réel des modifications

3. **Historique des modifications**
   - Logger les changements dans un fichier séparé
   - Permettre l'annulation (undo/redo)

4. **Export/Import**
   - Exporter les données en PDF pour impression
   - Import de bestiaires depuis des sources externes

---

## 📞 Support

En cas de problème lors du merge :

1. **Consulter cette documentation** en détail
2. **Vérifier les fichiers de backup** créés avant le merge
3. **Tester unitairement** chaque fonctionnalité après résolution de conflit
4. **Ne pas hésiter à revenir en arrière** si un conflit semble trop complexe

---

**Dernière mise à jour** : 4 décembre 2025  
**Version** : 1.0.0  
**Branche** : Antho/develop
