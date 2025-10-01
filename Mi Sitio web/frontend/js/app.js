// ============================================
// INTEGRACIÓN COMPLETA SUPABASE + FRONTEND
// Sistema de Registro de Placas Vehiculares
// ============================================

// Variable global para la base de datos
let db;

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando aplicación...');
    
    try {
        // Esperar a que database.js se cargue
        if (typeof VehicleDatabase !== 'undefined') {
            db = new VehicleDatabase();
            
            // Verificar conexión a Supabase
            const connectionStatus = await db.checkConnection();
            
            if (connectionStatus.connected) {
                console.log('✅ Conectado a Supabase exitosamente');
                showNotification('✅ Conectado a la base de datos', 'success');
                initializeApp();
            } else {
                console.warn('⚠️ Usando modo local (localStorage)');
                showNotification('⚠️ Modo offline - usando almacenamiento local', 'warning');
                initializeLocalMode();
            }
        } else {
            console.warn('⚠️ VehicleDatabase no disponible, usando modo local');
            initializeLocalMode();
        }
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        showNotification('❌ Error de conexión - usando modo local', 'error');
        initializeLocalMode();
    }
});

// ============================================
// INICIALIZACIÓN CON BASE DE DATOS
// ============================================
function initializeApp() {
    console.log('🎯 Inicializando aplicación con base de datos...');
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar formularios
    setupForms();
    
    // Cargar datos iniciales
    loadInitialData();
    
    // Configurar eventos de búsqueda
    setupSearch();
}

// ============================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ============================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const dashboardButtons = document.querySelectorAll('.dashboard-btn');

    function switchTab(tabId) {
        navLinks.forEach(link => link.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        if (tabId === 'history') {
            loadHistoryData();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    dashboardButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// ============================================
// CONFIGURACIÓN DE FORMULARIOS
// ============================================
function setupForms() {
    // Selector de tipo de registro
    const registrationOptions = document.querySelectorAll('.registration-option');
    const vehicleForms = document.querySelectorAll('.vehicle-form');

    registrationOptions.forEach(option => {
        option.addEventListener('click', () => {
            registrationOptions.forEach(opt => opt.classList.remove('active'));
            vehicleForms.forEach(form => form.classList.remove('active'));
            
            option.classList.add('active');
            const formId = option.getAttribute('data-form') + '-form';
            document.getElementById(formId).classList.add('active');
        });
    });

    // Formulario de vehículo con placa
    setupVehicleForm();
    
    // Formulario de vehículo sin placa
    setupNoPlateForm();
    
    // Formulario de placa restringida
    setupRestrictedForm();
}

// ============================================
// FORMULARIO DE VEHÍCULO CON PLACA
// ============================================
function setupVehicleForm() {
    const form = document.getElementById('vehicle-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            plate: formData.get('plate'),
            ownerName: formData.get('ownerName'),
            ownerId: formData.get('ownerId'),
            vehicleType: formData.get('vehicleType'),
            faculty: formData.get('faculty'),
            color: formData.get('color'),
            observations: formData.get('observations')
        };
        
        const imageFile = formData.get('vehicleImage');
        if (imageFile && imageFile.size > 0) {
            data.imageFile = imageFile;
        }
        
        try {
            showNotification('🔄 Registrando vehículo...', 'info');
            
            if (db) {
                const result = await db.registerVehicle(data);
                if (result.success) {
                    showNotification('✅ Vehículo registrado exitosamente', 'success');
                    form.reset();
                    loadHistoryData(); // Actualizar historial
                } else {
                    showNotification(`❌ Error: ${result.error}`, 'error');
                }
            } else {
                // Modo local
                saveToLocalStorage('vehicleDatabase', data);
                showNotification('✅ Vehículo guardado localmente', 'success');
                form.reset();
            }
        } catch (error) {
            console.error('Error al registrar vehículo:', error);
            showNotification('❌ Error al registrar vehículo', 'error');
        }
    });
}

// ============================================
// FORMULARIO DE VEHÍCULO SIN PLACA
// ============================================
function setupNoPlateForm() {
    const form = document.getElementById('no-plate-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            driverName: formData.get('driverName'),
            driverId: formData.get('driverId'),
            vehicleType: formData.get('vehicleType'),
            faculty: formData.get('faculty'),
            observations: formData.get('observations')
        };
        
        const vehicleImage = formData.get('vehicleImage');
        const licenseImage = formData.get('licenseImage');
        
        if (vehicleImage && vehicleImage.size > 0) {
            data.vehicleImageFile = vehicleImage;
        }
        if (licenseImage && licenseImage.size > 0) {
            data.licenseImageFile = licenseImage;
        }
        
        try {
            showNotification('🔄 Registrando vehículo sin placa...', 'info');
            
            if (db) {
                const result = await db.registerNoPlateVehicle(data);
                if (result.success) {
                    showNotification(`✅ Vehículo registrado con ID: ${result.tempId}`, 'success');
                    form.reset();
                    loadHistoryData();
                } else {
                    showNotification(`❌ Error: ${result.error}`, 'error');
                }
            } else {
                // Modo local
                data.tempId = generateTempId();
                saveToLocalStorage('noPlateVehicles', data);
                showNotification(`✅ Vehículo guardado con ID: ${data.tempId}`, 'success');
                form.reset();
            }
        } catch (error) {
            console.error('Error al registrar vehículo sin placa:', error);
            showNotification('❌ Error al registrar vehículo', 'error');
        }
    });
}

