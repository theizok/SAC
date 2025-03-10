// Función para enviar un mensaje
function enviarMensaje() {
    const destinatario = document.getElementById("recipient").value; // Corregir el ID
    const asunto = document.getElementById("subject").value; // Corregir el ID
    const mensaje = document.getElementById("message").value; // Corregir el ID

    const nuevoMensaje = {
        destinatario: destinatario,
        asunto: asunto,
        mensaje: mensaje,
        fecha: new Date().toLocaleString()
    };

    let mensajesEnviados = JSON.parse(localStorage.getItem("mensajesEnviados")) || [];
    mensajesEnviados.push(nuevoMensaje);
    localStorage.setItem("mensajesEnviados", JSON.stringify(mensajesEnviados));

    // Limpiar los campos después de enviar el mensaje
    document.getElementById("recipient").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("message").value = "";

    alert("Mensaje enviado con éxito!");
}

// Función para cargar los mensajes enviados
function cargarMensajesEnviados() {
    let mensajesEnviados = JSON.parse(localStorage.getItem("mensajesEnviados")) || [];
    const listaMensajes = document.getElementById("listaMensajesEnviados"); // Corregir el ID

    listaMensajes.innerHTML = ""; 
    mensajesEnviados.forEach(mensaje => {
        let li = document.createElement("li");
        li.className = "message-item";
        li.innerHTML = `
            <div class="message-header">Para: ${mensaje.destinatario} | Asunto: ${mensaje.asunto}</div>
            <div class="message-body">${mensaje.mensaje}</div>
            <div class="message-footer">Enviado el: ${mensaje.fecha}</div>
        `;
        listaMensajes.appendChild(li);
    });
}

// Llamar a la función cargarMensajesEnviados en la página de enviados
document.addEventListener("DOMContentLoaded", cargarMensajesEnviados);
