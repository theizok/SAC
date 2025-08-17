
document.addEventListener('DOMContentLoaded', function() {
    const ahora = new Date(); // Mueve la declaración aquí

    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    const fechaISO = `${anio}-${mes}-${dia}T${hora}:${minutos}:00`; // Formato ISO 8601
    document.getElementById('fecha').value = fechaISO;
    
    const formulario = document.getElementById('formulario-publicacion');
    
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();

        const titulo = document.getElementById('titulo').value;
        const contenido = document.getElementById('contenido').value;
        const fecha = document.getElementById('fecha').value;
        const idCuenta = sessionStorage.getItem("idCuenta");

        const nuevaPublicacion = JSON.stringify({
            titulo: titulo,
            contenido: contenido,
            fecha: fecha,
            cuenta: {
                idCuenta: idCuenta
            }
        });

        try {
            const respuesta = await fetch("/api/tablon/crearPublicacion",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: nuevaPublicacion
            });

            if (!respuesta.ok){
                console.log("Creacion de publicacion fallida");
                return
            }
            alert("Publicacion creada exitosamente")

        }catch (error) {
            console.error("Error:", error);
            document.getElementById("responseMessage").innerText = "Error de conexión";
        }


        //window.location.href = '/TablonAnuncios/tablon_anuncios.html';
    });


});