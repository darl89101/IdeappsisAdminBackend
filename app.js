// Importando libreria Express
var express = require('express');
var mongoose = require('mongoose');

// Iniciando aplicacion
var app = express();

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'Online');
});

// Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});


app.listen(3000, () => {
    console.log('Express server escuchando en el puerto 3000: \x1b[32m%s\x1b[0m', 'conectado');
});