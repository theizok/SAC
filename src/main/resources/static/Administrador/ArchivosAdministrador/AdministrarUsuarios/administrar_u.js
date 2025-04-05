document.addEventListener("DOMContentLoaded", function() {
    // Obtener usuario activo de sessionStorage
    const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo')) || {};
    
    // Obtener usuarios de localStorage o inicializar array vacío
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const tablaUsuarios = document.getElementById('tabla-usuarios').getElementsByTagName('tbody')[0];
    const btnAgregarUsuario = document.getElementById('btn-agregar-usuario');
    const buscarUsuario = document.getElementById('buscar-usuario');

    // Elementos del modal de edición
    const modalEditar = document.getElementById('modal-editar');
    const spanCerrar = document.querySelector('#modal-editar .cerrar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formEditar = document.getElementById('form-editar-usuario');
    let usuarioEditando = null;

    // Función para cargar usuarios en la tabla
    function cargarUsuarios(usuariosMostrar = usuarios) {
        tablaUsuarios.innerHTML = '';
        
        usuariosMostrar.forEach((usuario, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.documento || ''}</td>
                <td>${usuario.correo || ''}</td>
                <td>${usuario.celular || ''}</td>
                <td>${usuario.apartamento || ''}</td>
                <td>${usuario.rol || ''}</td>
                <td class="acciones">
                    <button class="editar" onclick="abrirModalEditar(${index})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="eliminar" onclick="eliminarUsuario(${index})">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </td>
            `;
            tablaUsuarios.appendChild(fila);
        });
    }

    // Función para buscar usuarios
    function buscarUsuarios(termino) {
        const terminoLower = termino.toLowerCase();
        const usuariosFiltrados = usuarios.filter(usuario => {
            return (
                (usuario.nombre && usuario.nombre.toLowerCase().includes(terminoLower)) ||
                (usuario.documento && usuario.documento.toLowerCase().includes(terminoLower)) ||
                (usuario.correo && usuario.correo.toLowerCase().includes(terminoLower)) ||
                (usuario.apartamento && usuario.apartamento.toLowerCase().includes(terminoLower)) ||
                (usuario.rol && usuario.rol.toLowerCase().includes(terminoLower))
            );
        });
        cargarUsuarios(usuariosFiltrados);
    }

    // Función para abrir modal de edición
    window.abrirModalEditar = function(index) {
        usuarioEditando = index;
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

    // Función para cerrar el modal
    function cerrarModal() {
        modalEditar.style.display = 'none';
        usuarioEditando = null;
    }

    // Eventos para cerrar el modal
    spanCerrar.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target === modalEditar) {
            cerrarModal();
        }
    });

    // Guardar cambios al editar usuario
    formEditar.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validar que hay un usuario siendo editado
        if (usuarioEditando === null) return;

        // Obtener los valores del formulario
        const nombre = document.getElementById('editar-nombre').value.trim();
        const documento = document.getElementById('editar-documento').value.trim();
        const correo = document.getElementById('editar-correo').value.trim();
        const celular = document.getElementById('editar-celular').value.trim();
        const apartamento = document.getElementById('editar-apartamento').value.trim();
        const rol = document.getElementById('editar-rol').value;

        // Validar campos obligatorios
        if (!nombre || !documento || !correo || !celular || !rol) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Actualizar el usuario
        const usuarioActualizado = {
            nombre,
            documento,
            correo,
            celular,
            apartamento,
            rol
        };
        
        usuarios[usuarioEditando] = usuarioActualizado;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Actualizar usuario activo si es el mismo
        if (usuarioActualizado.correo === usuarioActivo.correo) {
            sessionStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizado));
        }

        // Recargar tabla y cerrar modal
        cargarUsuarios();
        cerrarModal();
        alert('Usuario actualizado correctamente');
    });

    // Eliminar usuario
    window.eliminarUsuario = function(index) {
        if (confirm('¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
            // Verificar si el usuario a eliminar es el usuario activo
            if (usuarios[index].correo === usuarioActivo.correo) {
                alert('No puede eliminar su propio usuario mientras está logueado');
                return;
            }
            
            usuarios.splice(index, 1);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            cargarUsuarios();
            alert('Usuario eliminado correctamente');
        }
    };

    // Redirigir a agregar usuario
    btnAgregarUsuario.addEventListener('click', function() {
        window.location.href = '/SAC/src/main/resources/static/Administrador/ArchivosAdministrador/AgregarUsuario/agregar_usuario.html';
    });

    // Buscar usuarios al escribir
    buscarUsuario.addEventListener('input', function() {
        buscarUsuarios(this.value);
    });

    // Cargar usuarios al iniciar
    cargarUsuarios();
});