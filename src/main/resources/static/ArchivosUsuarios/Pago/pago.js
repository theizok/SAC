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
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const historialBody = document.getElementById('historial-body');
    const areasList = document.getElementById('areas-list');

    let areasCache = [];
    const idCuenta = sessionStorage.getItem('idCuenta');

    if (fechaReserva) {
        const hoy = new Date();
        fechaReserva.min = hoy.toISOString().split('T')[0];
    }

    async function fetchAreasConFallback() {
        let lastError = null;
        for (const path of ENDPOINTS) {
            try {
                const res = await fetch(path);
                if (!res.ok) { lastError = new Error(`HTTP ${res.status} en ${path}`); continue; }
                const json = await res.json();
                let data = json;
                if (!Array.isArray(data)) {
                    if (Array.isArray(json.data)) data = json.data;
                    else if (Array.isArray(json.areas)) data = json.areas;
                    else {
                        const maybeArr = Object.values(json).find(v => Array.isArray(v));
                        data = maybeArr || [];
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
            if (areasList) areasList.innerHTML = '<p>No hay áreas registradas.</p>';
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

    function parseLocaleNumber(str) {
        if (str == null) return 0;
        const cleaned = String(str).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
    }

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

    // Nueva función: cargar tarifa de Administración
    async function cargarTarifaAdministracion() {
        const inputMontoAdmin = document.getElementById('monto-admin');
        if (!inputMontoAdmin) return;

        try {
            // usar ruta relativa para que funcione en prod si el proxy lo maneja
            const res = await fetch('/api/tarifa', { method: 'GET' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();

            // Normalizar respuesta a array
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

    if (tipoPago) {
        tipoPago.addEventListener('change', async function () {
            if (camposAdmin) camposAdmin.style.display = 'none';
            if (camposReserva) camposReserva.style.display = 'none';
            if (this.value === 'administracion') {
                if (camposAdmin) camposAdmin.style.display = 'block';
                // Cargar tarifa de administración al mostrar los campos
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

    if (continuarPagoBtn) {
        continuarPagoBtn.addEventListener('click', async () => {
            const tipoPagoValue = tipoPago ? tipoPago.value : null;
            if (!tipoPagoValue) { alert('Por favor, seleccione un tipo de pago'); return; }

            let pago = { valor: 0, cuenta: { idCuenta: idCuenta }, descripcion: '', categoria: '' };
            let reserva = null;

            if (tipoPagoValue === 'administracion') {
                const mesPago = document.getElementById('mes-pago')?.value;
                const montoAdminStr = document.getElementById('monto-admin')?.value;
                // usar parseLocaleNumber para aceptar formatos locales
                pago.valor = parseLocaleNumber(montoAdminStr);
                pago.descripcion = `Pago administración mes: ${mesPago}`;
                pago.categoria = 'Administración';
            } else if (tipoPagoValue === 'reserva') {
                if (!fechaReserva?.value) { alert('Por favor, seleccione una fecha para la reserva'); return; }
                if (!areaComun?.value) { alert('Por favor, seleccione un área común'); return; }

                const areaSeleccionada = areaComun.options[areaComun.selectedIndex]?.textContent ?? '';
                const fechaSeleccionada = fechaReserva.value; // yyyy-mm-dd
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

                // No enviar idResidente; backend lo asignará desde la sesión autenticada
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
                if (tipoPagoValue === 'reserva') {
                    const payload = { pago: pago, reserva: reserva };
                    console.log('Payload pago+reserva (antes de fetch):', payload);

                    const response = await fetch('/api/pago/mercado-pago/reserva', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const txt = await response.text();
                        throw new Error(txt || `Error ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.init_point) { window.location.href = data.init_point; return; }
                    alert('No se recibió una URL de pago válida');
                } else {
                    const response = await fetch('/api/pago/mercado-pago', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(pago)
                    });
                    if (!response.ok) { const txt = await response.text(); throw new Error(txt || `Error ${response.status}`); }
                    const data = await response.json();
                    if (data.init_point) { window.location.href = data.init_point; return; }
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

    // HISTORIAL (simplificado)
    function cargarHistorialPagos() {
        const historialPagos = JSON.parse(localStorage.getItem('historialPagos')) || [];
        if (!historialBody) return;
        historialBody.innerHTML = '';
        if (historialPagos.length === 0) {
            const fila = document.createElement('tr');
            fila.innerHTML = '<td colspan="5" style="text-align: center;">No hay pagos registrados</td>';
            historialBody.appendChild(fila);
            return;
        }
        historialPagos.forEach(pago => {
            const fila = document.createElement('tr');
            fila.innerHTML = `<td>${new Date(pago.fecha).toLocaleDateString('es-CO')}</td>
                              <td>${pago.tipo}</td>
                              <td>${pago.detalle}</td>
                              <td>$${pago.monto.toLocaleString('es-CO')}</td>
                              <td>${pago.estado}</td>`;
            historialBody.appendChild(fila);
        });
    }

    (async function init() {
        try {
            const areas = await fetchAreasConFallback();
            poblarAreas(areas);
            actualizarMontoReserva();
        } catch (err) {
            if (areaComun) { areaComun.innerHTML = '<option value="">Error cargando áreas</option>'; areaComun.disabled = true; }
        }

        // Cargar tarifa de administración al iniciar (si el input existe)
        // esto garantiza que el monto de administración esté visible sin interactuar
        cargarTarifaAdministracion();

        if (tipoPago && tipoPago.value === 'reserva') { if (camposReserva) camposReserva.style.display = 'block'; actualizarMontoReserva(); }
        cargarHistorialPagos();
    })();
});