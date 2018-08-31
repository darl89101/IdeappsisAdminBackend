// Importando libreria Express
var express = require('express');
var mongoose = require('mongoose');

// Iniciando aplicacion
var app = express();

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