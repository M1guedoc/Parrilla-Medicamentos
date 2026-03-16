// Variables globales
let medicos = [];
let medicamentos = [];
let seleccionados = [];
let datosGuardados = [];
let medicamentosGamma = [];
let medicamentosGineco = [];
let medicamentosDermo = [];

// Cargar datos desde CSV
Papa.parse("MEDICOS_NEW.csv", {
    download: true,
    header: true,
    complete: function (results) {
        medicos = results.data.filter(m => m.Colegiado && m.Colegiado.trim() !== "");
        console.log("Médicos cargados:", medicos.length);
    },
    error: function (error) {
        console.error("Error al cargar médicos:", error);
    }
});

Papa.parse("MUESTRA_MEDICA_NEW.csv", {
    download: true,
    header: true,
    complete: function (results) {
        medicamentos = results.data.filter(m => m.ID && m.ID.trim() !== "");
        console.log("Medicamentos cargados:", medicamentos.length);
        categorizarMedicamentos();
    },
    error: function (error) {
        console.error("Error al cargar medicamentos:", error);
    }
});

// ⚠️ CATEGORIZACIÓN POR FILAS DEL CSV (AJUSTADO)
// Fila 1 = Encabezado (no cuenta en el array después de filter)
// Línea Gamma: Filas 1-42 (índices 0-41) = 42 medicamentos ✅
// Línea Gineco: Filas 43-57 (índices 42-56) = 15 medicamentos ✅
// Línea Dermoestético: Filas 58-115 (índices 57-114) = 58 medicamentos ✅
function categorizarMedicamentos() {
    medicamentosGamma = [];
    medicamentosGineco = [];
    medicamentosDermo = [];
    
    medicamentos.forEach((med, index) => {
        if (index >= 0 && index <= 41) {
            // Línea Gamma: índices 0-41 (Filas 1-42 del CSV) ✅ CORREGIDO
            medicamentosGamma.push({...med, linea: "Gamma"});
        } else if (index >= 42 && index <= 56) {
            // Línea Gineco: índices 42-56 (Filas 43-57 del CSV)
            medicamentosGineco.push({...med, linea: "Gineco"});
        } else if (index >= 57 && index <= 114) {
            // Línea Dermoestético: índices 57-114 (Filas 58-115 del CSV)
            medicamentosDermo.push({...med, linea: "Dermoestético"});
        }
    });
    
    console.log("Gamma:", medicamentosGamma.length);
    console.log("Gineco:", medicamentosGineco.length);
    console.log("Dermoestético:", medicamentosDermo.length);
}

// Cargar datos guardados desde localStorage al iniciar
document.addEventListener("DOMContentLoaded", function () {
    const activeUser = localStorage.getItem("activeUser");
    if (activeUser) {
        document.getElementById("app").style.display = "block";
        document.getElementById("user-system").style.display = "none";
        cargarDatosDelUsuario();
    } else {
        document.getElementById("app").style.display = "none";
        document.getElementById("user-system").style.display = "block";
    }
});

// Cargar datos específicos del usuario
function cargarDatosDelUsuario() {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) {
        console.warn("No hay usuario activo.");
        return;
    }
    
    datosGuardados = [];
    const storedData = localStorage.getItem(`tablaDatos_${activeUser}`);
    if (storedData) {
        datosGuardados = JSON.parse(storedData);
        actualizarTabla();
    }
}

// Guardar datos específicos del usuario
function guardarDatosDelUsuario() {
    const activeUser = localStorage.getItem("activeUser");
    if (!activeUser) {
        console.error("No hay usuario activo.");
        return;
    }
    localStorage.setItem(`tablaDatos_${activeUser}`, JSON.stringify(datosGuardados));
}

// Función para registrar usuario
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

// Función para iniciar sesión
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

// Función para cerrar sesión
function logoutUser() {
    localStorage.removeItem("activeUser");
    alert("Has cerrado sesión.");
    location.reload();
}

// Función para "Olvidé mi contraseña"
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

