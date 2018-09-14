var express = require('express');
var app = express();

var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

// =================================================
// Consultar Médicos
// =================================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }
            Medico.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });
            });

        });
});

// =================================================
// Consultar medico por id
// =================================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('hospital')
        .populate('usuario', 'nombre email img')
        .exec((err, medico) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        mensaje: 'Ocurrió un error inesperado consultando el médico',
                        errors: err
                    })
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El médico con id ${id} no existe`,
                    errors: {
                        message: 'Médico no encontrado'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                medico
            });
        });

});

// =================================================
// Guardar médicos
// =================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
                // usuarioToken: req.usuario
        });
    });

});

// =================================================
// Actualizar un médico
// =================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(404).json({
                ok: false,
                mensaje: `Error al consultar medico con id ${id}`,
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear el medico',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });

});

// =================================================
// Eliminar un médico
// =================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Eliminar medico',
                errors: err
            });
        }
        if (!medicoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: `Error al consultar medico con id ${id}`,
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    });
});

module.exports = app;