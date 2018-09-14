var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');


// =================================================
// Consultar los hospitales
// =================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }
            Hospital.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: count
                })
            });

        });
});

// =================================================
// Obtener Hospital por Id
// =================================================
app.get('/:id', (req, res) => {

    let id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital
            });
        })

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
            hospital: hospital
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

// =================================================
// Eliminar un Hospital
// =================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Eliminar hospital',
                errors: err
            });
        }
        if (!hospitalEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: `Error al consultar hospital con id ${id}`,
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});


module.exports = app;