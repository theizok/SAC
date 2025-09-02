document.addEventListener("DOMContentLoaded", async () => {
    const areaTitulo = document.getElementById("areaTitulo");
    const areaContenido = document.getElementById("areaContenido");
    const searchInput = document.querySelector('.search-box input'); // asumimos existe
    const filterSelect = document.querySelector('.filter-select');

    const modal = document.getElementById("replyModal");
    const modalAsunto = modal ? modal.querySelector('#modalAsunto') : null;
    const modalFrom = modal ? modal.querySelector('#modalFrom') : null;
    const replyText = document.getElementById("replyText");
    const sendReplyBtn = document.getElementById("sendReply");
    const cancelReplyBtn = document.getElementById("cancelReply");
    const replyError = document.getElementById("replyError");
    const modalOverlayCloseButtons = modal ? modal.querySelectorAll('[data-close]') : [];

    let currentReplyMessageId = null;
    let allMessages = [];

    // Mapa idCuenta -> nombre (llenado al iniciar)
    const userMap = new Map();

    // ---------- utilidades ----------
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function extractIdFromUser(user) {
        if (!user) return null;
        const tries = ['idCuenta','idcuenta','idCuentaUsuario','idCuentaAdministrador','id','idUsuario','id_usuario','id_cuenta'];
        for (const k of tries) if (user[k] !== undefined && user[k] !== null && String(user[k]).length) return Number(user[k]);
        for (const k of Object.keys(user)) {
            if (typeof user[k] === 'number' && !Number.isNaN(user[k])) return user[k];
            if (typeof user[k] === 'string' && /^[0-9]+$/.test(user[k])) return Number(user[k]);
        }
        return null;
    }
    function extractNameFromUser(user) {
        if (!user) return null;
        const tries = ['remitenteNombre','remitente_nombre','nombre','nombreAdministrador','nombreUsuario','name','fullName','nombreCompleto','nombre_propietario','correo','email'];
        for (const k of tries) if (user[k]) return String(user[k]);
        for (const k of Object.keys(user)) {
            if (typeof user[k] === 'string' && user[k].length > 1 && /[a-zA-Z]/.test(user[k])) return user[k];
        }
        return null;
    }

    function getCuentaIdFromMensaje(mensaje) {
        if (!mensaje) return null;
        try {
            if (mensaje.cuenta !== undefined && mensaje.cuenta !== null) {
                const c = mensaje.cuenta;
                if (typeof c === 'number') return Number(c);
                if (typeof c === 'string' && /^[0-9]+$/.test(c)) return Number(c);
                if (typeof c === 'object') {
                    if (c.idCuenta !== undefined && c.idCuenta !== null) return Number(c.idCuenta);
                    if (c.idcuenta !== undefined && c.idcuenta !== null) return Number(c.idcuenta);
                    if (c.id !== undefined && c.id !== null) return Number(c.id);
                    if (c.idCuentaRespondido !== undefined && c.idCuentaRespondido !== null) return Number(c.idCuentaRespondido);
                    if (c.id_cuenta !== undefined && c.id_cuenta !== null) return Number(c.id_cuenta);
                }
            }
            if (mensaje.idCuenta !== undefined && mensaje.idCuenta !== null) return Number(mensaje.idCuenta);
            if (mensaje.idcuenta !== undefined && mensaje.idcuenta !== null) return Number(mensaje.idcuenta);
            if (mensaje.idCuentaRemitente !== undefined && mensaje.idCuentaRemitente !== null) return Number(mensaje.idCuentaRemitente);
            if (mensaje.id_cuenta !== undefined && mensaje.id_cuenta !== null) return Number(mensaje.id_cuenta);
        } catch (e) { /* ignore */ }
        return null;
    }

    function accountNameForId(id) {
        if (id === null || id === undefined) return null;
        const key = Number(id);
        return userMap.has(key) ? userMap.get(key) : null;
    }

    function getRemitente(mensaje) {
        if (!mensaje) return 'Administración';

        // prioridad absoluto: campos ya resueltos por backend
        if (mensaje.remitenteNombre && String(mensaje.remitenteNombre).trim()) return String(mensaje.remitenteNombre).trim();
        if (mensaje.remitente_nombre && String(mensaje.remitente_nombre).trim()) return String(mensaje.remitente_nombre).trim();

        // si mensaje.remitente (string)
        if (mensaje.remitente && String(mensaje.remitente).trim()) return String(mensaje.remitente).trim();

        // buscar por idCuenta en el mapa de usuarios
        const cuentaId = getCuentaIdFromMensaje(mensaje);
        if (cuentaId !== null) {
            const name = accountNameForId(cuentaId);
            if (name) return name;
        }

        // si mensaje.cuenta tiene nombre
        if (mensaje.cuenta && typeof mensaje.cuenta === 'object') {
            const c = mensaje.cuenta;
            if (c.nombre && String(c.nombre).trim()) return String(c.nombre).trim();
            if (c.name && String(c.name).trim()) return String(c.name).trim();
            if (c.nombre_residente && String(c.nombre_residente).trim()) return String(c.nombre_residente).trim();
            if (c.nombre_autor && String(c.nombre_autor).trim()) return String(c.nombre_autor).trim();
            if (c.correo && String(c.correo).trim()) return String(c.correo).trim();
        }

        if (cuentaId !== null) return `Cuenta #${cuentaId}`;
        return 'Administración';
    }

    function formatFecha(fechaISO) {
        if (!fechaISO) return '';
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return String(fechaISO);
            return fecha.toLocaleDateString('es-CO', {
                day:'2-digit', month:'2-digit', year:'numeric',
                hour:'2-digit', minute:'2-digit'
            });
        } catch (e) { return String(fechaISO); }
    }

    // obtiene timestamp ms seguro desde un mensaje
    function getMessageTimestamp(m) {
        const candidates = [m?.fecha, m?.timestamp, m?.createdAt, m?.fechaPublicacion, m?.fecha_respuesta, m?.fechaRespuesta];
        for (const c of candidates) {
            if (c === undefined || c === null) continue;
            // números
            if (typeof c === 'number' && !Number.isNaN(c)) return Number(c);
            // string numérica
            if (typeof c === 'string' && /^[0-9]+$/.test(c)) return Number(c);
            // string ISO
            try {
                const d = new Date(c);
                if (!isNaN(d.getTime())) return d.getTime();
            } catch (e) {}
        }
        return 0;
    }

    // sort: order = 'newest' (default) or 'oldest'
    function sortMessages(arr, order = 'newest') {
        return arr.slice().sort((a,b) => {
            const ta = getMessageTimestamp(a);
            const tb = getMessageTimestamp(b);
            return order === 'oldest' ? (ta - tb) : (tb - ta);
        });
    }

    // ---------- Modal helpers ----------
    function openModal({ idMensaje, asunto = '', from = '' }) {
        currentReplyMessageId = idMensaje;
        if (modalAsunto) modalAsunto.textContent = asunto || '';
        if (modalFrom) modalFrom.textContent = from || '';
        if (replyText) replyText.value = '';
        if (replyError) replyError.style.display = 'none';
        if (modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => replyText?.focus(), 120);
            document.addEventListener('keydown', escHandler);
        }
    }
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        currentReplyMessageId = null;
        if (replyText) replyText.value = '';
        if (replyError) replyError.style.display = 'none';
        document.removeEventListener('keydown', escHandler);
    }
    function escHandler(e) { if (e.key === 'Escape') closeModal(); }
    modalOverlayCloseButtons?.forEach(btn => btn.addEventListener('click', (ev) => { ev.preventDefault(); closeModal(); }));
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

    // ---------- fetch usuarios y construir mapa ----------
    async function fetchUsuarios() {
        try {
            const resp = await fetch("/api/administrador/obtenerUsuarios", { credentials: 'include' });
            if (!resp.ok) throw new Error("No se pudo obtener usuarios");
            const usuarios = await resp.json();
            if (!Array.isArray(usuarios)) return;
            usuarios.forEach(u => {
                const id = extractIdFromUser(u);
                const name = extractNameFromUser(u) || `Cuenta ${id ?? '??'}`;
                if (id !== null && !Number.isNaN(id)) userMap.set(Number(id), name);
            });
        } catch (e) {
            console.warn("No fue posible cargar la lista de usuarios:", e);
        }
    }

    // ---------- filtrado + render central ----------
    function applyFilterAndRender() {
        let data = allMessages.slice();

        const sel = filterSelect ? filterSelect.value : 'all';
        // si en algún punto tu backend añade 'unread' y quieres filtrar por no leídos, aquí puedes implementarlo.
        // como pediste eliminar 'no leidos', no filtramos por eso.

        // búsqueda
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (q) {
            data = data.filter(m => {
                const sujeto = (m.asunto || '').toString().toLowerCase();
                const contenido = (m.contenido || m.mensaje || '').toString().toLowerCase();
                const remit = (m.remitente || m.remitenteNombre || accountNameForId(getCuentaIdFromMensaje(m)) || (m.cuenta?.nombre || '')).toString().toLowerCase();
                return sujeto.includes(q) || contenido.includes(q) || remit.includes(q);
            });
        }

        // ordenamiento
        const order = (sel === 'oldest') ? 'oldest' : 'newest';
        data = sortMessages(data, order);

        renderMensajesAdmin(data);
    }

    // ---------- fetch y render (base) ----------
    async function fetchMensajes() {
        try {
            const response = await fetch("/api/administrador/obtenerMensajes", { credentials: 'include' });
            if (!response.ok) throw new Error("Error al obtener todos los mensajes");
            const data = await response.json();
            allMessages = Array.isArray(data) ? data : [];
            // Por defecto: mostrar de más recientes a más antiguos
            if (filterSelect) filterSelect.value = 'all'; // por defecto
            applyFilterAndRender();
        } catch (e) {
            console.error("Error al cargar los mensajes:", e);
            if (areaTitulo) areaTitulo.innerHTML = '<div class="error-message">Error al cargar los mensajes. Por favor intente más tarde.</div>';
        }
    }

    function renderMensajesAdmin(data) {
        if (!areaTitulo || !areaContenido) return;
        areaTitulo.innerHTML = "";
        areaContenido.innerHTML = `<div class="empty-state">
            <i class="fas fa-comment-dots"></i>
            <h3>Selecciona un mensaje</h3>
            <p>Haz clic en un mensaje de la lista para ver su contenido</p>
        </div>`;
        if (!Array.isArray(data) || data.length === 0) return;

        data.forEach((mensaje) => {
            const id = mensaje.idMensaje ?? mensaje.id ?? mensaje.id_mensaje;
            const messageItem = document.createElement('div');
            messageItem.classList.add('message-item');
            messageItem.dataset.id = id;

            const fechaFormateada = formatFecha(mensaje.fecha);
            const remitenteDisplay = getRemitente(mensaje);

            // Header
            const headerHtml = `
                <div class="message-header">
                    <span class="message-sender">${ escapeHtml(remitenteDisplay) }</span>
                    <span class="message-date">${ escapeHtml(fechaFormateada) }</span>
                </div>
            `;

            const subjectHtml = `<div class="message-subject">${ escapeHtml(mensaje.asunto || '') }</div>`;
            const previewText = (mensaje.contenido || mensaje.mensaje || '');
            const previewHtml = `<div class="message-preview">${ escapeHtml(previewText.substring(0, 100)) }${ previewText.length > 100 ? '...' : '' }</div>`;

            messageItem.innerHTML = headerHtml + subjectHtml + previewHtml;

            // detalle
            const messageDetail = document.createElement('div');
            messageDetail.classList.add('message-detail');
            messageDetail.id = `mensaje-${id}`;

            const respuestaHtml = mensaje.respuesta ? `
                <div class="message-response">
                    <h4>Respuesta</h4>
                    <div class="response-meta"><small>Fecha: ${ escapeHtml(formatFecha(mensaje.fechaRespuesta)) }</small></div>
                    <div class="response-body">${ escapeHtml(mensaje.respuesta) }</div>
                </div>
            ` : '';

            const detailHtml = `
                <div class="message-detail-header">
                    <h2 class="message-detail-subject">${ escapeHtml(mensaje.asunto || '') }</h2>
                    <div class="message-detail-meta">
                        <span><strong>De:</strong> ${ escapeHtml(remitenteDisplay) }</span>
                        <span><strong>Fecha:</strong> ${ escapeHtml(fechaFormateada) }</span>
                    </div>
                </div>
                <div class="message-detail-content">
                    <p>${ escapeHtml(mensaje.contenido || '') }</p>
                    ${ respuestaHtml }
                </div>
                <div class="message-actions">
                    <button class="btn btn-reply" data-id="${ escapeHtml(String(id)) }"><i class="fas fa-reply"></i> Responder</button>
                    <button class="btn btn-delete" data-id="${ escapeHtml(String(id)) }"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            `;
            messageDetail.innerHTML = detailHtml;

            // selección
            messageItem.addEventListener('click', () => {
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) emptyState.style.display = 'none';
                document.querySelectorAll('.message-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll('.message-detail').forEach(detail => detail.classList.remove('active'));
                messageItem.classList.add('active');
                messageDetail.classList.add('active');
            });

            areaTitulo.appendChild(messageItem);
            areaContenido.appendChild(messageDetail);

            // listeners botones
            const replyBtn = messageDetail.querySelector('.btn-reply');
            const deleteBtn = messageDetail.querySelector('.btn-delete');

            if (replyBtn) {
                replyBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    openModal({ idMensaje: id, asunto: mensaje.asunto || '', from: getRemitente(mensaje) });
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (ev) => {
                    ev.stopPropagation();
                    const idToDelete = ev.currentTarget.dataset.id;
                    if (!confirm("¿Seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer.")) return;
                    try {
                        const resp = await fetch(`/api/administrador/eliminarMensaje?id=${encodeURIComponent(idToDelete)}`, { method: "DELETE", credentials: 'include' });
                        if (!resp.ok) {
                            const err = await resp.json().catch(()=>({message:'Error'}));
                            throw new Error(err.message || 'Error al eliminar');
                        }
                        // actualizar DOM
                        document.querySelector(`.message-item[data-id="${idToDelete}"]`)?.remove();
                        document.getElementById(`mensaje-${idToDelete}`)?.remove();
                        // actualizar allMessages
                        allMessages = allMessages.filter(m => {
                            const mid = m.idMensaje ?? m.id ?? m.id_mensaje;
                            return String(mid) !== String(idToDelete);
                        });
                        if (!document.querySelectorAll('.message-item').length) {
                            areaContenido.innerHTML = `<div class="empty-state">
                                <i class="fas fa-comment-dots"></i>
                                <h3>Selecciona un mensaje</h3>
                                <p>Haz clic en un mensaje de la lista para ver su contenido</p>
                            </div>`;
                        } else {
                            const firstItem = document.querySelector('.message-item');
                            const firstDetail = document.querySelector('.message-detail');
                            if (firstItem && firstDetail) { firstItem.classList.add('active'); firstDetail.classList.add('active'); }
                        }
                        alert("Mensaje eliminado.");
                    } catch (err) {
                        console.error(err);
                        alert("No se pudo eliminar el mensaje. Revisa la consola.");
                    }
                });
            }
        });

        // activar primero
        const firstItem = document.querySelector('.message-item');
        const firstDetail = document.querySelector('.message-detail');
        if (firstItem && firstDetail) {
            firstItem.classList.add('active');
            firstDetail.classList.add('active');
            const emptyState = document.querySelector('.empty-state');
            if (emptyState) emptyState.style.display = 'none';
        }
    }

    // ---------- Enviar respuesta usando modal (robusto) ----------
    if (sendReplyBtn) {
        sendReplyBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            const texto = replyText.value?.trim();
            if (!texto) {
                if (replyError) {
                    replyError.textContent = "La respuesta no puede estar vacía.";
                    replyError.style.display = 'block';
                }
                replyText.focus();
                return;
            }

            const adminIdRaw = sessionStorage.getItem('idCuenta') ?? sessionStorage.getItem('idCuentaAdmin') ?? sessionStorage.getItem('id_cuenta');
            const adminId = adminIdRaw ? Number(adminIdRaw) : null;
            if (!adminId) {
                console.warn("No se encontró idCuenta del admin en sessionStorage. idcuenta_respondido quedará NULL.");
            }

            sendReplyBtn.disabled = true;
            if (cancelReplyBtn) cancelReplyBtn.disabled = true;
            const prevText = sendReplyBtn.textContent;
            sendReplyBtn.textContent = "Enviando...";

            try {
                const body = { idMensaje: Number(currentReplyMessageId), respuesta: texto, idCuentaRespondido: adminId };
                const resp = await fetch("/api/administrador/responderMensaje", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify(body)
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(()=>({message:'Error'}));
                    throw new Error(err.message || 'Error al enviar respuesta');
                }
                const actualizado = await resp.json();

                const targetDetail = document.getElementById(`mensaje-${currentReplyMessageId}`);
                if (targetDetail) {
                    const existing = targetDetail.querySelector('.message-response');
                    const nuevaRespuestaHtml = `
                        <div class="message-response">
                            <h4>Respuesta</h4>
                            <div class="response-meta"><small>Fecha: ${ escapeHtml(formatFecha(actualizado.fechaRespuesta)) }</small></div>
                            <div class="response-body">${ escapeHtml(actualizado.respuesta) }</div>
                        </div>
                    `;
                    if (existing) existing.outerHTML = nuevaRespuestaHtml;
                    else targetDetail.querySelector('.message-detail-content')?.insertAdjacentHTML('beforeend', nuevaRespuestaHtml);
                }

                const idx = allMessages.findIndex(m => String(m.idMensaje ?? m.id ?? m.id_mensaje) === String(actualizado.idMensaje ?? actualizado.id ?? actualizado.id_mensaje));
                if (idx >= 0) allMessages[idx] = actualizado;

                closeModal();
                alert("Respuesta enviada correctamente.");
            } catch (err) {
                console.error(err);
                if (replyError) {
                    replyError.textContent = "No se pudo enviar la respuesta. Intenta nuevamente.";
                    replyError.style.display = 'block';
                } else {
                    alert("No se pudo enviar la respuesta. Revisa la consola.");
                }
            } finally {
                sendReplyBtn.disabled = false;
                if (cancelReplyBtn) cancelReplyBtn.disabled = false;
                sendReplyBtn.textContent = prevText || "Enviar respuesta";
            }
        });
    }

    // ---------- Buscador admin (filtrado local + debounce) ----------
    if (searchInput) {
        let debounceTimer = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applyFilterAndRender();
            }, 220);
        });
    }

    // ---------- select filter (all / oldest) ----------
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            applyFilterAndRender();
        });
    }

    await fetchUsuarios();
    await fetchMensajes();
});
