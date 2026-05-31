// Fichier de configuration d'Express

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'db_etu',
    password: 'N3twork!',
    database: 'app_db',
    port: 3306
});

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const uploadDir = './images';
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        callback(null, fileName);
    }
})
const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static('images'));

app.get('/', (req, res, next) => {
    connection.query('SELECT * FROM Item', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SQL :', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        } else {
            res.status(200).json(results);
        }
    });
})

app.get('/:id', (req, res, next) => {
    const itemId = req.params.id;
    connection.query('SELECT i.*, s.*, w.* FROM Item i LEFT JOIN Surfboard s ON i.idItem = s.idSurfboard LEFT JOIN Wetsuit w ON i.idItem = w.idWetsuit WHERE i.idItem = ? ', [itemId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SQL :', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        } else {
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ error: 'Aucun article trouvé avec cet ID' });
            }
        }
    });
});

app.put('/:id', (req, res, next) => {
    const itemId = req.params.id;
    const updatedItemData = req.body;
    connection.query('UPDATE Item SET ? WHERE idItem = ?', [updatedItemData, itemId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SQL :', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour des données' });
        } else {
            if (results.affectedRows > 0) {
                res.status(200).json({ message: 'Article mis à jour avec succès' });
            } else {
                res.status(404).json({ error: 'Aucun article trouvé avec cet ID' });
            }
        }
    });
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        const imageUrl = `http://localhost:3001/images/${req.file.filename}`;
        const articleId = req.body.articleId;
        const updateQuery = 'UPDATE Item SET image = ? WHERE idItem = ?';
        connection.query(updateQuery, [imageUrl, articleId], (error, results) => {
            if (error) {
                console.error('Erreur lors de la mise à jour de l\'image de l\'article avec l\'URL de l\'image :', error);
                res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'image de l\'article' });
            } else {
                res.status(200).json({ message: 'Image téléchargée et article mis à jour avec succès', imageUrl });
            }
        });
    } else {
        res.status(400).json({ error: 'Aucune image téléchargée' });
    }
});

app.post('/article',(req, res, next) => {
    const {name,description,price,amount,image,weight,volume,maxWeight,stability,maneuverability,leash,taille,material,tempMin,tempMax,antiUV } = req.body;
    if (name && description && price && image) {
        if (stability && maneuverability && weight && volume && maxWeight && leash !== undefined) {
            connection.query('INSERT INTO Item (name, description, price, amount, image) VALUES (?, ?, ?, ?, ?)', [name, description, price, amount, image], (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'insertion dans la table `Item` : ', error);
                    res.status(500).json({error: 'Erreur lors de l\'insertion dans la table `Item` '});
                } else {
                    const articleId = results.insertId;
                    connection.query('INSERT INTO Surfboard (idSurfboard, stability, maneuverability, weight, volume, maxSupportedWeight, withLeash) VALUES (?, ?, ?, ?, ?, ?, ?)', [articleId, stability, maneuverability, weight, volume, maxWeight, leash], (error, results) => {
                        if (error) {
                            console.log('Erreur lors de l\'insertion dans la table `Surfboard` : ', error);
                            res.status(500).json({error: 'Erreur lors de l\'insertion dans la table `Surfboard`'});
                        } else {
                            res.status(200).json({ message: 'Article créé avec succès'});
                        }
                    });
                }
            });
        } else if (taille && material && tempMin && tempMax && antiUV) {
            console.log("AAA !")
            console.log(taille, material, tempMin, tempMax, antiUV);
            uv = (antiUV === "on" ? 1 : 0);
            connection.query('INSERT INTO Item (name, description, price, amount, image) VALUES (?, ?, ?, ?, ?)', [name, description, price, amount, image], (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'insertion dans la table `Item` : ', error);
                    res.status(500).json({error: 'Erreur lors de l\'insertion dans la table `Item` '});
                } else {
                    const articleId = results.insertId;
                    connection.query('INSERT INTO Wetsuit (idWetsuit, size, material, tempMin, tempMax, isAntiUV) VALUES (?, ?, ?, ?, ?, ?)', [articleId, taille, material, tempMin, tempMax, uv], (error, results) => {
                        if (error) {
                            console.log('Erreur lors de l\'insertion dans la table `Wetsuit` : ', error);
                            res.status(500).json({error: 'Erreur lors de l\'insertion dans la table `Wetsuit`'});
                        } else {
                            res.status(200).json({ message: 'Article créé avec succès'});
                        }
                    });
                }
            });
        } else {
            res.status(400).json({ error: 'Les informations spécifique de l\'article ne sont pas entièrement remplies' });
        }
    } else {
        res.status(400).json({ error: 'Les informations de bases d\'un article ne sont pas entièrement remplies' });
    }
});

app.delete('/article/:id', (req, res, next) => {
    const itemId = req.params.id;
    connection.query('DELETE FROM Item WHERE idItem = ?', [itemId], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
        } else {
            if (results.affectedRows > 0) {
                res.status(200).json({ message: 'Article supprimé avec succès' });
            } else {
                res.status(404).json({ error: 'Aucun article trouvé avec cet ID' });
            }
        }
    })
})

