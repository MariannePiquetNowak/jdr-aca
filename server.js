const https = require('https');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3002;
const cors = require('cors');

const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};

app.use(express.json());
app.use(cors());

/* ======= VERA NOWAKOVIC ======= */
// Lire le fichier JSON 
app.get('/api/vera', (req, res) => {
    fs.readFile('./data/vera.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Erreur lecture fichier');
        res.json(JSON.parse(data));
    });
});

// Modifier le fichier JSON 
app.post('/api/vera', (req, res) => {
    fs.writeFile('./data/vera.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).send('Erreur écriture fichier');
        res.json({ message: "Fichier mis à jour" });
    });
});

/* ======= BERNARD DECROIX ======= */
// Lire le fichier JSON 
app.get('/api/bernard', (req, res) => {
    fs.readFile('./data/bernard.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Erreur lecture fichier');
        res.json(JSON.parse(data));
    });
});

// Modifier le fichier JSON 
app.post('/api/bernard', (req, res) => {
    fs.writeFile('./data/bernard.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).send('Erreur écriture fichier');
        res.json({ message: "Fichier mis à jour" });
    });
});

/* ======= ETIENNE ARCENAUX ======= */
// Lire le fichier JSON 
app.get('/api/etienne', (req, res) => {
    fs.readFile('./data/etienne.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Erreur lecture fichier');
        res.json(JSON.parse(data));
    });
});

// Modifier le fichier JSON 
app.post('/api/etienne', (req, res) => {
    fs.writeFile('./data/etienne.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).send('Erreur écriture fichier');
        res.json({ message: "Fichier mis à jour" });
    });
});

/* ======= THEODORE DE RUIJTER ======= */
// Lire le fichier JSON 
app.get('/api/theodore', (req, res) => {
    fs.readFile('./data/theodore.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Erreur lecture fichier');
        res.json(JSON.parse(data));
    });
});

// Modifier le fichier JSON 
app.post('/api/theodore', (req, res) => {
    fs.writeFile('./data/theodore.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).send('Erreur écriture fichier');
        res.json({ message: "Fichier mis à jour" });
    });
});

/* ======= LANCEMENT DU SERVEUR ======= */
app.listen(PORT, () => {
    console.log(`Serveur API lancé sur http://localhost:${PORT}`);
});
/* https.createServer(options, app).listen(PORT, () => {
  console.log(`Serveur API HTTPS lancé sur https://localhost:${PORT}`);
}); */