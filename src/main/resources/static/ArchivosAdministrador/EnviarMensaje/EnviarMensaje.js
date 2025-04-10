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

switch(rol){
    case("residente"):
        apiUrl="http://localhost:8080/api/residente/enviarMensaje";
        break;
    case("propietario"):
        apiUrl="http://localhost:8080/api/propietario/enviarMensaje";
        break;
    default:
}


document.getElementById("enviar-mensaje").addEventListener("submit", async function (event){
    event.preventDefault();

    const contenidoMensaje = document.getElementById("contenido").value;
    const asuntoMensaje = document.getElementById("asunto").value;
    const fechaMensaje = fechaISO;
    const idCuentaMensaje = idCuenta;

    const mensaje = JSON.stringify({
        asunto:asuntoMensaje,
        contenido:contenidoMensaje,
        fecha:fechaMensaje,
        cuenta:{
            idCuenta:idCuentaMensaje
        }
    });

    try {
        const response = await fetch (apiUrl,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: mensaje
        })

        if (!response.ok){
            alert("Fallo al enviar el mensaje")
        }
        else{
            alert("Mensaje enviado correctamente")
        }


    }catch(e){
        alert("Error al enviar el mensaje");
    }

    window.location.href = '/Mensaje/mensaje.html';


})