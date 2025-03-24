 const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const tablaUsuarios = document.getElementById('tabla-usuarios').getElementsByTagName('tbody')[0];

    // Modal de Edición
    const modalEditar = document.getElementById('modal-editar');
    const spanCerrar = document.querySelector('#modal-editar .cerrar');
    const formEditar = document.getElementById('form-editar-usuario');
    let usuarioEditando = null; // Almacena el índice del usuario que se está editando

    // Cargar usuarios en la tabla
    function cargarUsuarios() {
        tablaUsuarios.innerHTML = '';
        usuarios.forEach((usuario, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.documento || ''}</td>
                <td>${usuario.correo || ''}</td>
                <td>${usuario.celular || ''}</td>
                <td>${usuario.apartamento || ''}</td>
                <td>${usuario.rol || ''}</td>
                <td class="acciones">
                    <button class="editar" onclick="abrirModalEditar(${index})">Editar</button>
                    <button class="eliminar" onclick="eliminarUsuario(${index})">Eliminar</button>
                </td>
            `;
            tablaUsuarios.appendChild(fila);
        });
    }

    // Abrir modal de edición
    window.abrirModalEditar = function(index) {
        usuarioEditando = index; // Guardar el índice del usuario que se está editando
        const usuario = usuarios[index];

        // Llenar el formulario con los datos del usuario
        document.getElementById('editar-nombre').value = usuario.nombre;
        document.getElementById('editar-documento').value = usuario.documento;
        document.getElementById('editar-correo').value = usuario.correo;
        document.getElementById('editar-celular').value = usuario.celular;
        document.getElementById('editar-apartamento').value = usuario.apartamento || '';
        document.getElementById('editar-rol').value = usuario.rol;

        // Mostrar el modal
        modalEditar.style.display = 'block';
    };

    // Cerrar modal de edición
    spanCerrar.addEventListener('click', () => {
        modalEditar.style.display = 'none';
    });

    // Guardar cambios al editar
    formEditar.addEventListener('submit', function(e) {
        e.preventDefault();

        // Obtener los nuevos valores del formulario
        const nombre = document.getElementById('editar-nombre').value;
        const documento = document.getElementById('editar-documento').value;
        const correo = document.getElementById('editar-correo').value;
        const celular = document.getElementById('editar-celular').value;
        const apartamento = document.getElementById('editar-apartamento').value;
        const rol = document.getElementById('editar-rol').value;

        // Actualizar el usuario en el array
        const usuarioActualizado = {
            nombre,
            documento,
            correo,
            celular,
            apartamento,
            rol
        };
        usuarios[usuarioEditando] = usuarioActualizado;

        // Guardar en localStorage
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Si el usuario editado es el mismo que ha iniciado sesión, actualizar el usuarioActivo
        if (usuarioActualizado.correo === usuarioActivo.correo) {
            localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizado));
        }

        // Recargar la tabla y cerrar el modal
        cargarUsuarios();
        modalEditar.style.display = 'none';
        alert('Usuario actualizado correctamente');
    });

    // Eliminar usuario
    window.eliminarUsuario = function(index) {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            usuarios.splice(index, 1);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            cargarUsuarios();
            alert('Usuario eliminado correctamente');
        }
    };

    // Cargar usuarios al iniciar
    cargarUsuarios();

    // Redirigir a la página de agregar usuario
    document.getElementById('btn-agregar-usuario').addEventListener('click', function() {
        window.location.href = 'agregar_usuario.html';
    });
