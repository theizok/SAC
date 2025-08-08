document.addEventListener("DOMContentLoaded", async () => {
    const areaTitulo = document.getElementById("areaTitulo");
    const areaContenido = document.getElementById("areaContenido");

    function getRemitente(mensaje) {
        if (mensaje.remitente) return mensaje.remitente;
        if (mensaje.cuenta && mensaje.cuenta.nombre) return mensaje.cuenta.nombre;
        if (mensaje.cuenta && mensaje.cuenta.idCuenta) return `Cuenta #${mensaje.cuenta.idCuenta}`;
        return 'Administración';
    }

    try {
        const response = await fetch("http://localhost:8080/api/administrador/obtenerMensajes", {
            method: "GET"
        });
        if (!response.ok) throw new Error("Error al obtener todos los mensajes");
        const data = await response.json();

        data.forEach((mensaje, index) => {

            console.log("Mensaje recibido del API:", mensaje);

            const messageItem = document.createElement('div');
            messageItem.classList.add('message-item');
            messageItem.setAttribute('data-id', index + 1);


            const fecha = new Date(mensaje.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            messageItem.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${ getRemitente(mensaje) }</span>
                    <span class="message-date">${ fechaFormateada }</span>
                </div>
                <div class="message-subject">${ mensaje.asunto }</div>
                <div class="message-preview">${ mensaje.contenido.substring(0, 100) }...</div>
            `;

            const messageDetail = document.createElement('div');
            messageDetail.classList.add('message-detail');
            messageDetail.setAttribute('id', `mensaje-${index + 1}`);
            messageDetail.innerHTML = `
                <div class="message-detail-header">
                    <h2 class="message-detail-subject">${ mensaje.asunto }</h2>
                    <div class="message-detail-meta">
                        <span><strong>De:</strong> ${ getRemitente(mensaje) }</span>
                        <span><strong>Fecha:</strong> ${ fechaFormateada }</span>
                    </div>
                </div>
                <div class="message-detail-content">
                    <p>${ mensaje.contenido }</p>
                </div>
                <div class="message-actions">
                    <button class="btn btn-reply"><i class="fas fa-reply"></i> Responder</button>
                    <button class="btn btn-delete"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            `;

            messageItem.addEventListener('click', () => {
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) emptyState.style.display = 'none';

                document.querySelectorAll('.message-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll('.message-detail').forEach(detail => detail.classList.remove('active'));

                messageItem.classList.add('active');
                messageDetail.classList.add('active');
            });

            areaTitulo.appendChild(messageItem);
            areaContenido.appendChild(messageDetail);
        });

        if (data.length > 0) {
            const emptyState = document.querySelector('.empty-state');
            if (emptyState) emptyState.style.display = 'none';

            const firstMessage = document.querySelector('.message-item');
            const firstDetail = document.querySelector('.message-detail');
            if (firstMessage && firstDetail) {
                firstMessage.classList.add('active');
                firstDetail.classList.add('active');
            }
        }

    } catch (e) {
        console.error("Error al cargar los mensajes:", e);
        areaTitulo.innerHTML = '<div class="error-message">Error al cargar los mensajes. Por favor intente más tarde.</div>';
    }
});