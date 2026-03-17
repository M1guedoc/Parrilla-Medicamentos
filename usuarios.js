// Verificar si hay usuario activo al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    const app = document.getElementById("app");
    const userSystem = document.getElementById("user-system");
    const activeUser = localStorage.getItem("activeUser");

    if (activeUser) {
        app.style.display = "block";
        userSystem.style.display = "none";
        console.log(`Usuario activo: ${activeUser}`);
    } else {
        app.style.display = "none";
        userSystem.style.display = "block";
        console.log("No hay usuario activo.");
    }
});

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
    toggleButton.textContent = type === "password" ? "👁️" : "👁️‍🗨️";
}

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