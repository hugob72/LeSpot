const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/promotions/active', (req, res) => {
    const query = "SELECT * FROM Sale WHERE NOW() BETWEEN dateDebut AND dateFin ORDER BY isFeatured DESC, dateFin ASC";
    connection.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json(results);
    });
});

router.post('/promotions/validate', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ valid: false, error: "Veuillez saisir un code." });
    
    const query = "SELECT idSale, rate, description, conditions FROM Sale WHERE code = ? AND NOW() BETWEEN dateDebut AND dateFin";
    connection.query(query, [code], (error, results) => {
        if (error) return res.status(500).json({ valid: false, error: 'Erreur serveur.' });
        if (results.length > 0) res.status(200).json({ valid: true, promotion: results[0] });
        else res.status(400).json({ valid: false, error: "Code promo invalide ou expiré." });
    });
});

router.get('/promotions', (req, res) => {
    const query = "SELECT * FROM Sale ORDER BY isFeatured DESC, dateFin ASC";
    connection.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json(results);
    });
});

router.post('/promotions', (req, res) => {
    const { code, rate, description, conditions, dateDebut, dateFin, isFeatured } = req.body;
    if (!code || !rate || !dateDebut || !dateFin) return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    if (new Date(dateDebut) >= new Date(dateFin)) return res.status(400).json({ error: 'Date de fin invalide.' });

    const query = "INSERT INTO Sale (code, rate, description, conditions, dateDebut, dateFin, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(query, [code, rate, description, conditions, dateDebut, dateFin, isFeatured ? 1 : 0], (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ce code promo existe déjà.' });
            return res.status(500).json({ error: 'Erreur création.' });
        }
        res.status(200).json({ message: 'Promotion créée !', idSale: results.insertId });
    });
});

router.get('/promotions/:id', (req, res) => {
    connection.query("SELECT * FROM Sale WHERE idSale = ?", [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        if (results.length > 0) res.status(200).json(results[0]);
        else res.status(404).json({ error: 'Promotion introuvable' });
    });
});

router.put('/promotions/:id', (req, res) => {
    const { code, rate, description, conditions, dateDebut, dateFin, isFeatured } = req.body;
    if (new Date(dateDebut) >= new Date(dateFin)) return res.status(400).json({ error: 'Date de fin invalide.' });
    
    const query = "UPDATE Sale SET code = ?, rate = ?, description = ?, conditions = ?, dateDebut = ?, dateFin = ?, isFeatured = ? WHERE idSale = ?";
    connection.query(query, [code, rate, description, conditions, dateDebut, dateFin, isFeatured ? 1 : 0, req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur modification.' });
        res.status(200).json({ message: 'Promotion modifiée !' });
    });
});

router.put('/promotions/:id/featured', (req, res) => {
    connection.query("UPDATE Sale SET isFeatured = ? WHERE idSale = ?", [req.body.isFeatured ? 1 : 0, req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur modification.' });
        res.status(200).json({ message: 'Statut actualisé.' });
    });
});

router.delete('/promotions/:id', (req, res) => {
    connection.query("DELETE FROM Sale WHERE idSale = ?", [req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur suppression.' });
        res.status(200).json({ message: 'Promotion supprimée.' });
    });
});

module.exports = router;