//Obtenemos los valores necesarios para realizar la peticion
const idCuenta = sessionStorage.getItem("idCuenta");
const rol = sessionStorage.getItem("userType").toLowerCase();
let apiUrl = "";

switch(rol){
    case("residente"):
        apiUrl = "http://localhost:8080/api/residente/enviarMensaje";
        break;
    case("propietario"):
        apiUrl = "http:localhost:8080/api/propietario/enviarMensaje";
        break;
    default:
}

//Obtenemos la fecha y hora
const ahora = new Date(); // Mueve la declaración aquí

const dia = String(ahora.getDate()).padStart(2, '0');
const mes = String(ahora.getMonth() + 1).padStart(2, '0');
const anio = ahora.getFullYear();
const hora = String(ahora.getHours()).padStart(2, '0');
const minutos = String(ahora.getMinutes()).padStart(2, '0');

const fechaISO = `${anio}-${mes}-${dia}T${hora}:${minutos}:00`; // Formato ISO 8601


document.getElementById("enviar-mensaje").addEventListener("submit", async function (event){
    event.preventDefault();//Evita que se recarge la pagina al darle en enviar

    try {
        //Obtener datos del mensaje desde el formulario
        const contenido = document.getElementById("contenidoMensaje").value.trim();
        const asunto = document.getElementById("asunto").value.trim();
        const fecha = fechaISO;

        //Creación del objeto (Mensaje)
        const mensaje = JSON.stringify({
            fecha: fecha,
            contenido: contenido,
            asunto: asunto,
            cuenta:
                {
                idCuenta: idCuenta
                }
        });

        try {
            const respuesta = await fetch(apiUrl,{
                method:"POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: mensaje
            })

            if (!respuesta.ok){
                alert("Mensaje no enviado");
            }
            alert("Mensaje enviado de forma exitosa")
        }catch(e){
            console.log("Error al enviar el mensaje\nError:  " + e);
        }
    }
    catch(e){
        console.log("Error: " + e);
    }

})