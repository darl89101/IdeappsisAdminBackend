var express = require('express');
var app = express();

var mongoose = require('mongoose');
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');


// =================================================
// Consultar los hospitales
// =================================================
app.get('/', (req, res) => {
    Hospital.find({}, (err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            hospitales: hospitales
        })
    });
});

// =================================================
// Crear Hospital
// =================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: hospital
                // usuarioToken: req.usuario
        });
    })
});

// =================================================
// Actualizar un hospital
// =================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar Hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(404).json({
                ok: false,
                mensaje: `Error al consultar hospital con id ${id}`,
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear el hospital',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });

});

module.exports = app;