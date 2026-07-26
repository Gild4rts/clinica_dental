-- 1. Limpieza de tablas (Orden correcto para evitar errores de FK)
DROP TABLE IF EXISTS historial_clinico CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL, 
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'dentista')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inserción de Usuarios (Password: 1234)
-- Nota: Asegúrate de que el hash coincida con tu sistema de login (bcrypt)
INSERT INTO usuarios (nombre_usuario, password, rol) VALUES 
('admin', '$2b$10$7N0wVteWpMHVZgBfdl7gqepQ7QkUDS2xInIEJtyW7hxjTsvHwSpCO', 'admin'),
('dentista1', '$2b$10$7N0wVteWpMHVZgBfdl7gqepQ7QkUDS2xInIEJtyW7hxjTsvHwSpCO', 'dentista');

-- 4. Tabla de Citas
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente VARCHAR(200) NOT NULL, 
    fecha DATE NOT NULL,            
    hora TIME NOT NULL,             
    motivo VARCHAR(200) NOT NULL,   
    profesional VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba para la agenda
INSERT INTO citas (paciente, fecha, hora, motivo, profesional, estado) VALUES 
('Juan Pérez', '2026-04-10', '10:00:00', 'Limpieza Dental', 'dentista1', 'pendiente'),
('María González', '2026-04-10', '11:30:00', 'Extracción', 'dentista1', 'pendiente');

-- 5. Tabla de Historial Clínico (MODIFICADA CON FOTO_URL)
CREATE TABLE historial_clinico (
    id SERIAL PRIMARY KEY,
    cita_id INTEGER REFERENCES citas(id) ON DELETE SET NULL,
    paciente_nombre VARCHAR(200),
    diagnostico TEXT,
    monto_cobrado INTEGER DEFAULT 0, 
    foto_url TEXT, -- <--- AQUÍ SE GUARDA LA RUTA DE LA IMAGEN (Punto 3 Sence)
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);