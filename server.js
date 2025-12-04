const https = require('https');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3002;
const cors = require('cors');

/* const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
}; */

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

/* ======= BESTIAIRE ======= */
// Fonction pour lire data.json
const readDataFile = () => {
    try {
        const data = fs.readFileSync('./data.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { bestiaire: [], regles: { content: '' }, lore: { content: '' }, pnj: [], objets: [] };
    }
};

// Fonction pour écrire data.json
const writeDataFile = (data) => {
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2), 'utf8');
};

// GET tous les ennemis
app.get('/api/bestiaire', (req, res) => {
    const data = readDataFile();
    res.json(data.bestiaire || []);
});

// POST un nouvel ennemi
app.post('/api/bestiaire', (req, res) => {
    const data = readDataFile();
    const newEnemy = {
        ...req.body,
        id: req.body.id || Date.now()
    };
    data.bestiaire = data.bestiaire || [];
    data.bestiaire.push(newEnemy);
    writeDataFile(data);
    res.json(newEnemy);
});

// PUT modifier un ennemi
app.put('/api/bestiaire/:id', (req, res) => {
    const data = readDataFile();
    const id = parseInt(req.params.id);
    const index = (data.bestiaire || []).findIndex(e => e.id === id);
    if (index !== -1) {
        data.bestiaire[index] = { ...req.body, id };
        writeDataFile(data);
        res.json(data.bestiaire[index]);
    } else {
        res.status(404).json({ error: 'Ennemi non trouvé' });
    }
});

// DELETE un ennemi
app.delete('/api/bestiaire/:id', (req, res) => {
    const data = readDataFile();
    const id = parseInt(req.params.id);
    data.bestiaire = (data.bestiaire || []).filter(e => e.id !== id);
    writeDataFile(data);
    res.status(204).send();
});

/* ======= RÈGLES ======= */
// GET règles
app.get('/api/regles', (req, res) => {
    const data = readDataFile();
    res.json(data.regles || { content: '' });
});

// POST règles
app.post('/api/regles', (req, res) => {
    const data = readDataFile();
    data.regles = req.body;
    writeDataFile(data);
    res.json({ success: true });
});

/* ======= LORE ======= */
// GET lore
app.get('/api/lore', (req, res) => {
    const data = readDataFile();
    res.json(data.lore || { content: '' });
});

// POST lore
app.post('/api/lore', (req, res) => {
    const data = readDataFile();
    data.lore = req.body;
    writeDataFile(data);
    res.json({ success: true });
});

/* ======= PNJ ======= */
// GET tous les PNJ
app.get('/api/pnj', (req, res) => {
    const data = readDataFile();
    res.json(data.pnj || []);
});

// POST nouveau PNJ
app.post('/api/pnj', (req, res) => {
    const data = readDataFile();
    if (!data.pnj) data.pnj = [];
    data.pnj.push(req.body);
    writeDataFile(data);
    res.json({ success: true });
});

// PUT mettre à jour un PNJ
app.put('/api/pnj/:id', (req, res) => {
    const data = readDataFile();
    if (!data.pnj) data.pnj = [];
    const index = data.pnj.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        data.pnj[index] = req.body;
        writeDataFile(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'PNJ non trouvé' });
    }
});

// DELETE supprimer un PNJ
app.delete('/api/pnj/:id', (req, res) => {
    const data = readDataFile();
    if (!data.pnj) data.pnj = [];
    data.pnj = data.pnj.filter(p => p.id != req.params.id);
    writeDataFile(data);
    res.json({ success: true });
});

