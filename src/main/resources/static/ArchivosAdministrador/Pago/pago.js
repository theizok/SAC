document.addEventListener("DOMContentLoaded", function(){







    // Cambio de pestañas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
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

})





