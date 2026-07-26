const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verificarToken = require('../middlewares/auth'); // Importante para la seguridad

// 1. Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // La carpeta debe existir en: public/uploads
        cb(null, path.join(__dirname, '../../public/uploads/'));
    },
    filename: function (req, file, cb) {
        // Guardamos con la fecha actual para que no se repitan nombres
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filtro para que solo acepte imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// 3. LA RUTA POST (Punto 3 Sence)
// Usamos verificarToken porque nadie de afuera debe subir fotos sin permiso
router.post('/', verificarToken, upload.single('foto'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No se seleccionó ningún archivo." });
        }

        // Devolvemos la ruta que el navegador usará para mostrarla
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            url: fileUrl,
            message: "Imagen subida con éxito"
        });
    } catch (error) {
        console.error("Error en Multer:", error);
        res.status(500).json({ success: false, message: "Error al procesar la imagen." });
    }
});

module.exports = router;