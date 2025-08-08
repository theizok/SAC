document.addEventListener("DOMContentLoaded", () => {
    const userType = sessionStorage.getItem("userType");
    const idCuenta = sessionStorage.getItem("idCuenta");
    const rol = userType?.toLowerCase() || "";

    let apiUrl = "";
    switch (rol) {
        case "residente":
            apiUrl = "http://localhost:8080/api/residente/obtenerMensajes";
            break;
        case "propietario":
            apiUrl = "http://localhost:8080/api/propietario/obtenerMensajes";
            break;
        default:
            console.warn("Rol no reconocido:", userType);
    }

    const tabEnviados = document.getElementById("tab-enviados");
    const tabRecibidos = document.getElementById("tab-recibidos");

    function activarTab(tab) {
        [tabEnviados, tabRecibidos].forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
    }

    function renderizarMensajes(data) {
        const lista = document.getElementById("areaTitulo");
        const panel = document.getElementById("areaContenido");
        lista.innerHTML = "";
        panel.innerHTML = `<div class="empty-state" id="emptyState">
                               <i class="fas fa-envelope-open-text"></i>
                               <p>Selecciona un mensaje para ver su contenido</p>
                           </div>`;

        data.forEach((m, i) => {
            const card = document.createElement("div");
            card.className = "titulo-mensaje";
            card.dataset.id = i + 1;
            card.innerHTML = `
                <div class="mensaje-header">
                    <span class="mensaje-remitente">${m.remitente||"Administración"}</span>
                    <span>${new Date(m.fecha).toLocaleString()}</span>
                </div>
                <div class="mensaje-asunto">${m.asunto}</div>
                <div class="mensaje-contenido">${m.contenido}</div>
            `;

            const detail = document.createElement("div");
            detail.className = "contenido-mensaje";
            detail.id = `mensaje-${i+1}`;
            detail.innerHTML = `
                <div class="message-detail">
                    <h2>${m.asunto}</h2>
                    <div class="message-meta">
                        <span><strong>De:</strong> ${m.remitente||"Administrador"}</span>
                        <span><strong>Fecha:</strong> ${new Date(m.fecha).toLocaleString()}</span>
                    </div>
                    <div class="message-body">${m.contenido}</div>
                </div>
            `;

            lista.appendChild(card);
            panel.appendChild(detail);

            card.addEventListener("click", () => {
                const empty = document.getElementById("emptyState");
                if (empty) empty.style.display = "none";
                document.querySelectorAll(".titulo-mensaje").forEach(x => x.classList.remove("active"));
                document.querySelectorAll(".contenido-mensaje").forEach(x => x.classList.remove("active"));
                card.classList.add("active");
                detail.classList.add("active");
            });
        });
    }

    async function obtenerMensajesEnviados() {
        if (!apiUrl) return;
        try {
            const resp = await fetch(`${apiUrl}?idCuenta=${idCuenta}`, {
                headers: { "Content-Type": "application/json" }
            });
            if (!resp.ok) throw new Error("Error al obtener mensajes enviados");
            const data = await resp.json();
            renderizarMensajes(data);
        } catch (e) {
            console.error(e);
        }
    }
    

    tabEnviados.addEventListener("click", () => {
        activarTab(tabEnviados);
        obtenerMensajesEnviados();
    });
    tabRecibidos.addEventListener("click", () => {
        activarTab(tabRecibidos);
        obtenerMensajesRecibidos();
    });

    obtenerMensajesEnviados();
});