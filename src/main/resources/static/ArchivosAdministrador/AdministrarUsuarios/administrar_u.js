document.addEventListener("DOMContentLoaded", () => {
    let currentEditId = null;

    // 1) Cargar todos los usuarios (residentes + propietarios)
    async function obtenerUsuarios() {
        const res = await fetch("http://localhost:8080/api/administrador/obtenerUsuarios");
        const data = await res.json();
        const tabla = document.getElementById("users-table");
        tabla.innerHTML = "";
        data.forEach(usuario => {
            const tr = document.createElement("tr");
            tr.dataset.id = usuario.id;
            tr.innerHTML = `
                <td><strong>${usuario.nombre}</strong></td>
                <td><strong>${usuario.documento}</strong></td>
                <td><strong>${usuario.correo}</strong></td>
                <td><strong>${usuario.telefono}</strong></td>
                <td><strong>${usuario.tipoUsuario}</strong></td>
                <td class="acciones">
                    <button class="btn secondary btn-editar"><i class="fas fa-edit"></i></button>
                    <button class="btn secondary btn-eliminar"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    }

    // 2) Abrir modal y precargar datos
    document.getElementById("users-table").addEventListener("click", async e => {
        if (e.target.closest(".btn-editar")) {
            const tr = e.target.closest("tr");
            currentEditId = tr.dataset.id;
            const res = await fetch(`http://localhost:8080/api/administrador/obtenerResidenteById?id=${currentEditId}`);
            const usuario = await res.json();

            document.getElementById("editar-nombre").value    = usuario.nombre;
            document.getElementById("editar-documento").value = usuario.documento;
            document.getElementById("editar-correo").value    = usuario.correo;
            document.getElementById("editar-celular").value   = usuario.telefono;
            document.getElementById("editar-rol").value       = usuario.tipoUsuario;

            document.getElementById("modal-editar").style.display = "block";
        }
    });

    // 3) Enviar actualización
    document.getElementById("form-editar-usuario").addEventListener("submit", async e => {
        e.preventDefault();
        const payload = {
            nombre:      document.getElementById("editar-nombre").value,
            documento:   document.getElementById("editar-documento").value,
            correo:      document.getElementById("editar-correo").value,
            telefono:    document.getElementById("editar-celular").value,
            tipoUsuario: document.getElementById("editar-rol").value
        };
        const res = await fetch(`http://localhost:8080/api/administrador/modificarResidenteById?id=${currentEditId}`, {
            method:  "PUT",
            headers: {"Content-Type": "application/json"},
            body:    JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Usuario actualizado");
            document.getElementById("modal-editar").style.display = "none";
            obtenerUsuarios();
        } else {
            const err = await res.json();
            alert("Error: " + err.message);
        }
    });

    // 4) Cerrar modal
    document.querySelector(".cerrar").addEventListener("click", () => {
        document.getElementById("modal-editar").style.display = "none";
    });

    // 5) Eliminar usuario
    document.getElementById("users-table").addEventListener("click", async e => {
        if (e.target.closest(".btn-eliminar")) {
            const tr = e.target.closest("tr");
            const id = tr.dataset.id;
            if (!confirm("¿Eliminar este usuario?")) return;
            const res = await fetch(`http://localhost:8080/api/administrador/eliminarResidenteById?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                alert("Usuario eliminado");
                tr.remove();
            } else {
                const err = await res.json();
                alert("Error: " + err.message);
            }
        }
    });

    // 6) Redirigir a agregar usuario
    document.getElementById("btn-agregar-usuario").addEventListener("click", () => {
        window.location.href = "http://localhost:8080/ArchivosAdministrador/AgregarUsuario/agregar_usuario.html";
    });

    // inicializar
    obtenerUsuarios();
});
