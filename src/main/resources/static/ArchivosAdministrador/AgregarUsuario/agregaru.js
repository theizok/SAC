document.addEventListener("DOMContentLoaded", () => {
    const formAgregarUsuario = document.getElementById('form-agregar-usuario');
    if (!formAgregarUsuario) {
        console.error("No se encontró el formulario #form-agregar-usuario");
        return;
    }

    formAgregarUsuario.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre')?.value.trim() || "";
        const documento = document.getElementById('documento')?.value.trim() || "";
        const correo = document.getElementById('correo')?.value.trim() || "";
        const celular = document.getElementById('celular')?.value.trim() || "";
        const rol = (document.getElementById('rol')?.value || "").trim().toLowerCase();
        const contrasena = document.getElementById('contrasena')?.value || "";


        let usuarioPayload = null;
        let apiUrl="";

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
            // IMPORTANTE: enviar los campos que la entidad Propietario espera
            usuarioPayload = {
                nombre: nombre,
                documento: documento,
                correo: correo,
                telefonoPropietario: celular,
                "contraseña": contrasena
            };
        } else if (rol === "administrador") {
            apiUrl = "/api/administrador/agregarAdministrador";
            usuarioPayload = {
                nombre: nombre,
                documento: documento,
                correo: correo,
                telefono: celular,
                "contraseña": contrasena
            };
        } else {
            console.log("Tipo de usuario no válido:", rol);
            alert("Selecciona un rol válido antes de continuar.");
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuarioPayload),
                credentials: 'include'
            });

            if (!response.ok) {
                const text = await response.text().catch(()=>null);
                console.error("Error al crear usuario:", response.status, text);
                alert("Error al crear el usuario. Revisa la consola para más detalles.");
                return;
            }

            alert("Usuario creado de manera correcta");
            // Redirigir a la pantalla de administrar usuarios (una sola vez)
            window.location.href = "/ArchivosAdministrador/AdministrarUsuarios/administrar_usuarios.html";
        } catch (err) {
            console.error("Excepción al crear usuario:", err);
            alert("Error al crear el usuario. Revisa la consola.");
        }
    });
});