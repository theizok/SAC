document.addEventListener("DOMContentLoaded", () => {
    const userType = sessionStorage.getItem("userType");
    const idCuenta = sessionStorage.getItem("idCuenta");
    const rol = (userType || "").toLowerCase();

    let apiUrl = "";
    if (rol === "residente") apiUrl = "/api/residente/obtenerMensajes";
    else if (rol === "propietario") apiUrl = "/api/propietario/obtenerMensajes";
    else console.warn("Rol no reconocido:", userType);

    const tabEnviados = document.getElementById("tab-enviados");
    const tabRecibidos = document.getElementById("tab-recibidos");
    const userSearchInput = document.getElementById("userSearchInput");
    const areaTitulo = document.getElementById("areaTitulo");
    const areaContenido = document.getElementById("areaContenido");
    const emptyStateEl = document.getElementById("emptyState");

    let allMessages = []; // original
    let filteredMessages = []; // actualmente mostradas

    // ====== Helpers ======
    function escapeHtml(text) {
        if (text === undefined || text === null) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function safeText(s) {
        return s === undefined || s === null ? "" : String(s);
    }

    function formatFecha(fechaISO) {
        if (!fechaISO) return '';
        try {
            const d = new Date(fechaISO);
            if (isNaN(d.getTime())) return String(fechaISO);
            return d.toLocaleString('es-CO', {
                day:'2-digit', month:'2-digit', year:'numeric',
                hour:'2-digit', minute:'2-digit'
            });
        } catch (e) {
            return String(fechaISO);
        }
    }

    function getCuentaIdFromMensaje(m) {
        if (!m) return null;
        const c = m.cuenta;
        try {
            if (c !== undefined && c !== null) {
                if (typeof c === 'number') return Number(c);
                if (typeof c === 'string' && /^[0-9]+$/.test(c)) return Number(c);
                if (typeof c === 'object') {
                    if (c.idCuenta) return Number(c.idCuenta);
                    if (c.idcuenta) return Number(c.idcuenta);
                    if (c.id) return Number(c.id);
                    if (c.id_cuenta) return Number(c.id_cuenta);
                }
            }
            if (m.idCuenta) return Number(m.idCuenta);
            if (m.idcuenta) return Number(m.idcuenta);
            if (m.id_cuenta) return Number(m.id_cuenta);
        } catch (e) {  }
        return null;
    }

    // determina el remitente con múltiples fallback
    function getRemitente(m) {
        if (!m) return "Administración";
        // prioridades
        if (m.remitenteNombre) return safeText(m.remitenteNombre);
        if (m.remitente) return safeText(m.remitente);
        if (m.remitente_nombre) return safeText(m.remitente_nombre);
        // si la cuenta incluye nombre
        if (m.cuenta && typeof m.cuenta === 'object') {
            const c = m.cuenta;
            if (c.nombre) return safeText(c.nombre);
            if (c.name) return safeText(c.name);
            if (c.nombre_residente) return safeText(c.nombre_residente);
            if (c.nombre_autor) return safeText(c.nombre_autor);
        }
        // fallback a Cuenta #id
        const cid = getCuentaIdFromMensaje(m);
        if (cid !== null) return `Cuenta #${cid}`;
        return "Administración";
    }

    // timestamp para ordenar robustamente
    function getTimestampFromMensaje(m) {
        const candidates = [m.fecha, m.timestamp, m.createdAt];
        for (const v of candidates) {
            if (!v && v !== 0) continue;
            if (typeof v === 'number' && !Number.isNaN(v)) return Number(v);
            if (typeof v === 'string') {
                if (/^[0-9]+$/.test(v)) return Number(v);
                const d = new Date(v);
                if (!isNaN(d.getTime())) return d.getTime();
            }
        }
        return 0;
    }

    function sortNewestFirst(arr) {
        return arr.slice().sort((a,b) => getTimestampFromMensaje(b) - getTimestampFromMensaje(a));
    }

    // ====== Render ======
    function clearListAndPanel() {
        if (areaTitulo) areaTitulo.innerHTML = "";
        if (areaContenido) areaContenido.innerHTML = emptyStateMarkup();
    }

    function emptyStateMarkup() {
        return `<div class="empty-state" id="emptyState">
                    <i class="fas fa-envelope-open-text"></i>
                    <p>Selecciona un mensaje para ver su contenido</p>
                </div>`;
    }

    function renderizarMensajes(list) {
        clearListAndPanel();
        if (!Array.isArray(list) || list.length === 0) return;

        // orden: aseguramos newest first
        const ordered = sortNewestFirst(list);

        ordered.forEach((m, index) => {
            const mid = m.idMensaje ?? m.id ?? m.id_mensaje ?? index;
            const remitente = escapeHtml(getRemitente(m));
            const asunto = escapeHtml(safeText(m.asunto));
            const previewRaw = safeText(m.contenido || m.mensaje || '');
            const previewShort = previewRaw.length > 150 ? escapeHtml(previewRaw.substring(0,150)) + '...' : escapeHtml(previewRaw);

            // item card
            const card = document.createElement("div");
            card.className = "titulo-mensaje";
            card.dataset.id = mid;
            card.innerHTML = `
                <div class="mensaje-header">
                    <span class="mensaje-remitente">${remitente}</span>
                    <span class="message-date">${escapeHtml(formatFecha(m.fecha))}</span>
                </div>
                <div class="mensaje-asunto">${asunto}</div>
                <div class="mensaje-contenido">${previewShort}</div>
            `;

            // detail panel (hidden initially)
            const detail = document.createElement("div");
            detail.className = "contenido-mensaje";
            detail.id = `mensaje-${mid}`;
            const respuestaHtml = m.respuesta ? `
                <hr/>
                <div class="respuesta-usuario">
                    <h4>Respuesta de administración</h4>
                    <small>${escapeHtml(formatFecha(m.fechaRespuesta))}</small>
                    <div class="respuesta-texto">${escapeHtml(m.respuesta)}</div>
                </div>` : "";

            detail.innerHTML = `
                <div class="message-detail">
                    <h2>${asunto}</h2>
                    <div class="message-detail-meta">
                        <span><strong>De:</strong> ${remitente}</span>
                        <span><strong>Fecha:</strong> ${escapeHtml(formatFecha(m.fecha))}</span>
                    </div>
                    <div class="message-body">${escapeHtml(safeText(m.contenido || m.mensaje || ''))}</div>
                    ${respuestaHtml}
                </div>
            `;

            // click behavior (select)
            card.addEventListener("click", () => {
                // hide empty
                const empty = document.querySelector('.empty-state');
                if (empty) empty.style.display = 'none';
                // toggle active classes
                document.querySelectorAll('.titulo-mensaje').forEach(n => n.classList.remove('active'));
                document.querySelectorAll('.contenido-mensaje').forEach(n => n.classList.remove('active'));
                card.classList.add('active');
                detail.classList.add('active');
                // focus accessibility
                detail.focus?.();
            });

            areaTitulo.appendChild(card);
            areaContenido.appendChild(detail);
        });

        // activate first
        const firstCard = areaTitulo.querySelector('.titulo-mensaje');
        const firstDetail = areaContenido.querySelector('.contenido-mensaje');
        if (firstCard && firstDetail) {
            firstCard.classList.add('active');
            firstDetail.classList.add('active');
            const empty = document.getElementById('emptyState');
            if (empty) empty.style.display = 'none';
        }
    }

    // ====== Fetching ======
    async function obtenerMensajesEnviados() {
        if (!apiUrl) return;
        try {
            const resp = await fetch(`${apiUrl}?idCuenta=${encodeURIComponent(idCuenta)}`, { credentials: 'include' });
            if (!resp.ok) throw new Error("Error al obtener mensajes enviados");
            const data = await resp.json();
            allMessages = Array.isArray(data) ? data : [];
            filteredMessages = allMessages.slice();
            // default: show newest first
            renderizarMensajes(filteredMessages);
        } catch (e) {
            console.error(e);
            clearListAndPanel();
            if (areaTitulo) areaTitulo.innerHTML = `<div class="empty-state"><p>Error al cargar mensajes.</p></div>`;
        }
    }

    async function obtenerMensajesRecibidos() {
        if (!allMessages.length) await obtenerMensajesEnviados();
        const recibidos = (allMessages || []).filter(m => m.respuesta && String(m.respuesta).trim() !== '');
        filteredMessages = recibidos.slice();
        renderizarMensajes(filteredMessages);
    }

    // ====== Search (debounced) ======
    if (userSearchInput) {
        let timer = null;
        userSearchInput.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const q = String(e.target.value || '').trim().toLowerCase();
                if (!q) {
                    // reinvocar la pestaña activa
                    if (tabEnviados?.classList.contains('active')) obtenerMensajesEnviados();
                    else obtenerMensajesRecibidos();
                    return;
                }
                // fuente según tab
                const source = tabEnviados?.classList.contains('active') ? allMessages : (allMessages || []).filter(m => m.respuesta && String(m.respuesta).trim() !== '');
                const matched = (source || []).filter(m => {
                    const asunto = (m.asunto || '').toString().toLowerCase();
                    const contenido = (m.contenido || m.mensaje || '').toString().toLowerCase();
                    const remit = (m.remitente || (m.cuenta?.nombre || '')).toString().toLowerCase();
                    return asunto.includes(q) || contenido.includes(q) || remit.includes(q);
                });
                renderizarMensajes(matched);
            }, 220);
        });
    }

    // ====== Tabs ======
    function activarTab(tab) {
        if (!tabEnviados || !tabRecibidos) return;
        tabEnviados.classList.remove('active');
        tabRecibidos.classList.remove('active');
        tab.classList.add('active');
    }
    tabEnviados?.addEventListener('click', () => {
        activarTab(tabEnviados);
        if (userSearchInput && userSearchInput.value.trim()) userSearchInput.dispatchEvent(new Event('input'));
        else obtenerMensajesEnviados();
    });
    tabRecibidos?.addEventListener('click', () => {
        activarTab(tabRecibidos);
        if (userSearchInput && userSearchInput.value.trim()) userSearchInput.dispatchEvent(new Event('input'));
        else obtenerMensajesRecibidos();
    });


    obtenerMensajesEnviados();
});
