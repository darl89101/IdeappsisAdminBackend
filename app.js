// Importando libreria Express
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Iniciando aplicacion
var app = express();

// body-parser (parse application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'Online');
});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
    console.log('Express server escuchando en el puerto 3000: \x1b[32m%s\x1b[0m', 'conectado');
});