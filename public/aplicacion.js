document.addEventListener('DOMContentLoaded', () => {
    const nombre = localStorage.getItem('usuario_nombre');
    const rol = localStorage.getItem('usuario_rol');
    const display = document.getElementById('display-user');
    
    // Si hay sesión, mostramos el nombre y rol en el navbar
    if (nombre && display) {
        display.innerHTML = `<i class="bi bi-person-circle"></i> ${nombre} <span class="badge bg-light text-primary ms-1">${rol}</span>`;
    }

    // Carga inicial de la agenda (Pestaña por defecto)
    if (document.getElementById('contenedorCitas')) {
        verCitas(rol);
    }
});

// --- FUNCIÓN AUXILIAR: ENCABEZADOS CON TOKEN (Punto 4) ---
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- 1. LOGIN (Genera y guarda el Token) ---
async function login(e) {
    if (e) e.preventDefault();
    
    const nombre_usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.token); // Guardamos la "llave"
            localStorage.setItem('usuario_nombre', data.usuario.nombre);
            localStorage.setItem('usuario_rol', data.usuario.rol);
            window.location.href = '/agenda';
        } else {
            alert(data.message || "Credenciales incorrectas");
        }
    } catch (err) {
        alert("Error de conexión con el servidor");
    }
}

// --- 2. AGREGAR NUEVO PACIENTE (Punto 1 Sence - Protegido) ---
async function guardarNuevaCita() {
    const data = {
        paciente: document.getElementById('new_paciente').value,
        motivo: document.getElementById('new_motivo').value,
        fecha: document.getElementById('new_fecha').value,
        hora: document.getElementById('new_hora').value
    };

    if (!data.paciente || !data.motivo || !data.fecha || !data.hora) {
        return alert("⚠️ Todos los campos son obligatorios");
    }

    const res = await fetch('/api/citas', {
        method: 'POST',
        headers: getAuthHeader(), // Enviamos Token
        body: JSON.stringify(data)
    });

    if (res.ok) {
        document.getElementById('new_paciente').value = '';
        document.getElementById('new_motivo').value = '';
        bootstrap.Modal.getInstance(document.getElementById('modalNuevaCita')).hide();
        verCitas(localStorage.getItem('usuario_rol'));
    } else {
        alert("Error: No tienes permisos o el token expiró");
    }
}

// --- 3. FINALIZAR ATENCIÓN (Subida de Foto + Historial - Punto 2 y 3) ---
function abrirAtender(id) {
    document.getElementById('at_id').value = id;
    document.getElementById('at_diag').value = '';
    document.getElementById('at_monto').value = '';
    document.getElementById('at_foto').value = '';
    new bootstrap.Modal(document.getElementById('modalAtender')).show();
}

