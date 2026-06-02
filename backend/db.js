const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'db_etu',
    password: 'N3twork!',
    database: 'app_db',
    port: 3306
});

connection.connect(err => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
    } else {
        console.log('Connexion à MySQL réussie !');
    }
});

module.exports = connection;