var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');

// =================================================
// Obtener una imagen
// =================================================
app.get('/:tipo/:img', (req, res) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        pathImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathImagen);
    }
});

module.exports = app;