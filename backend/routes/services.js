const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/catalog/services', (req, res) => {
    connection.query("SELECT * FROM TypeService ORDER BY basePrice ASC", (error, results) => {
        if (error ){
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

router.post('/catalog/services', (req, res) => {
    const { name, description, image, defaultDuration, basePrice } = req.body;
    if (!name || !description || !image || !defaultDuration || !basePrice) {
        return res.status(400).json({ error: 'Toutes les informations sont requises' });
    }
    const query = "INSERT INTO TypeService (name, description, image, defaultDuration, basePrice) VALUES (?, ?, ?, ?, ?)";
    connection.query(query, [name, description, image, defaultDuration, basePrice], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json({ message: 'Prestation créée', idTypeService: results.insertId });
    });
});

router.put('/catalog/services/:id', (req, res) => {
    const { name, description, image, defaultDuration, basePrice } = req.body;
    const query = "UPDATE TypeService SET name = ?, description = ?, image = ?, defaultDuration = ?, basePrice = ? WHERE idTypeService = ?";
    connection.query(query, [name, description, image, defaultDuration, basePrice, req.params.id], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json({ message: 'Prestation modifiée' });
    });
});

router.get('/catalog/services/:id', (req, res) => {
    connection.query("SELECT * FROM TypeService WHERE idTypeService = ?", [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ error: 'Prestation introuvable' });
        }
    });
});

router.get('/catalog/services/:id/slots', (req, res) => {
    const query = `SELECT s.*, (s.numberParticipants - (SELECT COUNT(*) FROM Participation p WHERE p.idService = s.idService)) AS placesRestantes FROM Service s
        WHERE s.idTypeService = ? AND s.date >= CURDATE()
        ORDER BY s.date ASC, s.heure ASC
    `;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

router.get('/admin/services', (req, res) => {
    const query = `SELECT s.idService, s.date, s.heure, s.duree, s.price, s.numberParticipants, ts.name AS typeName, ts.idTypeService, (SELECT COUNT(*) FROM Participation p WHERE p.idService = s.idService) AS inscrits
        FROM Service s
        JOIN TypeService ts ON s.idTypeService = ts.idTypeService
        ORDER BY s.date DESC, s.heure DESC
    `;
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

router.post('/admin/services', (req, res) => {
    const { idTypeService, date, heure, duree, price, numberParticipants } = req.body;
    connection.query('SELECT name FROM TypeService WHERE idTypeService = ?', [idTypeService], (err, tsRes) => {
        if (err || tsRes.length === 0) {
            return res.status(400).json({ error: 'Type de service invalide' });
        }
        
        const title = `Session ${tsRes[0].name}`;
        const query = "INSERT INTO Service (idTypeService, title, date, heure, duree, price, numberParticipants) VALUES (?, ?, ?, ?, ?, ?, ?)";
        connection.query(query, [idTypeService, title, date, heure, duree, price, numberParticipants], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erreur création' });
            }
            res.status(200).json({ message: 'Créneau ajouté', idService: results.insertId });
        });
    });
});

router.get('/admin/services/:id', (req, res) => {
    connection.query("SELECT * FROM Service WHERE idService = ?", [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ error: 'Créneau introuvable' });
        }
    });
});

router.put('/admin/services/:id', (req, res) => {
    const { idTypeService, date, heure, duree, price, numberParticipants } = req.body;
    connection.query('SELECT name FROM TypeService WHERE idTypeService = ?', [idTypeService], (err, tsRes) => {
        if (err || tsRes.length === 0) {
            return res.status(400).json({ error: 'Type de service invalide' });
        }
        
        const title = `Session ${tsRes[0].name}`;
        const query = "UPDATE Service SET idTypeService = ?, title = ?, date = ?, heure = ?, duree = ?, price = ?, numberParticipants = ? WHERE idService = ?";
        connection.query(query, [idTypeService, title, date, heure, duree, price, numberParticipants, req.params.id], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Erreur modification' });
            }
            res.status(200).json({ message: 'Créneau modifié' });
        });
    });
});

router.delete('/admin/services/:id', (req, res) => {
    connection.query("DELETE FROM Service WHERE idService = ?", [req.params.id], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur suppression' });
        }
        res.status(200).json({ message: 'Créneau supprimé' });
    });
});

router.get('/admin/services/:id/participants', (req, res) => {
    const query = `SELECT u.idUser, u.firstName, u.lastName, u.email, u.phoneNumber FROM Participation pJOIN User u ON p.idUser = u.idUserWHERE p.idService = ?`;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;