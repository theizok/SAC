document.addEventListener("DOMContentLoaded", () => {
    const userType = sessionStorage.getItem("userType");
    const idCuenta = sessionStorage.getItem("idCuenta");
    const rol = userType?.toLowerCase() || "";

    let apiUrl = "";
    switch (rol) {
        case "residente":
            apiUrl = "http://localhost:8080/api/residente/obtenerMensajes";
            break;
        case "propietario":
            apiUrl = "http://localhost:8080/api/propietario/obtenerMensajes";
            break;
        default:
            console.warn("Rol no reconocido:", userType);
    }

    const tabEnviados = document.getElementById("tab-enviados");
    const tabRecibidos = document.getElementById("tab-recibidos");
    const userSearchInput = document.getElementById("userSearchInput"); // puede ser null si no insertaste el HTML

    let allMessages = []; // almacenamos la lista original traída del backend

    function activarTab(tab) {
        [tabEnviados, tabRecibidos].forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
    }

    function formatFecha(fechaISO) {
        if (!fechaISO) return '';
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString();
    }

    // Renderiza la lista pasada (ya filtrada)
    function renderizarMensajes(data) {
        const lista = document.getElementById("areaTitulo");
        const panel = document.getElementById("areaContenido");
        lista.innerHTML = "";
        panel.innerHTML = `<div class="empty-state" id="emptyState">
                               <i class="fas fa-envelope-open-text"></i>
                               <p>Selecciona un mensaje para ver su contenido</p>
                           </div>`;

        if (!Array.isArray(data) || data.length === 0) return;

        data.forEach((m) => {
            const card = document.createElement("div");
            card.className = "titulo-mensaje";
            card.dataset.id = m.idMensaje;

            // Usamos textContent para evitar inyección de HTML
            const remitente = m.remitente || (m.cuenta?.nombre || "Administración");
            const asunto = m.asunto || '';
            const contenidoCorto = (m.contenido || '').length > 150 ? (m.contenido || '').substring(0, 150) + "..." : (m.contenido || '');

            card.innerHTML = `
                <div class="mensaje-header">
                    <span class="mensaje-remitente">${remitente}</span>
                    <span>${ formatFecha(m.fecha) }</span>
                </div>
                <div class="mensaje-asunto">${asunto}</div>
                <div class="mensaje-contenido">${contenidoCorto}</div>
            `;

            const detail = document.createElement("div");
            detail.className = "contenido-mensaje";
            detail.id = `mensaje-${m.idMensaje}`;

            const respuestaHtml = m.respuesta ? `
                <hr/>
                <div class="respuesta-usuario">
                    <h4>Respuesta de administración</h4>
                    <small>${ formatFecha(m.fechaRespuesta) }</small>
                    <div class="respuesta-texto">${m.respuesta}</div>
                </div>
            ` : '';

            detail.innerHTML = `
                <div class="message-detail">
                    <h2>${asunto}</h2>
                    <div class="message-meta">
                        <span><strong>De:</strong> ${remitente}</span>
                        <span><strong>Fecha:</strong> ${ formatFecha(m.fecha) }</span>
                    </div>
                    <div class="message-body">${m.contenido || ''}</div>
                    ${respuestaHtml}
                </div>
            `;

            lista.appendChild(card);
            panel.appendChild(detail);

            card.addEventListener("click", () => {
                const empty = document.getElementById("emptyState");
                if (empty) empty.style.display = "none";
                document.querySelectorAll(".titulo-mensaje").forEach(x => x.classList.remove("active"));
                document.querySelectorAll(".contenido-mensaje").forEach(x => x.classList.remove("active"));
                card.classList.add("active");
                detail.classList.add("active");
            });
        });

        // activar primero
        const firstCard = document.querySelector('.titulo-mensaje');
        const firstDetail = document.querySelector('.contenido-mensaje');
        if (firstCard && firstDetail) {
            firstCard.classList.add('active');
            firstDetail.classList.add('active');
            const empty = document.getElementById('emptyState');
            if (empty) empty.style.display = 'none';
        }
    }

    // trae mensajes desde API y guarda en allMessages
    async function obtenerMensajesEnviados() {
        if (!apiUrl) return;
        try {
            const resp = await fetch(`${apiUrl}?idCuenta=${idCuenta}`, {
                headers: { "Content-Type": "application/json" }
            });
            if (!resp.ok) throw new Error("Error al obtener mensajes enviados");
            const data = await resp.json();
            allMessages = Array.isArray(data) ? data : [];
            // mostramos todos (Enviados)
            renderizarMensajes(allMessages);
        } catch (e) {
            console.error(e);
        }
    }

    // Filtrado: recibidos = mensajes del usuario que tienen respuesta
    async function obtenerMensajesRecibidos() {
        if (!apiUrl) return;
        try {
            if (!allMessages.length) {
                // si aún no cargamos, cargar los enviados (la fuente es la misma)
                await obtenerMensajesEnviados();
            }
            const filtrados = (Array.isArray(allMessages) ? allMessages : []).filter(m => m.respuesta && m.respuesta.trim() !== '');
            renderizarMensajes(filtrados);
        } catch (e) {
            console.error(e);
        }
    }

    // --------- Buscador para usuario (filtrado local con debounce) ----------
    if (userSearchInput) {
        let debounceTimer = null;
        userSearchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // Si el query está vacío, recargar la pestaña activa (Enviados/Recibidos)
                if (!q) {
                    if (tabEnviados.classList.contains('active')) obtenerMensajesEnviados();
                    else obtenerMensajesRecibidos();
                    return;
                }

                // Selecciona fuente según pestaña
                let source = [];
                if (tabEnviados.classList.contains('active')) {
                    source = allMessages;
                } else {
                    source = (Array.isArray(allMessages) ? allMessages : []).filter(m => m.respuesta && m.respuesta.trim() !== '');
                }

                const filtered = (source || []).filter(m => {
                    const asunto = (m.asunto || '').toString().toLowerCase();
                    const contenido = (m.contenido || '').toString().toLowerCase();
                    const remit = (m.remitente || (m.cuenta?.nombre || '')).toString().toLowerCase();
                    return asunto.includes(q) || contenido.includes(q) || remit.includes(q);
                });

                renderizarMensajes(filtered);
            }, 220);
        });
    }

    // eventos tabs
    tabEnviados.addEventListener("click", () => {
        activarTab(tabEnviados);
        // si hay query en buscador, ejecutar filtro local
        if (userSearchInput && userSearchInput.value.trim()) {
            userSearchInput.dispatchEvent(new Event('input'));
        } else {
            obtenerMensajesEnviados();
        }
    });
    tabRecibidos.addEventListener("click", () => {
        activarTab(tabRecibidos);
        if (userSearchInput && userSearchInput.value.trim()) {
            userSearchInput.dispatchEvent(new Event('input'));
        } else {
            obtenerMensajesRecibidos();
        }
    });

    // inicio: cargar Enviados por defecto
    obtenerMensajesEnviados();
});
