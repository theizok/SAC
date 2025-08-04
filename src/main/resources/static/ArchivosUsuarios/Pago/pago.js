document.addEventListener('DOMContentLoaded', async function () {
    // Elementos del DOM
    const tipoPago = document.getElementById('tipo-pago');

    //Cargar elementos guardados por sesion
    const idCuenta = sessionStorage.getItem("idCuenta");

    //Campos de pago de administración
    const camposAdmin = document.getElementById('campos-administracion');


    const camposReserva = document.getElementById('campos-reserva');
    const continuarPagoBtn = document.getElementById('continuar-pago');
    const modalPSE = document.getElementById('modal-pse');
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    const closeBtn = document.querySelector('.close');
    const btnPagoPSE = document.getElementById('btn-pago-pse');
    const btnCerrarConfirmacion = document.getElementById('btn-cerrar-confirmacion');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const filtroTipo = document.getElementById('filtro-tipo');
    const areaComun = document.getElementById('area-comun');
    const fechaReserva = document.getElementById('fecha-reserva');
    const horaReserva = document.getElementById('hora-reserva');
    const montoReserva = document.getElementById('monto-reserva');

    //Cargar valor de Administración
    try {

        const responseValorAdmin = await fetch("http://localhost:8080/api/tarifa", {
            method: "GET"
        })

        if (!responseValorAdmin.ok) {
            throw new Error("Error al obtener el valor de la administración")
        }

        const data = await responseValorAdmin.json();

        const tarifaAdmin = data.find(t => t.categoria === "Administración");

        if(tarifaAdmin) {
            document.getElementById("monto-admin").value = tarifaAdmin.valor
            let categoria = tarifaAdmin.categoria;

        }else {
            console.error("No se encontro la tarifa de administración")
        }
    } catch (e) {
        console.error("Error al cargar la tarifa\nError: "+ e)
    };




    // Establecer fecha mínima para la reserva (hoy)
    const hoy = new Date();
    const fechaMinima = hoy.toISOString().split('T')[0];
    fechaReserva.min = fechaMinima;

    // Cargar historial de pagos de ejemplo y mostrar el historial actual
    cargarPagosEjemplo();
    cargarHistorialPagos();

    // Event listeners

    // Cambio en el tipo de pago
    tipoPago.addEventListener('change', function () {
        // Ocultar todos los campos específicos
        camposAdmin.style.display = 'none';
        camposReserva.style.display = 'none';

        // Mostrar campos según selección
        if (this.value === 'administracion') {
            camposAdmin.style.display = 'block';
        } else if (this.value === 'reserva') {
            camposReserva.style.display = 'block';
            actualizarMontoReserva();
        }
    });

    // Actualizar monto de reserva cuando cambia el área o la hora
    areaComun.addEventListener('change', actualizarMontoReserva);
    horaReserva.addEventListener('change', actualizarMontoReserva);

    // Cambio de pestañas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Desactivar todas las pestañas
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activar la pestaña seleccionada
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Si es la pestaña de historial, recargar los datos
            if (tabId === 'historial-pagos') {
                cargarHistorialPagos();
            }
        });
    });

    // Filtrar historial
    filtroTipo.addEventListener('change', function () {
        const tipo = this.value;
        const filas = document.querySelectorAll('#historial-body tr');

        filas.forEach(fila => {
            if (tipo === 'todos' || fila.getAttribute('data-tipo') === tipo) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    });

    // Continuar con el pago
    continuarPagoBtn.addEventListener('click', async function () {
        const tipoPagoValue = tipoPago.value;

        if (!tipoPagoValue) {
            alert('Por favor, seleccione un tipo de pago');
            return;
        }

        let pago = {
            valor: 0,
            cuenta: {
                idCuenta: idCuenta // asegúrate de tener esto definido globalmente
            },
            descripcion: '',
            categoria: ''
        };

        if (tipoPagoValue === 'administracion') {
            const mesPago = document.getElementById('mes-pago').value;
            const montoAdmin = document.getElementById('monto-admin').value;

            pago.valor = parseFloat(montoAdmin);
            pago.descripcion = `Pago administracion mes: ${mesPago}`;
            pago.categoria = 'Administración';

            document.getElementById('pse-detalle').textContent = `Pago de administración - Mes: ${mesPago.charAt(0).toUpperCase() + mesPago.slice(1)}`;
            document.getElementById('pse-valor').textContent = `$${montoAdmin}`;

        } else if (tipoPagoValue === 'reserva') {
            if (!fechaReserva.value) {
                alert('Por favor, seleccione una fecha para la reserva');
                return;
            }

            const areaSeleccionada = areaComun.options[areaComun.selectedIndex].text;
            const fechaSeleccionada = formatearFecha(fechaReserva.value);
            const horaSeleccionada = horaReserva.options[horaReserva.selectedIndex].text;
            const montoReservaValue = montoReserva.value;

            pago.valor = parseFloat(montoReservaValue.replace(/\./g, '').replace(/,/g, ''));
            pago.descripcion = `Reserva de ${areaSeleccionada} - ${fechaSeleccionada} - ${horaSeleccionada}`;
            pago.categoria = 'Reserva';

            document.getElementById('pse-detalle').textContent = `Reserva de ${areaSeleccionada} - ${fechaSeleccionada} - ${horaSeleccionada}`;
            document.getElementById('pse-valor').textContent = `$${montoReservaValue}`;
        }

        try {
            const response = await fetch('http://localhost:8080/api/pago/mercado-pago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pago)
            });

            if (!response.ok) {
                throw new Error('Error al generar la preferencia de pago');
            }

            const data = await response.json();

            if (data.init_point) {
                // Redirige a Mercado Pago
                window.location.href = data.init_point;
            } else if (data.id) {
                // Alternativa: redirigir usando el SDK de Mercado Pago (si estás usando el frontend JS oficial)
                // mp.checkout({ preference: { id: data.id }, ... })
                console.log("ID de preferencia:", data.id);
            } else {
                alert('No se recibió una URL de pago válida');
            }

        } catch (error) {
            console.error('Error al generar pago con Mercado Pago:', error);
            alert('Hubo un error al procesar el pago. Intenta nuevamente.');
        }
    });

    // Funciones

    // Actualizar monto de reserva según área común y horario
    function actualizarMontoReserva() {
        const area = areaComun.value;
        const hora = horaReserva.value;
        let monto = 0;

        // Precios según área y horario
        const precios = {
            salon: {manana: 80000, tarde: 100000, noche: 120000},
            piscina: {manana: 50000, tarde: 70000, noche: 90000},
            bbq: {manana: 60000, tarde: 80000, noche: 100000},
            gimnasio: {manana: 30000, tarde: 40000, noche: 50000}
        };

        if (area && hora) {
            monto = precios[area][hora];
        }

        montoReserva.value = monto.toLocaleString('es-CO');
    }

    // Cargar historial de pagos
    function cargarHistorialPagos() {
        const historialBody = document.getElementById('historial-body');
        const historialPagos = JSON.parse(localStorage.getItem('historialPagos')) || [];

        // Limpiar tabla
        historialBody.innerHTML = '';

        // Si no hay historial, mostrar mensaje
        if (historialPagos.length === 0) {
            const fila = document.createElement('tr');
            fila.innerHTML = '<td colspan="5" style="text-align: center;">No hay pagos registrados</td>';
            historialBody.appendChild(fila);
            return;
        }

        // Ordenar por fecha (más reciente primero)
        historialPagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Agregar filas
        historialPagos.forEach(pago => {
            const fila = document.createElement('tr');
            fila.setAttribute('data-tipo', pago.tipo);

            const fechaFormateada = new Date(pago.fecha).toLocaleDateString('es-CO');

            fila.innerHTML = `
                <td>${fechaFormateada}</td>
                <td>${pago.tipo === 'administracion' ? 'Administración' : 'Reserva'}</td>
                <td>${pago.detalle}</td>
                <td>$${pago.monto.toLocaleString('es-CO')}</td>
                <td><span class="estado-pago estado-${pago.estado.toLowerCase()}">${pago.estado}</span></td>
            `;

            historialBody.appendChild(fila);
        });
    }

    // Guardar pago en historial
    function guardarPagoEnHistorial(numTransaccion, fecha) {
        const tipoPagoValue = tipoPago.value;
        let detalle, monto;

        if (tipoPagoValue === 'administracion') {
            const mesPago = document.getElementById('mes-pago').value;
            detalle = `Mes: ${mesPago.charAt(0).toUpperCase() + mesPago.slice(1)}`;
            monto = parseFloat(document.getElementById('monto-admin').value.replace(/\./g, '').replace(/,/g, ''));
        } else if (tipoPagoValue === 'reserva') {
            const areaSeleccionada = areaComun.options[areaComun.selectedIndex].text;
            const fechaSeleccionada = formatearFecha(fechaReserva.value);
            const horaSeleccionada = horaReserva.options[horaReserva.selectedIndex].text;
            detalle = `${areaSeleccionada} - ${fechaSeleccionada} - ${horaSeleccionada}`;
            monto = parseFloat(montoReserva.value.replace(/\./g, '').replace(/,/g, ''));
        }

        const nuevoPago = {
            id: numTransaccion,
            fecha: fecha,
            tipo: tipoPagoValue,
            detalle: detalle,
            monto: monto,
            estado: 'Pagado'
        };

        // Obtener historial actual
        const historialPagos = JSON.parse(localStorage.getItem('historialPagos')) || [];

        // Agregar nuevo pago
        historialPagos.push(nuevoPago);

        // Guardar en localStorage
        localStorage.setItem('historialPagos', JSON.stringify(historialPagos));
    }

    // Formatear fecha a DD/MM/YYYY
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();

        return `${dia}/${mes}/${año}`;
    }

    // Validar formato de correo electrónico
    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Añadir algunos pagos de ejemplo si no hay ninguno
    function cargarPagosEjemplo() {
        if (!localStorage.getItem('historialPagos')) {
            const pagosEjemplo = [
                {
                    id: 'PSE123456',
                    fecha: new Date(2024, 1, 15), // Febrero 15, 2024
                    tipo: 'administracion',
                    detalle: 'Mes: Febrero',
                    monto: 150000,
                    estado: 'Pagado'
                },
                {
                    id: 'PSE234567',
                    fecha: new Date(2024, 0, 10), // Enero 10, 2024
                    tipo: 'administracion',
                    detalle: 'Mes: Enero',
                    monto: 150000,
                    estado: 'Pagado'
                },
                {
                    id: 'PSE345678',
                    fecha: new Date(2024, 1, 20), // Febrero 20, 2024
                    tipo: 'reserva',
                    detalle: 'Salón Social - 25/02/2024 - Tarde (1:00 PM - 5:00 PM)',
                    monto: 100000,
                    estado: 'Pagado'
                },
                {
                    id: 'PSE456789',
                    fecha: new Date(2024, 2, 5), // Marzo 5, 2024
                    tipo: 'reserva',
                    detalle: 'Zona BBQ - 10/03/2024 - Noche (6:00 PM - 10:00 PM)',
                    monto: 100000,
                    estado: 'Pagado'
                }
            ];

            localStorage.setItem('historialPagos', JSON.stringify(pagosEjemplo));
        }
    }

    // Inicializar la aplicación mostrando los valores por defecto
    function init() {
        // Mostrar monto de reserva al cargar la página si se selecciona reserva
        if (tipoPago.value === 'reserva') {
            actualizarMontoReserva();
        }
    }

    // Ejecutar inicialización
    init();
});