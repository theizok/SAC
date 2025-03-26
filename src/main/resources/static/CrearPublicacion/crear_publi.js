
document.addEventListener('DOMContentLoaded', function() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    
    const fechaFormateada = `${dia}-${mes}-${anio}${hora}${minutos}${segundos}`;
    document.getElementById('fecha').value = fechaFormateada;
    
    const formulario = document.getElementById('formulario-publicacion');
    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo').value;
        const contenido = document.getElementById('contenido').value;
        const fecha = document.getElementById('fecha').value;
  
        const nuevaPublicacion = {
            titulo: titulo,
            contenido: contenido,
            fecha: fecha,
            autor: 'Administrador' 
        };

        guardarPublicacion(nuevaPublicacion);

        window.location.href = 'tablon_anuncios.html';
    });

    function guardarPublicacion(publicacion) {
        let publicaciones = JSON.parse(localStorage.getItem('publicaciones')) || [];
        
        // Añadir la nueva publicación
        publicaciones.push(publicacion);
        
        localStorage.setItem('publicaciones', JSON.stringify(publicaciones));
    }
});