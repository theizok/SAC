 const formAgregarUsuario = document.getElementById('form-agregar-usuario');

    formAgregarUsuario.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const documento = document.getElementById('documento').value;
        const correo = document.getElementById('correo').value;
        const celular = document.getElementById('celular').value;
        const apartamento = document.getElementById('apartamento').value;
        const rol = document.getElementById('rol').value;
        const contrasena = document.getElementById('contrasena').value;

        // Crear un objeto con los datos del usuario
        const nuevoUsuario = {
            nombre,
            documento,
            correo, // Usar "correo" en lugar de "email" para consistencia
            celular,
            apartamento,
            rol,
            password: contrasena // Cambiar "contrasena" a "password" para consistencia
        };

        // Obtener los usuarios existentes de localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // Verificar si el correo ya está registrado
        const usuarioExistente = usuarios.find(u => u.correo === correo);
        if (usuarioExistente) {
            alert('El correo electrónico ya está registrado.');
            return;
        }

        // Agregar el nuevo usuario al arreglo
        usuarios.push(nuevoUsuario);

        // Guardar el arreglo actualizado en localStorage
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('Usuario agregado correctamente');

        // Redirigir a la página de gestión de usuarios
        window.location.href = 'administrar_usuarios.html';
    });
