var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =================================================
// Autenticacion de Google
// =================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
// verify().catch(console.error);

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
                error: err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, UsuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error consultando usuario',
                errors: err
            });
        }
        if (UsuarioDB) {
            if (UsuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: UsuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas
                return res.status(200).json({
                    ok: true,
                    usuario: UsuarioDB,
                    token: token,
                    id: UsuarioDB._id,
                    menu: obtenermenu(UsuarioDB.role)
                });
            }
        } else {
            // El usuario no existe... hay q crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioCreado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear el usuario',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuario: usuarioCreado,
                    token: token,
                    id: usuarioCreado._id,
                    menu: obtenermenu(usuarioCreado.role)
                });
            });

        }
    });
});

// =================================================
// Autenticacion normal
// =================================================
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
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario.id,
            menu: obtenermenu(usuario.role)
        });
    });
});

function obtenermenu(ROLE) {
    var menu = [{
        titulo: 'Principal',
        icono: 'mdi mdi-gauge',
        submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'Progressbar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'RxJs', url: '/rxjs' }
        ]
    }, {
        titulo: 'Mantenimientos',
        icono: 'mdi mdi-folder-lock-open',
        submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Médicos', url: '/medicos' }
        ]
    }];
    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}

module.exports = app;