/* ======= MJA - BESTIAIRE & PNJ ======= */
const readMJAFile = () => {
    try {
        const data = fs.readFileSync('./data-mja.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { bestiaire: [], pnj: [] };
    }
};

const writeMJAFile = (data) => {
    fs.writeFileSync('./data-mja.json', JSON.stringify(data, null, 2), 'utf8');
};

// GET bestiaire MJA
app.get('/api/mja/bestiaire', (req, res) => {
    const data = readMJAFile();
    res.json(data.bestiaire || []);
});

// POST bestiaire MJA
app.post('/api/mja/bestiaire', (req, res) => {
    const data = readMJAFile();
    const newEnemy = { ...req.body, id: req.body.id || Date.now() };
    data.bestiaire = data.bestiaire || [];
    data.bestiaire.push(newEnemy);
    writeMJAFile(data);
    res.json(newEnemy);
});

// PUT bestiaire MJA
app.put('/api/mja/bestiaire/:id', (req, res) => {
    const data = readMJAFile();
    const id = parseInt(req.params.id);
    const index = (data.bestiaire || []).findIndex(e => e.id === id);
    if (index !== -1) {
        data.bestiaire[index] = { ...req.body, id };
        writeMJAFile(data);
        res.json(data.bestiaire[index]);
    } else {
        res.status(404).json({ error: 'Ennemi non trouvé' });
    }
});

// DELETE bestiaire MJA
app.delete('/api/mja/bestiaire/:id', (req, res) => {
    const data = readMJAFile();
    const id = parseInt(req.params.id);
    data.bestiaire = (data.bestiaire || []).filter(e => e.id !== id);
    writeMJAFile(data);
    res.status(204).send();
});

// GET PNJ MJA
app.get('/api/mja/pnj', (req, res) => {
    const data = readMJAFile();
    res.json(data.pnj || []);
});

// POST PNJ MJA
app.post('/api/mja/pnj', (req, res) => {
    const data = readMJAFile();
    if (!data.pnj) data.pnj = [];
    data.pnj.push(req.body);
    writeMJAFile(data);
    res.json({ success: true });
});

// PUT PNJ MJA
app.put('/api/mja/pnj/:id', (req, res) => {
    const data = readMJAFile();
    if (!data.pnj) data.pnj = [];
    const index = data.pnj.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        data.pnj[index] = req.body;
        writeMJAFile(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'PNJ non trouvé' });
    }
});

// DELETE PNJ MJA
app.delete('/api/mja/pnj/:id', (req, res) => {
    const data = readMJAFile();
    if (!data.pnj) data.pnj = [];
    data.pnj = data.pnj.filter(p => p.id != req.params.id);
    writeMJAFile(data);
    res.json({ success: true });
});

// GET objets MJA
app.get('/api/mja/objets', (req, res) => {
    const data = readMJAFile();
    res.json(data.objets || []);
});

// POST objets MJA
app.post('/api/mja/objets', (req, res) => {
    const data = readMJAFile();
    if (!data.objets) data.objets = [];
    data.objets.push(req.body);
    writeMJAFile(data);
    res.json({ success: true });
});

// PUT objets MJA
app.put('/api/mja/objets/:id', (req, res) => {
    const data = readMJAFile();
    if (!data.objets) data.objets = [];
    const index = data.objets.findIndex(o => o.id == req.params.id);
    if (index !== -1) {
        data.objets[index] = req.body;
        writeMJAFile(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Objet non trouvé' });
    }
});

// DELETE objets MJA
app.delete('/api/mja/objets/:id', (req, res) => {
    const data = readMJAFile();
    if (!data.objets) data.objets = [];
    data.objets = data.objets.filter(o => o.id != req.params.id);
    writeMJAFile(data);
    res.json({ success: true });
});

/* ======= MJJ - BESTIAIRE & PNJ ======= */
const readMJJFile = () => {
    try {
        const data = fs.readFileSync('./data-mjj.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { bestiaire: [], pnj: [] };
    }
};

const writeMJJFile = (data) => {
    fs.writeFileSync('./data-mjj.json', JSON.stringify(data, null, 2), 'utf8');
};

// GET bestiaire MJJ
app.get('/api/mjj/bestiaire', (req, res) => {
    const data = readMJJFile();
    res.json(data.bestiaire || []);
});

// POST bestiaire MJJ
app.post('/api/mjj/bestiaire', (req, res) => {
    const data = readMJJFile();
    const newEnemy = { ...req.body, id: req.body.id || Date.now() };
    data.bestiaire = data.bestiaire || [];
    data.bestiaire.push(newEnemy);
    writeMJJFile(data);
    res.json(newEnemy);
});

// PUT bestiaire MJJ
app.put('/api/mjj/bestiaire/:id', (req, res) => {
    const data = readMJJFile();
    const id = parseInt(req.params.id);
    const index = (data.bestiaire || []).findIndex(e => e.id === id);
    if (index !== -1) {
        data.bestiaire[index] = { ...req.body, id };
        writeMJJFile(data);
        res.json(data.bestiaire[index]);
    } else {
        res.status(404).json({ error: 'Ennemi non trouvé' });
    }
});

// DELETE bestiaire MJJ
app.delete('/api/mjj/bestiaire/:id', (req, res) => {
    const data = readMJJFile();
    const id = parseInt(req.params.id);
    data.bestiaire = (data.bestiaire || []).filter(e => e.id !== id);
    writeMJJFile(data);
    res.status(204).send();
});

// GET PNJ MJJ
app.get('/api/mjj/pnj', (req, res) => {
    const data = readMJJFile();
    res.json(data.pnj || []);
});

// POST PNJ MJJ
app.post('/api/mjj/pnj', (req, res) => {
    const data = readMJJFile();
    if (!data.pnj) data.pnj = [];
    data.pnj.push(req.body);
    writeMJJFile(data);
    res.json({ success: true });
});

// PUT PNJ MJJ
app.put('/api/mjj/pnj/:id', (req, res) => {
    const data = readMJJFile();
    if (!data.pnj) data.pnj = [];
    const index = data.pnj.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        data.pnj[index] = req.body;
        writeMJJFile(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'PNJ non trouvé' });
    }
});