// ============================================
// FORMULARIO DE PLACA RESTRINGIDA
// ============================================
function setupRestrictedForm() {
    const form = document.getElementById('restricted-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            plate: formData.get('plate'),
            reason: formData.get('reason'),
            customReason: formData.get('customReason'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            responsible: formData.get('responsible')
        };
        
        try {
            showNotification('🔄 Registrando placa restringida...', 'info');
            
            if (db) {
                const result = await db.registerRestrictedPlate(data);
                if (result.success) {
                    showNotification('✅ Placa restringida registrada', 'success');
                    form.reset();
                    loadHistoryData();
                } else {
                    showNotification(`❌ Error: ${result.error}`, 'error');
                }
            } else {
                // Modo local
                saveToLocalStorage('restrictedPlates', data);
                showNotification('✅ Placa restringida guardada localmente', 'success');
                form.reset();
            }
        } catch (error) {
            console.error('Error al registrar placa restringida:', error);
            showNotification('❌ Error al registrar placa', 'error');
        }
    });
}

// ============================================
// CONFIGURACIÓN DE BÚSQUEDA
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showNotification('⚠️ Ingrese un término de búsqueda', 'warning');
        return;
    }
    
    try {
        showNotification('🔍 Buscando...', 'info');
        
        if (db) {
            const result = await db.searchVehicle(searchTerm);
            if (result) {
                showSearchResult(result);
                showNotification('✅ Vehículo encontrado', 'success');
            } else {
                showNotification('❌ Vehículo no encontrado', 'error');
            }
        } else {
            // Búsqueda local
            const localResult = searchInLocalStorage(searchTerm);
            if (localResult) {
                showSearchResult(localResult);
                showNotification('✅ Vehículo encontrado', 'success');
            } else {
                showNotification('❌ Vehículo no encontrado', 'error');
            }
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showNotification('❌ Error al buscar', 'error');
    }
}

// ============================================
// CARGA DE DATOS
// ============================================
async function loadInitialData() {
    try {
        if (db) {
            // Cargar estadísticas
            const stats = await db.getStatistics();
            updateDashboardStats(stats);
        }
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
    }
}

async function loadHistoryData() {
    try {
        if (db) {
            const vehicles = await db.getAllVehiclesConsolidated(50, 0);
            updateHistoryTable(vehicles);
        } else {
            // Cargar datos locales
            const localData = getLocalStorageData();
            updateHistoryTable(localData);
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
        showNotification('❌ Error al cargar historial', 'error');
    }
}

// ============================================
// FUNCIONES DE MODO LOCAL (FALLBACK)
// ============================================
function initializeLocalMode() {
    console.log('🔄 Inicializando modo local...');
    
    // Usar las funciones del script.js original
    setupNavigation();
    setupForms();
    
    showNotification('💾 Funcionando en modo local', 'info');
}

function saveToLocalStorage(key, data) {
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    existing.push({
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(existing));
}

function getLocalStorageData() {
    const vehicles = JSON.parse(localStorage.getItem('vehicleDatabase')) || [];
    const noPlate = JSON.parse(localStorage.getItem('noPlateVehicles')) || [];
    const restricted = JSON.parse(localStorage.getItem('restrictedPlates')) || [];
    
    return [...vehicles, ...noPlate, ...restricted];
}

function searchInLocalStorage(searchTerm) {
    const allData = getLocalStorageData();
    return allData.find(item => 
        (item.plate && item.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tempId && item.tempId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

function generateTempId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SINPL-${year}-${random}`;
}

// ============================================
// FUNCIONES DE UI
// ============================================
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
    `;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showSearchResult(result) {
    console.log('Resultado de búsqueda:', result);
    // Aquí puedes agregar lógica para mostrar el resultado en un modal o sección especial
}

function updateHistoryTable(data) {
    console.log('Actualizando tabla con:', data);
    // Aquí puedes agregar lógica para actualizar la tabla del historial
}

function updateDashboardStats(stats) {
    console.log('Estadísticas:', stats);
    // Aquí puedes agregar lógica para actualizar las estadísticas del dashboard
}

// ============================================
// ESTILOS PARA ANIMACIONES
// ============================================
const styles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

console.log('📱 app.js cargado completamente');