document.addEventListener('DOMContentLoaded', async () => {
    const ENDPOINTS = [
        '/api/residente/obtenerAreasComunes',
        '/api/propietario/obtenerAreasComunes',
        '/api/administrador/obtenerAreas'
    ];

    const tipoPago = document.getElementById('tipo-pago');
    const camposAdmin = document.getElementById('campos-administracion');
    const camposReserva = document.getElementById('campos-reserva');
    const areaComun = document.getElementById('area-comun');
    const fechaReserva = document.getElementById('fecha-reserva');
    const horaReserva = document.getElementById('hora-reserva');
    const montoReserva = document.getElementById('monto-reserva');
    const continuarPagoBtn = document.getElementById('continuar-pago');
    const historialBody = document.getElementById('historial-body');

    let areasCache = [];
    const idCuenta = sessionStorage.getItem('idCuenta');

    if (fechaReserva) {
        const hoy = new Date();
        fechaReserva.min = hoy.toISOString().split('T')[0];
    }

    // ------------------ TAB SWITCHING ------------------
    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        if (!tabBtns || !tabBtns.length) {
            console.warn('initTabs: no se encontraron botones de pestaña (.tab-btn).');
            return;
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const tabName = btn.dataset.tab;
                const content = document.getElementById(tabName);
                if (content) content.classList.add('active');

                if (tabName === 'historial-pagos') {
                    if (typeof cargarHistorialDesdeBackend === 'function') {
                        cargarHistorialDesdeBackend();
                    } else {
                        console.warn('cargarHistorialDesdeBackend no definida');
                    }
                }
            });
        });
    }

    // ---------- fetch de areas con fallback ----------
    async function fetchAreasConFallback() {
        let lastError = null;
        for (const path of ENDPOINTS) {
            try {
                const res = await fetch(path, { credentials: 'include' });
                if (!res.ok) { lastError = new Error(`HTTP ${res.status} en ${path}`); continue; }
                const json = await res.json();
                let data = json;
                if (!Array.isArray(data)) {
                    if (Array.isArray(json.data)) data = json.data;
                    else if (Array.isArray(json.areas)) data = json.areas;
                    else {
                        const maybe = Object.values(json).find(v => Array.isArray(v));
                        data = maybe || [];
                    }
                }
                return data;
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error('No se pudo obtener áreas');
    }

    function poblarAreas(data) {
        areasCache = Array.isArray(data) ? data : [];
        if (!areaComun) return;
        areaComun.innerHTML = '';
        if (!areasCache.length) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No hay áreas registradas';
            areaComun.appendChild(opt);
            areaComun.disabled = true;
            return;
        }
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Seleccione un área común --';
        areaComun.appendChild(placeholder);

        areasCache.forEach(a => {
            const id = a.id ?? a.idArea ?? a.idAreaComun ?? a.idareacomun ?? '';
            const nombre = a.area ?? a.nombre ?? 'Área';
            const descripcion = a.descripcion ?? '';
            const precio = (a.precio != null) ? a.precio : (a.tarifa != null ? a.tarifa : undefined);
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = nombre + (descripcion ? ` — ${descripcion}` : '');
            if (precio != null) opt.dataset.precio = precio;
            areaComun.appendChild(opt);
        });
        areaComun.disabled = false;
    }

    // ---------- utilidades ----------
    function parseLocaleNumber(str) {
        if (str == null) return 0;
        const cleaned = String(str).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
    }

    function formatCurrency(value) {
        try {
            const n = Number(value) || 0;
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(n);
        } catch (e) { return String(value); }
    }

    function formatDate(val) {
        if (!val) return '';
        try {
            const d = (typeof val === 'number' || /^\d+$/.test(String(val))) ? new Date(Number(val)) : new Date(val);
            if (isNaN(d.getTime())) return String(val);
            return d.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
        } catch (e) { return String(val); }
    }

    function escapeHtml(text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ---------- monto reserva ----------
    function actualizarMontoReserva() {
        if (!areaComun || !montoReserva || !horaReserva) return;
        const selectedId = areaComun.value;
        const hora = horaReserva.value;
        let monto = 0;
        if (!selectedId) { montoReserva.value = ''; return; }
        const area = areasCache.find(a =>
            String(a.id) === String(selectedId) ||
            String(a.idArea) === String(selectedId) ||
            String(a.idAreaComun) === String(selectedId) ||
            String(a.idareacomun) === String(selectedId)
        );
        if (area) {
            monto = parseFloat(area.precio ?? area.tarifa) || 0;
            if (hora === 'tarde') monto = Math.round(monto * 1.2);
            else if (hora === 'noche') monto = Math.round(monto * 1.4);
        } else {
            const opt = areaComun.options[areaComun.selectedIndex];
            const precioAttr = opt ? opt.dataset.precio : undefined;
            if (precioAttr) monto = parseFloat(precioAttr) || 0;
        }
        montoReserva.value = monto > 0 ? monto.toLocaleString('es-CO') : '';
    }

    // ---------- tarifa administración ----------
    async function cargarTarifaAdministracion() {
        const inputMontoAdmin = document.getElementById('monto-admin');
        if (!inputMontoAdmin) return;

        try {
            const res = await fetch('/api/tarifa', { method: 'GET', credentials: 'include' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();

            let arr = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : (Array.isArray(json.tarifas) ? json.tarifas : []));
            if (!arr.length && typeof json === 'object') {
                const maybe = Object.values(json).find(v => Array.isArray(v));
                if (maybe) arr = maybe;
            }

            const tarifaAdmin = arr.find(t => (t.categoria || t.nombre || t.tipo) === 'Administración') ||
                arr.find(t => String(t.categoria || t.nombre || t.tipo).toLowerCase().includes('admin')) ||
                arr.find(t => String(t.id).toLowerCase().includes('admin'));

            if (tarifaAdmin) {
                const valor = tarifaAdmin.valor ?? tarifaAdmin.precio ?? tarifaAdmin.monto ?? 0;
                if (typeof valor === 'number') inputMontoAdmin.value = valor.toLocaleString('es-CO');
                else inputMontoAdmin.value = String(valor);
            } else {
                console.warn('No se encontró tarifa de Administración en /api/tarifa');
            }
        } catch (err) {
            console.error('Error al cargar tarifa administración:', err);
        }
    }

    // ---------- Historial (CORREGIDO: ordenamiento y filtros) ----------
    async function cargarHistorialDesdeBackend() {
        if (!historialBody) {
            console.warn('cargarHistorialDesdeBackend: historialBody no encontrado');
            return;
        }
        console.log('Cargando historial desde backend...');

        try {
            const url = '/api/pago/obtenerPagos';
            console.log('Solicitando historial ->', url);

            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });

            console.log('Respuesta /api/pago status:', res.status);
            if (!res.ok) {
                const txt = await res.text().catch(()=>null);
                console.warn('Error cargando pagos:', res.status, txt);
                if (res.status === 401 || res.status === 403) {
                    historialBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No autorizado. Inicia sesión.</td></tr>';
                } else {
                    historialBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se pudo cargar el historial</td></tr>';
                }
                return;
            }

            const json = await res.json();
            console.log('Payload recibido (preview):', JSON.stringify(json).slice(0,500));
            let arr = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : (Array.isArray(json.pagos) ? json.pagos : []));
            if (!arr.length && typeof json === 'object') {
                const maybe = Object.values(json).find(v => Array.isArray(v));
                if (maybe) arr = maybe;
            }

            renderPagos(arr, document.getElementById('filtro-tipo')?.value ?? 'todos');
        } catch (err) {
            console.error('Error en fetch historial:', err);
            historialBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se pudo cargar el historial</td></tr>';
        }
    }

    function normalizarPagoDTO(p) {
        const id = p.idPago ?? p.id ?? p.paymentId ?? p.id_pago ?? null;
        const valor = Number(p.valor ?? p.monto ?? p.amount ?? 0) || 0;
        const estado = p.estadoPago ?? p.estado ?? p.status ?? '';
        const descripcion = p.descripcion ?? p.description ?? p.detalle ?? '';
        const categoria = p.categoria ?? p.tipo ?? p.category ?? '';
        const fecha = p.fecha ?? p.fechaPago ?? p.createdAt ?? p.date ?? null;
        return { raw: p, id, valor, estado: String(estado), descripcion: String(descripcion), categoria: String(categoria), fecha };
    }

    // CORRECCIÓN 1: Función de filtrado mejorada para manejar acentos y mayúsculas
    function matchesFilter(categoria, filtro) {
        if (!filtro || filtro === 'todos') return true;

        // Normalizar strings: quitar acentos, convertir a minúsculas
        const normalizeString = (str) => {
            return str.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); // Quita acentos
        };

        const categoriaNormalizada = normalizeString(categoria);
        const filtroNormalizado = normalizeString(filtro);

        // Verificar coincidencias
        if (filtroNormalizado === 'administracion') {
            return categoriaNormalizada.includes('administracion') ||
                categoriaNormalizada.includes('admin');
        }

        if (filtroNormalizado === 'reserva') {
            return categoriaNormalizada.includes('reserva') ||
                categoriaNormalizada.includes('area');
        }

        return categoriaNormalizada.includes(filtroNormalizado);
    }

    // CORRECCIÓN 2: Renderizado con ordenamiento por fecha (más recientes primero)
    function renderPagos(rawArray, filtro = 'todos') {
        if (!historialBody) return;
        historialBody.innerHTML = '';

        const arr = Array.isArray(rawArray) ? rawArray : [];

        // CORRECCIÓN 1: Filtrado mejorado
        const filtrados = arr.filter(p => {
            const categoria = (p.categoria ?? p.tipo ?? p.category ?? '').toString();
            return matchesFilter(categoria, filtro);
        });

        // CORRECCIÓN 2: Ordenar por fecha descendente (más recientes primero)
        filtrados.sort((a, b) => {
            const fechaA = new Date(a.fecha ?? a.fechaPago ?? a.createdAt ?? 0);
            const fechaB = new Date(b.fecha ?? b.fechaPago ?? b.createdAt ?? 0);
            return fechaB - fechaA; // Orden descendente
        });

        if (!filtrados.length) {
            const fila = document.createElement('tr');
            fila.innerHTML = '<td colspan="5" style="text-align: center;">No hay pagos registrados</td>';
            historialBody.appendChild(fila);
            return;
        }

        filtrados.forEach(raw => {
            const p = normalizarPagoDTO(raw);
            const fila = document.createElement('tr');
            fila.style.cursor = 'pointer';
            fila.dataset.id = p.id ?? '';

            // Aplicar clase de estado para el styling
            const estadoClass = getEstadoClass(p.estado);

            fila.innerHTML = `<td>${formatDate(p.fecha)}</td>
                              <td>${escapeHtml(p.categoria)}</td>
                              <td>${escapeHtml(p.descripcion)}</td>
                              <td>${formatCurrency(p.valor)}</td>
                              <td><span class="estado-pago ${estadoClass}">${escapeHtml(p.estado)}</span></td>`;
            fila.addEventListener('click', () => mostrarDetallePago(p));
            historialBody.appendChild(fila);
        });
    }

    // Función auxiliar para determinar la clase CSS del estado
    function getEstadoClass(estado) {
        const estadoLower = String(estado).toLowerCase();
        if (estadoLower.includes('pagado') || estadoLower.includes('approved') || estadoLower.includes('completado')) {
            return 'estado-pagado';
        }
        if (estadoLower.includes('pendiente') || estadoLower.includes('pending')) {
            return 'estado-pendiente';
        }
        if (estadoLower.includes('cancelado') || estadoLower.includes('cancelled') || estadoLower.includes('rechazado')) {
            return 'estado-cancelado';
        }
        return 'estado-pendiente'; // Default
    }

    function mostrarDetallePago(p) {
        const detalle = [
            `ID: ${p.id ?? ''}`,
            `Categoría: ${p.categoria || ''}`,
            `Descripción: ${p.descripcion || ''}`,
            `Valor: ${formatCurrency(p.valor)}`,
            `Estado: ${p.estado || ''}`,
            `Fecha: ${formatDate(p.fecha)}`
        ].join('\n');
        alert(detalle);
    }

    // conectar filtro
    const filtroTipo = document.getElementById('filtro-tipo');
    if (filtroTipo) {
        filtroTipo.addEventListener('change', () => {
            cargarHistorialDesdeBackend();
        });
    }

    // ---------- Handler "Continuar con el pago" ----------
    if (continuarPagoBtn) {
        continuarPagoBtn.addEventListener('click', async () => {
            const tipoPagoValue = tipoPago ? tipoPago.value : null;
            if (!tipoPagoValue) { alert('Por favor, seleccione un tipo de pago'); return; }

            let pago = { valor: 0, cuenta: { idCuenta: idCuenta }, descripcion: '', categoria: '' };
            let reserva = null;

            if (tipoPagoValue === 'administracion') {
                const mesPago = document.getElementById('mes-pago')?.value;
                const montoAdminStr = document.getElementById('monto-admin')?.value;
                pago.valor = parseLocaleNumber(montoAdminStr);
                pago.descripcion = `Pago administración mes: ${mesPago}`;
                pago.categoria = 'Administración';
            } else if (tipoPagoValue === 'reserva') {
                if (!fechaReserva?.value) { alert('Por favor, seleccione una fecha para la reserva'); return; }
                if (!areaComun?.value) { alert('Por favor, seleccione un área común'); return; }

                const areaSeleccionada = areaComun.options[areaComun.selectedIndex]?.textContent ?? '';
                const fechaSeleccionada = fechaReserva.value;
                const horaSeleccionada = horaReserva?.value || '';

                const montoReservaValue = montoReserva.value;
                pago.valor = parseLocaleNumber(montoReservaValue);
                pago.descripcion = `Reserva de ${areaSeleccionada} - ${fechaSeleccionada} - ${horaSeleccionada}`;
                pago.categoria = 'Reserva';

                let horaParaISO = '00:00:00';
                const horaLower = (horaSeleccionada || '').toString().toLowerCase();
                if (horaLower.includes('mañana') || horaLower === 'manana') horaParaISO = '09:00:00';
                else if (horaLower.includes('tarde')) horaParaISO = '15:00:00';
                else if (horaLower.includes('noche')) horaParaISO = '19:00:00';
                if (/^\d{1,2}:\d{2}$/.test(horaLower)) {
                    const parts = horaLower.split(':').map(p => p.padStart(2, '0'));
                    horaParaISO = `${parts[0]}:${parts[1]}:00`;
                }
                const fechaISO = `${fechaSeleccionada}T${horaParaISO}`;

                reserva = {
                    idAreaComun: Number(areaComun.value),
                    fechaReserva: fechaISO,
                    tiempoReserva: horaSeleccionada
                };
            }

            const prevText = continuarPagoBtn.innerHTML;
            continuarPagoBtn.disabled = true;
            continuarPagoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            try {
                let endpoint = (tipoPagoValue === 'reserva') ? '/api/pago/mercado-pago/reserva' : '/api/pago/mercado-pago';
                let body = (tipoPagoValue === 'reserva') ? { pago: pago, reserva: reserva } : pago;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(txt || `Error ${response.status}`);
                }

                const data = await response.json();
                const init = data.init_point;
                // recargar el historial desde backend para que aparezca el pago creado (si fue guardado)
                await cargarHistorialDesdeBackend();

                if (init) {
                    window.location.href = init;
                    return;
                } else {
                    alert('No se recibió una URL de pago válida');
                }
            } catch (err) {
                console.error('Error en el flujo de pago:', err);
                alert('Hubo un error al procesar el pago. Revisa la consola.');
            } finally {
                continuarPagoBtn.disabled = false;
                continuarPagoBtn.innerHTML = prevText;
            }
        });
    }

    // Inicialización
    (async function init() {
        initTabs();

        try {
            const areas = await fetchAreasConFallback();
            poblarAreas(areas);
            actualizarMontoReserva();
        } catch (err) {
            if (areaComun) { areaComun.innerHTML = '<option value="">Error cargando áreas</option>'; areaComun.disabled = true; }
        }

        cargarTarifaAdministracion();

        if (tipoPago && tipoPago.value === 'reserva') { if (camposReserva) camposReserva.style.display = 'block'; actualizarMontoReserva(); }

        // cargar historial inicial
        await cargarHistorialDesdeBackend();
    })();

    if (tipoPago) {
        tipoPago.addEventListener('change', async function () {
            if (camposAdmin) camposAdmin.style.display = 'none';
            if (camposReserva) camposReserva.style.display = 'none';
            if (this.value === 'administracion') {
                if (camposAdmin) camposAdmin.style.display = 'block';
                cargarTarifaAdministracion();
            } else if (this.value === 'reserva') {
                if (camposReserva) camposReserva.style.display = 'block';
                if (areasCache.length === 0) {
                    try {
                        const fetched = await fetchAreasConFallback();
                        poblarAreas(fetched);
                    } catch (err) {
                        areaComun.innerHTML = '<option value="">Error cargando áreas</option>';
                        areaComun.disabled = true;
                    }
                }
                actualizarMontoReserva();
            }
        });
    }

    if (areaComun) areaComun.addEventListener('change', actualizarMontoReserva);
    if (horaReserva) horaReserva.addEventListener('change', actualizarMontoReserva);
});