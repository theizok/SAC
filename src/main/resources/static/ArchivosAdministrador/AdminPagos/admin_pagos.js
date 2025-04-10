document.addEventListener('DOMContentLoaded', () => {
    const filtroTipo = document.getElementById('filtro-tipo');
    const pagosBody = document.getElementById('pagos-body');
    const btnExportar = document.getElementById('btn-exportar');

    async function cargarPagos() {
        pagosBody.innerHTML = '';

        try {
            const response = await fetch("http://localhost:8080/api/pago/obtenerPagos");
            if (!response.ok) {
                throw new Error("Error al obtener los pagos");
            }

            const pagos = await response.json();
            const filtroTipoValue = filtroTipo.value;

            if (pagos.length === 0) {
                pagosBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay pagos registrados</td></tr>';
                return;
            }

            pagos.forEach(pago => {
                if (filtroTipoValue === 'todos' || pago.tipo === filtroTipoValue) {
                    const fila = document.createElement('tr');
                    const fechaFormateada = new Date(pago.fecha).toLocaleDateString('es-CO');
                    const usuario = pago.idCuenta || 'N/A';

                    fila.innerHTML = `
                        <td>${fechaFormateada}</td>
                        <td>${usuario}</td>
                        <td>${pago.categoria}</td>
                        <td>${pago.descripcion}</td>
                        <td>$${pago.valor.toLocaleString('es-CO')}</td>
                        <td><span class="estado-pago estado-${pago.estadoPago.toLowerCase()}">${pago.estadoPago}</span></td>
                    `;
                    pagosBody.appendChild(fila);
                }
            });

        } catch (error) {
            console.error("Error al recibir los pagos", error);
            pagosBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar los pagos</td></tr>';
        }
    }

    filtroTipo.addEventListener('change', () => cargarPagos());

    btnExportar.addEventListener('click', () => {
        alert('Exportando pagos a Excel...');
        // Implementar exportación aquí
    });

    cargarPagos();
});
