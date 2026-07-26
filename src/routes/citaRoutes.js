const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

// IMPORTAMOS EL GUARDIA (Middleware de JWT)
const verificarToken = require('../middlewares/auth');

// --- RUTAS DE LA API ---

// 1. Ver citas (Pública para usuarios logueados)
router.get('/', citaController.obtenerCitas);

// 2. Ver historial (Pública para usuarios logueados)
router.get('/historial', citaController.obtenerHistorial);

// --- RUTAS PROTEGIDAS (Requieren Token de Seguridad) ---

// 3. Crear nueva cita (POST /api/citas)
router.post('/', verificarToken, citaController.crearCita);

// 4. Editar datos (PUT /api/citas/:id)
router.put('/:id', verificarToken, citaController.editarCita);

// 5. Eliminar cita (DELETE /api/citas/:id)
router.delete('/:id', verificarToken, citaController.eliminarCita);

// 6. Atender paciente (PUT /api/citas/atender/:id)
router.put('/atender/:id', verificarToken, citaController.atenderCita);

module.exports = router;