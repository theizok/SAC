document.addEventListener('DOMContentLoaded', () => {
    const filtroTipo = document.getElementById('filtro-tipo');
    const pagosBody = document.getElementById('pagos-body');

    // Admin cash form elements
    const btnResolver = document.getElementById('btn-resolver-cuenta');
    const inputDocumento = document.getElementById('admin-documento');
    const inputIdCuenta = document.getElementById('admin-idcuenta');
    const inputNombreUsuario = document.getElementById('admin-nombre-usuario');
    const inputValor = document.getElementById('admin-valor');
    const inputCategoria = document.getElementById('admin-categoria');
    const inputDescripcion = document.getElementById('admin-descripcion');
    const btnCrear = document.getElementById('btn-crear-efectivo');

    const selectTipoPago = document.getElementById('admin-tipo-pago');
    const areaContainer = document.getElementById('area-select-container');
    const selectArea = document.getElementById('admin-area');
    const msg = document.getElementById('admin-cash-msg');

    let areasCache = [];

    function normalizeString(s) {
        if (!s && s !== 0) return '';
        return String(s)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function estadoAClase(estado) {
        if (!estado) return 'estado-pendiente';
        const e = normalizeString(estado);
        if (e.includes('aprob') || e.includes('paid') || e.includes('pagado')) return 'estado-pagado';
        if (e.includes('pend')) return 'estado-pendiente';
        if (e.includes('cancel') || e.includes('rechaz') || e.includes('reembol') || e.includes('refund')) return 'estado-cancelado';
        return 'estado-pendiente';
    }

    function categoriaCoincideFiltro(categoriaRaw, filtroValue) {
        if (!filtroValue || filtroValue === 'todos') return true;
        const cat = normalizeString(categoriaRaw);
        const filtro = normalizeString(filtroValue);

        if (filtro === 'administracion' || filtro === 'administración') {
            return cat.includes('admin') || cat.includes('administr');
        }
        if (filtro === 'reserva' || filtro === 'reservas' || filtro === 'area' || filtro === 'área') {
            return cat.includes('reserv') || cat.includes('area');
        }
        return cat.includes(filtro);
    }

    async function cargarPagos() {
        pagosBody.innerHTML = '';
        try {
            const response = await fetch("/api/pago/obtenerTodos", { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    pagosBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #b00;">Acceso no autorizado. Debes iniciar sesión como administrador.</td></tr>';
                    return;
                }
                throw new Error("Error al obtener los pagos");
            }

            let pagos = await response.json();
            if (!Array.isArray(pagos) || pagos.length === 0) {
                pagosBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay pagos registrados</td></tr>';
                return;
            }

            pagos.sort((a, b) => {
                const fa = a.fecha ? new Date(a.fecha) : new Date(0);
                const fb = b.fecha ? new Date(b.fecha) : new Date(0);
                return fb - fa;
            });

            const filtroTipoValue = filtroTipo.value;

            pagos.forEach(pago => {
                if (!categoriaCoincideFiltro(pago.categoria, filtroTipoValue)) return;

                const fila = document.createElement('tr');

                let fechaFormateada = '-';
                if (pago.fecha) {
                    const d = new Date(pago.fecha);
                    fechaFormateada = isNaN(d.getTime()) ? '-' : d.toLocaleString('es-CO');
                }

                let usuarioDisplay = 'N/A';
                if (pago.usuarioNombre) {
                    const doc = pago.usuarioDocumento || pago.idCuenta || '';
                    usuarioDisplay = `${pago.usuarioNombre} ${doc ? `(${doc})` : ''}`;
                } else if (pago.idCuenta !== undefined && pago.idCuenta !== null) {
                    usuarioDisplay = pago.idCuenta;
                }

                const monto = pago.valor != null ? Number(pago.valor) : null;
                const montoFormateado = (monto === null) ? '-' : `$${monto.toLocaleString('es-CO')}`;

                const estado = pago.estadoPago || 'PENDIENTE';
                const claseEstado = estadoAClase(estado);

                fila.innerHTML = `
                    <td>${fechaFormateada}</td>
                    <td>${escapeHtml(usuarioDisplay)}</td>
                    <td>${escapeHtml(pago.categoria || '-')}</td>
                    <td>${escapeHtml(pago.descripcion || '-')}</td>
                    <td>${montoFormateado}</td>
                    <td><span class="estado-pago ${claseEstado}">${escapeHtml(estado)}</span></td>
                `;

                pagosBody.appendChild(fila);
            });

            if (pagosBody.children.length === 0) {
                pagosBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay pagos que coincidan con el filtro</td></tr>';
            }
        } catch (error) {
            console.error("Error al recibir los pagos", error);
            pagosBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar los pagos</td></tr>';
        }
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

    // ---------- Funcionalidad admin: resolver documento -> idCuenta/nombre ----------
    async function resolverPorDocumento() {
        msg.textContent = '';
        msg.style.color = '#b00';
        const documento = (inputDocumento.value || '').trim();
        if (!documento) { msg.textContent = 'Ingresa un documento para buscar.'; return; }
        try {
            btnResolver.disabled = true;
            btnResolver.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            const res = await fetch(`/api/pago/admin/resolveCuenta?documento=${encodeURIComponent(documento)}`, {
                credentials: 'include'
            });
            if (!res.ok) {
                const txt = await res.text().catch(()=>null);
                msg.textContent = txt || 'No se encontró cuenta';
                inputIdCuenta.value = '';
                inputNombreUsuario.value = '';
                return;
            }
            const json = await res.json();
            inputIdCuenta.value = json.idCuenta || '';
            inputNombreUsuario.value = json.nombre || '';
            msg.style.color = 'green';
            msg.textContent = 'Cuenta encontrada. Verifica y registra el pago.';
        } catch (err) {
            console.error('Error resolviendo cuenta:', err);
            msg.style.color = '#b00';
            msg.textContent = 'Error al buscar cuenta';
        } finally {
            btnResolver.disabled = false;
            btnResolver.innerHTML = '<i class="fas fa-search"></i> Buscar';
        }
    }

    // ---------- Obtener áreas desde backend y poblar select ----------
    async function fetchAreas() {
        try {
            const res = await fetch('/api/areaComun/obtenerAreas', { credentials: 'include' });
            if (!res.ok) throw new Error('No se pudieron cargar áreas');
            const arr = await res.json();
            areasCache = Array.isArray(arr) ? arr : [];
            populateAreaSelect();
        } catch (err) {
            console.warn('fetchAreas error:', err);
            areasCache = [];
            populateAreaSelect();
        }
    }

    function populateAreaSelect() {
        selectArea.innerHTML = '';
        if (!areasCache.length) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No hay áreas registradas';
            selectArea.appendChild(opt);
            selectArea.disabled = true;
            return;
        }
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Seleccione un área --';
        selectArea.appendChild(placeholder);

        areasCache.forEach(a => {
            const opt = document.createElement('option');
            const idVal = a.id ?? a.idareacomun ?? a.idAreaComun ?? '';
            opt.value = idVal;
            opt.textContent = `${a.area ?? a.nombre ?? 'Área'}${a.descripcion ? ` — ${a.descripcion}` : ''}`;
            const precioVal = (a.precio !== undefined && a.precio !== null) ? a.precio : (a.tarifa ?? '');
            if (precioVal !== '') opt.dataset.precio = precioVal;
            selectArea.appendChild(opt);
        });
        selectArea.disabled = false;
    }

    // ---------- obtener tarifa administración ----------
    async function fetchTarifaAdministracion() {
        // intenta obtener /api/tarifa y buscar la tarifa de administración
        try {
            const res = await fetch('/api/tarifa', { credentials: 'include' });
            if (!res.ok) {
                console.warn('fetchTarifaAdministracion: respuesta no ok', res.status);
                return null;
            }
            const json = await res.json();
            // normalizar a arreglo
            let arr = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : (Array.isArray(json.tarifas) ? json.tarifas : []));
            if (!arr.length && typeof json === 'object') {
                const maybe = Object.values(json).find(v => Array.isArray(v));
                if (maybe) arr = maybe;
            }

            if (!arr || !arr.length) return null;

            // buscar por campos comunes
            const tarifaAdmin = arr.find(t => String(t.categoria ?? t.nombre ?? t.tipo ?? '').toLowerCase().includes('administr')) ||
                arr.find(t => String(t.id ?? '').toLowerCase().includes('administr'));

            if (!tarifaAdmin) return null;

            const valor = tarifaAdmin.valor ?? tarifaAdmin.precio ?? tarifaAdmin.monto ?? tarifaAdmin.tarifa ?? null;
            if (valor == null) return null;
            // devolver número (o string numérico)
            const n = Number(valor);
            return isNaN(n) ? null : n;
        } catch (err) {
            console.error('fetchTarifaAdministracion error:', err);
            return null;
        }
    }

    // ---------- Manejo del tipo de pago (mostrar/ocultar select de áreas) ----------
    function resetTipoUI() {
        selectTipoPago.value = '';
        areaContainer.style.display = 'none';
        inputCategoria.value = '';
    }

    selectTipoPago.addEventListener('change', async () => {
        const v = selectTipoPago.value;
        if (!v) {
            areaContainer.style.display = 'none';
            inputCategoria.value = '';
            return;
        }
        if (v === 'area_comun') {
            areaContainer.style.display = 'block';
            inputCategoria.value = 'Reserva';
            if (areasCache.length === 0) fetchAreas();
        } else if (v === 'administracion') {
            areaContainer.style.display = 'none';
            inputCategoria.value = 'Administración';
            try {
                inputValor.value = ''; // limpiar mientras carga
                const tarifa = await fetchTarifaAdministracion();
                if (tarifa != null) {
                    inputValor.value = Number(tarifa).toLocaleString('es-CO');
                } else {
                    // si no encontró nada, dejar el campo vacío para que el admin lo ingrese manualmente
                    inputValor.value = '';
                    // opcional: informar al admin
                    msg.style.color = '#b00';
                    msg.textContent = 'No se encontró tarifa de administración; ingrésala manualmente.';
                    setTimeout(()=> { if (msg.textContent && msg.textContent.includes('tarifa')) msg.textContent = ''; }, 4000);
                }
            } catch (err) {
                console.error('Error al cargar tarifa administración:', err);
            }
        } else {
            areaContainer.style.display = 'none';
            inputCategoria.value = '';
        }
    });

    // ---------- Al seleccionar área, AUTOCOMPLETAR VALOR ----------
    selectArea.addEventListener('change', () => {
        const opt = selectArea.options[selectArea.selectedIndex];
        if (!opt) return;
        const precioStr = opt.dataset ? opt.dataset.precio : undefined;
        if (precioStr !== undefined && precioStr !== '') {
            const precioNum = Number(String(precioStr).replace(/,/g,'.'));
            if (!isNaN(precioNum)) {
                inputValor.value = precioNum.toLocaleString('es-CO');
            }
        }
        if (!inputDescripcion.value) {
            inputDescripcion.value = opt.textContent || '';
        }
    });

    async function crearPagoEfectivo() {
        msg.textContent = '';
        msg.style.color = '#b00';

        const tipoPago = selectTipoPago.value;
        if (!tipoPago) {
            msg.textContent = 'Selecciona primero el tipo de pago (Administración o Área común).';
            return;
        }

        const idCuentaRaw = (inputIdCuenta.value || '').trim();
        if (!idCuentaRaw) { msg.textContent = 'Ingresa o busca una idCuenta'; return; }
        const idCuenta = Number(String(idCuentaRaw).replace(/\D/g, '')) || null;
        if (!idCuenta) { msg.textContent = 'IdCuenta inválido'; return; }

        const valorRaw = (inputValor.value || '').trim();
        if (!valorRaw) { msg.textContent = 'Ingresa el valor'; return; }
        const valor = Number(String(valorRaw).replace(/\./g, '').replace(/,/g, '.'));
        if (!valor || isNaN(valor) || valor <= 0) { msg.textContent = 'Valor inválido'; return; }

        let categoria = inputCategoria.value || '';
        let descripcion = inputDescripcion.value || '';

        if (tipoPago === 'area_comun') {
            const sel = selectArea.value;
            if (!sel) { msg.textContent = 'Selecciona un área común'; return; }
            const areaObj = areasCache.find(a => String(a.id) === String(sel) || String(a.idareacomun) === String(sel));
            if (areaObj) {
                categoria = 'Reserva';
                if (!descripcion) descripcion = `Reserva de ${areaObj.area}${areaObj.descripcion ? ' — ' + areaObj.descripcion : ''}`;
            }
        } else if (tipoPago === 'administracion') {
            categoria = 'Administración';
        }

        const payload = {
            idCuenta: idCuenta,
            valor: valor,
            descripcion: descripcion,
            categoria: categoria
        };

        try {
            btnCrear.disabled = true;
            const prev = btnCrear.innerHTML;
            btnCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            const res = await fetch('/api/pago/admin/crear-efectivo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text().catch(()=>null);
                msg.style.color = '#b00';
                msg.textContent = txt || `Error ${res.status}`;
                return;
            }

            const data = await res.json();
            msg.style.color = 'green';
            msg.textContent = 'Pago registrado correctamente.';
            await cargarPagos();

            inputDocumento.value = '';
            inputDescripcion.value = '';
            inputValor.value = '';
            inputNombreUsuario.value = '';
            inputIdCuenta.value = '';
            resetTipoUI();
            selectArea.innerHTML = '';
        } catch (err) {
            console.error('Error creando pago efectivo:', err);
            msg.style.color = '#b00';
            msg.textContent = 'Error interno registrando pago';
        } finally {
            btnCrear.disabled = false;
            btnCrear.innerHTML = '<i class="fas fa-plus-circle"></i> Registrar pago en efectivo';
        }
    }

    if (filtroTipo) filtroTipo.addEventListener('change', cargarPagos);
    if (btnResolver) btnResolver.addEventListener('click', resolverPorDocumento);
    if (btnCrear) btnCrear.addEventListener('click', crearPagoEfectivo);

    resetTipoUI();
    cargarPagos();
});
