var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');


// =================================================
// Obtener todos los usuarios
// =================================================
app.get('/', (request, res, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
            }
            Usuario.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: count
                });
            });
        });

});

// =================================================
// Actualizar usuario
// =================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: `Error al consultar usuario con id ${id}`,
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        if (body.role) {
            usuario.role = body.role;
        }

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear el usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });

});

// =================================================
// Crear un nuevo usuario
// =================================================
app.post('/', (req, res) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // bcrypt.genSaltSync(10)
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
                // usuarioToken: req.usuario
        });
    });

});

// =================================================
// Eliminar un usuario
// =================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Eliminar usuario',
                errors: err
            });
        }
        if (!usuarioEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: `Error al consultar usuario con id ${id}`,
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioEliminado
        });
    });
});

module.exports = app;