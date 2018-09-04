var express = require('express');
const fileupload = require('express-fileupload');
var fs = require('fs');
var app = express();

// Modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileupload());

// Rutas
app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0)
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: {
                message: 'Tipo de colección no válida'
            }
        });

    if (!req.files)
        return res.status(400).json({
            ok: false,
            mensaje: 'No hay archivos para subir',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        });

    // Obtener nombre del archivo
    let archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensioensValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensioensValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {
                message: 'Las extensiones válidas son ' + extensioensValidas.join(', ')
            }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al subir el archivo',
                errors: err
            })

        subirPorTipo(tipo, id, nombreArchivo, res);
        // Aca se estan subiendo archivos asi el usuario no exista

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Imagen subida correctamente'
        // });
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar usuario',
                    errors: err
                })
            if (!usuario) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Error al consultar usuario con id ${id}`,
                    errors: {
                        message: 'No existe un usuario con ese ID'
                    }
                });
            }
            if (usuario.img) {
                var oldPath = './uploads/usuarios/' + usuario.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario',
                        errors: err
                    })
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    } else if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar médico',
                    errors: err
                })
            if (!medico) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Error al consultar medico con id ${id}`,
                    errors: {
                        message: 'No existe un medico con ese ID'
                    }
                });
            }
            if (medico.img) {
                var oldPath = './uploads/medicos/' + medico.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        errors: err
                    })
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    } else if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar hospital',
                    errors: err
                })
            if (!hospital) {
                return res.status(404).json({
                    ok: false,
                    mensaje: `Error al consultar hospital con id ${id}`,
                    errors: {
                        message: 'No existe un hospital con ese ID'
                    }
                });
            }
            if (hospital.img) {
                var oldPath = './uploads/hospitales/' + hospital.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el hospital',
                        errors: err
                    })
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    medico: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;