-- ============================================
-- TABLA: configuracion_sistema (Configuración del sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clave_configuracion VARCHAR(100) UNIQUE NOT NULL,
    valor_configuracion TEXT NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);