const express = require('express');
const router = express.Router();
const connection = require('../db');

router.post('/complaint', (req, res) => {
    const { idUser, idOrder, type, topic, description } = req.body;
    if (!idUser || !idOrder || !type || !topic || !description) return res.status(400).json({ error: 'Données incomplètes' });
    
    const query = "INSERT INTO Complaint (idUser, idOrder, type, topic, description) VALUES (?, ?, ?, ?, ?)";
    connection.query(query, [idUser, idOrder, type, topic, description], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json({ message: 'Réclamation créée', idComplaint: results.insertId });
    });
});

router.get('/complaint', (req, res) => {
    const query = `
        SELECT c.*, u.firstName, u.lastName, u.email 
        FROM Complaint c JOIN User u ON c.idUser = u.idUser ORDER BY c.idComplaint DESC
    `;
    connection.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json(results);
    });
});

router.put('/complaint/:id/state', (req, res) => {
    if (!req.body.state) return res.status(400).json({ error: 'Statut manquant' });
    connection.query('UPDATE Complaint SET state = ? WHERE idComplaint = ?', [req.body.state, req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur mise à jour' });
        res.status(200).json({ message: 'Statut mis à jour' });
    });
});

router.get('/complaint/user/:userId', (req, res) => {
    connection.query("SELECT * FROM Complaint WHERE idUser = ? ORDER BY idComplaint DESC", [req.params.userId], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json(results);
    });
});

router.get('/complaint/:id', (req, res) => {
    const query = "SELECT c.*, u.firstName, u.lastName FROM Complaint c JOIN User u ON c.idUser = u.idUser WHERE c.idComplaint = ?";
    connection.query(query, [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        if (results.length > 0) res.status(200).json(results[0]);
        else res.status(404).json({ error: 'Réclamation introuvable' });
    });
});

router.get('/complaint/:id/messages', (req, res) => {
    const query = `
        SELECT cm.*, u.firstName, u.lastName, u.role 
        FROM ComplaintMessage cm JOIN User u ON cm.idUser = u.idUser 
        WHERE cm.idComplaint = ? ORDER BY cm.sendDate ASC
    `;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json(results);
    });
});

router.post('/complaint/:id/messages', (req, res) => {
    const { idUser, message } = req.body;
    if (!idUser || !message) return res.status(400).json({ error: 'Données incomplètes' });
    
    connection.query("INSERT INTO ComplaintMessage (idComplaint, idUser, content) VALUES (?, ?, ?)", [req.params.id, idUser, message], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json({ message: 'Message ajouté', idMessage: results.insertId });
    });
});

module.exports = router;