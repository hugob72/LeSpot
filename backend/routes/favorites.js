const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/favorites/check', (req, res) => {
    const { idUser, idItem, idTypeService } = req.query;
    let query = "SELECT COUNT(*) AS isFavorite FROM Favorite WHERE idUser = ? AND ";
    let params = [idUser];

    if (idItem) {
        query += "idItem = ?"; params.push(idItem);
    } else {
        query += "idTypeService = ?"; params.push(idTypeService);
    }

    connection.query(query, params, (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        res.status(200).json({ isFavorite: results[0].isFavorite > 0 });
    });
});

router.post('/favorites/toggle', (req, res) => {
    const { idUser, idItem, idTypeService } = req.body;
    if (!idUser) return res.status(400).json({ error: 'Utilisateur non connecté' });

    let checkQuery = "SELECT idFavorite FROM Favorite WHERE idUser = ? AND ";
    let params = [idUser];
    if (idItem) { checkQuery += "idItem = ?"; params.push(idItem); } 
    else { checkQuery += "idTypeService = ?"; params.push(idTypeService); }

    connection.query(checkQuery, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur BDD' });

        if (results.length > 0) {
            connection.query("DELETE FROM Favorite WHERE idFavorite = ?", [results[0].idFavorite], (deleteErr) => {
                if (deleteErr) return res.status(500).json({ error: 'Erreur suppression' });
                res.status(200).json({ action: 'removed', message: 'Retiré des favoris' });
            });
        } else {
            connection.query("INSERT INTO Favorite (idUser, idItem, idTypeService) VALUES (?, ?, ?)", [idUser, idItem || null, idTypeService || null], (insertErr) => {
                if (insertErr) return res.status(500).json({ error: 'Erreur insertion' });
                res.status(200).json({ action: 'added', message: 'Ajouté aux favoris' });
            });
        }
    });
});

router.get('/favorites/:userId', (req, res) => {
    const query = `
        SELECT f.idFavorite, 'article' AS type, i.idItem AS id, i.name, i.price, i.image, i.onSale
        FROM Favorite f JOIN Item i ON f.idItem = i.idItem WHERE f.idUser = ?
        UNION ALL
        SELECT f.idFavorite, 'service' AS type, ts.idTypeService AS id, ts.name, ts.basePrice AS price, ts.image, 0 AS onSale
        FROM Favorite f JOIN TypeService ts ON f.idTypeService = ts.idTypeService WHERE f.idUser = ?
    `;
    connection.query(query, [req.params.userId, req.params.userId], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur récupération' });
        res.status(200).json(results);
    });
});

module.exports = router;