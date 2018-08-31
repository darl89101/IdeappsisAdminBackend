var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');

// =================================================
// Obtener todos los usuarios
// =================================================
app.get('/', (request, res, next) => {

    Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarios
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
        });
    });

});

// =================================================
// Actualizar usuario
// =================================================
app.put('/:id', (req, res) => {
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
// Eliminar un usuario
// =================================================
app.delete('/:id', (req, res) => {
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