async function confirmarAtencion() {
    const id = document.getElementById('at_id').value;
    const diagnostico = document.getElementById('at_diag').value;
    const monto = document.getElementById('at_monto').value;
    const fotoInput = document.getElementById('at_foto');
    let fotoUrl = null;

    if (!diagnostico || !monto) return alert("⚠️ Diagnóstico y Monto son requeridos");

    // A. Subir imagen primero (Punto 3)
    if (fotoInput.files.length > 0) {
        const formData = new FormData();
        formData.append('foto', fotoInput.files[0]);

        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) fotoUrl = uploadData.url;
    }

    // B. Guardar en Historial (Punto 2)
    const res = await fetch(`/api/citas/atender/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ diagnostico, monto, foto: fotoUrl })
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalAtender')).hide();
        verCitas(localStorage.getItem('usuario_rol'));
        alert("✅ Atención registrada correctamente");
    }
}

// --- 4. CARGAR VISTAS (Agenda e Historial) ---
async function verCitas(rol) {
    const contenedor = document.getElementById('contenedorCitas');
    const res = await fetch('/api/citas'); // GET público para logueados
    const citas = await res.json();
    
    contenedor.innerHTML = '';
    citas.forEach(cita => {
        const fechaS = cita.fecha.split('T')[0];
        let btnsAdmin = rol === 'admin' ? `
            <div class="d-flex gap-2 mt-2">
                <button class="btn btn-outline-warning btn-sm w-50" onclick="editarCita(${cita.id},'${cita.paciente}','${cita.motivo}','${fechaS}','${cita.hora}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm w-50" onclick="borrarCita(${cita.id})"><i class="bi bi-trash"></i></button>
            </div>` : '';

        contenedor.innerHTML += `
            <div class="col-md-4">
                <div class="card shadow-sm p-3 border-0 border-start border-primary border-4">
                    <h6 class="fw-bold text-primary mb-1">${cita.paciente}</h6>
                    <p class="small mb-2"><strong>${cita.hora.slice(0,5)}</strong> | ${fechaS}</p>
                    <p class="small text-muted text-truncate">${cita.motivo}</p>
                    <button class="btn btn-primary btn-sm w-100 fw-bold" onclick="abrirAtender(${cita.id})">ATENDER</button>
                    ${btnsAdmin}
                </div>
            </div>`;
    });
}

async function cargarHistorial() {
    const tabla = document.getElementById('tablaHistorial');
    const res = await fetch('/api/citas/historial');
    const datos = await res.json();
    
    tabla.innerHTML = '';
    datos.forEach(h => {
        const fotoHTML = h.foto_url 
            ? `<a href="${h.foto_url}" target="_blank"><img src="${h.foto_url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;"></a>`
            : `<i class="bi bi-image text-muted opacity-50"></i>`;

        tabla.innerHTML += `
            <tr>
                <td><div class="d-flex align-items-center gap-2">${fotoHTML} <span class="fw-bold">${h.paciente_nombre}</span></div></td>
                <td>${h.diagnostico}</td>
                <td class="text-success fw-bold">$${h.monto_cobrado}</td>
                <td class="small">${h.fecha_registro.split('T')[0]}</td>
            </tr>`;
    });
}

// --- 5. GESTIÓN DE VISTAS Y LOGOUT ---
function cambiarVista(vista) {
    const sCitas = document.getElementById('seccionCitas');
    const sHist = document.getElementById('seccionHistorial');
    const btnC = document.getElementById('btn-citas');
    const btnH = document.getElementById('btn-historial');

    if (vista === 'citas') {
        sCitas.style.display = 'block'; sHist.style.display = 'none';
        btnC.classList.add('active'); btnH.classList.remove('active');
        verCitas(localStorage.getItem('usuario_rol'));
    } else {
        sCitas.style.display = 'none'; sHist.style.display = 'block';
        btnC.classList.remove('active'); btnH.classList.add('active');
        cargarHistorial();
    }
}

async function borrarCita(id) {
    if (confirm("¿Seguro que desea eliminar esta cita?")) {
        await fetch(`/api/citas/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        verCitas(localStorage.getItem('usuario_rol'));
    }
}

function editarCita(id, pac, mot, fec, hor) {
    document.getElementById('edit_id').value = id;
    document.getElementById('edit_paciente').value = pac;
    document.getElementById('edit_motivo').value = mot;
    document.getElementById('edit_fecha').value = fec;
    document.getElementById('edit_hora').value = hor;
    new bootstrap.Modal(document.getElementById('modalEditar')).show();
}

async function guardarEdicion() {
    const id = document.getElementById('edit_id').value;
    const body = {
        motivo: document.getElementById('edit_motivo').value,
        fecha: document.getElementById('edit_fecha').value,
        hora: document.getElementById('edit_hora').value
    };
    await fetch(`/api/citas/${id}`, { 
        method: 'PUT', 
        headers: getAuthHeader(), 
        body: JSON.stringify(body) 
    });
    bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
    verCitas(localStorage.getItem('usuario_rol'));
}

function salir() {
    localStorage.clear();
    window.location.href = '/login';
}