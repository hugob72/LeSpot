const express = require('express');
const router = express.Router();
const connection = require('../db');
const upload = require('../upload');

router.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        const imageUrl = `http://localhost:3001/images/${req.file.filename}`;
        const articleId = req.body.articleId;
        const updateQuery = 'UPDATE Item SET image = ? WHERE idItem = ?';
        connection.query(updateQuery, [imageUrl, articleId], (error, results) => {
            if (error) {
                console.error('Erreur lors de la mise à jour de l\'image :', error);
                res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'image' });
            } else {
                res.status(200).json({ message: 'Image téléchargée et article mis à jour', imageUrl });
            }
        });
    } else {
        res.status(400).json({ error: 'Aucune image téléchargée' });
    }
});

// Créer un article
router.post('/article', (req, res) => {
    const {name,description,price,amount,image,weight,volume,maxWeight,stability,maneuverability,leash,taille,material,tempMin,tempMax,antiUV, onSale } = req.body;
    const isOnSale = (onSale === true || onSale === 'true' || onSale === 'on' || onSale === 1) ? 1 : 0;

    if (name && description && price && image) {
        if (stability && maneuverability && weight && volume && maxWeight && leash !== undefined) {
            connection.query('INSERT INTO Item (name, description, price, amount, image, onSale) VALUES (?, ?, ?, ?, ?, ?)', [name, description, price, amount, image, isOnSale], (error, results) => {
                if (error) {
                    return res.status(500).json({error: 'Erreur Item'});
                }
                const articleId = results.insertId;
                connection.query('INSERT INTO Surfboard (idSurfboard, stability, maneuverability, weight, volume, maxSupportedWeight, withLeash) VALUES (?, ?, ?, ?, ?, ?, ?)', [articleId, stability, maneuverability, weight, volume, maxWeight, leash], (err) => {
                    if (err) {
                        return res.status(500).json({error: 'Erreur Surfboard'});
                    }
                    res.status(200).json({ message: 'Article créé avec succès'});
                });
            });
        } else if (taille && material && tempMin && tempMax && antiUV) {
            let uv = (antiUV === "on" ? 1 : 0);
            connection.query('INSERT INTO Item (name, description, price, amount, image) VALUES (?, ?, ?, ?, ?)', [name, description, price, amount, image], (error, results) => {
                if (error) {
                    return res.status(500).json({error: 'Erreur Item'});
                }
                const articleId = results.insertId;
                connection.query('INSERT INTO Wetsuit (idWetsuit, size, material, tempMin, tempMax, isAntiUV) VALUES (?, ?, ?, ?, ?, ?)', [articleId, taille, material, tempMin, tempMax, uv], (err) => {
                    if (err) {
                        return res.status(500).json({error: 'Erreur Wetsuit'});
                    }
                    res.status(200).json({ message: 'Article créé avec succès'});
                });
            });
        } else {
            res.status(400).json({ error: 'Informations spécifiques incomplètes' });
        }
    } else {
        res.status(400).json({ error: 'Informations de bases incomplètes' });
    }
});

// Supprimer un article
router.delete('/article/:id', (req, res) => {
    connection.query('DELETE FROM Item WHERE idItem = ?', [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
        if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Article supprimé' });
        } else {
            res.status(404).json({ error: 'Aucun article trouvé' });
        }
    });
});

router.get('/article/all', (req, res) => {
    const query = `
        SELECT i.*, 
               CASE 
                   WHEN s.idSurfboard IS NOT NULL THEN 'board' 
                   WHEN w.idWetsuit IS NOT NULL THEN 'wetsuit' 
                   ELSE 'autre' 
               END as itemType
        FROM Item i
        LEFT JOIN Surfboard s ON i.idItem = s.idSurfboard
        LEFT JOIN Wetsuit w ON i.idItem = w.idWetsuit
    `;
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur récupération données' });
        }
        res.status(200).json(results);
    });
});

router.get('/article/:id', (req, res) => {
    connection.query('SELECT i.*, s.*, w.* FROM Item i LEFT JOIN Surfboard s ON i.idItem = s.idSurfboard LEFT JOIN Wetsuit w ON i.idItem = w.idWetsuit WHERE i.idItem = ? ', [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur récupération données' });
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ error: 'Article introuvable' });
        }
    });
});

router.put('/article/:id', (req, res) => {
    const itemId = req.params.id;
    const { name, price, description, amount, image, onSale, weight, volume, maxWeight, stability, maneuverability, leash, taille, material, tempMin, tempMax, antiUV } = req.body;
    const isOnSale = (onSale === true || onSale === 'true' || onSale === 'on' || onSale === 1) ? 1 : 0;

    const itemToUpdate = { name, price, description, amount, image, onSale: isOnSale };

    connection.query('UPDATE Item SET ? WHERE idItem = ?', [itemToUpdate, itemId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur mise à jour base' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Article introuvable' });
        }

        if (stability && maneuverability && weight && volume && maxWeight) {
            const isLeash = (leash === true || leash === 'true' || leash === 1) ? 1 : 0;
            const querySurfboard = `UPDATE Surfboard SET stability = ?, maneuverability = ?, weight = ?, volume = ?, maxSupportedWeight = ?, withLeash = ? WHERE idSurfboard = ?`;
            connection.query(querySurfboard, [stability, maneuverability, weight, volume, maxWeight, isLeash, itemId], (errSurf) => {
                if (errSurf) {
                    return res.status(500).json({ error: 'Erreur mise à jour planche' });
                }
                return res.status(200).json({ message: 'Planche modifiée avec succès' });
            });
        } else if (taille && material && tempMin && tempMax) {
            const isUV = (antiUV === true || antiUV === 'true' || antiUV === 'on' || antiUV === 1) ? 1 : 0;
            const queryWetsuit = `UPDATE Wetsuit SET size = ?, material = ?, tempMin = ?, tempMax = ?, isAntiUV = ? WHERE idWetsuit = ?`;
            connection.query(queryWetsuit, [taille, material, tempMin, tempMax, isUV, itemId], (errWet) => {
                if (errWet) {
                    return res.status(500).json({ error: 'Erreur mise à jour combinaison' });
                }
                return res.status(200).json({ message: 'Combinaison modifiée avec succès' });
            });
        } else {
            return res.status(200).json({ message: 'Article modifié avec succès' });
        }
    });
});

module.exports = router;