app.post('/signup', (req, res, next) => {
    const { firstname, lastname, email, password, phoneNumber } = req.body;
    if (firstname && lastname && email && password && phoneNumber) {
        bcrypt.hash(password, 10, (hashError, hash) => {
            if (hashError) {
                console.error('Erreur lors du hachage du mot de passe :', hashError);
                res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
            } else {
                connection.query('INSERT INTO User (firstname, lastname, email, password, phoneNumber) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, email, hash, phoneNumber], (error, results) => {
                    if (error) {
                        console.error('Erreur insertion utilisateur dans BDD :', error);
                        res.status(500).json({ error: 'Erreur création utilisateur.' });
                    } else {
                        const userId = results.insertId; // Récupére ID user nouvellement créé
                        const token = jwt.sign({userId: userId}, 'votre_cle_secrete', { expiresIn: '24h' });
                        res.status(200).json({ message: 'Inscription réussie !', userId: userId, token: token });
                    }
                });
            }
        });
    } else {
        res.status(400).json({ error: 'Email et mot de passe requis' });
    }
});

app.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM User WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SQL :', error);
            res.status(500).json({ error: 'Erreur lors de la connexion' });
        } else {
            if (results.length > 0) {
                const hashedPassword = results[0].password;
                bcrypt.compare(password, hashedPassword, (compareError, match) => {
                    if (compareError) {
                        console.error('Erreur lors de la comparaison du mot de passe :', compareError);
                        res.status(500).json({ error: 'Erreur lors de la connexion' });
                    } else {
                        if (match) {
                            const userId = results[0].idUser; // Récupére ID user connecté
                            const token = jwt.sign({userId: userId}, 'votre_cle_secrete', { expiresIn: '24h' });
                            res.status(200).json({ message: 'Connexion réussie !', userId: userId, token: token });
                        } else {
                            res.status(401).json({ error: 'Mot de passe incorrect' });
                        }
                    }
                });
            } else {
                res.status(404).json({ error: 'Identifiants incorrects' });
            }
        }
    });
});

app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    connection.query('SELECT idUser, firstName, lastName, phoneNumber, email, role, address, postalCode, city, country, paymentPreference FROM User WHERE idUser = ?', [userId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SQL :', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des données utilisateur' });
        } else {
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet ID' });
            }
        }
    });
});

app.put('/user/:id', (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, phoneNumber, address, postalCode, city, country, paymentPreference } = req.body;
    connection.query(
        'UPDATE User SET firstName = ?, lastName = ?, phoneNumber = ?, address = ?, postalCode = ?, city = ?, country = ?, paymentPreference = ? WHERE idUser = ?',
        [firstName, lastName, phoneNumber, address, postalCode, city, country, paymentPreference, userId],
        (error, results) => {
            if (error) {
                console.error('Erreur lors de la requête SQL :', error);
                res.status(500).json({ error: 'Erreur lors de la mise à jour des données utilisateur' });
            } else {
                if (results.affectedRows > 0) {
                    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
                } else {
                    res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet ID' });
                }
            }
        }
    );
});

app.post('/order', (req, res) => {
    const { idUser, cartItems } = req.body;
    
    if (!idUser || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Données invalides pour la commande' });
    }

    // 1. Create the order with status 'payee'
    connection.query('INSERT INTO `Order` (idUser, currentStatus) VALUES (?, ?)', [idUser, 'payee'], (error, results) => {
        if (error) {
            console.error('Erreur lors de la création de la commande:', error);
            return res.status(500).json({ error: 'Erreur lors de la création de la commande' });
        }
        
        const idOrder = results.insertId;

        // 2. Insert order details
        const orderDetailsValues = cartItems.map(item => [idOrder, item.idItem, item.quantity, item.price]);
        connection.query('INSERT INTO OrderDetail (idOrder, idItem, quantity, unitPrice) VALUES ?', [orderDetailsValues], (errorDet, resultsDet) => {
            if (errorDet) {
                console.error('Erreur lors de l\'insertion des détails:', errorDet);
                return res.status(500).json({ error: 'Erreur lors de l\'enregistrement des articles de la commande' });
            }

            // 3. Insert into history
            connection.query('INSERT INTO CommandeHistory (idOrder, status) VALUES (?, ?)', [idOrder, 'payee'], (errorHist, resultsHist) => {
                if (errorHist) {
                    console.error('Erreur insertion historique:', errorHist);
                }
                res.status(200).json({ message: 'Commande créée avec succès', idOrder: idOrder });
            });
        });
    });
});

