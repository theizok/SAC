document.addEventListener('DOMContentLoaded', () => {
    const usuariosCard = document.getElementById('card-usuarios');
    const mensajesCard = document.getElementById('card-mensajes');
    const anunciosCard = document.getElementById('card-anuncios');

    const usuariosCountEl = document.getElementById('residentes-count');
    const mensajesCountEl = document.getElementById('mensajes-count');
    const anunciosCountEl = document.getElementById('anuncios-count');

    const URL_USUARIOS = '/api/administrador/obtenerUsuarios';
    const URL_MENSAJES = '/api/administrador/obtenerMensajes';
    const URL_ANUNCIOS = '/api/tablon/publicacionesAll';

    const bodyEl = document.body;
    const REFRESH_INTERVAL_COUNTS = parseInt(bodyEl.dataset.refreshCounts, 10) || 30000; // 30s
    const REFRESH_INTERVAL_MODAL = parseInt(bodyEl.dataset.refreshModal, 10) || 60000; // 60s
    const FETCH_TIMEOUT = 10000; // 10s

    let countsInterval = null;

    function escapeHtml(text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatFecha(val) {
        if (!val) return '';
        try {
            const d = (typeof val === 'number' || /^\d+$/.test(String(val))) ? new Date(Number(val)) : new Date(val);
            if (isNaN(d.getTime())) return String(val);
            return d.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
        } catch (e) { return String(val); }
    }

    // fetch con timeout
    async function fetchWithTimeout(url, opts = {}, timeout = FETCH_TIMEOUT) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, { signal: controller.signal, ...opts });
            clearTimeout(id);
            return res;
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    }

    // Cargar contadores (usuarios, mensajes, anuncios)
    async function cargarContadores() {
        try {
            const [rUsers, rMsgs, rAnu] = await Promise.all([
                fetchWithTimeout(URL_USUARIOS, { credentials: 'include' }).catch(() => null),
                fetchWithTimeout(URL_MENSAJES, { credentials: 'include' }).catch(() => null),
                fetchWithTimeout(URL_ANUNCIOS, { credentials: 'include' }).catch(() => null),
            ]);

            // Usuarios
            try {
                if (rUsers && rUsers.ok) {
                    const u = await rUsers.json();
                    usuariosCountEl.textContent = Array.isArray(u) ? u.length : (u ? 1 : 0);
                } else usuariosCountEl.textContent = '—';
            } catch (e) { usuariosCountEl.textContent = '—'; }

            // Mensajes
            try {
                if (rMsgs && rMsgs.ok) {
                    const m = await rMsgs.json();
                    mensajesCountEl.textContent = Array.isArray(m) ? m.length : (m ? 1 : 0);
                } else mensajesCountEl.textContent = '—';
            } catch (e) { mensajesCountEl.textContent = '—'; }

            // Anuncios
            try {
                if (rAnu && rAnu.ok) {
                    const raw = await rAnu.json();
                    let arr = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.publicaciones) ? raw.publicaciones : []));
                    if (!arr.length) {
                        const maybe = Object.values(raw || {}).find(v => Array.isArray(v));
                        if (Array.isArray(maybe)) arr = maybe;
                    }
                    anunciosCountEl.textContent = arr.length;
                } else anunciosCountEl.textContent = '—';
            } catch (e) { anunciosCountEl.textContent = '—'; }

        } catch (err) {
            console.error('Error cargando contadores', err);
            usuariosCountEl.textContent = mensajesCountEl.textContent = anunciosCountEl.textContent = '—';
        }
    }

    // Auto-refresh counts
    function startAutoRefreshCounts() {
        if (countsInterval) return;
        countsInterval = setInterval(() => {
            if (!document.hidden) cargarContadores();
        }, REFRESH_INTERVAL_COUNTS);
    }
    function stopAutoRefreshCounts() {
        if (countsInterval) {
            clearInterval(countsInterval);
            countsInterval = null;
        }
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoRefreshCounts();
        else {
            cargarContadores();
            startAutoRefreshCounts();
        }
    });

    // --------------- Modal helpers ---------------
    function crearOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'dashboard-modal-overlay';
        overlay.tabIndex = -1; // para detectar escape

        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle && menuToggle.checked) {
            menuToggle.checked = false;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        overlay.__close = function () {
            try {
                if (overlay.__modalInterval) clearInterval(overlay.__modalInterval);
            } catch (e) {}
            document.body.style.overflow = previousOverflow || '';
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') overlay.__close();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.__close();
        });

        return overlay;
    }

    function crearModalInner(title = '') {
        const modal = document.createElement('div');
        modal.className = 'dashboard-modal';
        modal.innerHTML = `
            <div class="dashboard-modal-header">
                <h3>${escapeHtml(title)}</h3>
                <button class="modal-close" aria-label="Cerrar">&times;</button>
            </div>
            <div class="dashboard-modal-body">
                <div class="dashboard-loading">Cargando...</div>
            </div>
        `;
        return modal;
    }

    // --------------- Usuarios modal (lista completa) ---------------
    async function abrirModalUsuarios() {
        const overlay = crearOverlay();
        const modal = crearModalInner('Usuarios registrados');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.focus();

        const body = modal.querySelector('.dashboard-modal-body');
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => overlay.__close());

        try {
            const res = await fetchWithTimeout(URL_USUARIOS, { credentials: 'include' }).catch(() => null);
            if (!res || !res.ok) {
                body.innerHTML = `<div class="center-msg">Error ${res ? res.status : ''} al obtener usuarios.</div>`;
                return;
            }
            const usuarios = await res.json();
            if (!Array.isArray(usuarios) || usuarios.length === 0) {
                body.innerHTML = `<div class="center-msg">No hay usuarios registrados.</div>
                    <div style="margin-top:12px"><a class="btn primary" href="../AdministrarUsuarios/administrar_usuarios.html">Ir a administrar usuarios</a></div>`;
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <div style="margin-bottom:10px; display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap;">
                    <div style="display:flex; gap:8px; align-items:center; flex:1; min-width:220px;">
                        <input placeholder="Buscar por nombre, documento, correo" style="padding:8px 10px; border-radius:6px; border:1px solid #ddd; width:420px; max-width:100%;" id="usuarios-search" />
                        <button id="usuarios-refresh" class="btn secondary">Actualizar</button>
                    </div>
                    <div>
                        <a class="btn primary" href="../AdministrarUsuarios/administrar_usuarios.html">Abrir lista completa</a>
                    </div>
                </div>
                <div style="overflow:auto; max-height:62vh;">
                    <table class="usuarios-table" id="usuarios-table">
                        <thead>
                            <tr><th>Nombre</th><th>Documento</th><th>Correo</th><th>Teléfono</th><th>Rol</th></tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `;

            body.innerHTML = '';
            body.appendChild(wrapper);

            const tbody = body.querySelector('#usuarios-table tbody');
            const renderRows = (arr) => {
                tbody.innerHTML = '';
                arr.forEach(u => {
                    const nombre = u.nombre ?? u.name ?? '';
                    const documento = u.documento ?? u.document ?? '';
                    const correo = u.correo ?? u.email ?? '';
                    const telefono = u.telefono ?? u.telefonoPropietario ?? u.telefonoResidente ?? '';
                    const tipo = u.tipoUsuario ?? u.tipo ?? u.rol ?? '';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${escapeHtml(nombre)}</td><td>${escapeHtml(documento)}</td><td>${escapeHtml(correo)}</td><td>${escapeHtml(telefono)}</td><td>${escapeHtml(tipo)}</td>`;
                    tbody.appendChild(tr);
                });
            };

            renderRows(usuarios);

            const searchInput = body.querySelector('#usuarios-search');
            searchInput.addEventListener('input', (e) => {
                const q = (e.target.value || '').toLowerCase().trim();
                if (!q) return renderRows(usuarios);
                const filtered = usuarios.filter(u => {
                    return (String(u.nombre || '') + ' ' + String(u.documento || '') + ' ' + String(u.correo || '') + ' ' + String(u.telefono || '') + ' ' + String(u.tipoUsuario || u.rol || '')).toLowerCase().includes(q);
                });
                renderRows(filtered);
            });

            body.querySelector('#usuarios-refresh').addEventListener('click', async () => {
                body.querySelector('.center-msg')?.remove();
                body.querySelector('.dashboard-loading')?.remove();
                body.innerHTML = '<div class="dashboard-loading">Actualizando...</div>';
                try {
                    const r = await fetchWithTimeout(URL_USUARIOS, { credentials: 'include' }).catch(() => null);
                    const fresh = (r && r.ok) ? await r.json() : [];
                    body.innerHTML = '';
                    body.appendChild(wrapper);
                    renderRows(fresh);
                } catch (err) {
                    body.innerHTML = `<div class="center-msg">Error actualizando.</div>`;
                }
            });

            overlay.__modalInterval = setInterval(async () => {
                // si input tiene foco (usuario escribiendo), no refrescar
                if (document.activeElement === searchInput) return;
                try {
                    const r = await fetchWithTimeout(URL_USUARIOS, { credentials: 'include' }).catch(() => null);
                    if (r && r.ok) {
                        const fresh = await r.json();
                        if (Array.isArray(fresh) && fresh.length !== usuarios.length) {
                            usuarios.length = 0;
                            usuarios.push(...fresh);
                            renderRows(usuarios);
                        }
                    }
                } catch (err) {
                    // no bloquear al usuario por fallos de auto-refresh
                    console.debug('Auto-refresh usuarios falló', err);
                }
            }, REFRESH_INTERVAL_MODAL);

        } catch (err) {
            console.error('Error usuarios modal', err);
            body.innerHTML = `<div class="center-msg">Error al cargar usuarios. Revisa la consola.</div>`;
        }
    }

    // --------------- Mensajes modal (lista) ---------------
    async function abrirModalMensajes() {
        const overlay = crearOverlay();
        const modal = crearModalInner('Mensajes');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.focus();

        const body = modal.querySelector('.dashboard-modal-body');
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => overlay.__close());

        try {
            const res = await fetchWithTimeout(URL_MENSAJES, { credentials: 'include' }).catch(() => null);
            if (!res || !res.ok) {
                body.innerHTML = `<div class="center-msg">Error ${res ? res.status : ''} al obtener mensajes.</div>`;
                return;
            }
            const mensajes = await res.json();
            if (!Array.isArray(mensajes) || mensajes.length === 0) {
                body.innerHTML = `<div class="center-msg">No hay mensajes.</div>`;
                return;
            }

            body.innerHTML = `
                 <div class="mensajes-header">
                    <input id="mensajes-search" placeholder="Buscar por remitente o contenido" style="padding:8px 10px; border-radius:6px; border:1px solid #ddd; width:60%; max-width:100%;" />
                    <div class="modal-actions">
                        <button id="mensajes-refresh" class="btn secondary">Actualizar</button>
                         <a id="ir-mensajes" class="btn primary" href="../Mensaje/mensaje.html">Ir a Mensajes</a>
                    </div>
                </div>
                <div style="margin-top:10px" class="mensajes-list" id="mensajes-list"></div>
            `;


            const list = body.querySelector('#mensajes-list');
            const renderMensajes = (arr) => {
                list.innerHTML = '';
                arr.forEach(m => {
                    const remitente = m.nombre ?? m.remitente ?? m.autor ?? '';
                    const correo = m.correo ?? '';
                    const contenido = m.contenido ?? m.mensaje ?? '';
                    const fecha = formatFecha(m.fecha ?? m.timestamp ?? m.createdAt);
                    const respuesta = m.respuesta ?? m.respuestaAdmin ?? '';
                    const div = document.createElement('div');
                    div.className = 'mensaje-item';
                    div.innerHTML = `
                        <h4>${escapeHtml(remitente || correo || '(Sin remitente)')}</h4>
                        <div class="meta">${escapeHtml(fecha)} ${correo ? ' • ' + escapeHtml(correo) : ''}</div>
                        <div class="body">${escapeHtml(contenido)}</div>
                        ${respuesta ? `<div style="margin-top:8px; padding:8px; background:#f7f7f7; border-radius:6px;"><strong>Respuesta:</strong> ${escapeHtml(respuesta)}</div>` : ''}
                    `;
                    list.appendChild(div);
                });
            };

            renderMensajes(mensajes);

            const search = body.querySelector('#mensajes-search');
            search.addEventListener('input', (e) => {
                const q = (e.target.value || '').toLowerCase().trim();
                if (!q) return renderMensajes(mensajes);
                const filtered = mensajes.filter(m => {
                    return (String(m.nombre || '') + ' ' + String(m.correo || '') + ' ' + String(m.contenido || '')).toLowerCase().includes(q);
                });
                renderMensajes(filtered);
            });

            body.querySelector('#mensajes-refresh').addEventListener('click', async () => {
                body.innerHTML = '<div class="dashboard-loading">Actualizando...</div>';
                try {
                    const r = await fetchWithTimeout(URL_MENSAJES, { credentials: 'include' }).catch(() => null);
                    const fresh = (r && r.ok) ? await r.json() : [];
                    body.innerHTML = '';
                    // reconstruir (simplemente reabrir modal)
                    overlay.__close();
                    abrirModalMensajes();
                } catch (err) {
                    body.innerHTML = `<div class="center-msg">Error actualizando.</div>`;
                }
            });

            overlay.__modalInterval = setInterval(async () => {
                if (document.activeElement === search) return;
                try {
                    const r = await fetchWithTimeout(URL_MENSAJES, { credentials: 'include' }).catch(() => null);
                    if (r && r.ok) {
                        const fresh = await r.json();
                        if (Array.isArray(fresh) && fresh.length !== mensajes.length) {
                            mensajes.length = 0;
                            mensajes.push(...fresh);
                            renderMensajes(mensajes);
                        }
                    }
                } catch (err) {
                    console.debug('Auto-refresh mensajes falló', err);
                }
            }, REFRESH_INTERVAL_MODAL);

        } catch (err) {
            console.error('Error mensajes modal', err);
            body.innerHTML = `<div class="center-msg">Error al cargar mensajes. Revisa la consola.</div>`;
        }
    }

    // --------------- Anuncios modal (lista + detalle) ---------------
    async function abrirModalAnuncios() {
        const overlay = crearOverlay();
        const modal = crearModalInner('Anuncios');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.focus();

        const body = modal.querySelector('.dashboard-modal-body');
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => overlay.__close());

        try {
            const res = await fetchWithTimeout(URL_ANUNCIOS, { credentials: 'include' }).catch(() => null);
            if (!res || !res.ok) {
                body.innerHTML = `<div class="center-msg">Error ${res ? res.status : ''} al obtener anuncios.</div>`;
                return;
            }

            const raw = await res.json();
            let anuncios = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.publicaciones) ? raw.publicaciones : []));
            if (!anuncios.length) {
                const maybe = Object.values(raw || {}).find(v => Array.isArray(v));
                if (Array.isArray(maybe)) anuncios = maybe;
            }

            if (!anuncios.length) {
                body.innerHTML = `<div class="center-msg">No hay anuncios disponibles.</div>`;
                return;
            }

            body.innerHTML = `
                <div class="anuncios-search">
                    <input id="anuncios-filter" placeholder="Buscar anuncios por título o autor" />
                    <div style="min-width:130px; text-align:right;">
                        <a class="btn primary" href="../TablonAnuncios/tablon_anuncios.html">Ir al Tablón</a>
                    </div>
                </div>
                <div class="anuncios-split">
                    <div class="anuncios-list" id="anuncios-list"></div>
                    <div class="anuncio-detail" id="anuncio-detail">
                        <div class="center-msg">Selecciona un anuncio a la izquierda para ver el detalle</div>
                    </div>
                </div>
            `;

            const listEl = body.querySelector('#anuncios-list');
            const detailEl = body.querySelector('#anuncio-detail');

            // crear filas
            function renderList(arr) {
                listEl.innerHTML = '';
                arr.forEach((a, idx) => {
                    const titulo = a.titulo ?? a.title ?? '(Sin título)';
                    const fecha = formatFecha(a.fecha ?? a.fechaPublicacion ?? a.createdAt);
                    const autor = a.nombre ?? a.nombre_autor ?? '';
                    const row = document.createElement('div');
                    row.className = 'anuncio-row';
                    row.dataset.index = String(idx);
                    row.innerHTML = `<div class="anuncio-list-title">${escapeHtml(titulo)}</div><div class="anuncio-list-meta">${escapeHtml(fecha)} ${autor ? ' • ' + escapeHtml(autor) : ''}</div>`;
                    row.addEventListener('click', () => mostrarDetalle(a));
                    listEl.appendChild(row);
                });
            }

            function mostrarDetalle(a) {
                const titulo = a.titulo ?? a.title ?? '(Sin título)';
                const fecha = formatFecha(a.fecha ?? a.fechaPublicacion ?? a.createdAt);
                const autor = a.nombre ?? a.nombre_autor ?? '';
                const contenido = a.contenido ?? a.descripcion ?? '';
                detailEl.innerHTML = `
                    <div class="titulo">${escapeHtml(titulo)}</div>
                    <div class="meta">${escapeHtml(fecha)} ${autor ? ' • ' + escapeHtml(autor) : ''}</div>
                    <div class="contenido">${escapeHtml(contenido)}</div>
                `;
            }

            renderList(anuncios);

            const filter = body.querySelector('#anuncios-filter');
            filter.addEventListener('input', (e) => {
                const q = (e.target.value || '').toLowerCase().trim();
                if (!q) return renderList(anuncios);
                const filtered = anuncios.filter(a => {
                    return ((String(a.titulo || '') + ' ' + String(a.contenido || '') + ' ' + String(a.nombre || a.nombre_autor || '')).toLowerCase().includes(q));
                });
                renderList(filtered);
                detailEl.innerHTML = '<div class="center-msg">Selecciona un anuncio a la izquierda para ver el detalle</div>';
            });

            overlay.__modalInterval = setInterval(async () => {
                if (document.activeElement === filter) return;
                try {
                    const r = await fetchWithTimeout(URL_ANUNCIOS, { credentials: 'include' }).catch(() => null);
                    if (r && r.ok) {
                        const raw2 = await r.json();
                        let arr2 = Array.isArray(raw2) ? raw2 : (Array.isArray(raw2.data) ? raw2.data : (Array.isArray(raw2.publicaciones) ? raw2.publicaciones : []));
                        if (!arr2.length) {
                            const maybe = Object.values(raw2 || {}).find(v => Array.isArray(v));
                            if (Array.isArray(maybe)) arr2 = maybe;
                        }
                        if (Array.isArray(arr2) && arr2.length !== anuncios.length) {
                            anuncios.length = 0;
                            anuncios.push(...arr2);
                            renderList(anuncios);
                            detailEl.innerHTML = '<div class="center-msg">Selecciona un anuncio a la izquierda para ver el detalle</div>';
                        }
                    }
                } catch (err) {
                    console.debug('Auto-refresh anuncios falló', err);
                }
            }, REFRESH_INTERVAL_MODAL);

        } catch (err) {
            console.error('Error anuncios modal', err);
            body.innerHTML = `<div class="center-msg">Error al cargar anuncios. Revisa la consola.</div>`;
        }
    }

    if (usuariosCard) {
        usuariosCard.addEventListener('click', (e) => { e.preventDefault(); abrirModalUsuarios(); });
        usuariosCard.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') abrirModalUsuarios(); });
    }
    if (mensajesCard) {
        mensajesCard.addEventListener('click', (e) => { e.preventDefault(); abrirModalMensajes(); });
        mensajesCard.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') abrirModalMensajes(); });
    }
    if (anunciosCard) {
        anunciosCard.addEventListener('click', (e) => { e.preventDefault(); abrirModalAnuncios(); });
        anunciosCard.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') abrirModalAnuncios(); });
    }

    // inicial
    cargarContadores();
    startAutoRefreshCounts();
});
