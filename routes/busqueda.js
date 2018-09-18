var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =================================================
// Busqueda por coleccion
// =================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;
    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda válidos son : usuarios, hospitales, medicos',
                error: {
                    message: 'Tipo de tabla/coleccion no válido'
                }
            });
    }
    promesa.then(datos => {
        res.status(200).json({
            ok: true,
            [tabla]: datos
        });
    }, err => {
        res.status(500).json({
            ok: false,
            errores: err
        });
    });

});

// =================================================
// Busqueda General
// =================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    }, err => {
        res.status(500).json({
            ok: false,
            errores: err
        });
    });

    // buscarHospitales(regex)
    //     .then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales: hospitales
    //         });
    //     }, err => {
    //         res.status(500).json({
    //             ok: false,
    //             errores: err
    //         });
    //     });

});

function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });

}

function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

        // Usuario.find({ nombre: regex, email: regex }, (err, usuarios) => {
        //     if (err) {
        //         reject('Error al cargar usuarios', err);
        //     } else {
        //         resolve(usuarios);
        //     }
        // });
    });

}

module.exports = app;