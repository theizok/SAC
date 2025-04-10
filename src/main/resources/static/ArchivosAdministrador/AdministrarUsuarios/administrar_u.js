 document.addEventListener("DOMContentLoaded",  () => {

     //Obtener usuarios
     async function obtenerUsuarios() {
         try {
             const response = await fetch("http://localhost:8080/api/administrador/obtenerUsuarios", {
                 method: "GET"
             })

             if(!response.ok){
                 throw new Error("Error al obtener los usuarios")
             }

             const data = await response.json();

             const tablaUsuarios = document.getElementById("users-table");

            data.forEach((usuario,index) => {
            const fila = document.createElement('tr');
            fila.setAttribute('id', index + 1);
            fila.innerHTML = `<td><strong>${usuario.nombre}</strong></td>
                <td><strong>${usuario.documento}</strong></td><td><strong>${usuario.correo}</strong></td><td><strong>${usuario.tipoUsuario}</strong></td>
            `;
                tablaUsuarios.appendChild(fila);
            });
         } catch (e) {
            Error("Error al obtener los usuarios\nError: " + e);
         }
     }

     document.getElementById("btn-agregar-usuario").addEventListener("click", function () {
        window.location.href="http://localhost:8080/ArchivosAdministrador/AgregarUsuario/agregar_usuario.html"
     })


     obtenerUsuarios();

 })
