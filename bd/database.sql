-- ============================================
-- SISTEMA DE REGISTRO DE PLACAS VEHICULARES
-- Base de Datos para Supabase
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: vehiculos (Vehículos con placa)
-- ============================================
CREATE TABLE vehiculos (
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

-- ============================================
-- TABLA: vehiculos_sin_placa (Vehículos sin placa)
-- ============================================
CREATE TABLE vehiculos_sin_placa (
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

-- ============================================
-- TABLA: placas_restringidas (Placas restringidas)
-- ============================================
CREATE TABLE placas_restringidas (
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

-- ============================================
-- TABLA: registros_acceso (Registro de accesos)
-- ============================================
CREATE TABLE registros_acceso (
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

-- ============================================
-- TABLA: configuracion_sistema (Configuración del sistema)
-- ============================================
CREATE TABLE configuracion_sistema (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clave_configuracion VARCHAR(100) UNIQUE NOT NULL,
    valor_configuracion TEXT NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para vehículos
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_vehiculos_cedula_propietario ON vehiculos(cedula_propietario);
CREATE INDEX idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX idx_vehiculos_fecha_creacion ON vehiculos(fecha_creacion);

-- Índices para vehículos sin placa
CREATE INDEX idx_vehiculos_sin_placa_id_temporal ON vehiculos_sin_placa(id_temporal);
CREATE INDEX idx_vehiculos_sin_placa_cedula_conductor ON vehiculos_sin_placa(cedula_conductor);
CREATE INDEX idx_vehiculos_sin_placa_estado ON vehiculos_sin_placa(estado);
CREATE INDEX idx_vehiculos_sin_placa_fecha_creacion ON vehiculos_sin_placa(fecha_creacion);

-- Índices para placas restringidas
CREATE INDEX idx_placas_restringidas_placa ON placas_restringidas(placa);
CREATE INDEX idx_placas_restringidas_estado ON placas_restringidas(estado);
CREATE INDEX idx_placas_restringidas_fecha_inicio ON placas_restringidas(fecha_inicio);
CREATE INDEX idx_placas_restringidas_fecha_fin ON placas_restringidas(fecha_fin);

-- Índices para registros de acceso
CREATE INDEX idx_registros_acceso_id_vehiculo ON registros_acceso(id_vehiculo);
CREATE INDEX idx_registros_acceso_id_vehiculo_sin_placa ON registros_acceso(id_vehiculo_sin_placa);
CREATE INDEX idx_registros_acceso_id_placa_restringida ON registros_acceso(id_placa_restringida);
CREATE INDEX idx_registros_acceso_hora_entrada ON registros_acceso(hora_entrada);
CREATE INDEX idx_registros_acceso_tipo_acceso ON registros_acceso(tipo_acceso);

-- ============================================
-- TRIGGERS PARA FECHA_ACTUALIZACION
-- ============================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER actualizar_vehiculos_fecha_actualizacion 
    BEFORE UPDATE ON vehiculos 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_vehiculos_sin_placa_fecha_actualizacion 
    BEFORE UPDATE ON vehiculos_sin_placa 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_placas_restringidas_fecha_actualizacion 
    BEFORE UPDATE ON placas_restringidas 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_configuracion_sistema_fecha_actualizacion 
    BEFORE UPDATE ON configuracion_sistema 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- ============================================
-- FUNCIÓN PARA GENERAR ID TEMPORAL AUTOMÁTICO
-- ============================================
CREATE OR REPLACE FUNCTION generar_id_temporal()
RETURNS TRIGGER AS $$
DECLARE
    siguiente_numero INTEGER;
    id_temporal TEXT;
BEGIN
    -- Obtener el siguiente número secuencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(id_temporal FROM 'SINPL-2025-(\d+)') AS INTEGER)), 0) + 1
    INTO siguiente_numero
    FROM vehiculos_sin_placa
    WHERE id_temporal LIKE 'SINPL-2025-%';
    
    -- Generar el ID temporal
    id_temporal := 'SINPL-2025-' || LPAD(siguiente_numero::TEXT, 3, '0');
    
    NEW.id_temporal := id_temporal;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar id_temporal automáticamente
CREATE TRIGGER generar_id_temporal_trigger
    BEFORE INSERT ON vehiculos_sin_placa
    FOR EACH ROW
    WHEN (NEW.id_temporal IS NULL)
    EXECUTE FUNCTION generar_id_temporal();

-- ============================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos_sin_placa ENABLE ROW LEVEL SECURITY;
ALTER TABLE placas_restringidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_acceso ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (ajustar según necesidades de seguridad)
CREATE POLICY "Permitir lectura pública" ON vehiculos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON vehiculos_sin_placa FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON placas_restringidas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON registros_acceso FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON configuracion_sistema FOR SELECT USING (true);

-- Políticas para escritura pública (ajustar según necesidades de seguridad)
CREATE POLICY "Permitir inserción pública" ON vehiculos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción pública" ON vehiculos_sin_placa FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción pública" ON placas_restringidas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción pública" ON registros_acceso FOR INSERT WITH CHECK (true);

-- Políticas para actualización pública
CREATE POLICY "Permitir actualización pública" ON vehiculos FOR UPDATE USING (true);
CREATE POLICY "Permitir actualización pública" ON vehiculos_sin_placa FOR UPDATE USING (true);
CREATE POLICY "Permitir actualización pública" ON placas_restringidas FOR UPDATE USING (true);

-- Políticas para eliminación pública
CREATE POLICY "Permitir eliminación pública" ON vehiculos FOR DELETE USING (true);
CREATE POLICY "Permitir eliminación pública" ON vehiculos_sin_placa FOR DELETE USING (true);
CREATE POLICY "Permitir eliminación pública" ON placas_restringidas FOR DELETE USING (true);

-- ============================================
-- DATOS INICIALES DE CONFIGURACIÓN
-- ============================================
INSERT INTO configuracion_sistema (clave_configuracion, valor_configuracion, descripcion) VALUES
('nombre_sistema', 'Sistema de Registro de Placas Vehiculares', 'Nombre del sistema'),
('nombre_universidad', 'Universidad Pública', 'Nombre de la universidad'),
('año_actual', '2025', 'Año académico actual'),
('prefijo_id_temporal', 'SINPL', 'Prefijo para IDs temporales'),
('puerta_predeterminada', 'Principal', 'Puerta de acceso por defecto'),
('max_entradas_diarias', '1000', 'Máximo de entradas diarias permitidas'),
('version_sistema', '1.0.0', 'Versión del sistema'),
('modo_mantenimiento', 'false', 'Modo de mantenimiento');

-- ============================================
-- VISTAS ÚTILES PARA CONSULTAS
-- ============================================

-- Vista consolidada de todos los vehículos
CREATE VIEW vista_todos_vehiculos AS
SELECT 
    'con-placa' as categoria_vehiculo,
    id,
    placa as identificador,
    nombre_propietario as nombre_persona,
    cedula_propietario as cedula_persona,
    tipo_vehiculo,
    facultad,
    color,
    observaciones,
    url_imagen,
    estado,
    fecha_creacion,
    fecha_actualizacion
FROM vehiculos
UNION ALL
SELECT 
    'sin-placa' as categoria_vehiculo,
    id,
    id_temporal as identificador,
    nombre_conductor as nombre_persona,
    cedula_conductor as cedula_persona,
    tipo_vehiculo,
    facultad,
    NULL as color,
    observaciones,
    url_imagen_vehiculo as url_imagen,
    estado,
    fecha_creacion,
    fecha_actualizacion
FROM vehiculos_sin_placa
UNION ALL
SELECT 
    'restringido' as categoria_vehiculo,
    id,
    placa as identificador,
    responsable as nombre_persona,
    NULL as cedula_persona,
    NULL as tipo_vehiculo,
    NULL as facultad,
    NULL as color,
    motivo as observaciones,
    NULL as url_imagen,
    estado,
    fecha_creacion,
    fecha_actualizacion
FROM placas_restringidas
ORDER BY fecha_creacion DESC;

-- Vista de estadísticas diarias
CREATE VIEW vista_estadisticas_diarias AS
SELECT 
    DATE(fecha_creacion) as fecha,
    COUNT(*) FILTER (WHERE estado = 'Autorizado') as cantidad_autorizados,
    COUNT(*) FILTER (WHERE estado = 'Restringido') as cantidad_restringidos,
    COUNT(*) as cantidad_total
FROM vista_todos_vehiculos
GROUP BY DATE(fecha_creacion)
ORDER BY fecha DESC;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para buscar vehículo por placa o ID
CREATE OR REPLACE FUNCTION buscar_vehiculo(termino_busqueda TEXT)
RETURNS TABLE (
    categoria_vehiculo TEXT,
    id UUID,
    identificador TEXT,
    nombre_persona TEXT,
    cedula_persona TEXT,
    tipo_vehiculo TEXT,
    facultad TEXT,
    color TEXT,
    observaciones TEXT,
    url_imagen TEXT,
    estado TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM vista_todos_vehiculos 
    WHERE UPPER(identificador) = UPPER(termino_busqueda);
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si una placa está restringida
CREATE OR REPLACE FUNCTION es_placa_restringida(numero_placa TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cantidad_restricciones INTEGER;
BEGIN
    SELECT COUNT(*) INTO cantidad_restricciones
    FROM placas_restringidas 
    WHERE UPPER(placa) = UPPER(numero_placa) 
    AND estado = 'Restringido'
    AND fecha_inicio <= CURRENT_DATE 
    AND fecha_fin >= CURRENT_DATE;
    
    RETURN cantidad_restricciones > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================
COMMENT ON TABLE vehiculos IS 'Tabla principal para vehículos registrados con placa';
COMMENT ON TABLE vehiculos_sin_placa IS 'Tabla para vehículos sin placa (motocicletas, bicicletas, etc.)';
COMMENT ON TABLE placas_restringidas IS 'Tabla para placas con restricciones de acceso';
COMMENT ON TABLE registros_acceso IS 'Registro histórico de accesos al campus';
COMMENT ON TABLE configuracion_sistema IS 'Configuración global del sistema';

-- ============================================
-- FINAL DEL SCRIPT
-- ============================================
-- Este script crea una base de datos completa para el sistema
-- de registro de placas vehiculares con todas las funcionalidades
-- necesarias para una aplicación web dinámica.
-- ============================================