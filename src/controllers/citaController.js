const pool = require('../config/db');

// --- 1. OBTENER CITAS (Agenda Diaria) ---
const obtenerCitas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM citas ORDER BY fecha, hora ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener citas" });
    }
};

// --- 2. CREAR NUEVA CITA (Punto 1 Sence) ---
const crearCita = async (req, res) => {
    const { paciente, motivo, fecha, hora } = req.body;
    try {
        await pool.query(
            'INSERT INTO citas (paciente, motivo, fecha, hora) VALUES ($1, $2, $3, $4)',
            [paciente, motivo, fecha, hora]
        );
        res.json({ success: true, message: "Cita agendada" });
    } catch (err) {
        res.status(500).json({ error: "Error al crear cita" });
    }
};

// --- 3. ATENDER PACIENTE Y GUARDAR HISTORIAL (Punto 2 y 3 Sence) ---
const atenderCita = async (req, res) => {
    const { id } = req.params; // ID de la cita
    const { diagnostico, monto, foto } = req.body; // 'foto' trae la URL que nos dio Multer

    try {
        // A. Buscamos los datos del paciente antes de borrar la cita
        const citaResult = await pool.query('SELECT paciente FROM citas WHERE id = $1', [id]);
        
        if (citaResult.rows.length === 0) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }

        const nombrePaciente = citaResult.rows[0].paciente;

        // B. Insertamos en el HISTORIAL (Aquí se guarda la foto)
        await pool.query(
            `INSERT INTO historial_clinico (paciente_nombre, diagnostico, monto_cobrado, foto_url) 
             VALUES ($1, $2, $3, $4)`,
            [nombrePaciente, diagnostico, monto, foto]
        );

        // C. Borramos la cita de la agenda (Ya fue atendido)
        await pool.query('DELETE FROM citas WHERE id = $1', [id]);

        res.json({ success: true, message: "Atención registrada y cita finalizada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al procesar la atención" });
    }
};

// --- 4. OBTENER HISTORIAL (Para ver las fotos) ---
const obtenerHistorial = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM historial_clinico ORDER BY fecha_registro DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};

// --- 5. EDITAR Y ELIMINAR (Mantenimiento) ---
const editarCita = async (req, res) => {
    const { id } = req.params;
    const { motivo, fecha, hora } = req.body;
    try {
        await pool.query(
            'UPDATE citas SET motivo = $1, fecha = $2, hora = $3 WHERE id = $4',
            [motivo, fecha, hora, id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Error al editar" }); }
};

const eliminarCita = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM citas WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Error al eliminar" }); }
};

module.exports = {
    obtenerCitas,
    crearCita,
    atenderCita,
    obtenerHistorial,
    editarCita,
    eliminarCita
};