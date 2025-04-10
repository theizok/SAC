document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.querySelectorAll(".perfil-tab");
    const contents = document.querySelectorAll(".perfil-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const target = tab.getAttribute("data-tab");

            // Remover la clase "active" de todas las pestañas y contenidos
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // Activar la pestaña y su contenido correspondiente
            tab.classList.add("active");
            document.getElementById(target).classList.add("active");
        });
    });


    // Obtener datos almacenados en sessionStorage
    const userType = sessionStorage.getItem("userType");
    const id = sessionStorage.getItem("id");
    let tipoUsuario = "";


    if (!userType || !id) {
        console.error("No se encontró userType o id en sessionStorage");
        return;
    }

    const rol = userType.toLowerCase(); // Convertir a minúscula para comparación
    let API_URL = "";
    let UPDATE_URL = "";
    let CHANGE_URL = "";

    if (rol === "administrador") {
        API_URL = "http://localhost:8080/api/administrador/obtenerPorId";
        UPDATE_URL = "http://localhost:8080/api/administrador/actualizar";
        CHANGE_URL = "http://localhost:8080/api/administrador/cambiarContraseña";
    }
    else {
        console.error("Tipo de usuario no válido");
        tipoUsuario = "TIpo de usuario no encontrado"
        return;
    }

    // Llamar a la API solo si se definió una URL
    if (API_URL) {
        obtenerDatosPerfil(API_URL, id);
    }


    // Evento para actualizar datos
    document.getElementById("form-datos-personales").addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            // Obtener los valores del formulario
            const nombre = document.getElementById("nombre").value.trim();
            const documento = document.getElementById("documento").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const telefono = document.getElementById("telefono").value.trim();

            // Validar que los campos no estén vacíos
            if (!nombre || !documento || !correo || !telefono) {
                document.getElementById("responseMessage").innerText = "Todos los campos son obligatorios";
                return;
            }

            // Obtener datos actuales del usuario
            const response = await fetch(`${API_URL}?id=${id}`, { method: "GET" });

            if (!response.ok) {
                throw new Error("Error al obtener datos");
            }

            const data = await response.json();

            // Crear objeto con datos actualizados
            const usuario = JSON.stringify({
                nombre,
                documento,
                correo,
                telefono,
                contraseña: data.contraseña,
                edad: data.edad,
                idcuenta: data.idcuenta,
                idrol: data.idrol,
                idapartamento: data.idapartamento
            });

            // Enviar datos al backend con PUT
            const respuesta = await fetch(`${UPDATE_URL}?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: usuario
            });

            if (respuesta.ok) {
                document.getElementById("responseMessage").innerText = "Usuario actualizado correctamente";
                location.reload();
            } else {
                document.getElementById("responseMessage").innerText = "Error al actualizar el usuario";
            }
        } catch (error) {
            console.error("Error en la actualización:", error);
            document.getElementById("responseMessage").innerText = "Ocurrió un error al actualizar";
        }
    });

    //Cambio de contraseña
    const formCambiarPassword = document.getElementById('form-cambiar-password');

    if (formCambiarPassword) {
        formCambiarPassword.addEventListener('submit', async function(e) {
            e.preventDefault();

            const id = sessionStorage.getItem("id"); // Obtener ID del usuario activo
            if (!id) {
                alert('Error: No se encontró el usuario en la sesión');
                return;
            }

            const passwordActual = document.getElementById('password-actual').value.trim();
            const passwordNueva = document.getElementById('password-nueva').value.trim();
            const passwordConfirmar = document.getElementById('password-confirmar').value.trim();

            if (!passwordActual || !passwordNueva || !passwordConfirmar) {
                alert('Todos los campos son obligatorios');
                return;
            }

            if (passwordNueva !== passwordConfirmar) {
                alert('Las contraseñas nuevas no coinciden');
                return;
            }

            // Crear objeto con la solicitud de cambio de contraseña
            const passwordData = {
                idUsuario: id,
                passwordActual: passwordActual,
                passwordNueva: passwordNueva
            };

            try {
                const response = await fetch(`${CHANGE_URL}?id=${id}`,{
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(passwordData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Contraseña actualizada correctamente');
                    formCambiarPassword.reset();
                    sessionStorage.clear(); // Cerrar sesión para que vuelva a iniciar con la nueva contraseña
                    window.location.href = "/noAuth/Login"; // Redirigir a la página de login
                } else {
                    alert(result.message || 'Error al actualizar la contraseña');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                alert('Ocurrió un error al actualizar la contraseña');
            }
        });
    }





});

async function obtenerDatosPerfil(url, id) {
    try {
        rol = sessionStorage.getItem("userType").toLowerCase();

        const response = await fetch(`${url}?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener datos");
        }

        const data = await response.json();

        // Verificar que los elementos existen antes de asignar valores
        if (document.getElementById("id")) {
            document.getElementById("id").value = data.id;
        }
        if(rol === "administrador")
        {
            if (document.getElementById("nombre")) {
                document.getElementById("nombre").value = data.nombreAdministrador;
            }
        }else{
        if (document.getElementById("nombre")) {
            document.getElementById("nombre").value = data.nombre;
        }
        }
        if (document.getElementById("correo")) {
            document.getElementById("correo").value = data.correo;
        }
        if (document.getElementById("telefono")) {
            document.getElementById("telefono").value = data.telefono;
        }
        if (document.getElementById("documento")) {
            document.getElementById("documento").value = data.documento;
        }

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }

}





