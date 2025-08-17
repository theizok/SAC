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

            const nombre    = document.getElementById("nombre").value.trim();
            const documento = document.getElementById("documento").value.trim();
            const correo    = document.getElementById("correo").value.trim();
            const telefono  = document.getElementById("telefono").value.trim();
            const msgElem   = document.getElementById("responseMessage");

            if (!nombre || !documento || !correo || !telefono) {
                msgElem.innerText = "Todos los campos son obligatorios";
                return;
            }

            try {
                // Obtener datos actuales para conservar campos no editables
                const respGet = await fetch(`${API_URL}?id=${id}`, { method: "GET" });
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

                // Enviar PUT
                const respPut = await fetch(`${UPDATE_URL}?id=${id}`, {
                    method:  "PUT",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(payload)
                });

                if (respPut.ok) {
                    msgElem.innerText = "Usuario actualizado correctamente";
                    setTimeout(() => location.reload(), 1000);
                } else {
                    msgElem.innerText = "Error al actualizar el usuario";
                }
            } catch (error) {
                console.error("Error en la actualización:", error);
                msgElem.innerText = "Ocurrió un error al actualizar";
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
                    body:    JSON.stringify(body)
                });

                const result = await resp.json();
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
                    method: "DELETE"
                });

                if (resp.ok) {
                    alert("Cuenta eliminada correctamente.");
                    sessionStorage.clear();
                    window.location.href = "../../Login/Index.html";
                } else {
                    const err = await resp.json();
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
            headers: { "Content-Type": "application/json" }
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
