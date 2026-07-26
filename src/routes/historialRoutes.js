const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

// POST /api/historial (Para guardar la atención)
router.post('/', historialController.crearEntradaHistorial);

// GET /api/historial (Para ver todas las atenciones pasadas)
router.get('/', historialController.obtenerHistorial);

module.exports = router;