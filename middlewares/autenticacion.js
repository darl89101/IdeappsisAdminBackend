var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// =================================================
// Verificar Token
// =================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}

// =================================================
// Verificar Administrador
// =================================================
exports.verificaAdmin = function(req, res, next) {
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es Administrador',
            errors: {
                message: 'No es administrador, no puede seguir'
            }
        });
    }
}

// =================================================
// Verifica admin o mismo usuario
// =================================================
exports.verificaAdminMismoUsuario = function(req, res, next) {
    var id = req.params.id;
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es Administrador ni es el mismo usuario',
            errors: {
                message: 'No es administrador, no puede seguir'
            }
        });
    }
}