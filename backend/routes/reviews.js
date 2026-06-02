const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/article/:id/reviews', (req, res) => {
    const query = `SELECT r.rating, r.comment, r.publishDate, u.firstName, u.lastName FROM Review r JOIN \`User\` u ON r.idUser = u.idUser WHERE r.idItem = ? ORDER BY r.publishDate DESC`;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

router.post('/article/:id/reviews', (req, res) => {
    const { idUser, rating, comment } = req.body;
    if (!idUser || !rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Données invalides' });
    const query = 'INSERT INTO Review (idItem, idUser, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)';
    connection.query(query, [req.params.id, idUser, rating, comment], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur BDD' });
        }
        res.status(200).json({ message: 'Avis ajouté' });
    });
});

router.get('/reviews/user/:userId', (req, res) => {
    const query = `SELECT r.rating, r.comment, r.publishDate, r.idItem, i.name AS articleName FROM Review r JOIN Item i ON r.idItem = i.idItem WHERE r.idUser = ? ORDER BY r.publishDate DESC`;
    connection.query(query, [req.params.userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur BDD' });
        }
        res.status(200).json(results);
    });
});

router.put('/reviews/user/:userId/item/:idItem', (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5 || !comment.trim()) return res.status(400).json({ error: 'Données invalides' });
    connection.query("UPDATE Review SET rating=?, comment=?, publishDate=NOW() WHERE idUser=? AND idItem=?", [rating, comment, req.params.userId, req.params.idItem], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur BDD' });
        }
        res.status(200).json({ message: 'Avis mis à jour' });
    });
});

router.delete('/reviews/user/:userId/item/:idItem', (req, res) => {
    connection.query("DELETE FROM Review WHERE idUser = ? AND idItem = ?", [req.params.userId, req.params.idItem], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur suppression' });
        }
        res.status(200).json({ message: 'Avis supprimé' });
    });
});

module.exports = router;