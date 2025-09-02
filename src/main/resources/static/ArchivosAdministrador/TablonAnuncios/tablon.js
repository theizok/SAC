// tablon.js (versión mejorada)
document.addEventListener("DOMContentLoaded", async function () {
    const publicacionesContainer = document.getElementById("contenedor-publicaciones");
    const filtroOpciones = document.getElementById("filtro-opciones");

    // ---------- CSRF helper ----------
    function getCsrfToken() {
        // 1) meta tag <meta name="csrf-token" content="...">
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content) return meta.content;

        // 2) cookie (Spring suele exponer XSRF-TOKEN)
        const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (match) return decodeURIComponent(match[2]);

        return null;
    }
    const csrfToken = getCsrfToken();

    // ---------- utilitarios ----------
    function escapeHtml(text) {
        if (text == null) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getInitials(name) {
        if (!name) return "";
        const parts = String(name).trim().split(/\s+/);
        if (parts.length === 1) return (parts[0].slice(0,2)).toUpperCase();
        return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    }

    function formatFecha(fechaRaw) {
        if (!fechaRaw) return "";
        try {
            const d = new Date(fechaRaw);
            if (isNaN(d.getTime())) return String(fechaRaw);
            return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
        } catch (e) {
            return String(fechaRaw);
        }
    }

    // ---------- cargar publicaciones ----------
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
            publicacionesContainer.innerHTML = ""; // limpiar

            if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
                publicacionesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-bullhorn"></i><p>No hay publicaciones disponibles.</p></div>';
                return;
            }

            publicaciones.forEach(publicacion => {
                // id robusto
                const id =
                    publicacion.idpublicacion ??
                    publicacion.idPublicacion ??
                    publicacion.id ??
                    null;

                const titulo = publicacion.titulo ?? "";
                const contenido = publicacion.contenido ?? "";
                const tipoCuenta = publicacion.tipo_cuenta ?? publicacion.tipoCuenta ?? publicacion.tipo ?? "N/A";
                const nombreAutor = publicacion.nombre ?? publicacion.nombre_autor ?? "Anónimo";
                const fechaText = formatFecha(publicacion.fecha ?? publicacion.fechaPublicacion ?? publicacion.fechaPublicacionRaw);

                // crear nodo
                const divPublicacion = document.createElement("div");
                divPublicacion.className = "publicacion";
                if (id !== null) divPublicacion.dataset.id = String(id);

                // innerHTML con estructura limpia (coincide con CSS mejorado)
                divPublicacion.innerHTML = `
                  <div class="publicacion-header">
                    <h3>${escapeHtml(titulo)}</h3>
                    <div class="header-actions">
                      <button class="btn-eliminar" title="Eliminar publicación" aria-label="Eliminar publicación">✕</button>
                    </div>
                  </div>

                  <div class="publicacion-body">
                    <div class="publicacion-meta">
                      <div class="autor">
                        <div class="avatar" aria-hidden="true">${escapeHtml(getInitials(nombreAutor))}</div>
                        <div class="autor-info">
                          <div class="autor-nombre">${escapeHtml(nombreAutor)}</div>
                          <div class="autor-tipo">${escapeHtml(tipoCuenta)}</div>
                        </div>
                      </div>

                      <div class="publicacion-fecha">${escapeHtml(fechaText)}</div>
                    </div>

                    <div class="publicacion-content">${escapeHtml(contenido)}</div>
                  </div>
                `;

                publicacionesContainer.appendChild(divPublicacion);
            });
        } catch (error) {
            console.error("Error al cargar publicaciones:", error);
            publicacionesContainer.innerHTML = '<div class="empty-state"><p>Error al cargar las publicaciones. Revisa la consola.</p></div>';
        }
    }

    // ---------- eliminar publicación (delegación) ----------
    publicacionesContainer.addEventListener("click", async (event) => {
        const btn = event.target.closest(".btn-eliminar");
        if (!btn) return;

        // buscar el contenedor .publicacion
        const card = btn.closest(".publicacion");
        if (!card) {
            alert("No se encontró la publicación en el DOM.");
            return;
        }

        const id = card.dataset.id;
        if (!id) {
            alert("No se pudo obtener el identificador de la publicación.");
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas eliminar esta publicación?");
        if (!confirmar) return;

        try {
            // headers con CSRF si existe
            const headers = {};
            if (csrfToken) {
                headers["X-XSRF-TOKEN"] = csrfToken;
                headers["X-CSRF-TOKEN"] = csrfToken;
            }
            headers["Content-Type"] = "application/json";

            const res = await fetch(`/api/administrador/eliminarPublicacion?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
                credentials: "same-origin",
                headers
            });

            if (!res.ok) {
                // intentar leer detalle del servidor
                let detalle = "";
                try {
                    detalle = await res.text();
                } catch (e) { /* noop */ }

                console.error("Eliminar falló:", res.status, detalle);
                alert("No se pudo eliminar la publicación. " + (detalle || `Código ${res.status}`));
                return;
            }

            // éxito: quitar del DOM con pequeña animación
            card.style.transition = "transform 220ms ease, opacity 220ms ease";
            card.style.transform = "translateY(-8px)";
            card.style.opacity = "0";
            setTimeout(() => card.remove(), 220);

            // opcional: notificar al usuario
            // alert("Publicación eliminada correctamente");
        } catch (err) {
            console.error("Error al eliminar la publicación:", err);
            alert("Error al eliminar la publicación. Revisa la consola.");
        }
    });

    // ---------- filtros UI ----------
    const opcionesFiltro = document.querySelectorAll('#filtro-opciones a');
    opcionesFiltro.forEach(opcion => {
        opcion.addEventListener('click', function (e) {
            e.preventDefault();
            const filtro = this.getAttribute('data-filter');
            obtenerPublicaciones(filtro);
        });
    });

    // ---------- boton crear ----------
    const btnCrear = document.getElementById('btn-crear');
    if (btnCrear) {
        btnCrear.addEventListener('click', function () {
            window.location.href = '../CrearPublicacion/crear_publi.html';
        });
    }

    // cargar inicial
    obtenerPublicaciones("todos");
});
