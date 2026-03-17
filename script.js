// Variables globales
let medicos = [];
let medicamentos = [];
let seleccionados = [];
let datosGuardados = [];
let medicamentosGamma = [];
let medicamentosGineco = [];
let medicamentosDermo = [];
let prescripciones = [];
let prescripcionPorMedico = {};
let datosCargados = false;
let jvpmActual = '';
let nombreMedicoActual = '';

// Mostrar pantalla de carga
document.addEventListener("DOMContentLoaded", function () {
    console.log("Iniciando carga de datos...");
});

// Cargar datos desde CSV
Papa.parse("MEDICOS_NEW.csv", {
    download: true,
    header: true,
    complete: function (results) {
        medicos = results.data.filter(m => m.Colegiado && m.Colegiado.toString().trim() !== "");
        console.log("✅ Médicos cargados:", medicos.length);
        verificarCargaCompleta();
    },
    error: function (error) {
        console.error("❌ Error al cargar médicos:", error);
    }
});

Papa.parse("MUESTRA_MEDICA_NEW.csv", {
    download: true,
    header: true,
    complete: function (results) {
        medicamentos = results.data.filter(m => m.ID && m.ID.trim() !== "");
        console.log("✅ Medicamentos cargados:", medicamentos.length);
        categorizarMedicamentos();
        verificarCargaCompleta();
    },
    error: function (error) {
        console.error("❌ Error al cargar medicamentos:", error);
    }
});

// Cargar Excel de Prescripciones
function cargarPrescripciones() {
    fetch('Prescripciones.xls')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            procesarPrescripciones(jsonData);
            console.log("✅ Prescripciones cargadas");
            verificarCargaCompleta();
        })
        .catch(error => {
            console.warn("⚠️ No se pudo cargar el archivo de prescripciones:", error.message);
            console.log("El sistema funcionará sin historial de prescripciones");
            verificarCargaCompleta();
        });
}

// Ejecutar carga de prescripciones
cargarPrescripciones();

// Verificar si todos los datos cargaron
function verificarCargaCompleta() {
    if (medicos.length > 0 && medicamentos.length > 0 && !datosCargados) {
        datosCargados = true;
        
        // Ocultar pantalla de carga
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("main-container").style.display = "block";
        
        console.log("✅ Todos los datos cargados correctamente");
        
        // Verificar sesión activa
        const activeUser = localStorage.getItem("activeUser");
        if (activeUser) {
            document.getElementById("app").style.display = "block";
            document.getElementById("user-system").style.display = "none";
            cargarDatosDelUsuario();
        } else {
            document.getElementById("app").style.display = "none";
            document.getElementById("user-system").style.display = "block";
        }
    }
}

// Procesar datos de prescripciones
function procesarPrescripciones(data) {
    prescripciones = [];
    prescripcionPorMedico = {};
    
    // Columna A=0 (Nombre), B=1 (JVPM), K=10 (Medicamento), W=22 (Recetas)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue;
        
        const jvpm = String(row[1]).trim();
        const nombreMedico = row[0] || '';
        const medicamento = row[10] || '';
        const recetas = parseInt(row[22]) || 0;
        
        if (!jvpm || !medicamento) continue;
        
        prescripciones.push({
            jvpm,
            nombreMedico,
            medicamento,
            recetas
        });
        
        if (!prescripcionPorMedico[jvpm]) {
            prescripcionPorMedico[jvpm] = {
                nombre: nombreMedico,
                medicamentos: {},
                totalRecetas: 0
            };
        }
        
        if (medicamento && recetas > 0) {
            prescripcionPorMedico[jvpm].medicamentos[medicamento] = 
                (prescripcionPorMedico[jvpm].medicamentos[medicamento] || 0) + recetas;
            prescripcionPorMedico[jvpm].totalRecetas += recetas;
        }
    }
    
    console.log("📊 Prescripciones procesadas:", prescripciones.length);
    console.log("👨‍⚕️ Médicos con prescripción:", Object.keys(prescripcionPorMedico).length);
}

// Categorizar medicamentos por filas del CSV
function categorizarMedicamentos() {
    medicamentosGamma = [];
    medicamentosGineco = [];
    medicamentosDermo = [];
    
    medicamentos.forEach((med, index) => {
        if (index >= 0 && index <= 41) {
            medicamentosGamma.push({...med, linea: "Gamma"});
        } else if (index >= 42 && index <= 56) {
            medicamentosGineco.push({...med, linea: "Gineco"});
        } else if (index >= 57 && index <= 114) {
            medicamentosDermo.push({...med, linea: "Dermoestético"});
        }
    });
    
    console.log("Gamma:", medicamentosGamma.length);
    console.log("Gineco:", medicamentosGineco.length);
    console.log("Dermoestético:", medicamentosDermo.length);
}

