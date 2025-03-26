document.getElementById('registro-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const documento = document.getElementById('documento').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value; // Campo correo
    const password = document.getElementById('contraseña').value;
    const apartamento = document.getElementById('apartamento').value;
    const rol = document.getElementById('rol').value;

    // Obtener usuarios existentes o inicializar un array vacío
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Verificar si el correo ya está registrado
    const usuarioExistente = usuarios.find(u => u.correo === correo);
    if (usuarioExistente) {
        alert('El correo electrónico ya está registrado.');
        return;
    }




    // Crear nuevo usuario con todos los campos
    const nuevoUsuario = {
        nombre,
        apellido,
        documento,
        celular: telefono,
        correo, // Guardar el correo
        password,
        apartamento,
        rol
    };

    // Guardar el nuevo usuario
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    window.location.href = 'Index.html'; // Redirigir a la página de inicio de sesión
});