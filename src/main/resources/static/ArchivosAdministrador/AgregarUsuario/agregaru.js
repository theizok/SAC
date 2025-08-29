document.addEventListener("DOMContentLoaded", () => {
    const formAgregarUsuario = document.getElementById('form-agregar-usuario');
    if (!formAgregarUsuario) {
        console.error("No se encontró el formulario #form-agregar-usuario");
        return;
    }

    function isValidEmail(email) {
        return /^\S+@\S+\.\S+$/.test(String(email).toLowerCase());
    }

    function showAlert(msg) {
        alert(msg);
    }

    formAgregarUsuario.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Leer valores del form
        const nombre = document.getElementById('nombre')?.value.trim() || "";
        const documento = document.getElementById('documento')?.value.trim() || "";
        const correo = document.getElementById('correo')?.value.trim() || "";
        const celular = document.getElementById('celular')?.value.trim() || "";
        const rol = (document.getElementById('rol')?.value || "").trim().toLowerCase();
        const contrasena = document.getElementById('contrasena')?.value || "";

        // Validación cliente mínima
        if (!nombre || nombre.length < 2) { showAlert("Por favor ingresa un nombre válido."); return; }
        if (!documento || documento.length < 4) { showAlert("Por favor ingresa un documento válido."); return; }
        if (!correo || !isValidEmail(correo)) { showAlert("Por favor ingresa un correo válido."); return; }
        if (!contrasena || contrasena.length < 6) { showAlert("La contraseña debe tener al menos 6 caracteres."); return; }
        if (!rol) { showAlert("Selecciona un rol."); return; }

        let usuarioPayload = null;
        let apiUrl = "";

        // Construir payload según rol (coincidir con nombres que espera el backend)
        if (rol === "residente") {
            apiUrl = "/api/administrador/agregarResidente";
            usuarioPayload = {
                nombre: nombre,
                documento: documento,
                correo: correo,
                telefono: celular,
                "contraseña": contrasena
            };
        } else if (rol === "propietario") {
            apiUrl = "/api/administrador/agregarPropietario";
            usuarioPayload = {
                nombre: nombre,
                documento: documento,
                correo: correo,
                telefonoPropietario: celular,
                "contraseña": contrasena
            };
        } else if (rol === "administrador") {
            apiUrl = "/api/administrador/agregarAdministrador";
            // IMPORTANTE: la entidad Administrador espera nombreAdministrador
            usuarioPayload = {
                nombreAdministrador: nombre,
                documento: documento,
                correo: correo,
                telefono: celular,
                "contraseña": contrasena
            };
        } else {
            console.warn("Tipo de usuario no válido:", rol);
            showAlert("Selecciona un rol válido antes de continuar.");
            return;
        }

        // Opcional: deshabilitar botón mientras se procesa
        const submitBtn = formAgregarUsuario.querySelector('button[type="submit"]');
        const prevText = submitBtn ? submitBtn.innerHTML : null;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuarioPayload),
                credentials: 'include'
            });

            // Intentar parsear respuesta JSON (si viene)
            let respBody = null;
            try { respBody = await response.json(); } catch (err) { /* no JSON */ }

            if (!response.ok) {
                // Priorizar mensaje proporcionado por backend
                const backendMsg = respBody && (respBody.message || respBody.error) ? (respBody.message || respBody.error) : `Error al crear el usuario (código ${response.status})`;
                console.error("Error al crear usuario:", response.status, backendMsg, respBody);
                showAlert("No se pudo crear el usuario. " + backendMsg);
                return;
            }

            // Éxito
            showAlert("Usuario creado de manera correcta");
            // Redirigir a la pantalla de administrar usuarios
            window.location.href = "/ArchivosAdministrador/AdministrarUsuarios/administrar_usuarios.html";

        } catch (err) {
            console.error("Excepción al crear usuario:", err);
            showAlert("Error de red al crear el usuario. Revisa la consola.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = prevText;
            }
        }
    });
});
