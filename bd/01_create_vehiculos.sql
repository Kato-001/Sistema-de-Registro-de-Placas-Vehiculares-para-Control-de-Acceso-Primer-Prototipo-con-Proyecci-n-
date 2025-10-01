-- ============================================
-- TABLA: vehiculos (Vehículos con placa)
-- ============================================
CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    nombre_propietario VARCHAR(255) NOT NULL,
    cedula_propietario VARCHAR(50) NOT NULL,
    tipo_vehiculo VARCHAR(100) NOT NULL,
    facultad VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL,
    observaciones TEXT,
    url_imagen TEXT,
    puerta VARCHAR(100) DEFAULT 'Principal',
    estado VARCHAR(50) DEFAULT 'Autorizado',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);