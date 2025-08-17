// mensaje-admin.js (reemplaza tu mensaje.js del admin)
document.addEventListener("DOMContentLoaded", async () => {
    const areaTitulo = document.getElementById("areaTitulo");
    const areaContenido = document.getElementById("areaContenido");
    const searchInput = document.querySelector('.search-box input'); // asumimos existe

    // Modal refs (igual que antes)
    const modal = document.getElementById("replyModal");
    const modalAsunto = document.getElementById("modalAsunto");
    const modalFrom = document.getElementById("modalFrom");
    const replyText = document.getElementById("replyText");
    const sendReplyBtn = document.getElementById("sendReply");
    const cancelReplyBtn = document.getElementById("cancelReply");
    const replyError = document.getElementById("replyError");
    const modalOverlayCloseButtons = modal.querySelectorAll('[data-close]');

    let currentReplyMessageId = null; // idMensaje que se está respondiendo
    let allMessages = []; // guardamos los mensajes originales para filtrar/buscar

    // ---------- Modal helpers ----------
    function openModal({ idMensaje, asunto = '', from = '' }) {
        currentReplyMessageId = idMensaje;
        modalAsunto.textContent = asunto || '';
        modalFrom.textContent = from || '';
        replyText.value = '';
        replyError.style.display = 'none';
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => replyText.focus(), 120);
        document.addEventListener('keydown', escHandler);
    }
    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        currentReplyMessageId = null;
        replyText.value = '';
        replyError.style.display = 'none';
        document.removeEventListener('keydown', escHandler);
    }
    function escHandler(e) { if (e.key === 'Escape') closeModal(); }
    modalOverlayCloseButtons.forEach(btn => btn.addEventListener('click', (ev) => { ev.preventDefault(); closeModal(); }));
    cancelReplyBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

    // ---------- utilidad ----------
    function getRemitente(mensaje) {
        if (mensaje.remitente) return mensaje.remitente;
        if (mensaje.cuenta && mensaje.cuenta.nombre) return mensaje.cuenta.nombre;
        if (mensaje.cuenta && (mensaje.cuenta.idCuenta || mensaje.cuenta.idCuenta === 0)) return `Cuenta #${mensaje.cuenta.idCuenta}`;
        return 'Administración';
    }
    function formatFecha(fechaISO) {
        if (!fechaISO) return '';
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-CO',{
            day:'2-digit', month:'2-digit', year:'numeric',
            hour:'2-digit', minute:'2-digit'
        });
    }

    // ---------- fetch y render (base) ----------
    async function fetchMensajes() {
        try {
            const response = await fetch("/api/administrador/obtenerMensajes");
            if (!response.ok) throw new Error("Error al obtener todos los mensajes");
            const data = await response.json();
            allMessages = Array.isArray(data) ? data : [];
            renderMensajesAdmin(allMessages);
        } catch (e) {
            console.error("Error al cargar los mensajes:", e);
            areaTitulo.innerHTML = '<div class="error-message">Error al cargar los mensajes. Por favor intente más tarde.</div>';
        }
    }

    function renderMensajesAdmin(data) {
        areaTitulo.innerHTML = "";
        areaContenido.innerHTML = `<div class="empty-state">
            <i class="fas fa-comment-dots"></i>
            <h3>Selecciona un mensaje</h3>
            <p>Haz clic en un mensaje de la lista para ver su contenido</p>
        </div>`;
        if (!Array.isArray(data) || data.length === 0) return;

        data.forEach((mensaje) => {
            const id = mensaje.idMensaje;
            const messageItem = document.createElement('div');
            messageItem.classList.add('message-item');
            messageItem.dataset.id = id;

            const fechaFormateada = formatFecha(mensaje.fecha);
            messageItem.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${ getRemitente(mensaje) }</span>
                    <span class="message-date">${ fechaFormateada }</span>
                </div>
                <div class="message-subject">${ mensaje.asunto || '' }</div>
                <div class="message-preview">${ (mensaje.contenido||'').substring(0, 100) }...</div>
            `;

            const messageDetail = document.createElement('div');
            messageDetail.classList.add('message-detail');
            messageDetail.id = `mensaje-${id}`;
            const respuestaHtml = mensaje.respuesta ? `
                <div class="message-response">
                    <h4>Respuesta</h4>
                    <div class="response-meta"><small>Fecha: ${ formatFecha(mensaje.fechaRespuesta) }</small></div>
                    <div class="response-body">${ mensaje.respuesta }</div>
                </div>
            ` : '';

            messageDetail.innerHTML = `
                <div class="message-detail-header">
                    <h2 class="message-detail-subject">${ mensaje.asunto || '' }</h2>
                    <div class="message-detail-meta">
                        <span><strong>De:</strong> ${ getRemitente(mensaje) }</span>
                        <span><strong>Fecha:</strong> ${ fechaFormateada }</span>
                    </div>
                </div>
                <div class="message-detail-content">
                    <p>${ mensaje.contenido || '' }</p>
                    ${respuestaHtml}
                </div>
                <div class="message-actions">
                    <button class="btn btn-reply" data-id="${id}"><i class="fas fa-reply"></i> Responder</button>
                    <button class="btn btn-delete" data-id="${id}"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            `;

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

            replyBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                openModal({ idMensaje: id, asunto: mensaje.asunto || '', from: getRemitente(mensaje) });
            });

            deleteBtn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                const idToDelete = ev.currentTarget.dataset.id;
                if (!confirm("¿Seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer.")) return;
                try {
                    const resp = await fetch(`/api/administrador/eliminarMensaje?id=${idToDelete}`, { method: "DELETE" });
                    if (!resp.ok) { const err = await resp.json().catch(()=>({message:'Error'})); throw new Error(err.message || 'Error al eliminar'); }
                    document.querySelector(`.message-item[data-id="${idToDelete}"]`)?.remove();
                    document.getElementById(`mensaje-${idToDelete}`)?.remove();
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

    // ---------- Enviar respuesta usando modal ----------
    sendReplyBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const texto = replyText.value?.trim();
        if (!texto) {
            replyError.textContent = "La respuesta no puede estar vacía.";
            replyError.style.display = 'block';
            replyText.focus();
            return;
        }

        // obtener id del admin desde sessionStorage (asegúrate de guardarlo al login)
        const adminIdRaw = sessionStorage.getItem('idCuenta'); // ajusta clave si usas otra
        const adminId = adminIdRaw ? Number(adminIdRaw) : null;
        if (!adminId) {
            // aún permitimos enviar sin idCuentaRespondido, pero avisamos
            console.warn("No se encontró idCuenta del admin en sessionStorage. idcuenta_respondido quedará NULL.");
        }

        sendReplyBtn.disabled = true;
        cancelReplyBtn.disabled = true;
        sendReplyBtn.textContent = "Enviando...";

        try {
            const body = { idMensaje: Number(currentReplyMessageId), respuesta: texto, idCuentaRespondido: adminId };
            const resp = await fetch("/api/administrador/responderMensaje", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!resp.ok) {
                const err = await resp.json().catch(()=>({message:'Error'}));
                throw new Error(err.message || 'Error al enviar respuesta');
            }
            const actualizado = await resp.json();

            // actualizar UI: sección de respuesta
            const targetDetail = document.getElementById(`mensaje-${currentReplyMessageId}`);
            if (targetDetail) {
                const existing = targetDetail.querySelector('.message-response');
                const nuevaRespuestaHtml = `
                    <div class="message-response">
                        <h4>Respuesta</h4>
                        <div class="response-meta"><small>Fecha: ${ formatFecha(actualizado.fechaRespuesta) }</small></div>
                        <div class="response-body">${ actualizado.respuesta }</div>
                    </div>
                `;
                if (existing) existing.outerHTML = nuevaRespuestaHtml;
                else targetDetail.querySelector('.message-detail-content').insertAdjacentHTML('beforeend', nuevaRespuestaHtml);
            }

            // actualizar copia en allMessages para que el buscador/filtrado la muestre como respondida
            const idx = allMessages.findIndex(m => m.idMensaje === actualizado.idMensaje);
            if (idx >= 0) allMessages[idx] = actualizado;

            closeModal();
            alert("Respuesta enviada correctamente.");
        } catch (err) {
            console.error(err);
            replyError.textContent = "No se pudo enviar la respuesta. Intenta nuevamente.";
            replyError.style.display = 'block';
        } finally {
            sendReplyBtn.disabled = false;
            cancelReplyBtn.disabled = false;
            sendReplyBtn.textContent = "Enviar respuesta";
        }
    });

    // ---------- Buscador admin (filtrado local) ----------
    // Si el input no existe, no falla.
    if (searchInput) {
        let debounceTimer = null;
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (!q) {
                    renderMensajesAdmin(allMessages);
                    return;
                }
                const filtered = allMessages.filter(m => {
                    const sujeto = (m.asunto || '').toString().toLowerCase();
                    const contenido = (m.contenido || '').toString().toLowerCase();
                    const remit = (m.remitente || (m.cuenta?.nombre || '')).toString().toLowerCase();
                    return sujeto.includes(q) || contenido.includes(q) || remit.includes(q);
                });
                renderMensajesAdmin(filtered);
            }, 220);
        });
    }

    // inicio
    await fetchMensajes();

});
