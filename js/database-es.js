// ============================================
// CONFIGURACIÓN Y CONEXIÓN A SUPABASE
// Sistema de Registro de Placas Vehiculares - VERSIÓN EN ESPAÑOL
// ============================================

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

class SupabaseConfig {
    constructor() {
        // Configuración desde variables de entorno o directamente
    this.supabaseUrl = this.getEnvVar('SUPABASE_URL') || 'https://onbzyaydbpmezsybdrfq.supabase.co';
    this.supabaseAnonKey = this.getEnvVar('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnp5YXlkYnBtZXpzeWJkcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODAxMTIsImV4cCI6MjA3NDg1NjExMn0.rBr4zZNwlEo5U5hIhunLfW8gunl7hp7DMXtWRuHfCQk';
        
        // Inicializar cliente de Supabase
        this.supabase = window.supabase?.createClient(this.supabaseUrl, this.supabaseAnonKey) || null;
        
        if (!this.supabase) {
            console.error('❌ No se pudo inicializar Supabase. Verifica que la librería esté cargada.');
        } else {
            console.log('✅ Supabase inicializado correctamente');
        }
    }

    // Función auxiliar para obtener variables de entorno
    getEnvVar(name) {
        // En un entorno de Node.js
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name];
        }
        
        // En el navegador, podrías usar meta tags o configuración manual
        const metaTag = document.querySelector(`meta[name="env-${name.toLowerCase()}"]`);
        return metaTag ? metaTag.getAttribute('content') : null;
    }

    // Obtener instancia de Supabase
    getClient() {
        return this.supabase;
    }
}

// ============================================
// CLASE PRINCIPAL DE BASE DE DATOS
// ============================================

class VehicleDatabase {
    constructor() {
        this.config = new SupabaseConfig();
        this.supabase = this.config.getClient();
        
        // Configuración de almacenamiento
        this.storageBuckets = {
            placas: 'imagenes-placas',
            vehiculos: 'imagenes-vehiculos',
            licencias: 'imagenes-licencias'
        };
        
        // Nombres de tablas en español
        this.tables = {
            vehiculos: 'vehiculos',
            vehiculosSinPlaca: 'vehiculos_sin_placa',
            placasRestringidas: 'placas_restringidas',
            registrosAcceso: 'registros_acceso',
            configuracionSistema: 'configuracion_sistema'
        };
    }

    // ============================================
    // MÉTODOS PARA VEHÍCULOS CON PLACA
    // ============================================

