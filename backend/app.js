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
    const { firstname, lastname, email, password } = req.body;
    if (firstname && lastname && email && password) {
        bcrypt.hash(password, 10, (hashError, hash) => {
            if (hashError) {
                console.error('Erreur lors du hachage du mot de passe :', hashError);
                res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
            } else {
                connection.query('INSERT INTO User (firstname, lastname, email, password) VALUES (?, ?, ?, ?)', [firstname, lastname, email, hash], (error, results) => {
                    if (error) {
                        console.error('Erreur insertion utilisateur dans BDD :', error);
                        res.status(500).json({ error: 'Erreur création utilisateur.' });
                    } else {
                        const userId = results.insertId; // Récupére ID user nouvellement créé
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
                            const userId = results[0].id; // Récupére ID user connecté
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