document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registro-form');
    const alertContainer = document.getElementById('alert-container');
    const registerBtn = document.getElementById('register-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');
    const card = document.querySelector('.register-card');

    function showMessage(message, type = 'error', autoHide = true, timeout = 4000) {
        alertContainer.innerHTML = ''; // limpiar mensajes anteriores
        const div = document.createElement('div');
        div.className = `alert ${type === 'success' ? 'success' : 'error'}`;
        div.setAttribute('role', 'alert');
        div.innerHTML = (type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>') +
            `<span style="margin-left:8px">${message}</span>`;
        alertContainer.appendChild(div);

        if (autoHide) {
            setTimeout(() => {
                if (alertContainer.contains(div)) alertContainer.removeChild(div);
            }, timeout);
        }
    }

    function showBannerAndRedirect(message, type = 'success', displayMs = 2500, redirectUrl = '/InicioNoAuth/Inicio_no.html') {
        // eliminar banner previo si existe
        const existing = document.querySelector('.response-message');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.className = `response-message ${type} show`;
        banner.setAttribute('role', 'status');

        banner.innerHTML = `
            <div id="responseIcon">${type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'}</div>
            <div id="responseText">${message}</div>
        `;

        card.insertAdjacentElement('afterend', banner);

        setLoading(false);
        registerBtn.setAttribute('disabled', 'disabled');

        // tiempo visible y luego redirect
        setTimeout(() => {
            banner.classList.remove('show');
            setTimeout(() => {
                if (banner.parentNode) banner.parentNode.removeChild(banner);
                window.location.href = redirectUrl;
            }, 220);
        }, displayMs);
    }

    function clearMessages() {
        alertContainer.innerHTML = '';
    }

    function setLoading(loading) {
        if (loading) {
            registerBtn.setAttribute('disabled', 'disabled');
            btnSpinner.classList.remove('hidden');
            btnText.textContent = ' Registrando...';
        } else {
            registerBtn.removeAttribute('disabled');
            btnSpinner.classList.add('hidden');
            btnText.innerHTML = '<i class="fas fa-user-plus"></i> Registrar';
        }
    }

    function validateForm(data) {
        if (!data.nombre || data.nombre.trim().length < 2) {
            return { ok: false, field: 'nombre', msg: 'Ingrese un nombre válido (mínimo 2 caracteres).' };
        }
        if (!data.documento || data.documento.trim().length < 4) {
            return { ok: false, field: 'documento', msg: 'Ingrese un documento válido.' };
        }
        if (!data.telefono || data.telefono.trim().length < 7) {
            return { ok: false, field: 'telefono', msg: 'Ingrese un teléfono válido.' };
        }
        if (!data.correo || !/^\S+@\S+\.\S+$/.test(data.correo)) {
            return { ok: false, field: 'email', msg: 'Ingrese un correo válido.' };
        }
        if (!data.contrasena || data.contrasena.length < 6) {
            return { ok: false, field: 'password', msg: 'La contraseña debe tener al menos 6 caracteres.' };
        }
        return { ok: true };
    }

    function focusField(fieldId) {
        const el = document.getElementById(fieldId);
        if (el) {
            el.focus();
            el.classList.add('input-error');
            setTimeout(() => el.classList.remove('input-error'), 3000);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        // Leer valores
        const nombre = document.getElementById('nombre').value.trim();
        const documento = document.getElementById('documento').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const correo = document.getElementById('email').value.trim();
        const contrasena = document.getElementById('password').value;
        const rol = document.getElementById('rol').value;

        // Crear payload base
        const payloadBase = {
            nombre,
            correo,
            documento
        };

        let apiUrl = '';
        let bodyObj = null;

        if (rol === 'residente') {
            apiUrl = '/api/register/residente';
            bodyObj = {
                ...payloadBase,
                telefono: telefono,
                "contraseña": contrasena
            };
        } else {
            apiUrl = '/api/register/propietario';
            bodyObj = {
                ...payloadBase,
                telefonoPropietario: telefono,
                "contraseña": contrasena
            };
        }

        // Validación cliente
        const check = validateForm({ nombre, documento, telefono, correo, contrasena });
        if (!check.ok) {
            showMessage(check.msg, 'error', true, 5000);
            focusField(check.field);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyObj)
            });

            let responseBody = null;
            try {
                responseBody = await response.json();
            } catch (err) {
                // no JSON body
            }

            if (response.status === 409) {
                const serverMsg = responseBody && responseBody.message
                    ? responseBody.message
                    : 'Ese correo o documento ya está en uso. Intenta iniciar sesión.';
                showMessage(serverMsg, 'error', true, 7000);

                if (serverMsg.toLowerCase().includes('correo') || serverMsg.toLowerCase().includes('email')) {
                    focusField('email');
                } else if (serverMsg.toLowerCase().includes('documento')) {
                    focusField('documento');
                } else if (serverMsg.toLowerCase().includes('telefono')) {
                    focusField('telefono');
                }
                setLoading(false);
                return;
            }

            // Otros errores HTTP
            if (!response.ok) {
                const serverMsg = responseBody && (responseBody.message || responseBody.error)
                    ? (responseBody.message || responseBody.error)
                    : `Fallo al registrarse (código ${response.status})`;
                showMessage(serverMsg, 'error', true, 6000);
                // enfocar campo si se detecta en el mensaje
                if (serverMsg.toLowerCase().includes('correo')) focusField('email');
                if (serverMsg.toLowerCase().includes('documento')) focusField('documento');
                setLoading(false);
                return;
            }

            // Éxito: mostrar banner persistente debajo de la card y luego redirigir
            showBannerAndRedirect('Usuario registrado correctamente', 'success', 2500, '../Login/Index.html');

        } catch (error) {
            console.error('Error creando la cuenta', error);
            showMessage('Error de red. Intenta de nuevo más tarde.', 'error', true, 6000);
            setLoading(false);
        } finally {
            setTimeout(() => {
                if (!document.querySelector('.response-message')) setLoading(false);
            }, 1000);
        }
    });
});