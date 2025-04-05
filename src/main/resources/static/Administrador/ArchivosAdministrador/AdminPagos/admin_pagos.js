
document.addEventListener('DOMContentLoaded', function() {
    const filtroTipo = document.getElementById('filtro-tipo');
    const pagosBody = document.getElementById('pagos-body');
    const btnExportar = document.getElementById('btn-exportar');

    // Cargar pagos desde localStorage
    const pagos = JSON.parse(localStorage.getItem('historialPagos')) || [];

    // Función para cargar los pagos en la tabla
    function cargarPagos(filtroTipoValue = 'todos') {
        pagosBody.innerHTML = '';

        if (pagos.length === 0) {
            pagosBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay pagos registrados</td></tr>';
            return;
        }

        pagos.forEach(pago => {
            if (filtroTipoValue === 'todos' || pago.tipo === filtroTipoValue) {
                const fila = document.createElement('tr');
                const fechaFormateada = new Date(pago.fecha).toLocaleDateString('es-CO');
                const usuario = pago.usuario || 'N/A'; // Si no hay usuario, mostrar "N/A"

                fila.innerHTML = `
                    <td>${fechaFormateada}</td>
                    <td>${usuario}</td>
                    <td>${pago.tipo === 'administracion' ? 'Administración' : 'Reserva'}</td>
                    <td>${pago.detalle}</td>
                    <td>$${pago.monto.toLocaleString('es-CO')}</td>
                    <td><span class="estado-pago estado-${pago.estado.toLowerCase()}">${pago.estado}</span></td>
                `;
                pagosBody.appendChild(fila);
            }
        });
    }

    // Aplicar filtro por tipo
    filtroTipo.addEventListener('change', function() {
        cargarPagos(this.value);
    });

    // Exportar a Excel
    btnExportar.addEventListener('click', function() {
        alert('Exportando pagos a Excel...');
        // Aquí podrías implementar la lógica para exportar a Excel usando una librería como SheetJS
    });

    // Cargar pagos al inicio
    cargarPagos();
});