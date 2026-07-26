const jwt = require('jsonwebtoken');

// Este middleware protegerá las rutas sensibles
const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los encabezados de la petición (Authorization)
    // Normalmente viene como "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no hay token, denegamos el acceso de inmediato
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Acceso denegado. Se requiere un token de seguridad." 
        });
    }

    try {
        // 3. Verificamos el token usando la clave secreta de tu archivo .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'llave_maestra_123');
        
        // 4. Guardamos los datos del usuario (id, nombre, rol) en el objeto 'req'
        // Esto permite que los controladores sepan quién está haciendo la acción
        req.usuario = decoded;

        // 5. ¡Todo en orden! Pasamos al siguiente paso (el controlador)
        next();
    } catch (err) {
        // Si el token expiró o es falso, lanzamos error
        return res.status(403).json({ 
            success: false, 
            message: "Token inválido o expirado. Inicie sesión nuevamente." 
        });
    }
};

module.exports = verificarToken;