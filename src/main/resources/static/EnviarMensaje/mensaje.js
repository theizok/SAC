// Función para guardar el mensaje en LocalStorage
function guardarMensaje(event) {
    event.preventDefault(); // Evita que el formulario se envíe

    // Seleccionamos los campos del formulario
    const inputAsunto = document.getElementById('asunto');
    const inputRemitente = document.getElementById('remitente');
    const selectDestinatario = document.getElementById('destinatario');
    const textareaMensaje = document.querySelector('.contenido-mensaje textarea');

    // Obtenemos los valores del formulario
    const asunto = inputAsunto.value;
    const remitente = inputRemitente.value;
    const destinatario = selectDestinatario.value;
    const mensaje = textareaMensaje.value;
    const fecha = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

    // Validamos que todos los campos estén completos
    if (!asunto || !remitente || !destinatario || !mensaje) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Creamos un objeto con los datos del mensaje
    const nuevoMensaje = {
        asunto,
        remitente,
        destinatario,
        mensaje,
        fecha,
    };

    // Recuperamos los mensajes existentes en LocalStorage (si los hay)
    const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];

    // Agregamos el nuevo mensaje al array
    mensajesGuardados.push(nuevoMensaje);

    // Guardamos el array actualizado en LocalStorage
    localStorage.setItem('mensajes', JSON.stringify(mensajesGuardados));

    // Limpiamos el formulario
    event.target.reset();

    // Redirigimos a la página de "Mensajes enviados" (mensaje.html)
    window.location.href = 'mensaje.html';
}

// Función para mostrar los mensajes en la página "Mensajes enviados"
function mostrarMensajes() {
    // Recuperamos los mensajes guardados en LocalStorage
    const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];

    // Seleccionamos los contenedores de la lista de títulos y el contenido
    const listaTitulos = document.querySelector('.lista-titulos');
    const contenidoMensaje = document.querySelector('.contenido-mensaje');

    // Limpiamos los contenedores (por si ya había mensajes mostrados)
    listaTitulos.innerHTML = '';
    contenidoMensaje.innerHTML = '';

    // Recorremos los mensajes y los agregamos al DOM
    mensajesGuardados.forEach((mensaje, index) => {
        // Creamos el título del mensaje
        const titulo = document.createElement('div');
        titulo.classList.add('titulo-mensaje');
        titulo.setAttribute('data-id', index + 1); // Asignamos un ID único
        titulo.innerHTML = `
            <h2>${mensaje.asunto}</h2>
            <p><strong>Fecha:</strong> ${mensaje.fecha}</p>
        `;

        // Escuchamos el clic en el título para mostrar el contenido
        titulo.addEventListener('click', () => {
            // Removemos la clase 'active' de todos los títulos
            document.querySelectorAll('.titulo-mensaje').forEach(t => t.classList.remove('active'));

            // Agregamos la clase 'active' al título seleccionado
            titulo.classList.add('active');

            // Mostramos el contenido del mensaje
            contenidoMensaje.innerHTML = `
                <div class="mensaje" id="mensaje-${index + 1}">
                    <h2>${mensaje.asunto}</h2>
                    <div class="info-mensaje">
                        <p><strong>Remitente:</strong> ${mensaje.remitente}</p>
                        <p><strong>Destinatario:</strong> ${mensaje.destinatario}</p>
                        <p><strong>Fecha:</strong> ${mensaje.fecha}</p>
                    </div>
                    <div class="contenido">
                        <p>${mensaje.mensaje}</p>
                    </div>
                    <!-- Botón de eliminar -->
                    <button class="btn-eliminar" data-id="${index}">Eliminar</button>
                </div>
            `;
        });

        // Agregamos el título a la lista
        listaTitulos.appendChild(titulo);
    });

    // Mostramos el primer mensaje por defecto (si hay mensajes)
    if (mensajesGuardados.length > 0) {
        listaTitulos.firstChild.click(); // Simulamos un clic en el primer título
    }
}

// Función para eliminar un mensaje
function eliminarMensaje(id) {
    // Recuperamos los mensajes guardados en LocalStorage
    const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];

    // Filtramos el mensaje que queremos eliminar
    const mensajesActualizados = mensajesGuardados.filter((mensaje, index) => index !== id);

    // Guardamos el array actualizado en LocalStorage
    localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));

    // Recargamos la página para reflejar los cambios
    location.reload();
}

// Función para filtrar los mensajes por palabra clave
function filtrarMensajes() {
    const palabraClave = document.getElementById('buscar').value.toLowerCase();
    const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];
    const listaTitulos = document.querySelector('.lista-titulos');
    const contenidoMensaje = document.querySelector('.contenido-mensaje');

    // Limpiamos los contenedores
    listaTitulos.innerHTML = '';
    contenidoMensaje.innerHTML = '';

    // Filtramos los mensajes según la palabra clave
    const mensajesFiltrados = mensajesGuardados.filter(mensaje => {
        const asunto = mensaje.asunto.toLowerCase();
        const contenido = mensaje.mensaje.toLowerCase();
        return asunto.includes(palabraClave) || contenido.includes(palabraClave);
    });

    // Mostramos los mensajes filtrados
    mensajesFiltrados.forEach((mensaje, index) => {
        const titulo = document.createElement('div');
        titulo.classList.add('titulo-mensaje');
        titulo.setAttribute('data-id', index + 1);
        titulo.innerHTML = `
            <h2>${mensaje.asunto}</h2>
            <p><strong>Fecha:</strong> ${mensaje.fecha}</p>
        `;

        titulo.addEventListener('click', () => {
            document.querySelectorAll('.titulo-mensaje').forEach(t => t.classList.remove('active'));
            titulo.classList.add('active');
            contenidoMensaje.innerHTML = `
                <div class="mensaje" id="mensaje-${index + 1}">
                    <h2>${mensaje.asunto}</h2>
                    <div class="info-mensaje">
                        <p><strong>Remitente:</strong> ${mensaje.remitente}</p>
                        <p><strong>Destinatario:</strong> ${mensaje.destinatario}</p>
                        <p><strong>Fecha:</strong> ${mensaje.fecha}</p>
                    </div>
                    <div class="contenido">
                        <p>${mensaje.mensaje}</p>
                    </div>
                    <button class="btn-eliminar" data-id="${index}">Eliminar</button>
                </div>
            `;
        });

        listaTitulos.appendChild(titulo);
    });

    if (mensajesFiltrados.length > 0) {
        listaTitulos.firstChild.click();
    }
}

// Vinculamos las funciones a las páginas correspondientes
if (document.querySelector('.enviar-mensaje')) {
    // Si estamos en la página "Enviar mensajes" (enviar_m.html), escuchamos el evento submit del formulario
    const formulario = document.querySelector('.enviar-mensaje');
    formulario.addEventListener('submit', guardarMensaje);
}

if (document.querySelector('.mensajes-enviados')) {
    // Si estamos en la página "Mensajes enviados" (mensaje.html), mostramos los mensajes al cargar la página
    document.addEventListener('DOMContentLoaded', mostrarMensajes);

    // Escuchamos los clics en los botones de eliminar
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-eliminar')) {
            const id = event.target.getAttribute('data-id');
            eliminarMensaje(Number(id));
        }
    });

    // Escuchamos los cambios en el campo de búsqueda
    document.getElementById('buscar').addEventListener('input', filtrarMensajes);
}