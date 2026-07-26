const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { nombre_usuario, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE nombre_usuario = $1', [nombre_usuario]);

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            const match = await bcrypt.compare(password, usuario.password);

            if (match) {
                // Generamos el Token JWT (Punto 4 Sence)
                const token = jwt.sign(
                    { id: usuario.id, nombre: usuario.nombre_usuario, rol: usuario.rol },
                    process.env.JWT_SECRET || 'llave_secreta_dental',
                    { expiresIn: '2h' }
                );

                return res.json({
                    success: true,
                    token: token,
                    usuario: { nombre: usuario.nombre_usuario, rol: usuario.rol }
                });
            } else {
                return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
            }
        } else {
            return res.status(404).json({ success: false, message: "El usuario no existe en la base de datos" });
        }
    } catch (err) {
        console.error("Error en el login:", err);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

module.exports = { login };