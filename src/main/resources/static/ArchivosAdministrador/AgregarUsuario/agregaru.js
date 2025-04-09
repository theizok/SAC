 const formAgregarUsuario = document.getElementById('form-agregar-usuario');

    formAgregarUsuario.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const documento = document.getElementById('documento').value;
        const correo = document.getElementById('correo').value;
        const celular = document.getElementById('celular').value;
        const rol = document.getElementById('rol').value;
        const contrasena = document.getElementById('contrasena').value;

        let usuario = {};
        let apiUrl="";

       if(rol==="residente"){

           apiUrl = "http://localhost:8080/api/administrador/agregarResidente";

           usuario = JSON.stringify({
               nombre:nombre,
               documento:documento,
               correo:correo, // Usar "correo" en lugar de "email" para consistencia
               telefono:celular,
               contraseña: contrasena // Cambiar "contrasena" a "password" para consistencia
           });

       }else if (rol === "propietario"){
           apiUrl = "http://localhost:8080/api/administrador/agregarPropietario";

           usuario  = JSON.stringify({
               nombre:nombre,
               documentoPropietario:documento,
               correo:correo,
               contraseña:contrasena,
               telefonoPropietario:celular
           })
       }else{
           Console.log("Tipo de usuario no valido")
       }


        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: usuario
            })

            if(!response.ok){
                throw new Error("Error al crear el nuevo usuario")
            }
            else if (response.ok){
                alert("Usuario creado de manera correcta")
                window.location.href="/ArchivosAdministrador/AdministrarUsuarios/administrar_usuarios.html"
            }


        } catch (e) {

        }


        alert('Usuario agregado correctamente');

        // Redirigir a la página de gestión de usuarios
        window.location.href = 'administrar_usuarios.html';
    });
