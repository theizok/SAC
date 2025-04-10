document.addEventListener("DOMContentLoaded", async () => {
    const mensajes = document.getElementById("sent-mensajes")

    try {
        const response = await fetch("http://localhost:8080/api/administrador/obtenerMensajes", {
            method:"GET"
        }  )

        if(!response.ok){
            throw new Error("Error la obtener todos los mensajes");
        }


        data = await response.json();

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

    } catch (e) {

    }



})

