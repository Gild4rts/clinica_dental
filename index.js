const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARES DE LECTURA ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ---
// Esto permite que el navegador vea tu JS, CSS y las FOTOS subidas
app.use(express.static(path.join(__dirname, 'public')));
// Hacemos que la carpeta de subidas sea accesible públicamente
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- 3. MOTOR DE VISTAS (HBS) ---
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// --- 4. IMPORTAR RUTAS ---
const loginRoutes = require('./src/routes/loginRoutes');
const citaRoutes = require('./src/routes/citaRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

// --- 5. RUTAS DE NAVEGACIÓN (Renders) ---
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));
app.get('/agenda', (req, res) => res.render('agenda'));

// --- 6. RUTAS DE LA API ---
// Aquí conectamos los archivos de la carpeta 'src/routes'
app.use('/api/login', loginRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/upload', uploadRoutes); // <--- ESTA ES LA QUE DABA EL 404

// --- 7. ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Servidor activo en el puerto: ${PORT}`);
    console.log(`📁 Carpeta de fotos lista en: /public/uploads`);
    console.log('-------------------------------------------');
});