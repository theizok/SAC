document.addEventListener("DOMContentLoaded", () => {
    let currentEditId = null;
    let currentEditTipo = null; // "Residente" o "Propietario"

    // 1) Cargar todos los usuarios (residentes + propietarios)
    async function obtenerUsuarios() {
        try {
            const res = await fetch("/api/administrador/obtenerUsuarios");
            if (!res.ok) throw new Error("Error al obtener usuarios");
            const data = await res.json();
            const tabla = document.getElementById("users-table");
            tabla.innerHTML = "";

            data.forEach(usuario => {
                // Detectar id defensivamente (según cómo venga el DTO)
                const userId = usuario.id || usuario.idCuenta || usuario.idUsuario || usuario.idcuenta || usuario.idCuentaUsuario || usuario.idPropietario || usuario.idresidente;
                const tipo = usuario.tipoUsuario || usuario.tipo || "";

                const tr = document.createElement("tr");
                tr.dataset.id = userId;
                tr.dataset.tipo = tipo;
                tr.innerHTML = `
                    <td><strong>${usuario.nombre || ""}</strong></td>
                    <td><strong>${usuario.documento || ""}</strong></td>
                    <td><strong>${usuario.correo || ""}</strong></td>
                    <td><strong>${usuario.telefono || ""}</strong></td>
                    <td><strong>${tipo}</strong></td>
                    <td class="acciones">
                        <button class="btn secondary btn-editar"><i class="fas fa-edit"></i></button>
                        <button class="btn secondary btn-eliminar"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                tabla.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            alert("No se pudo cargar la lista de usuarios.");
        }
    }

    // 2) Abrir modal y precargar datos (detecta tipo para usar endpoint correcto)
    document.getElementById("users-table").addEventListener("click", async e => {
        if (e.target.closest(".btn-editar")) {
            const tr = e.target.closest("tr");
            currentEditId = tr.dataset.id;
            currentEditTipo = (tr.dataset.tipo || "").trim();

            if (!currentEditId) {
                alert("No se pudo obtener el id del usuario.");
                return;
            }

            try {
                let res;
                if (currentEditTipo === "Propietario") {
                    res = await fetch(`https://sac-253068519041.us-central1.run.app/api/administrador/obtenerPropietarioById?id=${currentEditId}`);
                } else {
                    // Por defecto tratamos como residente
                    res = await fetch(`https://sac-253068519041.us-central1.run.app/api/administrador/obtenerResidenteById?id=${currentEditId}`);
                }

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || "Error al obtener usuario");
                }

                const usuario = await res.json();

                // llenar campos (manejamos telefonos con flexibilidad)
                document.getElementById("editar-nombre").value    = usuario.nombre || "";
                document.getElementById("editar-documento").value = usuario.documento || "";
                document.getElementById("editar-correo").value    = usuario.correo || "";
                document.getElementById("editar-celular").value   = usuario.telefono || usuario.telefonoPropietario || usuario.telefono || "";
                document.getElementById("editar-rol").value       = usuario.tipoUsuario || currentEditTipo || "";

                document.getElementById("modal-editar").style.display = "block";
            } catch (err) {
                console.error(err);
                alert("Error al precargar datos: " + (err.message || err));
            }
        }
    });

    // 3) Enviar actualización (usa endpoint según tipo detectado)
    document.getElementById("form-editar-usuario").addEventListener("submit", async e => {
        e.preventDefault();
        if (!currentEditId) {
            alert("Id del usuario no definido.");
            return;
        }

        const payload = {
            nombre:      document.getElementById("editar-nombre").value,
            documento:   document.getElementById("editar-documento").value,
            correo:      document.getElementById("editar-correo").value,
            telefono:    document.getElementById("editar-celular").value,
            tipoUsuario: document.getElementById("editar-rol").value
        };

        try {
            let url;
            if (currentEditTipo === "Propietario") {
                url = `http://localhost:8080/api/administrador/modificarPropietarioById?id=${currentEditId}`;
            } else {
                url = `http://localhost:8080/api/administrador/modificarResidenteById?id=${currentEditId}`;
            }

            const res = await fetch(url, {
                method:  "PUT",
                headers: {"Content-Type": "application/json"},
                body:    JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Usuario actualizado");
                document.getElementById("modal-editar").style.display = "none";
                // refrescar tabla
                obtenerUsuarios();
            } else {
                const err = await res.json().catch(() => ({}));
                alert("Error: " + (err.message || "No se pudo actualizar"));
            }
        } catch (err) {
            console.error(err);
            alert("Error al actualizar: " + err.message);
        }
    });

    // 4) Cerrar modal
    document.querySelector(".cerrar").addEventListener("click", () => {
        document.getElementById("modal-editar").style.display = "none";
    });

    // 5) Eliminar usuario (usa endpoint según tipo detectado)
    document.getElementById("users-table").addEventListener("click", async e => {
        if (e.target.closest(".btn-eliminar")) {
            const tr = e.target.closest("tr");
            const id = tr.dataset.id;
            const tipo = tr.dataset.tipo || "";

            if (!id) {
                alert("No se pudo obtener el id del usuario.");
                return;
            }
            if (!confirm("¿Eliminar este usuario?")) return;

            try {
                let url;
                if (tipo === "Propietario") {
                    url = `http://localhost:8080/api/administrador/eliminarPropietarioById?id=${id}`;
                } else {
                    url = `http://localhost:8080/api/administrador/eliminarResidenteById?id=${id}`;
                }

                const res = await fetch(url, { method: "DELETE" });

                if (res.ok) {
                    alert("Usuario eliminado");
                    tr.remove();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert("Error: " + (err.message || "No se pudo eliminar"));
                }
            } catch (err) {
                console.error(err);
                alert("Error al eliminar: " + err.message);
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
