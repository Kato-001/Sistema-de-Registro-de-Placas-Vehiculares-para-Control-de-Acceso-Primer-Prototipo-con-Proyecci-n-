// script-web-completo.js
// Script para manejar todos los formularios de la web y conectar con Supabase

const SUPABASE_URL = 'https://onbzyaydbpmezsybdrfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnp5YXlkYnBtZXpzeWJkcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODAxMTIsImV4cCI6MjA3NDg1NjExMn0.rBr4zZNwlEo5U5hIhunLfW8gunl7hp7DMXtWRuHfCQk';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  // --- REGISTRO VEHÍCULO CON PLACA ---
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const plate = document.getElementById('plateNumberRegister')?.value.trim().toUpperCase();
      const nombre_propietario = document.getElementById('nombrePropietario')?.value.trim();
      const cedula_propietario = document.getElementById('cedulaPropietario')?.value.trim();
      const tipo_vehiculo = document.getElementById('tipoVehiculo')?.value;
      const facultad = document.getElementById('facultad')?.value;
      const color = document.getElementById('color')?.value.trim();
      const observaciones = document.getElementById('observaciones')?.value.trim();
      const url_imagen = document.getElementById('registerPreview')?.src || null;
      if (!plate || !nombre_propietario || !cedula_propietario || !tipo_vehiculo || !facultad || !color) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }
      const { error } = await supabase.from('vehiculos').insert([
        { placa: plate, nombre_propietario, cedula_propietario, tipo_vehiculo, facultad, color, observaciones: observaciones || null, url_imagen, estado: 'Autorizado', puerta: 'Principal' }
      ]);
      const resultContainer = document.getElementById('registerResult');
      if (error) {
        resultContainer.innerHTML = `<div class='result-error'><h3>❌ Error</h3><p>${error.message}</p></div>`;
        resultContainer.style.display = 'block';
        return;
      }
      resultContainer.innerHTML = `<div class='result-success'><h3>✅ Registro exitoso</h3><p>Vehículo registrado correctamente.</p></div>`;
      resultContainer.style.display = 'block';
      // Limpiar campos
      document.getElementById('plateNumberRegister').value = '';
      document.getElementById('nombrePropietario').value = '';
      document.getElementById('cedulaPropietario').value = '';
      document.getElementById('tipoVehiculo').selectedIndex = 0;
      document.getElementById('facultad').selectedIndex = 0;
      document.getElementById('color').value = '';
      document.getElementById('observaciones').value = '';
      document.getElementById('registerPreview').src = '';
    });
  }

  // --- REGISTRO VEHÍCULO SIN PLACA ---
  const noPlateRegisterBtn = document.getElementById('noPlateRegisterBtn');
  if (noPlateRegisterBtn) {
    noPlateRegisterBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const nombre_conductor = document.getElementById('nombreConductor')?.value.trim();
      const cedula_conductor = document.getElementById('cedulaConductor')?.value.trim();
      const tipo_vehiculo = document.getElementById('tipoVehiculoSinPlaca')?.value;
      const facultad = document.getElementById('facultadSinPlaca')?.value;
      const observaciones = document.getElementById('observacionesSinPlaca')?.value.trim();
      const url_imagen_vehiculo = document.getElementById('noPlatePreview')?.src || null;
      const url_imagen_licencia = document.getElementById('licensePreview')?.src || null;
      if (!nombre_conductor || !cedula_conductor || !tipo_vehiculo || !facultad) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }
      // Generar id_temporal único
      const now = new Date();
      const id_temporal = `SINPL-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
      // Prueba solo con los campos obligatorios para descartar problemas de formato
      const dataToSend = {
        id_temporal,
        nombre_conductor,
        cedula_conductor,
        tipo_vehiculo,
        facultad,
        estado: 'Autorizado'
      };
      console.log('Enviando a Supabase:', dataToSend);
      const { error } = await supabase
        .from('vehiculos_sin_placa')
        .insert([dataToSend]);
      const resultContainer = document.getElementById('registerResult');
      if (error) {
        console.error('Error Supabase:', error);
        resultContainer.innerHTML = `<div class='result-error'><h3>❌ Error</h3><pre>${JSON.stringify(error, null, 2)}</pre><pre>Data enviada: ${JSON.stringify(dataToSend, null, 2)}</pre></div>`;
        resultContainer.style.display = 'block';
        return;
      }
      resultContainer.innerHTML = `<div class='result-success'><h3>✅ Registro exitoso</h3><p>Vehículo sin placa registrado correctamente.<br><strong>ID Temporal:</strong> ${id_temporal}</p></div>`;
      resultContainer.style.display = 'block';
      // Limpiar campos
      document.getElementById('nombreConductor').value = '';
      document.getElementById('cedulaConductor').value = '';
      document.getElementById('tipoVehiculoSinPlaca').selectedIndex = 0;
      document.getElementById('facultadSinPlaca').selectedIndex = 0;
      document.getElementById('observacionesSinPlaca').value = '';
      document.getElementById('noPlatePreview').src = '';
      document.getElementById('licensePreview').src = '';
    });
  }

  // --- REGISTRO PLACA RESTRINGIDA ---
  const restrictedRegisterBtn = document.getElementById('restrictedRegisterBtn');
  if (restrictedRegisterBtn) {
    restrictedRegisterBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const placa = document.getElementById('restrictedPlate')?.value.trim().toUpperCase();
      const motivo = document.getElementById('motivo')?.value;
      const motivo_personalizado = document.getElementById('motivoPersonalizado')?.value.trim();
      const fecha_inicio = document.getElementById('fechaInicio')?.value;
      const fecha_fin = document.getElementById('fechaFin')?.value;
      const responsable = document.getElementById('responsable')?.value.trim();
      if (!placa || !motivo || !fecha_inicio || !fecha_fin || !responsable) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }
      const { error } = await supabase.from('placas_restringidas').insert([
        { placa, motivo, motivo_personalizado: motivo === 'Otro' ? motivo_personalizado : null, fecha_inicio, fecha_fin, responsable, estado: 'Restringido' }
      ]);
      const resultContainer = document.getElementById('registerResult');
      if (error) {
        resultContainer.innerHTML = `<div class='result-error'><h3>❌ Error</h3><p>${error.message}</p></div>`;
        resultContainer.style.display = 'block';
        return;
      }
      resultContainer.innerHTML = `<div class='result-success'><h3>✅ Restricción registrada</h3><p>Placa restringida correctamente.</p></div>`;
      resultContainer.style.display = 'block';
      // Limpiar campos
      document.getElementById('restrictedPlate').value = '';
      document.getElementById('motivo').selectedIndex = 0;
      document.getElementById('motivoPersonalizado').value = '';
      document.getElementById('fechaInicio').value = '';
      document.getElementById('fechaFin').value = '';
      document.getElementById('responsable').value = '';
    });
  }

  // --- NAVEGACIÓN ENTRE PESTAÑAS ---
  const navLinks = document.querySelectorAll('.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const tab = link.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tab) content.classList.add('active');
      });
    });
  });

  // --- CAMBIO DE FORMULARIO DE REGISTRO ---
  const regOptions = document.querySelectorAll('.registration-option');
  const regForms = document.querySelectorAll('.vehicle-form');
  regOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      regOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      regForms.forEach(f => f.classList.remove('active'));
      if (opt.dataset.form === 'with-plate') document.getElementById('with-plate-form').classList.add('active');
      if (opt.dataset.form === 'without-plate') document.getElementById('without-plate-form').classList.add('active');
      if (opt.dataset.form === 'restricted') document.getElementById('restricted-form').classList.add('active');
    });
  });

  // --- CARGAR HISTORIAL DE REGISTROS ---
  async function cargarHistorial() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';
    // Vehículos con placa
    const { data: vehiculos, error: err1 } = await supabase.from('vehiculos').select('*').order('fecha_creacion', { ascending: false });
    // Vehículos sin placa
    const { data: sinPlaca, error: err2 } = await supabase.from('vehiculos_sin_placa').select('*').order('fecha_creacion', { ascending: false });
    // Placas restringidas
    const { data: restringidas, error: err3 } = await supabase.from('placas_restringidas').select('*').order('fecha_creacion', { ascending: false });
    if (err1 || err2 || err3) {
      tbody.innerHTML = '<tr><td colspan="9">Error al cargar datos</td></tr>';
      return;
    }
    let rows = '';
    (vehiculos || []).forEach(v => {
      rows += `<tr><td>Con placa</td><td><img src="${v.url_imagen || ''}" class="mini-img"></td><td>${v.placa}</td><td>${v.tipo_vehiculo}</td><td>${v.nombre_propietario}</td><td>${v.facultad}</td><td>${v.fecha_creacion ? new Date(v.fecha_creacion).toLocaleString('es-ES') : ''}</td><td>${v.estado}</td><td></td></tr>`;
    });
    (sinPlaca || []).forEach(v => {
      rows += `<tr><td>Sin placa</td><td><img src="${v.url_imagen_vehiculo || ''}" class="mini-img"></td><td>${v.id_temporal || v.id}</td><td>${v.tipo_vehiculo}</td><td>${v.nombre_conductor}</td><td>${v.facultad}</td><td>${v.fecha_creacion ? new Date(v.fecha_creacion).toLocaleString('es-ES') : ''}</td><td>${v.estado}</td><td></td></tr>`;
    });
    (restringidas || []).forEach(v => {
      rows += `<tr><td>Restringida</td><td></td><td>${v.placa}</td><td></td><td></td><td></td><td>${v.fecha_creacion ? new Date(v.fecha_creacion).toLocaleString('es-ES') : ''}</td><td>${v.estado}</td><td></td></tr>`;
    });
    tbody.innerHTML = rows || '<tr><td colspan="9">Sin registros</td></tr>';
  }
  cargarHistorial();
  const refreshBtn = document.getElementById('refreshTableBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', cargarHistorial);

  // --- BÚSQUEDA DE VEHÍCULOS ---
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const val = document.getElementById('searchInput')?.value.trim();
      const result = document.getElementById('searchResult');
      if (!val) {
        result.innerHTML = '<div class="result-error">Ingrese una placa o ID.</div>';
        return;
      }
      // Buscar en todas las tablas
      let html = '';
      // Vehículos con placa
      const { data: v1 } = await supabase.from('vehiculos').select('*').eq('placa', val);
      if (v1 && v1.length) {
        const v = v1[0];
        html += `<div class='result-success'><h3>Vehículo con placa</h3><p>Propietario: ${v.nombre_propietario}<br>Tipo: ${v.tipo_vehiculo}<br>Facultad: ${v.facultad}<br>Estado: ${v.estado}</p></div>`;
      }
      // Vehículos sin placa
      const { data: v2 } = await supabase.from('vehiculos_sin_placa').select('*').or(`id_temporal.eq.${val},id.eq.${val}`);
      if (v2 && v2.length) {
        const v = v2[0];
        html += `<div class='result-success'><h3>Vehículo sin placa</h3><p>Conductor: ${v.nombre_conductor}<br>Tipo: ${v.tipo_vehiculo}<br>Facultad: ${v.facultad}<br>Estado: ${v.estado}</p></div>`;
      }
      // Placas restringidas
      const { data: v3 } = await supabase.from('placas_restringidas').select('*').eq('placa', val);
      if (v3 && v3.length) {
        const v = v3[0];
        html += `<div class='result-error'><h3>Placa Restringida</h3><p>Motivo: ${v.motivo}<br>Responsable: ${v.responsable}<br>Estado: ${v.estado}</p></div>`;
      }
      result.innerHTML = html || '<div class="result-error">No se encontró ningún registro.</div>';
    });
  }

  // --- EDICIÓN BÁSICA (solo muestra modal, lógica de edición real puede añadirse) ---
  const modal = document.getElementById('editModal');
  const modalBody = document.getElementById('editModalBody');
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      // Aquí puedes cargar los datos en el modal para editar
      modal.style.display = 'block';
      modalBody.innerHTML = '<p>Funcionalidad de edición en desarrollo.</p>';
    }
    if (e.target.classList.contains('close-modal')) {
      modal.style.display = 'none';
    }
  });

  // --- CERRAR MODAL AL HACER CLICK FUERA ---
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
});
