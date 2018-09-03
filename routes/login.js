var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error consultando usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas', // `Error al consultar usuario con email ${body.email}`,
                errors: {
                    message: 'Credenciales Incorrectas' // 'No existe un usuario con ese email'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas',
                errors: {
                    mensaje: 'Credenciales Incorrectas'
                }
            });
        }
        // Crear Token!!!!
        usuario.password = ':)';
        var token = jwt.sign({ usuario: usuario }, '@este-es@-un-seed-dificil', { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario.id
        });
    });
});

module.exports = app;