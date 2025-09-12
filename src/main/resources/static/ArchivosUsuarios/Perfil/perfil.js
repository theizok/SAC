document.addEventListener("DOMContentLoaded", () => {
    function showConfirm(options = {}) {
        const modal = document.getElementById("confirm-modal");
        if (!modal) return Promise.resolve(window.confirm(options.message || "Confirmar acción"));
        const titleEl = modal.querySelector("#confirm-modal-title");
        const descEl = modal.querySelector("#confirm-modal-desc");
        const btnConfirm = modal.querySelector("[data-action='confirm']");
        const btnCancel = modal.querySelector("[data-action='cancel']");
        const backdrop = modal.querySelector(".confirm-modal-backdrop");
        const opts = Object.assign({
            title: "Confirmar acción",
            message: "¿Estás seguro?",
            confirmText: "Aceptar",
            cancelText: "Cancelar"
        }, options);
        titleEl.textContent = opts.title;
        descEl.textContent = opts.message;
        btnConfirm.textContent = opts.confirmText;
        btnCancel.textContent = opts.cancelText;
        modal.setAttribute("aria-hidden", "false");
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusable = [btnCancel, btnConfirm];
        const lastFocused = document.activeElement;
        btnConfirm.focus();
        return new Promise(resolve => {
            const cleanup = () => {
                modal.setAttribute("aria-hidden", "true");
                document.body.style.overflow = prevOverflow;
                if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
                btnConfirm.removeEventListener("click", onConfirm);
                btnCancel.removeEventListener("click", onCancel);
                backdrop.removeEventListener("click", onCancel);
                document.removeEventListener("keydown", onKeydown);
            };
            const onConfirm = (e) => { e && e.preventDefault(); cleanup(); resolve(true); };
            const onCancel = (e) => { e && e.preventDefault(); cleanup(); resolve(false); };
            const onKeydown = (e) => {
                if (e.key === "Escape") onCancel(e);
                if (e.key === "Tab") {
                    const idx = focusable.indexOf(document.activeElement);
                    if (e.shiftKey) {
                        if (idx === 0) { focusable[focusable.length - 1].focus(); e.preventDefault(); }
                    } else {
                        if (idx === focusable.length - 1) { focusable[0].focus(); e.preventDefault(); }
                    }
                }
                if (e.key === "Enter" && (document.activeElement === btnConfirm || document.activeElement === btnCancel)) {
                    document.activeElement.click();
                }
            };
            btnConfirm.addEventListener("click", onConfirm);
            btnCancel.addEventListener("click", onCancel);
            backdrop.addEventListener("click", onCancel);
            document.addEventListener("keydown", onKeydown);
        });
    }

    function showInlineMessage(containerEl, message, type = "success", autoHide = true, timeout = 4000) {
        let parent = containerEl;
        if (!parent) parent = document.querySelector(".perfil-main") || document.body;
        const prev = parent.querySelector(".inline-message");
        if (prev) prev.remove();
        const div = document.createElement("div");
        div.className = `inline-message ${type}`;
        div.setAttribute("role", type === "error" ? "alert" : "status");
        div.innerHTML = `<span class="inline-text">${message}</span>`;
        parent.appendChild(div);
        if (autoHide) {
            setTimeout(() => {
                div.classList.add("hide");
                setTimeout(() => div.remove(), 260);
            }, timeout);
        }
        return div;
    }

    function showToast(message, type = "info", timeout = 2500) {
        let container = document.querySelector(".app-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "app-toast-container";
            document.body.appendChild(container);
        }
        const toast = document.createElement("div");
        toast.className = `app-toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 300);
        }, timeout);
    }

    function showFieldError(fieldId, message, ttl = 6000) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        clearFieldError(fieldId);
        const span = document.createElement('span');
        span.id = `${fieldId}-error`;
        span.className = 'field-error';
        span.setAttribute('role', 'alert');
        span.textContent = message;
        if (field.parentNode) {
            const wrapper = field.closest('.input-group') || field.parentNode;
            wrapper.appendChild(span);
        } else {
            field.after(span);
        }
        field.classList.add('input-error');
        try { field.focus(); } catch (e) {}
        const timer = setTimeout(() => clearFieldError(fieldId), ttl);
        field.dataset._errorTimeout = String(timer);
    }

    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.remove('input-error');
        const existing = document.getElementById(`${fieldId}-error`);
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        const t = field.dataset._errorTimeout;
        if (t) {
            try { clearTimeout(Number(t)); } catch (e) {}
            delete field.dataset._errorTimeout;
        }
    }

    const tabs = document.querySelectorAll(".perfil-tab");
    const contents = document.querySelectorAll(".perfil-content");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add("active");
        });
    });

    const userType = sessionStorage.getItem("userType");
    const id = sessionStorage.getItem("id");
    if (!userType || !id) {
        console.error("No se encontró userType o id en sessionStorage");
        return;
    }
    const rol = userType.toLowerCase();
    let API_URL = "";
    let UPDATE_URL = "";
    let CHANGE_URL = "";
    let DELETE_URL = "";
    if (rol === "residente") {
        API_URL = "/api/residente/obtenerPorId";
        UPDATE_URL = "/api/residente/actualizar";
        CHANGE_URL = "/api/residente/cambiarContraseña";
        DELETE_URL = "/api/residente/eliminar";
    } else if (rol === "propietario") {
        API_URL = "/api/propietario/ObtenerPropietarioById";
        UPDATE_URL = "/api/propietario/actualizar";
        CHANGE_URL = "/api/propietario/cambiarContraseña";
        DELETE_URL = "/api/propietario/eliminarCuenta";
    } else {
        console.error("Tipo de usuario no válido:", userType);
        return;
    }

    const responseMessageEl = document.getElementById("responseMessage");
    function setResponseMessage(text = "", type = "success", autoHide = true, timeout = 3500) {
        if (!responseMessageEl) {
            showInlineMessage(document.querySelector(".perfil-main"), text, type, autoHide, timeout);
            return;
        }
        responseMessageEl.innerText = text;
        responseMessageEl.classList.remove("error", "success");
        responseMessageEl.classList.add(type === "error" ? "error" : "success");
        if (autoHide && text) {
            setTimeout(() => {
                responseMessageEl.innerText = "";
                responseMessageEl.classList.remove("error", "success");
            }, timeout);
        }
    }

    async function obtenerDatosPerfil(url, id) {
        try {
            const resp = await fetch(`${url}?id=${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });
            if (!resp.ok) throw new Error("Error al obtener datos");
            const data = await resp.json();
            document.getElementById("nombre").value = data.nombre || "";
            document.getElementById("correo").value = data.correo || "";
            document.getElementById("documento").value = data.documento || "";
            document.getElementById("telefono").value = (data.telefono ?? data.telefonoPropietario) || "";
        } catch (error) {
            console.error("Error al obtener datos:", error);
        }
    }

    if (API_URL) {
        obtenerDatosPerfil(API_URL, id).catch(err => console.error("Error cargando perfil:", err));
    }

    const formDatos = document.getElementById("form-datos-personales");
    if (formDatos) {
        formDatos.addEventListener("submit", async event => {
            event.preventDefault();
            clearFieldError('correo');
            clearFieldError('documento');
            clearFieldError('telefono');
            const msgElem = document.getElementById("responseMessage");
            if (msgElem) msgElem.innerText = "";
            const nombre = document.getElementById("nombre").value.trim();
            const documento = document.getElementById("documento").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const telefono = document.getElementById("telefono").value.trim();
            if (!nombre || !documento || !correo || !telefono) {
                if (msgElem) msgElem.innerText = "Todos los campos son obligatorios";
                return;
            }
            try {
                const respGet = await fetch(`${API_URL}?id=${id}`, { method: "GET", credentials: 'include' });
                if (!respGet.ok) throw new Error("Error al obtener datos");
                const data = await respGet.json();
                let payload;
                if (rol === "residente") {
                    payload = {
                        nombre,
                        documento,
                        correo,
                        telefono,
                        contraseña: data.contraseña,
                        edad: data.edad,
                        idcuenta: data.idcuenta,
                        idrol: data.idrol,
                        idapartamento: data.idapartamento
                    };
                } else {
                    payload = {
                        nombre,
                        documento,
                        correo,
                        telefonoPropietario: telefono,
                        contraseña: data.contraseña,
                        edad: data.edad,
                        idcuenta: data.idcuenta,
                        idrol: data.idrol,
                        idapartamento: data.idapartamento
                    };
                }
                const respPut = await fetch(`${UPDATE_URL}?id=${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                if (respPut.ok) {
                    setResponseMessage("Usuario actualizado correctamente", "success");
                    clearFieldError('correo');
                    clearFieldError('documento');
                    clearFieldError('telefono');
                    setTimeout(() => location.reload(), 900);
                } else {
                    let errorBody = null;
                    try { errorBody = await respPut.json(); } catch (e) {
                        try { const txt = await respPut.text(); if (txt) errorBody = { message: txt }; } catch {}
                    }
                    const serverMsg = (errorBody && (errorBody.message || errorBody.error)) ? (errorBody.message || errorBody.error) : `Error al actualizar el usuario (código ${respPut.status})`;
                    const lower = serverMsg.toLowerCase();
                    const standardMsg = "Esta informacion ya está registrada. Intenta con uno nuevo.";
                    if (lower.includes("correo") || lower.includes("email")) {
                        showFieldError('correo', standardMsg);
                    } else if (lower.includes("documento")) {
                        showFieldError('documento', standardMsg);
                    } else if (lower.includes("tel") || lower.includes("telefono") || lower.includes("telefono_propietario")) {
                        showFieldError('telefono', standardMsg);
                    } else {
                        if (msgElem) msgElem.innerText = serverMsg;
                    }
                }
            } catch (error) {
                console.error("Error en la actualización:", error);
                const msgElem2 = document.getElementById("responseMessage");
                if (msgElem2) msgElem2.innerText = "Ocurrió un error al actualizar";
            }
        });
    }

    const formCambiarPassword = document.getElementById("form-cambiar-password");
    if (formCambiarPassword) {
        formCambiarPassword.addEventListener("submit", async e => {
            e.preventDefault();
            const passAct = document.getElementById("password-actual").value.trim();
            const passNew = document.getElementById("password-nueva").value.trim();
            const passCon = document.getElementById("password-confirmar").value.trim();
            if (!passAct || !passNew || !passCon) {
                showInlineMessage(document.getElementById("seguridad"), "Todos los campos son obligatorios", "error");
                return;
            }
            if (passNew !== passCon) {
                showInlineMessage(document.getElementById("seguridad"), "Las contraseñas nuevas no coinciden", "error");
                return;
            }
            try {
                const body = { idUsuario: id, passwordActual: passAct, passwordNueva: passNew };
                const resp = await fetch(`${CHANGE_URL}?id=${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: 'include'
                });
                const result = await resp.json().catch(() => null);
                if (resp.ok) {
                    showInlineMessage(document.getElementById("seguridad"), "Contraseña actualizada correctamente. Cerrando sesión...", "success", true, 1800);
                    showToast("Cerrando sesión...", "info", 1400);
                    setTimeout(() => {
                        formCambiarPassword.reset();
                        sessionStorage.clear();
                        window.location.href = "../../Login/Index.html";
                    }, 1500);
                } else {
                    const msg = (result && result.message) ? result.message : "Error al actualizar la contraseña";
                    showInlineMessage(document.getElementById("seguridad"), msg, "error", true, 6000);
                }
            } catch (err) {
                console.error("Error en la solicitud:", err);
                showInlineMessage(document.getElementById("seguridad"), "Ocurrió un error al actualizar la contraseña", "error", true, 6000);
            }
        });
    }

    const btnEliminar = document.getElementById("btn-confirmar-eliminacion");
    if (btnEliminar) {
        btnEliminar.addEventListener("click", async () => {
            const pwdConfirm = document.getElementById("password-confirmar-eliminacion").value.trim();
            if (!pwdConfirm) {
                showInlineMessage(document.getElementById("eliminar-cuenta"), "Por favor ingresa tu contraseña para confirmar.", "error");
                return;
            }
            const confirmed = await showConfirm({
                title: "ELIMINAR CUENTA",
                message: "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.",
                confirmText: "Aceptar",
                cancelText: "Cancelar"
            });
            if (!confirmed) return;
            btnEliminar.disabled = true;
            const origText = btnEliminar.innerText;
            btnEliminar.innerText = "Eliminando...";
            try {
                const resp = await fetch(`${DELETE_URL}?id=${id}`, {
                    method: "DELETE",
                    credentials: 'include'
                });
                if (resp.ok) {
                    showInlineMessage(document.getElementById("eliminar-cuenta"), "Cuenta eliminada correctamente. Redirigiendo...", "success", true, 2000);
                    showToast("Cuenta eliminada", "success", 1600);
                    setTimeout(() => {
                        sessionStorage.clear();
                        window.location.href = "../../Login/Index.html";
                    }, 1500);
                } else {
                    const err = await resp.json().catch(() => ({}));
                    const msg = err.message || "No se pudo eliminar la cuenta.";
                    showInlineMessage(document.getElementById("eliminar-cuenta"), msg, "error", true, 6000);
                }
            } catch (error) {
                console.error("Error al eliminar cuenta:", error);
                showInlineMessage(document.getElementById("eliminar-cuenta"), "Ocurrió un error al eliminar la cuenta.", "error", true, 6000);
            } finally {
                btnEliminar.disabled = false;
                btnEliminar.innerText = origText;
            }
        });
    }

    const logoutEl = document.getElementById("logout");
    if (logoutEl) {
        logoutEl.addEventListener("click", async (e) => {
            e.preventDefault();
            const confirmed = await showConfirm({
                title: "CERRAR SESION",
                message: "¿Estás seguro de cerrar sesión?",
                confirmText: "Cerrar sesión",
                cancelText: "Cancelar"
            });
            if (!confirmed) return;
            showToast("Cerrando sesión...", "info", 900);
            setTimeout(() => {
                sessionStorage.clear();
                window.location.href = "../../InicioNoAuth/Inicio_no.html";
            }, 900);
        });
    }

    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", () => {
            const targetId = icon.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    });
});
