const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Definimos la ruta absoluta hacia public/uploads
const uploadDir = path.join(__dirname, '../../public/uploads');

// 2. Verificamos si la carpeta existe, si no, la creamos automáticamente
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Configuración del motor de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Creamos un nombre único: FECHA-NOMBRE_LIMPIO.ext
        const nombreLimpio = file.originalname.replace(/\s+/g, '_').toLowerCase();
        const uniqueSuffix = Date.now() + '-' + nombreLimpio;
        cb(null, uniqueSuffix);
    }
});

// 4. Filtro de seguridad (Solo JPG, JPEG y PNG)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Solo se permiten imágenes (JPG, PNG)'), false);
    }
};

// 5. Exportamos la configuración (Límite de 5MB por archivo)
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

module.exports = upload;