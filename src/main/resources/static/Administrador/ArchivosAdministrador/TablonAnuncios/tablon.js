document.addEventListener("DOMContentLoaded", async function () {
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

    // Cargar las publicaciones
    await cargarPublicaciones();
});

async function cargarPublicaciones() {
    const publicacionesContainer = document.getElementById("contenedor-publicaciones");
    publicacionesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando publicaciones...</div>';

    try {
        // Petición al backend
        const response = await fetch("http://localhost:8080/api/tablon/publicaciones");
        if(!response.ok) {
            throw new Error("Error al obtener publicaciones");
        }
        const publicaciones = await response.json();

        // Verificación de publicaciones
        if (publicaciones.length === 0) {
            publicacionesContainer.innerHTML = '<div class="no-results"><i class="fas fa-info-circle"></i> No hay publicaciones disponibles.</div>';
            return;
        }

        // Limpiar el contenedor
        publicacionesContainer.innerHTML = '';

        // Iterar sobre las publicaciones y agregarlas al DOM
        publicaciones.forEach(publicacion => {
            const publicacionElement = crearElementoPublicacion(publicacion);
            publicacionesContainer.appendChild(publicacionElement);
        });

        // Configurar eventos de eliminación
        configurarBotonesEliminar();

    } catch (error) {
        console.error("Error al cargar publicaciones:", error);
        publicacionesContainer.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Error al cargar las publicaciones. Intente nuevamente más tarde.</div>';
    }
}

function crearElementoPublicacion(publicacion) {
    const divPublicacion = document.createElement("div");
    divPublicacion.className = "publicacion";
    divPublicacion.setAttribute("data-id", publicacion.id);
    divPublicacion.setAttribute("data-fecha", publicacion.fecha);
    divPublicacion.setAttribute("data-autor", publicacion.autor || "Administrador");

    divPublicacion.innerHTML = `
        <div class="publicacion-header">
            <h3>${publicacion.titulo || 'Sin título'}</h3>
            <button class="btn-eliminar" title="Eliminar publicación"><i class="fas fa-times"></i></button>
        </div>
        <div class="publicacion-body">
            <div class="publicacion-meta">
                <span><strong><i class="fas fa-user"></i> Por:</strong> ${publicacion.autor || 'Administrador'}</span>
                <span><strong><i class="fas fa-calendar-alt"></i> Fecha:</strong> ${formatearFecha(publicacion.fecha)}</span>
            </div>
            <div class="publicacion-content">
                ${publicacion.contenido || 'No hay contenido disponible.'}
            </div>
        </div>
    `;

    return divPublicacion;
}

function configurarBotonesEliminar() {
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const publicacionId = this.closest('.publicacion').getAttribute('data-id');
            if(confirm('¿Está seguro que desea eliminar esta publicación?')) {
                eliminarPublicacion(publicacionId);
            }
        });
    });
}

async function eliminarPublicacion(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/tablon/publicaciones/${id}`, {
            method: 'DELETE'
        });

        if(response.ok) {
            await cargarPublicaciones();
        } else {
            throw new Error('Error al eliminar la publicación');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo eliminar la publicación');
    }
}

function filtrarPublicaciones(filtro) {
    const publicaciones = document.querySelectorAll('.publicacion');
    
    publicaciones.forEach(pub => {
        switch(filtro) {
            case 'todos':
                pub.style.display = 'flex';
                break;
            case 'recientes':
                ordenarPublicacionesPorFecha('desc');
                pub.style.display = 'flex';
                break;
            case 'antiguos':
                ordenarPublicacionesPorFecha('asc');
                pub.style.display = 'flex';
                break;
            case 'administrador':
                const autor = pub.getAttribute('data-autor');
                pub.style.display = (autor && autor.toLowerCase().includes('admin')) ? 'flex' : 'none';
                break;
        }
    });
}

function ordenarPublicacionesPorFecha(orden) {
    const contenedor = document.getElementById('contenedor-publicaciones');
    const publicaciones = Array.from(contenedor.querySelectorAll('.publicacion'));
    
    publicaciones.sort((a, b) => {
        const fechaA = a.getAttribute('data-fecha') || '';
        const fechaB = b.getAttribute('data-fecha') || '';
        
        return orden === 'asc' 
            ? fechaA.localeCompare(fechaB)
            : fechaB.localeCompare(fechaA);
    });
    
    // Limpiar el contenedor y añadir las publicaciones ordenadas
    contenedor.innerHTML = '';
    publicaciones.forEach(pub => {
        contenedor.appendChild(pub);
    });
}

function formatearFecha(fechaRaw) {
    if (!fechaRaw) return 'Fecha desconocida';
    
    // Si la fecha está en formato ISO (YYYY-MM-DD)
    if (fechaRaw.match(/^\d{4}-\d{2}-\d{2}/)) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaRaw).toLocaleDateString('es-ES', options);
    }
    
    // Si la fecha está en formato DD-MM-YYYYHHMMSS
    try {
        const dia = fechaRaw.substring(0, 2);
        const mes = fechaRaw.substring(3, 5);
        const anio = fechaRaw.substring(6, 10);
        return new Date(`${anio}-${mes}-${dia}`).toLocaleDateString('es-ES', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    } catch (e) {
        return fechaRaw;
    }
}