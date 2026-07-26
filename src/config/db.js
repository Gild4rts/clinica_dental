const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Verificamos la conexión al iniciar el servidor
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error de conexión a PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conexión exitosa a la base de datos');
    }
});

module.exports = pool;