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
                publicacionesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-bullhorn"></i>
                        <h3>No hay publicaciones disponibles</h3>
                        <p>No se encontraron anuncios para mostrar</p>
                    </div>
                `;
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
                        <div class="publicacion-meta">
                            <span class="publicacion-author">${publicacion.tipo_cuenta} - ${publicacion.nombre}</span>
                            <span class="publicacion-date">${publicacion.fecha}</span>
                        </div>
                        <div class="publicacion-content">${publicacion.contenido}</div>
                    </div>
                `;

                publicacionesContainer.appendChild(divPublicacion);
            });
        } catch (error) {
            console.error("Error al cargar publicaciones:", error);
            publicacionesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar publicaciones</h3>
                    <p>No se pudieron cargar los anuncios. Intente nuevamente más tarde.</p>
                </div>
            `;
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