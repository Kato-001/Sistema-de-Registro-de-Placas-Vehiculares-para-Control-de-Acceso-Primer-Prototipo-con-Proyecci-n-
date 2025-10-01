-- ============================================
-- TABLA: registros_acceso (Registro de accesos)
-- ============================================
CREATE TABLE IF NOT EXISTS registros_acceso (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_vehiculo UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
    id_vehiculo_sin_placa UUID REFERENCES vehiculos_sin_placa(id) ON DELETE CASCADE,
    id_placa_restringida UUID REFERENCES placas_restringidas(id) ON DELETE CASCADE,
    hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hora_salida TIMESTAMP WITH TIME ZONE,
    puerta VARCHAR(100) DEFAULT 'Principal',
    tipo_acceso VARCHAR(50) NOT NULL, -- 'entrada', 'salida', 'denegado'
    notas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);