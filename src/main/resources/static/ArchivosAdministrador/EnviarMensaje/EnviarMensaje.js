document.addEventListener("DOMContentLoaded", () => {

    let currentId = null;
    let currentTipo = null;



//Obtener datos para el mensaje
    const idCuenta = sessionStorage.getItem("idCuenta");
    const rol = sessionStorage.getItem("userType").toLowerCase();
//Declaramos la ruta a la que haremos la peticion
    let apiUrl = "";

//Obtener fecha
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    const fechaISO = `${anio}-${mes}-${dia}T${hora}:${minutos}:00`; // Formato ISO 8601



    //Obtener usuarios para enviarle el mensaje.
    const obtenerUsuarios = async () => {
        try {
            const response = await fetch("/api/administrador/obtenerUsuarios");
            const usuarios = await response.json();
            console.log(usuarios);
            return usuarios;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    obtenerUsuarios().then(usuarios => {
        usuarios.forEach(usuario => {
            const option = document.createElement("option")
            option.value = usuario.idCuenta;
            option.textContent = usuario.tipoUsuario + " " + usuario.nombre;
            document.getElementById("destinatario").appendChild(option);
        })
    })

    document.getElementById("enviar-mensaje").addEventListener("submit", async(e) => {
        e.preventDefault();
        const idCuentaAEnviarMensaje = document.getElementById("destinatario").value;
        const contenido = document.getElementById("contenidoMensaje").value;
        const asunto = document.getElementById("asunto").value;

        const mensaje = {

            fecha: fechaISO,
            asunto: asunto,
            contenido: contenido,
            cuenta : {
                idCuenta: idCuenta
            },
            cuentaRespondido : {
            idCuenta: idCuentaAEnviarMensaje
            }
        }

        try {
            const respuesta = await fetch("/api/administrador/enviarMensaje", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mensaje)
            });

            if (!respuesta.ok) {
                const errorText = await respuesta.text()
                console.error("Error del servidor: ", errorText);
                alert("No se pudo enviar el mensaje. Intenta de nuevo");
            }

            alert("Mensaje enviado correctamente");
            window.location.href = '/ArchivosAdministrador/Mensaje/mensaje.html';

        } catch (error) {
            console.error("Error:", error);
            alert("Ocurrió un error de red al enviar el mensaje.");
        }
    })

})

