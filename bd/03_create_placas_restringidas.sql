-- ============================================
-- TABLA: placas_restringidas (Placas restringidas)
-- ============================================
CREATE TABLE IF NOT EXISTS placas_restringidas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    motivo_personalizado TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    responsable VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Restringido',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);