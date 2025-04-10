document.addEventListener("DOMContentLoaded", async () => {
    const mensajes = document.getElementById("sent-mensajes")

    try {
        const response = await fetch("http:localhost:8080/api/administrador/obtenerMensajes", {
            method:"GET"
        }  )

        if(!response.ok){
            throw new Error("Error la obtener todos los mensajes");
        }

        data = await response.json();

        const mensaje = document.createElement('div')


    } catch (e) {

    }


})