// Función para mostrar/ocultar contraseña
function togglePassword(inputId, toggleButton) {
    const passwordField = document.getElementById(inputId);
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    toggleButton.textContent = type === "password" ? "👁️ Mostrar/Ocultar" : "👁️ Ocultar";
}

// Función para buscar médico
document.getElementById("buscarMedico").addEventListener("click", function () {
    const jvpm = document.getElementById("jvpm").value.trim();
    const medico = medicos.find((m) => m.Colegiado === jvpm);
    const nombreMedicoElement = document.getElementById("nombreMedico");
    
    if (medico) {
        nombreMedicoElement.innerText = `Nombre: ${medico.NombreLargo}`;
        nombreMedicoElement.className = "medico-info encontrado";
    } else {
        nombreMedicoElement.innerText = "Médico no encontrado";
        nombreMedicoElement.className = "medico-info no-encontrado";
    }
});

// Pasar al siguiente paso
document.getElementById("siguiente").addEventListener("click", function () {
    const jvpm = document.getElementById("jvpm").value.trim();
    const dia = document.getElementById("dia").value;
    const semana = document.getElementById("semana").value;
    const medico = medicos.find((m) => m.Colegiado === jvpm);
    
    if (!jvpm || !medico) {
        alert("Debe ingresar un JVPM válido y buscar al médico.");
        return;
    }
    
    document.getElementById("datosMedico").innerHTML = 
        `<p><strong>JVPM:</strong> ${jvpm}</p>` +
        `<p><strong>Nombre:</strong> ${medico.NombreLargo}</p>` +
        `<p><strong>Día:</strong> ${dia}</p>` +
        `<p><strong>Semana:</strong> ${semana}</p>`;
    
    document.getElementById("step-1").style.display = "none";
    document.getElementById("step-2").style.display = "block";
    mostrarMedicamentosPorCategoria();
});

// Mostrar medicamentos por categoría (3 columnas)
function mostrarMedicamentosPorCategoria() {
    // Llenar lista Gamma
    const listaGamma = document.getElementById("listaGamma");
    listaGamma.innerHTML = "";
    medicamentosGamma.forEach((med) => {
        const option = document.createElement("option");
        option.value = med.ID;
        option.textContent = `${med.DESCRIPCION} (ID: ${med.ID})`;
        option.dataset.linea = "Gamma";
        listaGamma.appendChild(option);
    });
    
    // Llenar lista Gineco
    const listaGineco = document.getElementById("listaGineco");
    listaGineco.innerHTML = "";
    medicamentosGineco.forEach((med) => {
        const option = document.createElement("option");
        option.value = med.ID;
        option.textContent = `${med.DESCRIPCION} (ID: ${med.ID})`;
        option.dataset.linea = "Gineco";
        listaGineco.appendChild(option);
    });
    
    // Llenar lista Dermo
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

// Agregar medicamento desde cualquier categoría
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

// Regresar medicamento a su categoría original
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

// Actualizar lista de seleccionados
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

// Actualizar contadores por línea
function actualizarContadores() {
    const gammaCount = seleccionados.filter(m => m.LINEA === 'Gamma').length;
    const ginecoCount = seleccionados.filter(m => m.LINEA === 'Gineco').length;
    const dermoCount = seleccionados.filter(m => m.LINEA === 'Dermoestético').length;
    
    document.getElementById("contadorGamma").textContent = gammaCount;
    document.getElementById("contadorGineco").textContent = ginecoCount;
    document.getElementById("contadorDermo").textContent = dermoCount;
    document.getElementById("totalSeleccionados").textContent = seleccionados.length;
}

// Pasar a asignar cantidades
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

// Guardar datos
document.getElementById("guardar").addEventListener("click", function () {
    const jvpm = document.getElementById("jvpm").value.trim();
    const dia = document.getElementById("dia").value;
    const semana = document.getElementById("semana").value;
    const medico = medicos.find((m) => m.Colegiado === jvpm);
    
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
    seleccionados = [];
    mostrarMedicamentosPorCategoria();
});

// Actualizar tabla
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

// Exportar a Excel
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

// Borrar datos
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