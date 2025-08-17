// Obtenemos los valores necesarios para realizar la petición
const idCuentaRaw = sessionStorage.getItem("idCuenta");
const idCuenta = idCuentaRaw ? parseInt(idCuentaRaw, 10) : null;
const rol = sessionStorage.getItem("userType")?.toLowerCase();
let apiUrl = "";

switch (rol) {
    case "residente":
        apiUrl = "/api/residente/enviarMensaje";
        break;
    case "propietario":
        apiUrl = "/api/propietario/enviarMensaje";
        break;
    default:
        console.error("Rol de usuario desconocido:", rol);
    // podrías redirigir o avisar al usuario aquí
}

// Obtenemos la fecha y hora en formato ISO 8601
function getFechaISO() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${anio}-${mes}-${dia}T${hora}:${minutos}:00`;
}

// Manejador de envío de formulario
document.getElementById("enviar-mensaje").addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita recarga

    if (!apiUrl || !idCuenta) {
        alert("No se pudo determinar la ruta o la cuenta. Revisa tu sesión.");
        return;
    }

    // Tomamos datos del formulario
    const contenido = document.getElementById("contenidoMensaje").value.trim();
    const asunto = document.getElementById("asunto").value.trim();
    const fecha = getFechaISO();

    if (!asunto || !contenido) {
        alert("Por favor completa asunto y contenido.");
        return;
    }

    // Construimos el payload
    const payload = {
        fecha: fecha,
        asunto: asunto,
        contenido: contenido,
        cuenta: {
            idCuenta: idCuenta
        }
    };

    try {
        const respuesta = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            console.error("Error del servidor:", errorText);
            alert("No se pudo enviar el mensaje. Intenta de nuevo más tarde.");
            return;
        }

        alert("Mensaje enviado correctamente.");
        // Opcional: redirigir o limpiar el formulario:
        // this.reset();
        // window.location.href = "ruta/a/mensajes.html";
    } catch (e) {
        console.error("Error al enviar el mensaje:", e);
        alert("Ocurrió un error de red al enviar el mensaje.");
    }
});
