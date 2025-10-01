# 🚗 Sistema de Registro de Placas Vehiculares

Un sistema web dinámico para el control de acceso vehicular en universidades, desarrollado con **HTML**, **CSS**, **JavaScript** y **Supabase** como base de datos.

## 📋 Características

- ✅ **Registro de vehículos con placa** - Sistema completo de registro vehicular
- ✅ **Registro de vehículos sin placa** - Para motocicletas, bicicletas, etc.
- ✅ **Sistema de placas restringidas** - Control de acceso por restricciones
- ✅ **Búsqueda avanzada** - Buscar por placa o ID temporal
- ✅ **Subida de imágenes** - Almacenamiento en Supabase Storage
- ✅ **Base de datos en tiempo real** - Sincronización automática
- ✅ **Responsive Design** - Compatible con dispositivos móviles
- ✅ **Interfaz moderna** - Diseño profesional y intuitivo

## 🚀 Configuración Rápida

### 1. Configurar Supabase

1. **Crear cuenta en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Configurar la base de datos**
   - Ve a **SQL Editor** en tu dashboard de Supabase
   - Copia y pega todo el contenido del archivo `database.sql`
   - Ejecuta el script (esto creará todas las tablas, funciones y configuraciones)

3. **Configurar Storage**
   - Ve a **Storage** en tu dashboard
   - Crea los siguientes buckets:
     - `plates-images` (para imágenes de placas)
     - `vehicles-images` (para imágenes de vehículos sin placa)
     - `licenses-images` (para imágenes de licencias)
   - Configura políticas públicas de lectura para cada bucket

4. **Obtener credenciales**
   - Ve a **Settings > API**
   - Copia tu **Project URL**
   - Copia tu **anon/public key**

### 2. Configurar el Proyecto

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd Sistema-de-Registro-de-Placas-Vehiculares
   ```

2. **Configurar variables de entorno**
   - Copia `.env.example` a `.env`
   - Edita `.env` con tus credenciales de Supabase:
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-clave-publica-aqui
   ```

3. **Configurar HTML**
   - Edita `index.html` en las líneas de meta tags:
   ```html
   <meta name="env-supabase_url" content="https://tu-proyecto.supabase.co">
   <meta name="env-supabase_anon_key" content="tu-clave-publica-aqui">
   ```

### 3. Ejecutar la Aplicación

#### Opción A: Servidor Local Simple
```bash
# Con Python 3
python -m http.server 3000

# Con Node.js (si tienes http-server instalado)
npx http-server -p 3000

# Con PHP
php -S localhost:3000
```

#### Opción B: Live Server (VS Code)
- Instala la extensión "Live Server" en VS Code
- Click derecho en `index.html` > "Open with Live Server"

#### Opción C: Abrir directamente
- Abre `index.html` directamente en tu navegador
- ⚠️ **Nota**: Algunas funciones de almacenamiento pueden no funcionar por restricciones CORS

## 📁 Estructura del Proyecto

```
Mi Sitio web/
├── index.html          # Estructura principal HTML
├── styles.css          # Estilos y diseño
├── script.js           # Lógica de interfaz (legacy localStorage)
├── database.js         # Nueva conexión y métodos de Supabase
├── database.sql        # Esquema completo de la base de datos
├── .env.example        # Plantilla de variables de entorno
├── .gitignore          # Archivos a ignorar en Git
└── README.md           # Este archivo
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **`vehicles`** - Vehículos registrados con placa
- **`no_plate_vehicles`** - Vehículos sin placa (IDs temporales)
- **`restricted_plates`** - Placas con restricciones de acceso
- **`access_logs`** - Registro histórico de accesos
- **`system_config`** - Configuración global del sistema

### Características Avanzadas

- ✅ **Triggers automáticos** para `updated_at`
- ✅ **Función automática** para generar IDs temporales
- ✅ **Vistas consolidadas** para consultas optimizadas
- ✅ **Funciones SQL** para búsquedas y validaciones
- ✅ **Índices optimizados** para rendimiento
- ✅ **Row Level Security (RLS)** configurado

## 🔧 API de JavaScript

### Métodos Principales

```javascript
// Instancia global disponible
const db = window.vehicleDB;

// Registrar vehículo con placa
const result = await db.registerVehicle({
    plate: 'ABC123',
    ownerName: 'Juan Pérez',
    ownerId: '12345678',
    vehicleType: 'Automóvil',
    faculty: 'Ingeniería',
    color: 'Rojo',
    observations: 'Observaciones opcionales',
    imageFile: file // Archivo de imagen opcional
});

// Buscar vehículo
const vehicle = await db.searchVehicle('ABC123');

// Obtener todos los vehículos (vista consolidada)
const vehicles = await db.getAllVehiclesConsolidated(50, 0);

// Registrar vehículo sin placa
const noPlateResult = await db.registerNoPlateVehicle({
    driverName: 'Carlos Ruiz',
    driverId: '87654321',
    vehicleType: 'Motocicleta',
    faculty: 'Ciencias',
    vehicleImageFile: file1,
    licenseImageFile: file2
});

// Registrar placa restringida
const restrictedResult = await db.registerRestrictedPlate({
    plate: 'XYZ789',
    reason: 'Reporte de robo',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    responsible: 'Departamento de Seguridad'
});
```

## 🔐 Seguridad

- ✅ **Variables de entorno** para credenciales sensibles
- ✅ **Row Level Security** habilitado en Supabase
- ✅ **Validación de archivos** para subida de imágenes
- ✅ **Sanitización de datos** en consultas SQL
- ✅ **CORS configurado** correctamente

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 **Desktop** (1200px+)
- 📱 **Tablet** (768px - 1199px)
- 📱 **Mobile** (hasta 767px)

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Estilos**: CSS Grid, Flexbox, CSS Variables
- **Iconos**: Font Awesome 6.4.0

## 📈 Funcionalidades Futuras

- [ ] **Autenticación de usuarios** con roles
- [ ] **Notificaciones en tiempo real** con Supabase Realtime
- [ ] **Exportación de reportes** en PDF/Excel
- [ ] **Dashboard de estadísticas** avanzado
- [ ] **API REST** para integraciones externas
- [ ] **App móvil** con React Native/Flutter
- [ ] **Reconocimiento automático** de placas con IA

## 🐛 Solución de Problemas

### Error de conexión a Supabase
```javascript
// Verificar conexión
const status = await vehicleDB.checkConnection();
console.log(status);
```

### Variables de entorno no cargadas
- Verifica que las meta tags en `index.html` tengan las credenciales correctas
- Asegúrate de que el archivo `.env` esté configurado (para desarrollo local)

### Imágenes no se suben
- Verifica que los buckets de Storage estén creados en Supabase
- Confirma que las políticas de Storage permitan operaciones públicas

### Base de datos vacía
- Ejecuta el script `database.sql` completo en Supabase SQL Editor
- Verifica que todas las tablas se hayan creado correctamente

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso académico y está desarrollado para la **Feria de Innovación 2025** de la Universidad Pública.

## 👥 Autores

- **Desarrollador Principal** - Sistema de Control Vehicular
- **Universidad Pública** - Proyecto de Investigación 2025

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: admin@universidad.edu
- 🔗 GitHub Issues: [Crear Issue](../../issues)
- 📱 Campus: Departamento de Sistemas

---

⭐ **¡No olvides dar una estrella al proyecto si te fue útil!** ⭐