app.get('/order/user/:id', (req, res) => {
    const idUser = req.params.id;
    const query = `
        SELECT o.idOrder, o.date, o.currentStatus, 
               od.idItem, od.quantity, od.unitPrice, 
               i.name, i.image
        FROM \`Order\` o
        JOIN OrderDetail od ON o.idOrder = od.idOrder
        JOIN Item i ON od.idItem = i.idItem
        WHERE o.idUser = ?
        ORDER BY o.date DESC
    `;
    
    connection.query(query, [idUser], (error, results) => {
        if (error) {
            console.error('Erreur récupération commandes:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
        }
        
        // Group by order
        const orders = {};
        results.forEach(row => {
            if (!orders[row.idOrder]) {
                orders[row.idOrder] = {
                    idOrder: row.idOrder,
                    date: row.date,
                    currentStatus: row.currentStatus,
                    items: []
                };
            }
            orders[row.idOrder].items.push({
                idItem: row.idItem,
                name: row.name,
                image: row.image,
                quantity: row.quantity,
                unitPrice: row.unitPrice
            });
        });
        
        res.status(200).json(Object.values(orders));
    });
});

app.get('/article/:id/reviews', (req, res) => {
    const itemId = req.params.id;
    const query = `
        SELECT r.rating, r.comment, r.publishDate, u.firstName, u.lastName
        FROM Review r
        JOIN \`User\` u ON r.idUser = u.idUser
        WHERE r.idItem = ?
        ORDER BY r.publishDate DESC
    `;
    connection.query(query, [itemId], (error, results) => {
        if (error) {
            console.error('Erreur récupération avis:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
        }
        res.status(200).json(results);
    });
});

app.get('/user/:userId/hasBought/:articleId', (req, res) => {
    const userId = req.params.userId;
    const articleId = req.params.articleId;
    const query = `
        SELECT COUNT(*) as count
        FROM \`Order\` o
        JOIN OrderDetail od ON o.idOrder = od.idOrder
        WHERE o.idUser = ? AND od.idItem = ?
    `;
    connection.query(query, [userId, articleId], (error, results) => {
        if (error) {
            console.error('Erreur vérification achat:', error);
            return res.status(500).json({ error: 'Erreur lors de la vérification' });
        }
        res.status(200).json({ hasBought: results[0].count > 0 });
    });
});

app.post('/article/:id/reviews', (req, res) => {
    const itemId = req.params.id;
    const { idUser, rating, comment } = req.body;

    if (!idUser || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Données invalides pour l\'avis' });
    }

    const query = 'INSERT INTO Review (idItem, idUser, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)';
    connection.query(query, [itemId, idUser, rating, comment], (error, results) => {
        if (error) {
            console.error('Erreur ajout avis:', error);
            return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'avis' });
        }
        res.status(200).json({ message: 'Avis ajouté avec succès' });
    });
});

app.post('/complaint', (req, res) => {
    // Ajout de 'type' ici
    const { idUser, idOrder, type, topic, description } = req.body;
    
    if (!idUser || !idOrder || !type || !topic || !description) {
        return res.status(400).json({ error: 'Données incomplètes' });
    }
    
    // Ajout de 'type' dans la requête SQL
    const query = "INSERT INTO Complaint (idUser, idOrder, type, topic, description) VALUES (?, ?, ?, ?, ?)";
    
    connection.query(query, [idUser, idOrder, type, topic, description], (error, results) => {
        if (error) {
            console.error('Erreur création réclamation:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json({ message: 'Réclamation créée', idComplaint: results.insertId });
    });
});

app.get('/complaint/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = "SELECT * FROM Complaint WHERE idUser = ? ORDER BY idComplaint DESC";
    connection.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

app.get('/complaint/:id', (req, res) => {
    const complaintId = req.params.id;
    const query = "SELECT c.*, u.firstName, u.lastName FROM Complaint c JOIN User u ON c.idUser = u.idUser WHERE c.idComplaint = ?";
    connection.query(query, [complaintId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ error: 'Réclamation introuvable' });
        }
    });
});

app.get('/complaint/:id/messages', (req, res) => {
    const complaintId = req.params.id;
    // CORRECTION ICI : ORDER BY cm.sendDate (au lieu de publishDate)
    const query = `
        SELECT cm.*, u.firstName, u.lastName, u.role 
        FROM ComplaintMessage cm 
        JOIN User u ON cm.idUser = u.idUser 
        WHERE cm.idComplaint = ? 
        ORDER BY cm.sendDate ASC
    `;
    connection.query(query, [complaintId], (error, results) => {
        if (error) {
            console.error('Erreur récupération messages:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json(results);
    });
});

app.post('/complaint/:id/messages', (req, res) => {
    const complaintId = req.params.id;
    const { idUser, message } = req.body;
    if (!idUser || !message) {
        return res.status(400).json({ error: 'Données incomplètes' });
    }
    // CORRECTION ICI : INSERT INTO ... content (au lieu de message)
    const query = "INSERT INTO ComplaintMessage (idComplaint, idUser, content) VALUES (?, ?, ?)";
    connection.query(query, [complaintId, idUser, message], (error, results) => {
        if (error) {
            console.error('Erreur création message:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json({ message: 'Message ajouté', idMessage: results.insertId });
    });
});

// app.use((req, res, next) => {
//     console.log('Requête recue !');
//     next();
// });

// app.get('/hello', (req, res, next) => {
//     res.send('Bonjour tout le monde !');
//     next();
// });

// app.use((req, res) => {
//     res.json({ message: 'Votre message a été reçu avec succès !' });
// });

connection.connect(err => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
    } else {
        console.log('Connexion à MySQL réussie !');
    }
});

module.exports = app;