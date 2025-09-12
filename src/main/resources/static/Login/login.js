let messageTimeout = null;

function showMessage(text, type = "error", options = {}) {
    const container = document.getElementById("responseMessage");
    const iconEl = document.getElementById("responseIcon");
    const textEl = document.getElementById("responseText");
    const loginCard = document.querySelector(".login-card");
    const loginBtn = document.querySelector(".login-btn");

    if (!container || !iconEl || !textEl) return;

    // limpiar clases previas
    container.classList.remove("error", "success", "info", "show");
    // reset icon classes a la base
    iconEl.className = "fas";
    textEl.textContent = text;

    // elegir icono y clase por tipo
    if (type === "error") {
        container.classList.add("error");
        iconEl.classList.add("fa-exclamation-triangle");
        iconEl.setAttribute("aria-label", "Error");
    } else if (type === "success") {
        container.classList.add("success");
        iconEl.classList.add("fa-check-circle");
        iconEl.setAttribute("aria-label", "Éxito");
    } else {
        container.classList.add("info");
        iconEl.classList.add("fa-info-circle");
        iconEl.setAttribute("aria-label", "Información");
    }

    // Mostrar
    container.hidden = false;
    void container.offsetWidth;
    container.classList.add("show");

    // Efecto adicional: sacudir formulario en caso de error
    if (type === "error" && loginCard) {
        loginCard.classList.remove("shake"); // reinicia
        void loginCard.offsetWidth;
        loginCard.classList.add("shake");
        // resaltar boton brevemente
        if (loginBtn) {
            loginBtn.classList.add("error-glow");
            setTimeout(() => loginBtn.classList.remove("error-glow"), 700);
        }
    }

    const duration = typeof options.duration === "number" ? options.duration : 4000;
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        container.classList.remove("show");
        // esconder tras transición
        setTimeout(() => container.hidden = true, 260);
    }, duration);
}

document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll("#correo, #contraseña");
    inputs.forEach(el => {
        el.addEventListener("input", () => {
            const c = document.getElementById("responseMessage");
            if (c && c.classList.contains("show")) {
                c.classList.remove("show");
                setTimeout(() => c.hidden = true, 220);
            }
        });
    });
});

/* ---------- submit handler ---------- */
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contraseña").value;

    // validación simple en front (opcional)
    if (!correo || !contraseña) {
        showMessage("Por favor completa todos los campos.", "error", { duration: 3000 });
        return;
    }

    const usuario = JSON.stringify({ correo: correo, contraseña: contraseña });

    try {
        const respuesta = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: usuario,
            credentials: "include"
        });

        if (!respuesta.ok) {
            // mostrar mensajes distintos segun status
            if (respuesta.status === 401 || respuesta.status === 403) {
                showMessage("Credenciales incorrectas. Verifica correo y contraseña.", "error");
            } else if (respuesta.status >= 500) {
                showMessage("Error del servidor. Intenta de nuevo más tarde.", "error");
            } else {
                showMessage("No fue posible iniciar sesión.", "error");
            }
            return;
        }

        const data = await respuesta.json();
        const role = data.userType;
        sessionStorage.setItem("userType", data.userType);
        sessionStorage.setItem("id", data.id);
        sessionStorage.setItem("idCuenta", data.idCuenta);

        showMessage("Inicio de sesión correcto. Redirigiendo...", "success", { duration: 1200 });

        setTimeout(() => {
            if (role === "ADMINISTRADOR") {
                window.location.href = "/api/administrador/dashboard";
            } else if (role === "RESIDENTE") {
                window.location.href = "/api/residente/dashboard";
            } else if (role === "PROPIETARIO") {
                window.location.href = "/api/propietario/dashboard";
            } else {
                window.location.href = "/";
            }
        }, 900);

    } catch (error) {
        console.error("Error:", error);
        showMessage("Error de conexión. Revisa tu red.", "error");
    }
});