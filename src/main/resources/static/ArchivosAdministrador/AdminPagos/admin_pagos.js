document.addEventListener('DOMContentLoaded', () => {
    const filtroTipo = document.getElementById('filtro-tipo');
    const pagosBody = document.getElementById('pagos-body');

    // normaliza: quita acentos y pasa a minúsculas
    function normalizeString(s) {
        if (!s && s !== 0) return '';
        return String(s)
            .normalize('NFD')                // separa diacríticos
            .replace(/[\u0300-\u036f]/g, '') // quita diacríticos
            .toLowerCase()
            .trim();
    }

    // mapa estado -> clase CSS
    function estadoAClase(estado) {
        if (!estado) return 'estado-pendiente';
        const e = normalizeString(estado);
        if (e.includes('aprob')) return 'estado-pagado';
        if (e.includes('pend')) return 'estado-pendiente';
        if (e.includes('cancel') || e.includes('rechaz') ) return 'estado-cancelado';
        if (e.includes('reembol')) return 'estado-cancelado';
        return 'estado-pendiente';
    }

    // Lógica de filtrado más tolerante
    function categoriaCoincideFiltro(categoriaRaw, filtroValue) {
        // si filtro es 'todos' siempre pasa
        if (!filtroValue || filtroValue === 'todos') return true;

        const cat = normalizeString(categoriaRaw);
        const filtro = normalizeString(filtroValue);

        // casos especiales: permitir coincidencias parciales/sin acento
        if (filtro === 'administracion' || filtro === 'administración') {
            // coincide si contiene 'admin' o 'administr'
            return cat.includes('admin') || cat.includes('administr');
        }
        if (filtro === 'reserva' || filtro === 'reservas' || filtro === 'area' || filtro === 'área') {
            return cat.includes('reserv') || cat.includes('area') || cat.includes('área');
        }

        // comparación por inclusión (más flexible)
        return cat.includes(filtro);
    }

    async function cargarPagos() {
        pagosBody.innerHTML = '';

        try {
            const response = await fetch("/api/pago/obtenerTodos");
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

            // DEBUG: listar categorías únicas para diagnóstico (ver consola)
            try {
                const cats = [...new Set(pagos.map(p => p.categoria || '---').map(s => String(s)))];
                console.debug('Categorías recibidas (únicas):', cats);
            } catch (e) {
                console.debug('No se pudo listar categorías únicas:', e);
            }

            // Ordenar por fecha descendente
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

                const usuario = pago.idCuenta !== undefined && pago.idCuenta !== null ? pago.idCuenta : 'N/A';
                const monto = pago.valor != null ? Number(pago.valor) : null;
                const montoFormateado = (monto === null) ? '-' : `$${monto.toLocaleString('es-CO')}`;

                const estado = pago.estadoPago || 'PENDIENTE';
                const claseEstado = estadoAClase(estado);

                fila.innerHTML = `
                    <td>${fechaFormateada}</td>
                    <td>${usuario}</td>
                    <td>${pago.categoria || '-'}</td>
                    <td>${pago.descripcion || '-'}</td>
                    <td>${montoFormateado}</td>
                    <td><span class="estado-pago ${claseEstado}">${estado}</span></td>
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

    filtroTipo.addEventListener('change', cargarPagos);

    cargarPagos();
});
