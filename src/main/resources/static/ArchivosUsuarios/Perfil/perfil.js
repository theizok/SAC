// perfil.js

document.addEventListener("DOMContentLoaded", () => {
    // —————————————————————————————————————
    // 1. Pestañas
    // —————————————————————————————————————
    const tabs     = document.querySelectorAll(".perfil-tab");
    const contents = document.querySelectorAll(".perfil-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(target).classList.add("active");
        });
    });

    // —————————————————————————————————————
    // Helpers para errores inline
    // —————————————————————————————————————
    function showFieldError(fieldId, message, ttl = 6000) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        clearFieldError(fieldId);

        // crear span para error debajo del campo
        const span = document.createElement('span');
        span.id = `${fieldId}-error`;
        span.className = 'field-error';
        span.setAttribute('role', 'alert');
        span.textContent = message;

        // intentar colocar después del input (si está dentro de label o wrapper)
        if (field.parentNode) {
            const wrapper = field.closest('.input-group') || field.parentNode;
            wrapper.appendChild(span);
        } else {
            field.after(span);
        }

        field.classList.add('input-error');
        try { field.focus(); } catch (e) { /* no-op */ }

        const timer = setTimeout(() => clearFieldError(fieldId), ttl);
        field.dataset._errorTimeout = String(timer);
    }

    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.remove('input-error');
        const existing = document.getElementById(`${fieldId}-error`);
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        const t = field.dataset._errorTimeout;
        if (t) {
            try { clearTimeout(Number(t)); } catch (e) {}
            delete field.dataset._errorTimeout;
        }
    }

    // limpiar errores al escribir
    ['nombre','documento','correo','telefono'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => clearFieldError(id));
        }
    });

    // —————————————————————————————————————
    // 2. Configuración de URLs según rol
    // —————————————————————————————————————
    const userType = sessionStorage.getItem("userType");
    const id       = sessionStorage.getItem("id");

    if (!userType || !id) {
        console.error("No se encontró userType o id en sessionStorage");
        return;
    }

    const rol = userType.toLowerCase();
    let API_URL    = "";
    let UPDATE_URL = "";
    let CHANGE_URL = "";
    let DELETE_URL = "";

    if (rol === "residente") {
        API_URL    = "/api/residente/obtenerPorId";
        UPDATE_URL = "/api/residente/actualizar";
        CHANGE_URL = "/api/residente/cambiarContraseña";
        DELETE_URL = "/api/residente/eliminar";
    } else if (rol === "propietario") {
        API_URL    = "/api/propietario/ObtenerPropietarioById";
        UPDATE_URL = "/api/propietario/actualizar";
        CHANGE_URL = "/api/propietario/cambiarContraseña";
        DELETE_URL = "/api/propietario/eliminarCuenta";
    } else {
        console.error("Tipo de usuario no válido:", userType);
        return;
    }

    // Cargar datos al inicio
    obtenerDatosPerfil(API_URL, id);

    // —————————————————————————————————————
    // 3. Actualizar datos personales
    // —————————————————————————————————————
    document
        .getElementById("form-datos-personales")
        .addEventListener("submit", async event => {
            event.preventDefault();

            // limpiar errores previos
            clearFieldError('correo');
            clearFieldError('documento');
            clearFieldError('telefono');
            // limpiar mensaje global solo si teníamos uno
            const msgElem = document.getElementById("responseMessage");
            if (msgElem) msgElem.innerText = "";

            const nombre    = document.getElementById("nombre").value.trim();
            const documento = document.getElementById("documento").value.trim();
            const correo    = document.getElementById("correo").value.trim();
            const telefono  = document.getElementById("telefono").value.trim();

            if (!nombre || !documento || !correo || !telefono) {
                if (msgElem) msgElem.innerText = "Todos los campos son obligatorios";
                return;
            }

            try {
                // Obtener datos actuales para conservar campos no editables
                const respGet = await fetch(`${API_URL}?id=${id}`, { method: "GET", credentials: 'include' });
                if (!respGet.ok) throw new Error("Error al obtener datos");
                const data = await respGet.json();

                // Preparar payload según rol
                let payload;
                if (rol === "residente") {
                    payload = {
                        nombre,
                        documento,
                        correo,
                        telefono,
                        contraseña:    data.contraseña,
                        edad:          data.edad,
                        idcuenta:      data.idcuenta,
                        idrol:         data.idrol,
                        idapartamento: data.idapartamento
                    };
                } else {
                    payload = {
                        nombre,
                        documento,
                        correo,
                        telefonoPropietario: telefono,
                        contraseña:          data.contraseña,
                        edad:                data.edad,
                        idcuenta:            data.idcuenta,
                        idrol:               data.idrol,
                        idapartamento:       data.idapartamento
                    };
                }

                const respPut = await fetch(`${UPDATE_URL}?id=${id}`, {
                    method:  "PUT",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(payload),
                    credentials: 'include'
                });

                // Manejo detallado de la respuesta
                if (respPut.ok) {
                    if (msgElem) msgElem.innerText = "Usuario actualizado correctamente";
                    clearFieldError('correo');
                    clearFieldError('documento');
                    clearFieldError('telefono');
                    setTimeout(() => location.reload(), 900);
                } else {
                    let errorBody = null;
                    try {
                        errorBody = await respPut.json();
                    } catch (e) {
                        try {
                            const txt = await respPut.text();
                            if (txt) errorBody = { message: txt };
                        } catch (_ignored) { /* no-op */ }
                    }

                    const serverMsg = (errorBody && (errorBody.message || errorBody.error)) ?
                        (errorBody.message || errorBody.error) :
                        `Error al actualizar el usuario (código ${respPut.status})`;

                    const lower = serverMsg.toLowerCase();
                    const standardMsg = "Esta informacion ya está registrada. Intenta con uno nuevo.";

                    if (lower.includes("correo") || lower.includes("email")) {
                        showFieldError('correo', standardMsg);
                    } else if (lower.includes("documento")) {
                        showFieldError('documento', standardMsg);
                    } else if (lower.includes("tel") || lower.includes("telefono") || lower.includes("telefono_propietario")) {
                        showFieldError('telefono', standardMsg);
                    } else {
                        // Mensaje general (no campo detectado)
                        if (msgElem) msgElem.innerText = serverMsg;
                    }
                }
            } catch (error) {
                console.error("Error en la actualización:", error);
                const msgElem2 = document.getElementById("responseMessage");
                if (msgElem2) msgElem2.innerText = "Ocurrió un error al actualizar";
            }
        });

    // —————————————————————————————————————
    // 4. Cambiar contraseña
    // —————————————————————————————————————
    const formCambiarPassword = document.getElementById("form-cambiar-password");
    if (formCambiarPassword) {
        formCambiarPassword.addEventListener("submit", async e => {
            e.preventDefault();

            const passAct = document.getElementById("password-actual").value.trim();
            const passNew = document.getElementById("password-nueva").value.trim();
            const passCon = document.getElementById("password-confirmar").value.trim();

            if (!passAct || !passNew || !passCon) {
                alert("Todos los campos son obligatorios");
                return;
            }
            if (passNew !== passCon) {
                alert("Las contraseñas nuevas no coinciden");
                return;
            }

            try {
                const body = {
                    idUsuario:     id,
                    passwordActual: passAct,
                    passwordNueva:  passNew
                };
                const resp = await fetch(`${CHANGE_URL}?id=${id}`, {
                    method:  "PUT",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(body),
                    credentials: 'include'
                });

                const result = await resp.json().catch(() => ({}));
                if (resp.ok) {
                    alert("Contraseña actualizada correctamente");
                    sessionStorage.clear();
                    window.location.href = "../../Login/Index.html";
                } else {
                    alert(result.message || "Error al actualizar la contraseña");
                }
            } catch (err) {
                console.error("Error en la solicitud:", err);
                alert("Ocurrió un error al actualizar la contraseña");
            }
        });
    }

    // —————————————————————————————————————
    // 5. Eliminar cuenta
    // —————————————————————————————————————
    const btnEliminar = document.getElementById("btn-confirmar-eliminacion");
    if (btnEliminar) {
        btnEliminar.addEventListener("click", async () => {
            const pwdConfirm = document.getElementById("password-confirmar-eliminacion").value.trim();
            if (!pwdConfirm) {
                alert("Por favor ingresa tu contraseña para confirmar.");
                return;
            }

            if (!confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.")) {
                return;
            }

            try {
                const resp = await fetch(`${DELETE_URL}?id=${id}`, {
                    method: "DELETE",
                    credentials: 'include'
                });

                if (resp.ok) {
                    alert("Cuenta eliminada correctamente.");
                    sessionStorage.clear();
                    window.location.href = "../../Login/Index.html";
                } else {
                    const err = await resp.json().catch(() => ({}));
                    alert(err.message || "No se pudo eliminar la cuenta.");
                }
            } catch (error) {
                console.error("Error al eliminar cuenta:", error);
                alert("Ocurrió un error al eliminar la cuenta.");
            }
        });
    }

    // —————————————————————————————————————
    // 6. Cerrar sesión
    // —————————————————————————————————————
    document.getElementById("logout")?.addEventListener("click", e => {
        e.preventDefault();
        if (confirm("¿Estás seguro de cerrar sesión?")) {
            sessionStorage.clear();
            window.location.href = "../../InicioNoAuth/Inicio_no.html";
        }
    });

    // —————————————————————————————————————
    // 7. Toggle mostrar/ocultar contraseña
    // —————————————————————————————————————
    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", () => {
            const targetId = icon.dataset.target;
            const input    = document.getElementById(targetId);
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    });
});

// —————————————————————————————————————
// Función: obtenerDatosPerfil
// —————————————————————————————————————
async function obtenerDatosPerfil(url, id) {
    try {
        const resp = await fetch(`${url}?id=${id}`, {
            method:  "GET",
            headers: { "Content-Type": "application/json" },
            credentials: 'include'
        });
        if (!resp.ok) throw new Error("Error al obtener datos");
        const data = await resp.json();

        document.getElementById("nombre").value    = data.nombre || "";
        document.getElementById("correo").value    = data.correo || "";
        document.getElementById("documento").value = data.documento || "";
        document.getElementById("telefono").value  =
            (data.telefono ?? data.telefonoPropietario) || "";
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}
