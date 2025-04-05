document.addEventListener("DOMContentLoaded", function() {
    const formAgregarUsuario = document.getElementById('form-agregar-usuario');
    const btnCancelar = document.getElementById('btn-cancelar');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('contrasena');

    // Mostrar/ocultar contraseña
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Validar fortaleza de contraseña
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strengthBars = document.querySelectorAll('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            const strength = calcularFortalezaContrasena(this.value);
            
            strengthBars.forEach((bar, index) => {
                bar.style.backgroundColor = index < strength ? getColorSeguridad(strength) : '#ddd';
            });
            
            strengthText.textContent = `Seguridad: ${getTextoNivelSeguridad(strength)}`;
            strengthText.style.color = getColorSeguridad(strength);
        });
    }

    // Función para calcular fortaleza de contraseña
    function calcularFortalezaContrasena(password) {
        let strength = 0;
        
        // Longitud mínima
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Contiene números
        if (/\d/.test(password)) strength++;
        
        // Contiene mayúsculas y minúsculas
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        
        // Contiene caracteres especiales
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        return Math.min(strength, 3); // Máximo 3 niveles de seguridad
    }

    function getColorSeguridad(strength) {
        const colors = ['#e74c3c', '#f39c12', '#2ecc71'];
        return colors[strength - 1] || '#e74c3c';
    }

    function getTextoNivelSeguridad(strength) {
        const niveles = ['Baja', 'Media', 'Alta'];
        return niveles[strength - 1] || 'Muy baja';
    }

    // Cancelar y volver atrás
    btnCancelar.addEventListener('click', function() {
        window.location.href = '../AdministrarUsuarios/administrar_usuarios.html';
    });

    // Enviar formulario
    formAgregarUsuario.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const documento = document.getElementById('documento').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const apartamento = document.getElementById('apartamento').value.trim();
        const rol = document.getElementById('rol').value;
        const contrasena = document.getElementById('contrasena').value;

        // Validar campos obligatorios
        if (!nombre || !documento || !correo || !celular || !apartamento || !rol || !contrasena) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Validar fortaleza de contraseña
        if (calcularFortalezaContrasena(contrasena) < 2) {
            alert('La contraseña es demasiado débil. Debe tener al menos 8 caracteres y combinar letras y números.');
            return;
        }

        // Crear objeto de usuario
        const nuevoUsuario = {
            nombre,
            documento,
            correo,
            celular,
            apartamento,
            rol,
            password: contrasena
        };

        // Obtener usuarios existentes
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // Verificar si el usuario ya existe
        const usuarioExistente = usuarios.find(u => u.correo === correo || u.documento === documento);
        if (usuarioExistente) {
            alert(usuarioExistente.correo === correo 
                ? 'El correo electrónico ya está registrado' 
                : 'El número de documento ya está registrado');
            return;
        }

        // Agregar nuevo usuario
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Mostrar confirmación y redirigir
        alert('Usuario agregado correctamente');
        window.location.href = '../AdministrarUsuarios/administrar_usuarios.html';
    });
});