// DELETE PNJ MJJ
app.delete('/api/mjj/pnj/:id', (req, res) => {
    const data = readMJJFile();
    if (!data.pnj) data.pnj = [];
    data.pnj = data.pnj.filter(p => p.id != req.params.id);
    writeMJJFile(data);
    res.json({ success: true });
});

// GET objets MJJ
app.get('/api/mjj/objets', (req, res) => {
    const data = readMJJFile();
    res.json(data.objets || []);
});

// POST objets MJJ
app.post('/api/mjj/objets', (req, res) => {
    const data = readMJJFile();
    if (!data.objets) data.objets = [];
    data.objets.push(req.body);
    writeMJJFile(data);
    res.json({ success: true });
});

// PUT objets MJJ
app.put('/api/mjj/objets/:id', (req, res) => {
    const data = readMJJFile();
    if (!data.objets) data.objets = [];
    const index = data.objets.findIndex(o => o.id == req.params.id);
    if (index !== -1) {
        data.objets[index] = req.body;
        writeMJJFile(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Objet non trouvé' });
    }
});

// DELETE objets MJJ
app.delete('/api/mjj/objets/:id', (req, res) => {
    const data = readMJJFile();
    if (!data.objets) data.objets = [];
    data.objets = data.objets.filter(o => o.id != req.params.id);
    writeMJJFile(data);
    res.json({ success: true });
});

/* ======= OBJETS ======= */
// GET tous les objets
app.get('/api/objets', (req, res) => {
    const data = readDataFile();
    res.json(data.objets || []);
});

// POST nouvel objet
app.post('/api/objets', (req, res) => {
    const data = readDataFile();
    if (!data.objets) data.objets = [];
    data.objets.push(req.body);
    writeDataFile(data);
    res.json({ success: true });
});

// PUT mettre à jour un objet
app.put('/api/objets/:id', (req, res) => {
    const data = readDataFile();
    if (!data.objets) data.objets = [];
    const index = data.objets.findIndex(o => o.id == req.params.id);
    if (index !== -1) {
        data.objets[index] = req.body;
        writeDataFile(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Objet non trouvé' });
    }
});

// DELETE supprimer un objet
app.delete('/api/objets/:id', (req, res) => {
    const data = readDataFile();
    if (!data.objets) data.objets = [];
    data.objets = data.objets.filter(o => o.id != req.params.id);
    writeDataFile(data);
    res.json({ success: true });
});

/* ======= LANCEMENT DU SERVEUR ======= */
app.listen(PORT, () => {
    console.log(`Serveur API lancé sur http://localhost:${PORT}`);
});
/* https.createServer(options, app).listen(PORT, () => {
  console.log(`Serveur API HTTPS lancé sur https://localhost:${PORT}`);
}); */