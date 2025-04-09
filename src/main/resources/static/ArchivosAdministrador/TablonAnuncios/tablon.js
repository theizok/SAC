// Evento al cargar el DOM
document.addEventListener("DOMContentLoaded", async function () {
    const publicacionesContainer = document.getElementById("contenedor-publicaciones");
    const filtroOpciones = document.getElementById("filtro-opciones");

    // Función para obtener y mostrar publicaciones según el filtro
    async function obtenerPublicaciones(filtro) {
        let apiUrlBase = "";

        switch (filtro) {
            case "administrador":
                apiUrlBase = "http://localhost:8080/api/tablon/publicacionesAdministrador";
                break;
            case "residentes":
                apiUrlBase = "http://localhost:8080/api/tablon/publicacionesResidentes";
                break;
            case "propietarios":
                apiUrlBase = "http://localhost:8080/api/tablon/publicacionesPropietarios";
                break;
            default:
                apiUrlBase = "http://localhost:8080/api/tablon/publicacionesAll";
        }

        try {
            console.log("URL de la API:", apiUrlBase);
            const response = await fetch(apiUrlBase);
            if (!response.ok) {
                throw new Error("Error al obtener publicaciones");
            }

            const publicaciones = await response.json();

            publicacionesContainer.innerHTML = ""; // Limpiar anteriores

            if (publicaciones.length === 0) {
                publicacionesContainer.innerHTML = "<p>No hay publicaciones disponibles.</p>";
                return;
            }

            // Crear y agregar cada publicación
            publicaciones.forEach(publicacion => {
                const divPublicacion = document.createElement("div");
                divPublicacion.className = "publicacion";
                divPublicacion.setAttribute("data-id", publicacion.idPublicacion);

                divPublicacion.innerHTML = `
                    <div class="publicacion-header">
                        <h3>${publicacion.titulo}</h3>
                        <button class="btn-eliminar" title="Eliminar publicación">×</button>
                    </div>
                    <div class="publicacion-body">
                        <p><strong>Por:</strong> ${publicacion.tipo_cuenta} - ${publicacion.nombre} 
                        <span class="fecha"><strong>Fecha:</strong> ${publicacion.fecha}</span></p>
                        <p>${publicacion.contenido}</p>
                    </div>
                `;

                // Agregar evento de eliminar a cada botón individual
                const btnEliminar = divPublicacion.querySelector(".btn-eliminar");
                btnEliminar.addEventListener("click", async () => {
                    const confirmar = confirm("¿Estás seguro de que deseas eliminar esta publicación?");
                    if (!confirmar) return;

                    try {
                        console.log("ID a eliminar:", publicacion.idpublicacion);
                        const response = await fetch(`http://localhost:8080/api/administrador/eliminarPublicacion?id=${publicacion.idPublicacion}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        if (!response.ok) {
                            throw new Error("Error al eliminar la publicación");
                        }

                        alert("Publicación eliminada correctamente");
                        divPublicacion.remove(); // Eliminar del DOM
                    } catch (error) {
                        console.error(error);
                        alert("Error al eliminar la publicación");
                    }
                });

                publicacionesContainer.appendChild(divPublicacion);
            });
        } catch (error) {
            console.error("Error al cargar publicaciones:", error);
            publicacionesContainer.innerHTML = "<p>Error al cargar las publicaciones.</p>";
        }
    }

    // Manejo de filtros de publicaciones
    const opcionesFiltro = document.querySelectorAll('#filtro-opciones a');
    opcionesFiltro.forEach(opcion => {
        opcion.addEventListener('click', function (e) {
            e.preventDefault();
            const filtro = this.getAttribute('data-filter');
            obtenerPublicaciones(filtro);
        });
    });

    // Evento para botón de crear publicación
    const btnCrear = document.getElementById('btn-crear');
    if (btnCrear) {
        btnCrear.addEventListener('click', function () {
            window.location.href = '/api/tablon/crearPublicacion';
        });
    }

    // Cargar publicaciones iniciales (todos)
    obtenerPublicaciones("todos");
});
