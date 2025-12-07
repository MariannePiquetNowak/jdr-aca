# Structure de l'API

Ce document décrit la structure de l'API nécessaire pour l'application JDR.

## Endpoints requis

### Bestiaire

**GET /bestiaire**
- Retourne: `Array<Enemy>`
- Exemple: `[{id, name, description, dangerLevel, powers, loot, portrait}, ...]`

**POST /bestiaire**
- Body: `{name, description, dangerLevel, powers, loot, portrait}`
- Retourne: l'ennemi créé avec son ID généré

**DELETE /bestiaire/:id**
- Supprime l'ennemi avec l'ID spécifié
- Retourne: statut 204 ou 200

### Règles

**GET /regles**
- Retourne: `{content: string}`

**POST /regles**
- Body: `{content: string}`
- Retourne: statut 200

### Lore

**GET /lore**
- Retourne: `{content: string}`

**POST /lore**
- Body: `{content: string}`
- Retourne: statut 200

### PNJ

**GET /pnj**
- Retourne: `{content: string}`

**POST /pnj**
- Body: `{content: string}`
- Retourne: statut 200

## Exemple de serveur Node.js simple

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({limit: '10mb'}));

// Fonction pour lire les données
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { bestiaire: [], regles: { content: '' }, lore: { content: '' }, pnj: { content: '' } };
  }
};

// Fonction pour écrire les données
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Routes Bestiaire
app.get('/bestiaire', (req, res) => {
  const data = readData();
  res.json(data.bestiaire || []);
});

app.post('/bestiaire', (req, res) => {
  const data = readData();
  const newEnemy = {
    ...req.body,
    id: Date.now()
  };
  data.bestiaire = data.bestiaire || [];
  data.bestiaire.push(newEnemy);
  writeData(data);
  res.json(newEnemy);
});

app.delete('/bestiaire/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  data.bestiaire = data.bestiaire.filter(e => e.id !== id);
  writeData(data);
  res.status(204).send();
});

// Routes Règles
app.get('/regles', (req, res) => {
  const data = readData();
  res.json(data.regles || { content: '' });
});

app.post('/regles', (req, res) => {
  const data = readData();
  data.regles = req.body;
  writeData(data);
  res.json({ success: true });
});

// Routes Lore
app.get('/lore', (req, res) => {
  const data = readData();
  res.json(data.lore || { content: '' });
});

app.post('/lore', (req, res) => {
  const data = readData();
  data.lore = req.body;
  writeData(data);
  res.json({ success: true });
});

// Routes PNJ
app.get('/pnj', (req, res) => {
  const data = readData();
  res.json(data.pnj || { content: '' });
});

app.post('/pnj', (req, res) => {
  const data = readData();
  data.pnj = req.body;
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

## Configuration

N'oubliez pas de définir la variable d'environnement dans votre `.env` :
```
REACT_APP_BASE_URL_API=http://localhost:3001
```
