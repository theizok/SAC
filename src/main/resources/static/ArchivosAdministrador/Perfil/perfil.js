document.addEventListener("DOMContentLoaded", () => {
    function showConfirm(options = {}) {
        const modal = document.getElementById("confirm-modal");
        if (!modal) return Promise.resolve(false);
        const titleEl = modal.querySelector("#confirm-modal-title");
        const descEl = modal.querySelector("#confirm-modal-desc");
        const btnConfirm = modal.querySelector("[data-action='confirm']");
        const btnCancel = modal.querySelector("[data-action='cancel']");
        const backdrop = modal.querySelector(".confirm-modal-backdrop");
        const opts = Object.assign({
            title: "Confirmar acción",
            message: "¿Estás seguro de realizar esta acción?",
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

    const tabs = document.querySelectorAll(".perfil-tab");
    const contents = document.querySelectorAll(".perfil-content");
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const target = tab.getAttribute("data-tab");
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
    if (rol === "administrador") {
        API_URL = "/api/administrador/obtenerPorId";
        UPDATE_URL = "/api/administrador/actualizar";
        CHANGE_URL = "/api/administrador/cambiarContraseña";
        DELETE_URL = "/api/administrador/eliminarAdministrador";
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
            const rolLocal = (sessionStorage.getItem("userType") || "").toLowerCase();
            const response = await fetch(`${url}?id=${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });
            if (!response.ok) throw new Error("Error al obtener datos del servidor");
            const data = await response.json();
            if (document.getElementById("id")) {
                if (data.idAdministrador !== undefined) document.getElementById("id").value = data.idAdministrador;
                else if (data.id !== undefined) document.getElementById("id").value = data.id;
            }
            if (rolLocal === "administrador") {
                if (document.getElementById("nombre") && data.nombreAdministrador !== undefined) {
                    document.getElementById("nombre").value = data.nombreAdministrador;
                }
            } else {
                if (document.getElementById("nombre") && data.nombre !== undefined) {
                    document.getElementById("nombre").value = data.nombre;
                }
            }
            if (document.getElementById("correo") && data.correo !== undefined) {
                document.getElementById("correo").value = data.correo;
            }
            if (document.getElementById("telefono") && data.telefono !== undefined) {
                document.getElementById("telefono").value = data.telefono;
            }
            if (document.getElementById("documento") && data.documento !== undefined) {
                document.getElementById("documento").value = data.documento;
            }
        } catch (error) {
            console.error("Error al obtener datos:", error);
        }
    }

    if (API_URL) {
        obtenerDatosPerfil(API_URL, id).catch(err => {
            console.error("Error cargando perfil:", err);
        });
    }

    const formDatos = document.getElementById("form-datos-personales");
    if (formDatos) {
        formDatos.addEventListener("submit", async (event) => {
            event.preventDefault();
            setResponseMessage("", "success");
            const nombre = (document.getElementById("nombre")?.value || "").trim();
            const documento = (document.getElementById("documento")?.value || "").trim();
            const telefono = (document.getElementById("telefono")?.value || "").trim();
            const correo = (document.getElementById("correo")?.value || "").trim();
            if (!nombre || !documento || !telefono || !correo) {
                setResponseMessage("Todos los campos son obligatorios", "error");
                return;
            }
            try {
                const getResp = await fetch(`${API_URL}?id=${id}`, { method: "GET", credentials: 'include' });
                if (!getResp.ok) throw new Error("No se pudieron obtener los datos actuales antes de actualizar.");
                const dataActual = await getResp.json();
                const payload = {
                    nombreAdministrador: nombre,
                    documento: documento,
                    correo: correo,
                    telefono: telefono,
                    contraseña: dataActual.contraseña !== undefined ? dataActual.contraseña : null,
                    idCuenta: dataActual.idCuenta !== undefined ? dataActual.idCuenta : null
                };
                const updateResp = await fetch(`${UPDATE_URL}?id=${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                if (updateResp.ok) {
                    setResponseMessage("Usuario actualizado correctamente", "success");
                    setTimeout(() => location.reload(), 700);
                } else {
                    const errBody = await updateResp.json().catch(() => null);
                    const msg = (errBody && (errBody.message || errBody.error)) ? (errBody.message || errBody.error) : `Error al actualizar (código ${updateResp.status})`;
                    setResponseMessage(msg, "error", true, 6000);
                }
            } catch (err) {
                console.error("Error en la actualización:", err);
                setResponseMessage("Ocurrió un error al actualizar", "error", true, 6000);
            }
        });
    }

    const formCambiarPassword = document.getElementById("form-cambiar-password");
    if (formCambiarPassword) {
        formCambiarPassword.addEventListener("submit", async (e) => {
            e.preventDefault();
            const idUsuario = sessionStorage.getItem("id");
            if (!idUsuario) {
                showInlineMessage(document.getElementById("seguridad"), "Error: usuario no encontrado en sesión", "error");
                return;
            }
            const passwordActual = (document.getElementById("password-actual")?.value || "").trim();
            const passwordNueva = (document.getElementById("password-nueva")?.value || "").trim();
            const passwordConfirmar = (document.getElementById("password-confirmar")?.value || "").trim();
            if (!passwordActual || !passwordNueva || !passwordConfirmar) {
                showInlineMessage(document.getElementById("seguridad"), "Todos los campos son obligatorios", "error");
                return;
            }
            if (passwordNueva !== passwordConfirmar) {
                showInlineMessage(document.getElementById("seguridad"), "Las contraseñas nuevas no coinciden", "error");
                return;
            }
            const body = {
                idUsuario: idUsuario,
                passwordActual: passwordActual,
                passwordNueva: passwordNueva
            };
            try {
                const resp = await fetch(`${CHANGE_URL}?id=${idUsuario}`, {
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
                        window.location.href = "/noAuth/Login";
                    }, 1500);
                } else {
                    const msg = (result && result.message) ? result.message : "Error al actualizar la contraseña";
                    showInlineMessage(document.getElementById("seguridad"), msg, "error", true, 6000);
                }
            } catch (err) {
                console.error("Error en cambio de contraseña:", err);
                showInlineMessage(document.getElementById("seguridad"), "Ocurrió un error al actualizar la contraseña", "error", true, 6000);
            }
        });
    }

    const btnEliminar = document.getElementById("btn-confirmar-eliminacion");
    if (btnEliminar) {
        btnEliminar.addEventListener("click", async (ev) => {
            ev.preventDefault();
            const passInput = document.getElementById("password-confirmar-eliminacion");
            const password = (passInput?.value || "").trim();
            if (!password) {
                showInlineMessage(document.getElementById("eliminar-cuenta"), "Debes ingresar tu contraseña para eliminar la cuenta", "error");
                return;
            }
            const confirmed = await showConfirm({
                title: "ELIMINAR CUENTA",
                message: "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
                confirmText: "Aceptar",
                cancelText: "Cancelar"
            });
            if (!confirmed) return;
            btnEliminar.disabled = true;
            const originalText = btnEliminar.innerText;
            btnEliminar.innerText = "Eliminando...";
            try {
                const payload = {
                    idUsuario: Number(id),
                    passwordActual: password
                };
                console.log("Enviando petición de eliminación:", payload);
                const resp = await fetch(DELETE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const body = await resp.json().catch(() => null);
                if (resp.ok) {
                    showInlineMessage(document.getElementById("eliminar-cuenta"), "Cuenta eliminada correctamente. Redirigiendo...", "success", true, 2000);
                    showToast("Cuenta eliminada", "success", 1600);
                    setTimeout(() => {
                        sessionStorage.clear();
                        window.location.href = "../../InicioNoAuth/Inicio_no.html";
                    }, 1500);
                } else {
                    const msg = (body && (body.message || body.error)) ? (body.message || body.error) : `Error eliminando (código ${resp.status})`;
                    showInlineMessage(document.getElementById("eliminar-cuenta"), msg, "error", true, 6000);
                }
            } catch (err) {
                console.error("Error eliminando cuenta:", err);
                showInlineMessage(document.getElementById("eliminar-cuenta"), "Ocurrió un error eliminando la cuenta", "error", true, 6000);
            } finally {
                btnEliminar.disabled = false;
                btnEliminar.innerText = originalText;
            }
        });
    }

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (typeof showConfirm !== "function") {
                if (!confirm("¿Estás seguro de cerrar sesión?")) return;
                sessionStorage.clear();
                window.location.href = "../../InicioNoAuth/Inicio_no.html";
                return;
            }
            const confirmed = await showConfirm({
                title: "CERRAR SESION",
                message: "¿Estás seguro de cerrar sesión?",
                confirmText: "Cerrar sesión",
                cancelText: "Cancelar"
            });
            if (!confirmed) return;
            logoutBtn.disabled = true;
            const origText = logoutBtn.innerText;
            try {
                showToast("Cerrando sesión...", "info", 900);
                setTimeout(() => {
                    sessionStorage.clear();
                    window.location.href = "../../InicioNoAuth/Inicio_no.html";
                }, 900);
            } finally {
                setTimeout(() => {
                    logoutBtn.disabled = false;
                    logoutBtn.innerText = origText;
                }, 1400);
            }
        });
    }

    (function setupPasswordToggles() {
        const toggles = document.querySelectorAll(".toggle-password");
        if (!toggles || toggles.length === 0) return;
        toggles.forEach(icon => {
            const targetId = icon.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;
            icon.setAttribute("role", "button");
            icon.setAttribute("aria-controls", targetId);
            icon.setAttribute("tabindex", "0");
            icon.setAttribute("aria-pressed", "false");
            icon.setAttribute("aria-label", "Mostrar contraseña");
            const toggle = () => {
                if (input.type === "password") {
                    input.type = "text";
                    icon.classList.remove("fa-eye");
                    icon.classList.add("fa-eye-slash");
                    icon.setAttribute("aria-pressed", "true");
                    icon.setAttribute("aria-label", "Ocultar contraseña");
                    icon.classList.add("active");
                } else {
                    input.type = "password";
                    icon.classList.remove("fa-eye-slash");
                    icon.classList.add("fa-eye");
                    icon.setAttribute("aria-pressed", "false");
                    icon.setAttribute("aria-label", "Mostrar contraseña");
                    icon.classList.remove("active");
                }
            };
            icon.addEventListener("click", (ev) => {
                ev.preventDefault();
                toggle();
                input.focus();
            });
            icon.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
                    ev.preventDefault();
                    toggle();
                    input.focus();
                }
            });
        });
    })();
});
