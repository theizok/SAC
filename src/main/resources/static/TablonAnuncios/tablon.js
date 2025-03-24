 // Configurar evento para el botón "Crear publicación"
    const btnCrear = document.getElementById('btn-crear');
    if (btnCrear) {
        btnCrear.addEventListener('click', function() {
            window.location.href = 'crear_publi.html';
        });
    }
    
    // Configurar eventos para las opciones de filtro
    const opcionesFiltro = document.querySelectorAll('#filtro-opciones a');
    opcionesFiltro.forEach(opcion => {
        opcion.addEventListener('click', function(e) {
            e.preventDefault();
            const filtro = this.getAttribute('data-filter');
            filtrarPublicaciones(filtro);
        });
    });

    // Función para cargar publicaciones desde localStorage
    function cargarPublicaciones() {
        const publicaciones = JSON.parse(localStorage.getItem('publicaciones')) || [];
        const contenedorPublicaciones = document.getElementById('contenedor-publicaciones');
        
        // Limpiar el contenedor excepto el ejemplo si no hay publicaciones
        contenedorPublicaciones.innerHTML = '';
        
        // Si no hay publicaciones guardadas, añadir la publicación de ejemplo
        if (publicaciones.length === 0) {
            const ejemploPublicacion = crearPublicacionEjemplo();
            contenedorPublicaciones.appendChild(ejemploPublicacion);
            return;
        }
        
        // Añadir las publicaciones desde localStorage
        publicaciones.forEach(pub => {
            const publicacionElement = crearElementoPublicacion(pub);
            contenedorPublicaciones.appendChild(publicacionElement);
        });
    }
    
    // Función para crear la publicación de ejemplo
    function crearPublicacionEjemplo() {
        const divPublicacion = document.createElement('div');
        divPublicacion.className = 'publicacion';
        divPublicacion.setAttribute('data-id', 'ejemplo');
        
        divPublicacion.innerHTML = `
            <div class="publicacion-header">
                <h3>Corte de agua en el edificio</h3>
                <button class="btn-eliminar" title="Eliminar publicación">×</button>
            </div>
            <div class="publicacion-body">
                <p><strong>Por:</strong> Administrador <span class="fecha"><strong>Fecha:</strong> 2024-08-26</span></p>
                <p>Se le informa a los residentes de Miraflores que el día 30 de agosto del 2024 se realizará mantenimiento al alcantarillado del edificio, por ende, se cortará el agua de 12 p.m. a 6 p.m. del mismo día. Muchas gracias.</p>
            </div>
        `;
        
        // Agregar evento para el botón eliminar
        const btnEliminar = divPublicacion.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', function() {
            if (confirm('¿Estás seguro de eliminar esta publicación?')) {
                divPublicacion.remove();
            }
        });
        
        return divPublicacion;
    }
    
    // Función para crear elemento HTML de una publicación
    function crearElementoPublicacion(publicacion) {
        // Formatear la fecha para mostrarla en el formato adecuado
        const fechaRaw = publicacion.fecha;
        const fechaFormateada = formatearFecha(fechaRaw);
        
        // Crear elemento de publicación
        const divPublicacion = document.createElement('div');
        divPublicacion.className = 'publicacion';
        divPublicacion.setAttribute('data-id', publicacion.id);
        divPublicacion.setAttribute('data-fecha', fechaRaw);
        divPublicacion.setAttribute('data-autor', publicacion.autor);
        
        // Crear HTML interno
        divPublicacion.innerHTML = `
            <div class="publicacion-header">
                <h3>${publicacion.titulo}</h3>
                <button class="btn-eliminar" title="Eliminar publicación">×</button>
            </div>
            <div class="publicacion-body">
                <p><strong>Por:</strong> ${publicacion.autor} <span class="fecha"><strong>Fecha:</strong> ${fechaFormateada}</span></p>
                <p>${publicacion.contenido}</p>
            </div>
        `;
        
        // Agregar evento para el botón eliminar
        const btnEliminar = divPublicacion.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', function() {
            eliminarPublicacion(publicacion.id);
        });
        
        return divPublicacion;
    }
    
    // Función para eliminar una publicación
    function eliminarPublicacion(id) {
        if (confirm('¿Estás seguro de eliminar esta publicación?')) {
            // Eliminar del DOM
            const publicacionElement = document.querySelector(`.publicacion[data-id="${id}"]`);
            if (publicacionElement) {
                publicacionElement.remove();
            }
            
            // Eliminar del localStorage
            let publicaciones = JSON.parse(localStorage.getItem('publicaciones')) || [];
            publicaciones = publicaciones.filter(pub => pub.id !== id);
            localStorage.setItem('publicaciones', JSON.stringify(publicaciones));
        }
    }
    
    // Función para filtrar publicaciones
    function filtrarPublicaciones(filtro) {
        const publicaciones = document.querySelectorAll('.publicacion');
        
        publicaciones.forEach(pub => {
            switch(filtro) {
                case 'todos':
                    pub.style.display = 'block';
                    break;
                case 'recientes':
                    // Mostrar las publicaciones ordenadas por fecha (más recientes primero)
                    ordenarPublicacionesPorFecha('desc');
                    pub.style.display = 'block';
                    break;
                case 'antiguos':
                    // Mostrar las publicaciones ordenadas por fecha (más antiguas primero)
                    ordenarPublicacionesPorFecha('asc');
                    pub.style.display = 'block';
                    break;
                case 'administrador':
                    // Mostrar solo las publicaciones del administrador
                    const autor = pub.getAttribute('data-autor');
                    pub.style.display = (autor && autor.toLowerCase() === 'administrador') ? 'block' : 'none';
                    break;
            }
        });
    }
    
    // Función para ordenar publicaciones por fecha
    function ordenarPublicacionesPorFecha(orden) {
        const contenedor = document.getElementById('contenedor-publicaciones');
        const publicaciones = Array.from(contenedor.querySelectorAll('.publicacion'));
        
        publicaciones.sort((a, b) => {
            const fechaA = a.getAttribute('data-fecha') || '';
            const fechaB = b.getAttribute('data-fecha') || '';
            
            // Si ordenamos de forma ascendente (más antiguas primero)
            if (orden === 'asc') {
                return fechaA.localeCompare(fechaB);
            } 
            // Si ordenamos de forma descendente (más recientes primero)
            else {
                return fechaB.localeCompare(fechaA);
            }
        });
        
        // Limpiar el contenedor y añadir las publicaciones ordenadas
        contenedor.innerHTML = '';
        publicaciones.forEach(pub => {
            contenedor.appendChild(pub);
        });
    }
    
    // Función para formatear la fecha desde DD-MM-YYYYHHMMSS a YYYY-MM-DD
    function formatearFecha(fechaRaw) {
        if (!fechaRaw || fechaRaw.length < 10) return 'Fecha desconocida';
        
        // Si la fecha ya está en formato YYYY-MM-DD
        if (fechaRaw.includes('-') && fechaRaw.length === 10) {
            return fechaRaw;
        }
        
        // Si la fecha está en formato DD-MM-YYYYHHMMSS
        try {
            const dia = fechaRaw.substring(0, 2);
            const mes = fechaRaw.substring(3, 5);
            const anio = fechaRaw.substring(6, 10);
            
            return `${anio}-${mes}-${dia}`;
        } catch (e) {
            return fechaRaw;
        }
    }
