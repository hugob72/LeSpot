const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const articlesRoutes = require('./routes/articles');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const servicesRoutes = require('./routes/services');
const promotionsRoutes = require('./routes/promotions');
const reviewsRoutes = require('./routes/reviews');
const complaintsRoutes = require('./routes/complaints');
const favoritesRoutes = require('./routes/favorites');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static('images'));

app.use('/', articlesRoutes);
app.use('/', usersRoutes);
app.use('/', ordersRoutes);
app.use('/', servicesRoutes);
app.use('/', promotionsRoutes);
app.use('/', reviewsRoutes);
app.use('/', complaintsRoutes);
app.use('/', favoritesRoutes);

module.exports = app;