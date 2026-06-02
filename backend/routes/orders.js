const express = require('express');
const router = express.Router();
const connection = require('../db');

router.post('/order', (req, res) => {
    const { idUser, cartItems, finalTotal } = req.body;
    
    if (!idUser || !cartItems || cartItems.length === 0 || !finalTotal) {
        return res.status(400).json({ error: 'Données invalides' });
    }

    connection.beginTransaction(err => {
        if (err) return res.status(500).json({ error: 'Erreur serveur (Transaction)' });

        connection.query('INSERT INTO `Order` (idUser, pricePaid, currentStatus) VALUES (?, ?, ?)', 
        [idUser, finalTotal, 'payee'], 
        (error, results) => {
            if (error) {
                return connection.rollback(() => res.status(500).json({ error: 'Erreur création commande' }));
            }

            const idOrder = results.insertId;

            const queryPromise = (sql, params) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, params, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            };

            const processItems = async () => {
                try {
                    for (const item of cartItems) {
                        await queryPromise(
                            'INSERT INTO OrderDetail (idOrder, idItem, quantity, unitPrice) VALUES (?, ?, ?, ?)',
                            [idOrder, item.idItem, item.quantity, item.price]
                        );
                        await queryPromise(
                            'UPDATE Item SET amount = GREATEST(amount - ?, 0) WHERE idItem = ?',
                            [item.quantity, item.idItem]
                        );
                    }
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => res.status(500).json({ error: 'Erreur lors de la validation finale' }));
                        }
                        res.status(200).json({ message: 'Commande créée et stock mis à jour', idOrder });
                    });

                } catch (error) {
                    console.error("Erreur d'insertion des articles :", error);
                    connection.rollback(() => res.status(500).json({ error: 'Erreur lors du traitement des articles' }));
                }
            };
            processItems();
        });
    });
});

router.get('/order', (req, res) => {
    const query = `SELECT o.idOrder, o.date, o.currentStatus, u.firstName, u.lastName, u.email, od.idItem, od.quantity, od.unitPrice, i.name, i.image FROM \`Order\` o JOIN User u ON o.idUser = u.idUser JOIN OrderDetail od ON o.idOrder = od.idOrder JOIN Item i ON od.idItem = i.idItem ORDER BY o.date DESC`;
    connection.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur BDD' });
        const orders = {};
        results.forEach(row => {
            if (!orders[row.idOrder]) {
                orders[row.idOrder] = { idOrder: row.idOrder, date: row.date, currentStatus: row.currentStatus, firstName: row.firstName, lastName: row.lastName, email: row.email, items: [], totalPrice: 0 };
            }
            orders[row.idOrder].items.push({ idItem: row.idItem, name: row.name, image: row.image, quantity: row.quantity, unitPrice: row.unitPrice });
            orders[row.idOrder].totalPrice += (row.quantity * row.unitPrice);
        });
        res.status(200).json(Object.values(orders));
    });
});

router.get('/order/:id', (req, res) => {
    const query = `SELECT o.idOrder, o.date, o.currentStatus, u.firstName, u.lastName, u.email, u.phoneNumber, u.address, u.postalCode, u.city, u.country, od.idItem, od.quantity, od.unitPrice, i.name, i.image FROM \`Order\` o JOIN User u ON o.idUser = u.idUser JOIN OrderDetail od ON o.idOrder = od.idOrder JOIN Item i ON od.idItem = i.idItem WHERE o.idOrder = ?`;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur serveur' });
        if (results.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
        const order = { idOrder: results[0].idOrder, date: results[0].date, currentStatus: results[0].currentStatus, user: { firstName: results[0].firstName, lastName: results[0].lastName, email: results[0].email, phoneNumber: results[0].phoneNumber, address: results[0].address, postalCode: results[0].postalCode, city: results[0].city, country: results[0].country }, items: [], totalPrice: 0 };
        results.forEach(row => {
            order.items.push({ idItem: row.idItem, name: row.name, image: row.image, quantity: row.quantity, unitPrice: row.unitPrice });
            order.totalPrice += (row.quantity * row.unitPrice);
        });
        res.status(200).json(order);
    });
});

router.put('/order/:id/status', (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Statut manquant' });
    connection.query('UPDATE `Order` SET currentStatus = ? WHERE idOrder = ?', [status, req.params.id], (error) => {
        if (error) return res.status(500).json({ error: 'Erreur BDD' });
        connection.query('INSERT INTO CommandeHistory (idOrder, status) VALUES (?, ?)', [req.params.id, status], () => {
            res.status(200).json({ message: 'Statut mis à jour' });
        });
    });
});

router.get('/order/user/:id', (req, res) => {
    const query = `SELECT o.idOrder, o.date, o.currentStatus, od.idItem, od.quantity, od.unitPrice, i.name, i.image FROM \`Order\` o JOIN OrderDetail od ON o.idOrder = od.idOrder JOIN Item i ON od.idItem = i.idItem WHERE o.idUser = ? ORDER BY o.date DESC`;
    connection.query(query, [req.params.id], (error, results) => {
        if (error) return res.status(500).json({ error: 'Erreur BDD' });
        const orders = {};
        results.forEach(row => {
            if (!orders[row.idOrder]) orders[row.idOrder] = { idOrder: row.idOrder, date: row.date, currentStatus: row.currentStatus, items: [] };
            orders[row.idOrder].items.push({ idItem: row.idItem, name: row.name, image: row.image, quantity: row.quantity, unitPrice: row.unitPrice });
        });
        res.status(200).json(Object.values(orders));
    });
});

module.exports = router;