function cargarDatosDelUsuario() {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) return;
    
    datosGuardados = [];
    const storedData = localStorage.getItem(`tablaDatos_${activeUser}`);
    if (storedData) {
        datosGuardados = JSON.parse(storedData);
        actualizarTabla();
    }
}

function guardarDatosDelUsuario() {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) return;
    localStorage.setItem(`tablaDatos_${activeUser}`, JSON.stringify(datosGuardados));
}

function registerUser() {
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    
    if (!username || !password) {
        alert("Por favor, ingrese un usuario y una contraseña.");
        return;
    }
    
    if (localStorage.getItem(username)) {
        alert("El usuario ya existe.");
        return;
    }
    
    localStorage.setItem(username, password);
    alert("Usuario registrado exitosamente.");
}

function loginUser() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    
    if (!username || !password) {
        alert("Por favor, ingrese un usuario y una contraseña.");
        return;
    }
    
    const storedPassword = localStorage.getItem(username);
    
    if (storedPassword && storedPassword === password) {
        alert("Inicio de sesión exitoso.");
        localStorage.setItem("activeUser", username);
        datosGuardados = [];
        cargarDatosDelUsuario();
        document.getElementById("app").style.display = "block";
        document.getElementById("user-system").style.display = "none";
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

function logoutUser() {
    localStorage.removeItem("activeUser");
    alert("Has cerrado sesión.");
    location.reload();
}

function forgotPassword() {
    const username = document.getElementById("login-username").value.trim();
    if (!username) {
        alert("Por favor, ingrese su usuario para recuperar la contraseña.");
        return;
    }
    
    const storedPassword = localStorage.getItem(username);
    if (storedPassword) {
        alert(`Su contraseña es: ${storedPassword}`);
    } else {
        alert("Usuario no encontrado.");
    }
}

function togglePassword(inputId, toggleButton) {
    const passwordField = document.getElementById(inputId);
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    toggleButton.textContent = type === "password" ? "👁️" : "👁️‍🗨️";
}

// Buscar médico y mostrar prescripción
document.getElementById("buscarMedico").addEventListener("click", function () {
    const jvpm = document.getElementById("jvpm").value.trim();
    const medico = medicos.find((m) => m.Colegiado == jvpm);
    const nombreMedicoElement = document.getElementById("nombreMedico");
    
    if (medico) {
        nombreMedicoElement.innerText = `✅ Nombre: ${medico.NombreLargo}`;
        nombreMedicoElement.className = "medico-info encontrado";
        
        // Guardar datos del médico actual
        jvpmActual = jvpm;
        nombreMedicoActual = medico.NombreLargo;
        
        // Mostrar prescripción en Step 1
        mostrarPrescripcion(jvpm, medico.NombreLargo, 'step1');
    } else {
        nombreMedicoElement.innerText = "❌ Médico no encontrado";
        nombreMedicoElement.className = "medico-info no-encontrado";
        jvpmActual = '';
        nombreMedicoActual = '';
    }
});

// Mostrar datos de prescripción (TOP 15)
function mostrarPrescripcion(jvpm, nombreMedico, step) {
    const datos = prescripcionPorMedico[jvpm];
    
    // Determinar qué panel actualizar
    const panelId = step === 'step1' ? 'panelPrescripcion' : 'panelPrescripcionStep2';
    const panel = document.getElementById(panelId);
    
    if (!panel) return;
    
    if (!datos || datos.totalRecetas === 0) {
        panel.style.display = "none";
        return;
    }
    
    panel.style.display = "block";
    
    // Actualizar estadísticas según el step
    const totalRecetasId = step === 'step1' ? 'totalRecetas' : 'totalRecetasStep2';
    const totalMedicamentosId = step === 'step1' ? 'totalMedicamentos' : 'totalMedicamentosStep2';
    const tablaTopId = step === 'step1' ? 'tablaTopMedicamentos' : 'tablaTopMedicamentosStep2';
    const sugerenciaId = step === 'step1' ? 'sugerenciaGamma' : 'sugerenciaGammaStep2';
    
    document.getElementById(totalRecetasId).textContent = datos.totalRecetas.toLocaleString();
    document.getElementById(totalMedicamentosId).textContent = Object.keys(datos.medicamentos).length;
    
    // TOP 15 medicamentos
    const topMedicamentos = Object.entries(datos.medicamentos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const tablaTop = document.getElementById(tablaTopId);
    tablaTop.innerHTML = `<tr><th>Medicamento</th><th>Recetas</th><th>%</th></tr>`;
    
    topMedicamentos.forEach(([med, recetas]) => {
        const porcentaje = ((recetas / datos.totalRecetas) * 100).toFixed(1);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${med}</td><td>${recetas.toLocaleString()}</td><td>${porcentaje}%</td>`;
        tablaTop.appendChild(tr);
    });
    
    // Sugerencia Gamma
    const sugerencia = document.getElementById(sugerenciaId);
    const gammaMedicamentos = topMedicamentos.filter(([med]) => 
        medicamentosGamma.some(m => m.DESCRIPCION.toUpperCase().includes(med.toUpperCase().substring(0, 5)))
    );
    
    if (gammaMedicamentos.length > 0) {
        sugerencia.innerHTML = `
            <div class="sugerencia-box">
                <strong>💡 Sugerencia:</strong> Este médico prescribe frecuentemente productos Gamma.
                <br>TOP: ${gammaMedicamentos.slice(0, 3).map(([med]) => med).join(', ')}
            </div>
        `;
    } else {
        sugerencia.innerHTML = `
            <div class="sugerencia-box info">
                <strong>ℹ️ Info:</strong> No hay coincidencias directas con línea Gamma en su historial.
            </div>
        `;
    }
}

// Pasar al paso 2
document.getElementById("siguiente").addEventListener("click", function () {
    const jvpm = document.getElementById("jvpm").value.trim();
    const dia = document.getElementById("dia").value;
    const semana = document.getElementById("semana").value;
    const medico = medicos.find((m) => m.Colegiado == jvpm);
    
    if (!jvpm || !medico) {
        alert("Debe ingresar un JVPM válido y buscar al médico.");
        return;
    }
    
    document.getElementById("datosMedico").innerHTML = 
        `<p><strong>JVPM:</strong> ${jvpm}</p>` +
        `<p><strong>Nombre:</strong> ${medico.NombreLargo}</p>` +
        `<p><strong>Día:</strong> ${dia}</p>` +
        `<p><strong>Semana:</strong> ${semana}</p>`;
    
    // Guardar datos para Step 2
    jvpmActual = jvpm;
    nombreMedicoActual = medico.NombreLargo;
    
    document.getElementById("step-1").style.display = "none";
    document.getElementById("step-2").style.display = "block";
    
    // Mostrar prescripción en Step 2
    mostrarPrescripcion(jvpm, medico.NombreLargo, 'step2');
    
    mostrarMedicamentosPorCategoria();
});

// Mostrar medicamentos por categoría
function mostrarMedicamentosPorCategoria() {
    const listaGamma = document.getElementById("listaGamma");
    listaGamma.innerHTML = "";
    medicamentosGamma.forEach((med) => {
        const option = document.createElement("option");
        option.value = med.ID;
        option.textContent = `${med.DESCRIPCION} (ID: ${med.ID})`;
        option.dataset.linea = "Gamma";
        listaGamma.appendChild(option);
    });
    
    const listaGineco = document.getElementById("listaGineco");
    listaGineco.innerHTML = "";
    medicamentosGineco.forEach((med) => {
        const option = document.createElement("option");
        option.value = med.ID;
        option.textContent = `${med.DESCRIPCION} (ID: ${med.ID})`;
        option.dataset.linea = "Gineco";
        listaGineco.appendChild(option);
    });
    
    const listaDermo = document.getElementById("listaDermo");
    listaDermo.innerHTML = "";
    medicamentosDermo.forEach((med) => {
        const option = document.createElement("option");
        option.value = med.ID;
        option.textContent = `${med.DESCRIPCION} (ID: ${med.ID})`;
        option.dataset.linea = "Dermoestético";
        listaDermo.appendChild(option);
    });
    
    seleccionados = [];
    actualizarSeleccionados();
    actualizarContadores();
}

function agregarMedicamento(categoria) {
    let listaOrigen;
    if (categoria === 'gamma') listaOrigen = document.getElementById("listaGamma");
    else if (categoria === 'gineco') listaOrigen = document.getElementById("listaGineco");
    else listaOrigen = document.getElementById("listaDermo");
    
    const seleccionado = listaOrigen.options[listaOrigen.selectedIndex];
    
    if (!seleccionado) {
        alert("Seleccione un medicamento primero.");
        return;
    }
    
    if (seleccionados.length >= 8) {
        alert("Solo se permiten 8 medicamentos en total.");
        return;
    }
    
    seleccionados.push({
        ID: seleccionado.value,
        DESCRIPCION: seleccionado.textContent,
        LINEA: seleccionado.dataset.linea
    });
    
    listaOrigen.remove(listaOrigen.selectedIndex);
    actualizarSeleccionados();
    actualizarContadores();
}

function regresarMedicamento() {
    const listaSeleccionados = document.getElementById("listaSeleccionados");
    const seleccionado = listaSeleccionados.options[listaSeleccionados.selectedIndex];
    
    if (!seleccionado) {
        alert("Seleccione un medicamento para regresar.");
        return;
    }
    
    const linea = seleccionado.dataset.linea;
    let listaDestino;
    
    if (linea === 'Gamma') listaDestino = document.getElementById("listaGamma");
    else if (linea === 'Gineco') listaDestino = document.getElementById("listaGineco");
    else listaDestino = document.getElementById("listaDermo");
    
    const option = document.createElement("option");
    option.value = seleccionado.value;
    option.textContent = seleccionado.textContent;
    option.dataset.linea = linea;
    listaDestino.appendChild(option);
    
    seleccionados = seleccionados.filter((med) => med.ID !== seleccionado.value);
    listaSeleccionados.remove(listaSeleccionados.selectedIndex);
    actualizarSeleccionados();
    actualizarContadores();
}

function actualizarSeleccionados() {
    const seleccionadosContainer = document.getElementById("listaSeleccionados");
    seleccionadosContainer.innerHTML = "";
    
    seleccionados.forEach((medicamento) => {
        const option = document.createElement("option");
        option.value = medicamento.ID;
        option.textContent = `${medicamento.DESCRIPCION} [${medicamento.LINEA}]`;
        option.dataset.linea = medicamento.LINEA;
        seleccionadosContainer.appendChild(option);
    });
    
    if (seleccionados.length === 8) {
        document.getElementById("siguienteCantidad").style.display = "block";
    } else {
        document.getElementById("siguienteCantidad").style.display = "none";
    }
}

function actualizarContadores() {
    const gammaCount = seleccionados.filter(m => m.LINEA === 'Gamma').length;
    const ginecoCount = seleccionados.filter(m => m.LINEA === 'Gineco').length;
    const dermoCount = seleccionados.filter(m => m.LINEA === 'Dermoestético').length;
    
    const contadorGamma = document.getElementById("contadorGamma");
    const contadorGineco = document.getElementById("contadorGineco");
    const contadorDermo = document.getElementById("contadorDermo");
    const totalSeleccionados = document.getElementById("totalSeleccionados");
    
    if (contadorGamma) contadorGamma.textContent = gammaCount;
    if (contadorGineco) contadorGineco.textContent = ginecoCount;
    if (contadorDermo) contadorDermo.textContent = dermoCount;
    if (totalSeleccionados) totalSeleccionados.textContent = seleccionados.length;
}

document.getElementById("siguienteCantidad").addEventListener("click", function () {
    if (seleccionados.length !== 8) {
        alert("Debe seleccionar exactamente 8 medicamentos.");
        return;
    }
    
    document.getElementById("step-2").style.display = "none";
    document.getElementById("step-3").style.display = "block";
    
    const cantidadesContainer = document.getElementById("cantidades");
    cantidadesContainer.innerHTML = "";
    
    seleccionados.forEach((medicamento) => {
        const div = document.createElement("div");
        div.className = "cantidad-item";
        div.innerHTML = 
            `<label>${medicamento.DESCRIPCION}</label>` +
            `<span class="linea-badge linea-${medicamento.LINEA.toLowerCase().replace('é', 'e')}">${medicamento.LINEA}</span>` +
            `<input type="number" min="1" max="4" placeholder="Cantidad (1-4)" data-id="${medicamento.ID}" data-linea="${medicamento.LINEA}" class="cantidad-input">`;
        cantidadesContainer.appendChild(div);
    });
    
    const inputs = document.querySelectorAll(".cantidad-input");
    inputs.forEach((input, index) => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown" && index < inputs.length - 1) {
                event.preventDefault();
                inputs[index + 1].focus();
            } else if (event.key === "ArrowUp" && index > 0) {
                event.preventDefault();
                inputs[index - 1].focus();
            }
        });
        
        input.addEventListener("blur", () => {
            if (input.value > 4) input.value = 4;
            else if (input.value < 1 && input.value !== "") input.value = 1;
        });
    });
});

document.getElementById("guardar").addEventListener("click", function () {
    const jvpm = document.getElementById("jvpm").value.trim();
    const dia = document.getElementById("dia").value;
    const semana = document.getElementById("semana").value;
    const medico = medicos.find((m) => m.Colegiado == jvpm);
    
    if (!medico) {
        alert("JVPM no válido. No se guardarán los datos.");
        return;
    }
    
    const cantidades = Array.from(document.querySelectorAll(".cantidad-input")).map((input) => ({
        id: input.getAttribute("data-id"),
        cantidad: input.value,
        linea: input.getAttribute("data-linea")
    }));
    
    cantidades.forEach((med) => {
        datosGuardados.push({
            nombreMedico: medico.NombreLargo,
            jvpm: jvpm,
            codigoProducto: med.id,
            nombreProducto: seleccionados.find((s) => s.ID === med.id).DESCRIPCION,
            cantidad: med.cantidad,
            dia: dia,
            semana: semana,
            linea: med.linea
        });
    });
    
    actualizarTabla();
    guardarDatosDelUsuario();
    
    alert("✅ Datos guardados exitosamente.");
    document.getElementById("step-3").style.display = "none";
    document.getElementById("step-1").style.display = "block";
    document.getElementById("jvpm").value = "";
    document.getElementById("dia").value = "";
    document.getElementById("semana").value = "";
    document.getElementById("nombreMedico").innerText = "";
    jvpmActual = '';
    nombreMedicoActual = '';
    seleccionados = [];
    mostrarMedicamentosPorCategoria();
});

function actualizarTabla() {
    const tablaResultados = document.getElementById("tablaResultados");
    tablaResultados.innerHTML = 
        `<tr>
            <th>Médico</th>
            <th>JVPM</th>
            <th>Código</th>
            <th>Medicamento</th>
            <th>Cant.</th>
            <th>Día</th>
            <th>Semana</th>
            <th>Línea</th>
        </tr>`;
    
    datosGuardados.forEach((dato) => {
        const tr = document.createElement("tr");
        tr.innerHTML = 
            `<td>${dato.nombreMedico}</td>
            <td>${dato.jvpm}</td>
            <td>${dato.codigoProducto}</td>
            <td>${dato.nombreProducto}</td>
            <td>${dato.cantidad}</td>
            <td>${dato.dia}</td>
            <td>${dato.semana}</td>
            <td><span class="linea-badge-table linea-${dato.linea.toLowerCase().replace('é', 'e')}">${dato.linea}</span></td>`;
        tablaResultados.appendChild(tr);
    });
    
    document.getElementById("tablaDatos").style.display = "block";
}

document.getElementById("exportar").addEventListener("click", function () {
    if (datosGuardados.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    
    const wsData = datosGuardados.map((dato) => ({
        "Médico": dato.nombreMedico,
        "JVPM": dato.jvpm,
        "Código": dato.codigoProducto,
        "Medicamento": dato.nombreProducto,
        "Cantidad": dato.cantidad,
        "Día": dato.dia,
        "Semana": dato.semana,
        "Línea": dato.linea
    }));
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parrilla");
    XLSX.writeFile(wb, "ParrillaPromocional.xlsx");
});

document.getElementById("borrarDatos").addEventListener("click", function () {
    if (confirm("¿Está seguro de borrar todos los datos? Esta acción no se puede deshacer.")) {
        const activeUser = localStorage.getItem("activeUser");
        if (activeUser) {
            localStorage.removeItem(`tablaDatos_${activeUser}`);
            datosGuardados = [];
            actualizarTabla();
            alert("Datos borrados.");
        }
    }
});

// Funciones de navegación
function regresarPaso1() {
    document.getElementById("step-2").style.display = "none";
    document.getElementById("step-1").style.display = "block";
}

function regresarPaso2() {
    document.getElementById("step-3").style.display = "none";
    document.getElementById("step-2").style.display = "block";
}