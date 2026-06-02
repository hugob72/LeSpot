const express = require('express');
const router = express.Router();
const connection = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res) => {
    const { firstname, lastname, email, password, phoneNumber } = req.body;
    if (firstname && lastname && email && password && phoneNumber) {
        bcrypt.hash(password, 10, (hashError, hash) => {
            if (hashError) return res.status(500).json({ error: 'Erreur hachage' });
            connection.query('INSERT INTO User (firstname, lastname, email, password, phoneNumber) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, email, hash, phoneNumber], (error, results) => {
                if (error) return res.status(500).json({ error: 'Erreur BDD' });
                const token = jwt.sign({userId: results.insertId}, 'votre_cle_secrete', { expiresIn: '24h' });
                res.status(200).json({ message: 'Inscription réussie !', userId: results.insertId, token: token });
            });
        });
    } else {
        res.status(400).json({ error: 'Données manquantes' });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM User WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur de connexion' });
        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (compareError, match) => {
                if (compareError) return res.status(500).json({ error: 'Erreur comparaison' });
                if (match) {
                    const token = jwt.sign({userId: results[0].idUser}, 'votre_cle_secrete', { expiresIn: '24h' });
                    res.status(200).json({ message: 'Connexion réussie !', userId: results[0].idUser, token: token });
                } else {
                    res.status(401).json({ error: 'Mot de passe incorrect' });
                }
            });
        } else {
            res.status(404).json({ error: 'Identifiants incorrects' });
        }
    });
});

router.get('/user', (req, res) => {
    connection.query("SELECT idUser, firstName, lastName, email, phoneNumber, role FROM User ORDER BY idUser DESC", (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur récupération comptes' });
        res.status(200).json(results);
    });
});

router.put('/user/:id/role', (req, res) => {
    const { role } = req.body;
    if (role !== 'client' && role !== 'admin') return res.status(400).json({ error: 'Rôle invalide' });
    connection.query("UPDATE User SET role = ? WHERE idUser = ?", [role, req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur mise à jour rôle' });
        res.status(200).json({ message: 'Rôle mis à jour' });
    });
});

router.delete('/user/:id', (req, res) => {
    connection.query("DELETE FROM User WHERE idUser = ?", [req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur suppression' });
        res.status(200).json({ message: 'Utilisateur supprimé' });
    });
});

router.get('/user/:id', (req, res) => {
    connection.query('SELECT idUser, firstName, lastName, phoneNumber, email, role, address, postalCode, city, country, paymentPreference FROM User WHERE idUser = ?', [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur BDD' });
        if (results.length > 0) res.status(200).json(results[0]);
        else res.status(404).json({ error: 'Utilisateur introuvable' });
    });
});

router.put('/user/:id', (req, res) => {
    const { firstName, lastName, phoneNumber, address, postalCode, city, country, paymentPreference } = req.body;
    connection.query('UPDATE User SET firstName=?, lastName=?, phoneNumber=?, address=?, postalCode=?, city=?, country=?, paymentPreference=? WHERE idUser=?', [firstName, lastName, phoneNumber, address, postalCode, city, country, paymentPreference, req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur mise à jour' });
        if (results.affectedRows > 0) res.status(200).json({ message: 'Utilisateur mis à jour' });
        else res.status(404).json({ error: 'Utilisateur introuvable' });
    });
});

router.get('/user/:id/bookings', (req, res) => {
    const query = `
        SELECT s.idService, s.date, s.heure, s.duree, ts.name, ts.image 
        FROM Participation p JOIN Service s ON p.idService = s.idService JOIN TypeService ts ON s.idTypeService = ts.idTypeService
        WHERE p.idUser = ? ORDER BY s.date DESC, s.heure DESC`;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json(results);
    });
});

router.get('/user/:userId/hasBought/:articleId', (req, res) => {
    const query = `SELECT COUNT(*) as count FROM \`Order\` o JOIN OrderDetail od ON o.idOrder = od.idOrder WHERE o.idUser = ? AND od.idItem = ?`;
    connection.query(query, [req.params.userId, req.params.articleId], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur vérification achat' });
        res.status(200).json({ hasBought: results[0].count > 0 });
    });
});

module.exports = router;