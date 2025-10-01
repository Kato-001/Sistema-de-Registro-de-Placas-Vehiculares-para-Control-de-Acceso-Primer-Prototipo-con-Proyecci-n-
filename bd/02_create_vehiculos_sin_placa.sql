-- ============================================
-- TABLA: vehiculos_sin_placa (Vehículos sin placa)
-- ============================================
CREATE TABLE IF NOT EXISTS vehiculos_sin_placa (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_temporal VARCHAR(50) UNIQUE NOT NULL, -- SINPL-2025-001, etc.
    nombre_conductor VARCHAR(255) NOT NULL,
    cedula_conductor VARCHAR(50) NOT NULL,
    tipo_vehiculo VARCHAR(100) NOT NULL,
    facultad VARCHAR(255) NOT NULL,
    observaciones TEXT,
    url_imagen_vehiculo TEXT,
    url_imagen_licencia TEXT,
    estado VARCHAR(50) DEFAULT 'Autorizado',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);