    // Registrar vehículo con placa
    async registerVehicle(vehicleData) {
        try {
            // Verificar si la placa ya existe
            const existingVehicle = await this.findVehicleByPlate(vehicleData.plate);
            if (existingVehicle) {
                throw new Error(`La placa ${vehicleData.plate} ya está registrada`);
            }

            // Verificar si la placa está restringida
            const isRestricted = await this.isPlateRestricted(vehicleData.plate);
            if (isRestricted) {
                throw new Error(`La placa ${vehicleData.plate} está restringida`);
            }

            // Subir imagen si existe
            let imageUrl = null;
            if (vehicleData.imageFile) {
                imageUrl = await this.uploadImage(vehicleData.imageFile, this.storageBuckets.placas);
            }

            // Insertar en la base de datos
            const { data, error } = await this.supabase
                .from(this.tables.vehiculos)
                .insert([{
                    placa: vehicleData.plate.toUpperCase(),
                    nombre_propietario: vehicleData.ownerName,
                    cedula_propietario: vehicleData.ownerId,
                    tipo_vehiculo: vehicleData.vehicleType,
                    facultad: vehicleData.faculty,
                    color: vehicleData.color,
                    observaciones: vehicleData.observations || null,
                    url_imagen: imageUrl
                }])
                .select();

            if (error) throw error;

            // Registrar acceso
            await this.logAccess({
                id_vehiculo: data[0].id,
                tipo_acceso: 'entrada',
                notas: 'Registro inicial del vehículo'
            });

            return {
                success: true,
                vehicle: data[0],
                message: 'Vehículo registrado exitosamente'
            };

        } catch (error) {
            console.error('Error al registrar vehículo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Buscar vehículo por placa
    async findVehicleByPlate(plate) {
        try {
            const { data, error } = await this.supabase
                .from(this.tables.vehiculos)
                .select('*')
                .eq('placa', plate.toUpperCase())
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;

        } catch (error) {
            console.error('Error al buscar vehículo por placa:', error);
            return null;
        }
    }

    // ============================================
    // MÉTODOS PARA VEHÍCULOS SIN PLACA
    // ============================================

    // Registrar vehículo sin placa
    async registerNoPlateVehicle(vehicleData) {
        try {
            // Subir imágenes si existen
            let vehicleImageUrl = null;
            let licenseImageUrl = null;

            if (vehicleData.vehicleImageFile) {
                vehicleImageUrl = await this.uploadImage(vehicleData.vehicleImageFile, this.storageBuckets.vehiculos);
            }

            if (vehicleData.licenseImageFile) {
                licenseImageUrl = await this.uploadImage(vehicleData.licenseImageFile, this.storageBuckets.licencias);
            }

            // Insertar en la base de datos (el trigger generará el ID temporal automáticamente)
            const { data, error } = await this.supabase
                .from(this.tables.vehiculosSinPlaca)
                .insert([{
                    nombre_conductor: vehicleData.driverName,
                    cedula_conductor: vehicleData.driverId,
                    tipo_vehiculo: vehicleData.vehicleType,
                    facultad: vehicleData.faculty,
                    observaciones: vehicleData.observations || null,
                    url_imagen_vehiculo: vehicleImageUrl,
                    url_imagen_licencia: licenseImageUrl
                }])
                .select();

            if (error) throw error;

            // Registrar acceso
            await this.logAccess({
                id_vehiculo_sin_placa: data[0].id,
                tipo_acceso: 'entrada',
                notas: 'Registro inicial del vehículo sin placa'
            });

            return {
                success: true,
                vehicle: data[0],
                tempId: data[0].id_temporal,
                message: 'Vehículo sin placa registrado exitosamente'
            };

        } catch (error) {
            console.error('Error al registrar vehículo sin placa:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // MÉTODOS PARA PLACAS RESTRINGIDAS
    // ============================================

    // Registrar placa restringida
    async registerRestrictedPlate(restrictionData) {
        try {
            const { data, error } = await this.supabase
                .from(this.tables.placasRestringidas)
                .insert([{
                    placa: restrictionData.plate.toUpperCase(),
                    motivo: restrictionData.reason,
                    motivo_personalizado: restrictionData.customReason || null,
                    fecha_inicio: restrictionData.startDate,
                    fecha_fin: restrictionData.endDate,
                    responsable: restrictionData.responsible
                }])
                .select();

            if (error) throw error;

            return {
                success: true,
                restriction: data[0],
                message: 'Placa restringida registrada exitosamente'
            };

        } catch (error) {
            console.error('Error al registrar placa restringida:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verificar si una placa está restringida
    async isPlateRestricted(plate) {
        try {
            const { data, error } = await this.supabase
                .rpc('es_placa_restringida', { numero_placa: plate.toUpperCase() });

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error al verificar restricción de placa:', error);
            return false;
        }
    }

    // ============================================
    // MÉTODOS DE BÚSQUEDA
    // ============================================

    // Buscar vehículo (placa o ID temporal)
    async searchVehicle(searchTerm) {
        try {
            const { data, error } = await this.supabase
                .rpc('buscar_vehiculo', { termino_busqueda: searchTerm.toUpperCase() });

            if (error) throw error;
            return data && data.length > 0 ? data[0] : null;

        } catch (error) {
            console.error('Error al buscar vehículo:', error);
            return null;
        }
    }

    // Obtener todos los vehículos (vista consolidada)
    async getAllVehiclesConsolidated(limit = 50, offset = 0) {
        try {
            const { data, error } = await this.supabase
                .from('vista_todos_vehiculos')
                .select('*')
                .order('fecha_creacion', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error al obtener vehículos:', error);
            return [];
        }
    }

    // ============================================
    // MÉTODOS DE ACCESO Y LOGS
    // ============================================

    // Registrar log de acceso
    async logAccess(accessData) {
        try {
            const { data, error } = await this.supabase
                .from(this.tables.registrosAcceso)
                .insert([accessData])
                .select();

            if (error) throw error;
            return data[0];

        } catch (error) {
            console.error('Error al registrar acceso:', error);
            return null;
        }
    }

    // Obtener logs de acceso
    async getAccessLogs(limit = 100, offset = 0) {
        try {
            const { data, error } = await this.supabase
                .from(this.tables.registrosAcceso)
                .select(`
                    *,
                    vehiculos(placa, nombre_propietario),
                    vehiculos_sin_placa(id_temporal, nombre_conductor),
                    placas_restringidas(placa, motivo)
                `)
                .order('hora_entrada', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error al obtener logs de acceso:', error);
            return [];
        }
    }

    // ============================================
    // MÉTODOS DE ESTADÍSTICAS
    // ============================================

    // Obtener estadísticas del sistema
    async getStatistics() {
        try {
            const [vehiculosResult, sinPlacaResult, restringidasResult, accesosResult] = await Promise.all([
                this.supabase.from(this.tables.vehiculos).select('*', { count: 'exact' }),
                this.supabase.from(this.tables.vehiculosSinPlaca).select('*', { count: 'exact' }),
                this.supabase.from(this.tables.placasRestringidas).select('*', { count: 'exact' }),
                this.supabase.from(this.tables.registrosAcceso).select('*', { count: 'exact' })
            ]);

            return {
                totalVehiculos: vehiculosResult.count || 0,
                totalSinPlaca: sinPlacaResult.count || 0,
                totalRestringidas: restringidasResult.count || 0,
                totalAccesos: accesosResult.count || 0
            };

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                totalVehiculos: 0,
                totalSinPlaca: 0,
                totalRestringidas: 0,
                totalAccesos: 0
            };
        }
    }

    // ============================================
    // MÉTODOS DE CONFIGURACIÓN
    // ============================================

    // Obtener configuración del sistema
    async getSystemConfig(key = null) {
        try {
            let query = this.supabase.from(this.tables.configuracionSistema).select('*');
            
            if (key) {
                query = query.eq('clave_configuracion', key).single();
            }

            const { data, error } = await query;
            if (error) throw error;

            return key ? data?.valor_configuracion : data;

        } catch (error) {
            console.error('Error al obtener configuración:', error);
            return key ? null : [];
        }
    }

    // Actualizar configuración del sistema
    async updateSystemConfig(key, value) {
        try {
            const { data, error } = await this.supabase
                .from(this.tables.configuracionSistema)
                .upsert({
                    clave_configuracion: key,
                    valor_configuracion: value
                })
                .select();

            if (error) throw error;
            return data[0];

        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            return null;
        }
    }

    // ============================================
    // MÉTODOS DE ALMACENAMIENTO
    // ============================================

    // Subir imagen al storage
    async uploadImage(file, bucket) {
        try {
            if (!file || file.size === 0) {
                throw new Error('Archivo no válido');
            }

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Tipo de archivo no permitido. Solo JPEG, PNG y WebP.');
            }

            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Archivo muy grande. Máximo 5MB.');
            }

            // Generar nombre único
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

            // Subir archivo
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            // Obtener URL pública
            const { data: urlData } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return urlData.publicUrl;

        } catch (error) {
            console.error('Error al subir imagen:', error);
            throw error;
        }
    }

    // ============================================
    // MÉTODOS DE UTILIDAD
    // ============================================

    // Verificar conexión a Supabase
    async checkConnection() {
        try {
            if (!this.supabase) {
                return {
                    connected: false,
                    message: 'Cliente de Supabase no inicializado'
                };
            }

            // Hacer una consulta simple para verificar la conexión
            const { data, error } = await this.supabase
                .from(this.tables.configuracionSistema)
                .select('clave_configuracion')
                .limit(1);

            if (error) {
                return {
                    connected: false,
                    message: `Error de conexión: ${error.message}`
                };
            }

            return {
                connected: true,
                message: 'Conexión exitosa a Supabase'
            };

        } catch (error) {
            return {
                connected: false,
                message: `Error inesperado: ${error.message}`
            };
        }
    }

    // Limpiar datos antiguos (función de mantenimiento)
    async cleanupOldData(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const { error } = await this.supabase
                .from(this.tables.registrosAcceso)
                .delete()
                .lt('fecha_creacion', cutoffDate.toISOString());

            if (error) throw error;

            return {
                success: true,
                message: `Datos anteriores a ${daysOld} días eliminados`
            };

        } catch (error) {
            console.error('Error al limpiar datos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

// Crear instancia global cuando el DOM esté listo
let vehicleDB;

document.addEventListener('DOMContentLoaded', function() {
    vehicleDB = new VehicleDatabase();
    
    // Hacer disponible globalmente
    window.vehicleDB = vehicleDB;
    
    console.log('🚀 Sistema de base de datos inicializado');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VehicleDatabase;
}

console.log('📚 database.js (versión español) cargado completamente');