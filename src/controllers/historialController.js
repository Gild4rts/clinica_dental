const pool = require('../config/db');

const historialController = {
    // 1. GUARDAR ATENCIÓN (Se activa al terminar una cita)
    crearEntradaHistorial: async (req, res) => {
        const { cita_id, paciente_nombre, observaciones, diagnostico, insumos_utilizados, monto_cobrado } = req.body;

        const client = await pool.connect(); // Usamos un cliente para asegurar una transacción

        try {
            await client.query('BEGIN'); // Iniciamos transacción

            // A. Insertamos en el historial clínico
            const sqlHistorial = `
                INSERT INTO historial_clinico 
                (cita_id, paciente_nombre, observaciones, diagnostico, insumos_utilizados, monto_cobrado) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            
            const valoresHistorial = [cita_id, paciente_nombre, observaciones, diagnostico, insumos_utilizados, monto_cobrado];
            const nuevoHistorial = await client.query(sqlHistorial, valoresHistorial);

            // B. Actualizamos el estado de la cita a 'completada'
            await client.query('UPDATE citas SET estado = $1 WHERE id = $2', ['completada', cita_id]);

            await client.query('COMMIT'); // Guardamos ambos cambios

            res.status(201).json({
                mensaje: "Atención registrada con éxito",
                datos: nuevoHistorial.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK'); // Si algo falla, no se guarda nada
            console.error("ERROR AL REGISTRAR ATENCIÓN:", error.message);
            res.status(500).json({ error: "No se pudo guardar la atención médica" });
        } finally {
            client.release();
        }
    },

    // 2. OBTENER TODO EL HISTORIAL (Para el botón "Historial de Atenciones")
    obtenerHistorial: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM historial_clinico ORDER BY fecha_registro DESC');
            res.json(result.rows);
        } catch (error) {
            console.error("ERROR AL OBTENER HISTORIAL:", error.message);
            res.status(500).json({ error: "No se pudo cargar el historial" });
        }
    }
};

module.exports = historialController;