document.addEventListener("DOMContentLoaded", async (event) => {
    const userType = sessionStorage.getItem("userType");
    const idCuenta = sessionStorage.getItem("idCuenta");

    const rol = userType.toLowerCase();
    let apiUrl = "";

    switch (rol){
        case("residente"):
            apiUrl = "http://localhost:8080/api/residente/obtenerMensajes";
            break;
        case("propietario"):
            apiUrl = "http://localhost:8080/api/propietario/obtenerMensajes"
            break;
        default:
    }


    async function obtenerMensajes(apiUrl, idCuenta){
        try {
            const response = await fetch(`${apiUrl}?idCuenta=${idCuenta}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok){
                throw new Error("Error al obtener los mensajes");
            }
            const data = await response.json();


            const areaTitulo = document.getElementById("areaTitulo");
            const areaContenido = document.getElementById("areaContenido");

            data.forEach((mensaje, index) => {

                const titulo = document.createElement('div');
                titulo.classList.add("titulo-mensaje");
                titulo.setAttribute('data-id', index + 1);
                titulo.innerHTML = `<strong>Fecha:</strong> ${mensaje.fecha}`;

                // Crear el contenido completo del mensaje
                const contenido = document.createElement('div');
                contenido.classList.add("contenido-mensaje");
                contenido.setAttribute('id', `mensaje-${index + 1}`);
                contenido.innerHTML = `
                 <p><strong>Asunto:</strong> <h2>${mensaje.asunto}</h2> </p>
                <p><strong>Contenido:</strong> ${mensaje.contenido}</p>
            `;
                areaTitulo.appendChild(titulo);
                areaContenido.appendChild(contenido);
            });


        }catch(e){
            console.log("Error al traer los mensajes\n Error: " + e)
        }

    }

    if (apiUrl){
        obtenerMensajes(apiUrl,idCuenta)
    }

})


