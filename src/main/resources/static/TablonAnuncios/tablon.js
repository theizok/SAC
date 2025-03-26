 // Configurar evento para el botón "Crear publicación"
    const btnCrear = document.getElementById('btn-crear');
    if (btnCrear) {
        btnCrear.addEventListener('click', function() {
            window.location.href = '/api/tablon/crearPublicacion';
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
    


    //Cargar las publicaciones
 document.addEventListener("DOMContentLoaded", async function () {
     const publicacionesContainer = document.getElementById("contenedor-publicaciones");

     try {
         //Peticion al back
         const response = await fetch("http://localhost:8080/api/tablon/publicaciones");
         if(!response.ok) {
             throw new Error("Error al obtener publicaciones");
         }
         const publicaciones = await response.json();

         //Verificacion de publicaciones (Si hay o no)
         if (publicaciones.length === 0) {
             publicacionesContainer.innerHTML = "<p>No hay publicaciones disponibles.</p>";
             return;
         }

         // Iterar sobre las publicaciones y agregarlas al DOM
         publicaciones.forEach(publicacion => {
             const divPublicacion = document.createElement("div");
             divPublicacion.className = "publicacion";
             divPublicacion.setAttribute("data-id", publicacion.id);

             divPublicacion.innerHTML = `
                <div class="publicacion-header">
                    <h3>${publicacion.titulo}</h3>
                    <button class="btn-eliminar" title="Eliminar publicación">×</button>
                </div>
                <div class="publicacion-body">
                    <p><strong>Por:</strong>"Adminstrador"<span class="fecha"><strong>Fecha:</strong> ${publicacion.fecha}</span></p>
                    <p>${publicacion.contenido}</p>
                </div>
            `;
             // Agregar publicación al contenedor
            publicacionesContainer.appendChild(divPublicacion);
            });
            } catch (error) {
            console.error("Error al cargar publicaciones:", error);
            publicacionesContainer.innerHTML = "<p>Error al cargar las publicaciones.</p>";
     }
 });

    
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
