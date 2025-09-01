document.addEventListener("DOMContentLoaded", async function () {
    const publicacionesContainer = document.getElementById("contenedor-publicaciones");
    const filtroOpciones = document.getElementById("filtro-opciones");

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content) return meta.content;

        const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (match) return decodeURIComponent(match[2]);

        return null;
    }

    const csrfToken = getCsrfToken();

    // Función para obtener y mostrar publicaciones según el filtro
    async function obtenerPublicaciones(filtro) {
        let apiUrlBase = "";

        switch (filtro) {
            case "administrador":
                apiUrlBase = "/api/tablon/publicacionesAdministrador";
                break;
            case "residentes":
                apiUrlBase = "/api/tablon/publicacionesResidentes";
                break;
            case "propietarios":
                apiUrlBase = "/api/tablon/publicacionesPropietarios";
                break;
            default:
                apiUrlBase = "/api/tablon/publicacionesAll";
        }

        try {
            console.log("URL de la API:", apiUrlBase);
            const response = await fetch(apiUrlBase, { credentials: "same-origin" });
            if (!response.ok) {
                throw new Error(`Error al obtener publicaciones: ${response.status}`);
            }

            const publicaciones = await response.json();

            publicacionesContainer.innerHTML = ""; // Limpiar anteriores

            if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
                publicacionesContainer.innerHTML = "<p>No hay publicaciones disponibles.</p>";
                return;
            }

            publicaciones.forEach(publicacion => {
                // obtener id de forma robusta (soporta varias formas que devuelva el backend)
                const id =
                    publicacion.idpublicacion ??
                    publicacion.idPublicacion ??
                    publicacion.idPublicacion ??
                    publicacion.idpublicacion ??
                    publicacion.id;

                const divPublicacion = document.createElement("div");
                divPublicacion.className = "publicacion";
                divPublicacion.dataset.id = id ?? "";

                // normalizar fecha si viene
                let fechaText = "";
                if (publicacion.fecha) {
                    try {
                        const d = new Date(publicacion.fecha);
                        fechaText = isNaN(d.getTime()) ? String(publicacion.fecha) : d.toLocaleString();
                    } catch (e) {
                        fechaText = String(publicacion.fecha);
                    }
                }

                const tipoCuenta = publicacion.tipo_cuenta ?? publicacion.tipoCuenta ?? publicacion.tipo ?? "N/A";
                const nombreAutor = publicacion.nombre ?? publicacion.nombre_autor ?? "Anónimo";
                const titulo = publicacion.titulo ?? "";
                const contenido = publicacion.contenido ?? "";

                divPublicacion.innerHTML = `
                    <div class="publicacion-header">
                        <h3>${escapeHtml(titulo)}</h3>
                        <button class="btn-eliminar" title="Eliminar publicación">×</button>
                    </div>
                    <div class="publicacion-body">
                        <p>
                            <strong>Por:</strong> ${escapeHtml(tipoCuenta)} - ${escapeHtml(nombreAutor)}
                            <span class="fecha"><strong>Fecha:</strong> ${escapeHtml(fechaText)}</span>
                        </p>
                        <p>${escapeHtml(contenido)}</p>
                    </div>
                `;

                // botón eliminar
                const btnEliminar = divPublicacion.querySelector(".btn-eliminar");
                btnEliminar.addEventListener("click", async () => {
                    const confirmar = confirm("¿Estás seguro de que deseas eliminar esta publicación?");
                    if (!confirmar) return;

                    if (!id) {
                        alert("No se pudo obtener el identificador de la publicación.");
                        return;
                    }

                    try {
                        console.log("Intentando eliminar id:", id);
                        const headers = {};
                        if (csrfToken) {
                            // Spring suele esperar header 'X-XSRF-TOKEN' o 'X-CSRF-TOKEN' según configuración
                            headers["X-XSRF-TOKEN"] = csrfToken;
                            headers["X-CSRF-TOKEN"] = csrfToken; // redundante pero seguro
                        }

                        const response = await fetch(`/api/administrador/eliminarPublicacion?id=${encodeURIComponent(id)}`, {
                            method: "DELETE",
                            credentials: "same-origin",
                            headers: headers
                        });

                        if (!response.ok) {
                            // intentar leer texto/json del backend para mostrar razón
                            let detail = "";
                            try {
                                detail = await response.text();
                            } catch (e) { /* noop */ }
                            console.error("Eliminar falló:", response.status, detail);
                            alert("Error al eliminar la publicación: " + (detail || response.status));
                            return;
                        }

                        alert("Publicación eliminada correctamente");
                        divPublicacion.remove(); // eliminar del DOM
                    } catch (error) {
                        console.error("Error al eliminar la publicación:", error);
                        alert("Error al eliminar la publicación. Revisa la consola.");
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

    const btnCrear = document.getElementById('btn-crear');
    if (btnCrear) {
        btnCrear.addEventListener('click', function () {
            window.location.href = '../CrearPublicacion/crear_publi.html';
        });
    }

    obtenerPublicaciones("todos");

    function escapeHtml(text) {
        if (text == null) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
