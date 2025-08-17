document.addEventListener("DOMContentLoaded", () => {
    let currentEditId = null;
    let currentEditTipo = null; // 'Propietario' / 'Residente' / etc.

    function obtenerIdDeUsuario(u) {
        return u.id ?? u.idCuenta ?? u.idUsuario ?? u.idCuentaUsuario ?? u.idPropietario ?? u.idresidente ?? u.idResidente ?? null;
    }

    async function obtenerUsuarios() {
        try {
            const res = await fetch("/api/administrador/obtenerUsuarios", { credentials: 'include' });
            if (!res.ok) throw new Error("Error al obtener usuarios: " + res.status);
            const data = await res.json();

            const tabla = document.getElementById("users-table");
            if (!tabla) throw new Error("No se encontró el elemento #users-table");
            tabla.innerHTML = "";

            data.forEach(usuario => {
                const userId = obtenerIdDeUsuario(usuario);
                const tipo = (usuario.tipoUsuario || usuario.tipo || usuario.rol || "").toString().trim();

                const tr = document.createElement("tr");
                tr.dataset.id = userId ?? "";
                tr.dataset.tipo = tipo;
                tr.dataset.documento = usuario.documento ?? "";

                tr.innerHTML = `
          <td><strong>${usuario.nombre || ""}</strong></td>
          <td><strong>${usuario.documento || ""}</strong></td>
          <td><strong>${usuario.correo || ""}</strong></td>
          <td><strong>${usuario.telefono || usuario.telefonoPropietario || usuario.telefonoResidente || ""}</strong></td>
          <td><strong>${tipo}</strong></td>
          <td class="acciones">
            <button class="btn secondary btn-editar" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn secondary btn-eliminar" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </td>
        `;
                tabla.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            alert("No se pudo cargar la lista de usuarios. Revisa la consola.");
        }
    }

    // Abrir modal: siempre pedir al backend por ID (sin cache)
    document.getElementById("users-table")?.addEventListener("click", async (e) => {
        if (!e.target) return;
        if (e.target.closest(".btn-editar")) {
            const tr = e.target.closest("tr");
            currentEditId = tr.dataset.id;
            currentEditTipo = (tr.dataset.tipo || "").trim();

            if (!currentEditId) {
                alert("No se pudo obtener el id del usuario.");
                return;
            }

            try {
                let usuario = null;
                if (String(currentEditTipo).toLowerCase().includes("propietario")) {
                    const r = await fetch(`/api/administrador/obtenerPropietarioById?id=${currentEditId}`, { credentials: 'include' });
                    if (!r.ok) throw new Error("No se encontró propietario");
                    usuario = await r.json();
                } else {
                    const r = await fetch(`/api/administrador/obtenerResidenteById?id=${currentEditId}`, { credentials: 'include' });
                    if (!r.ok) throw new Error("No se encontró residente");
                    usuario = await r.json();
                }

                // Llenar campos (rol solo lectura)
                document.getElementById("editar-nombre").value = usuario.nombre || "";
                document.getElementById("editar-documento").value = usuario.documento || "";
                document.getElementById("editar-correo").value = usuario.correo || "";
                // Mostrar teléfono correcto (propietario vs residente)
                const telefonoVal = usuario.telefonoPropietario ?? usuario.telefono ?? usuario.telefonoResidente ?? "";
                document.getElementById("editar-celular").value = telefonoVal;
                document.getElementById("mostrar-rol").textContent = usuario.tipoUsuario || currentEditTipo || "";

                document.getElementById("modal-editar").style.display = "block";
            } catch (err) {
                console.error(err);
                alert("Error al precargar datos: " + (err.message || err));
            }
        }
    });

    // Guardar cambios (envíar payload acorde al tipo)
    document.getElementById("form-editar-usuario")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentEditId) {
            alert("Id del usuario no definido.");
            return;
        }

        const nombreVal = document.getElementById("editar-nombre").value || "";
        const documentoVal = document.getElementById("editar-documento").value || "";
        const correoVal = document.getElementById("editar-correo").value || "";
        const celularVal = document.getElementById("editar-celular").value || "";

        let payload = {
            nombre: nombreVal,
            documento: documentoVal,
            correo: correoVal
        };

        if (String(currentEditTipo).toLowerCase().includes("propietario")) {
            // El backend espera telefonoPropietario en la entidad Propietario
            payload.telefonoPropietario = celularVal;
        } else {
            // Para residentes u otros se usa telefono
            payload.telefono = celularVal;
        }

        try {
            let url;
            if (String(currentEditTipo).toLowerCase().includes("propietario")) {
                url = `/api/administrador/modificarPropietarioById?id=${currentEditId}`;
            } else {
                url = `/api/administrador/modificarResidenteById?id=${currentEditId}`;
            }

            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (res.ok) {
                alert("Usuario actualizado");
                document.getElementById("modal-editar").style.display = "none";
                await obtenerUsuarios();
            } else {
                const errBody = await res.json().catch(() => ({}));
                console.error("Error update:", errBody);
                alert("Error: " + (errBody.message || "No se pudo actualizar"));
            }
        } catch (err) {
            console.error(err);
            alert("Error al actualizar: " + (err.message || err));
        }
    });

    // Cerrar modal (botón X)
    document.querySelector(".cerrar")?.addEventListener("click", () => {
        document.getElementById("modal-editar").style.display = "none";
    });

    // Cerrar modal al hacer click fuera del contenido
    window.addEventListener("click", (ev) => {
        const modal = document.getElementById("modal-editar");
        if (modal && ev.target === modal) {
            modal.style.display = "none";
        }
    });

    // Eliminar usuario (siempre por id en backend)
    document.getElementById("users-table")?.addEventListener("click", async (e) => {
        if (e.target.closest(".btn-eliminar")) {
            const tr = e.target.closest("tr");
            const id = tr.dataset.id;
            const tipo = (tr.dataset.tipo || "").trim();

            if (!id) {
                alert("No se pudo obtener el id del usuario.");
                return;
            }
            if (!confirm("¿Eliminar este usuario?")) return;

            try {
                let url;
                if (String(tipo).toLowerCase().includes("propietario")) {
                    url = `/api/administrador/eliminarPropietarioById?id=${id}`;
                } else {
                    url = `/api/administrador/eliminarResidenteById?id=${id}`;
                }

                const res = await fetch(url, { method: "DELETE", credentials: 'include' });
                if (res.ok) {
                    alert("Usuario eliminado");
                    await obtenerUsuarios();
                } else {
                    const errBody = await res.json().catch(() => ({}));
                    console.error("Error delete:", errBody);
                    alert("Error: " + (errBody.message || "No se pudo eliminar"));
                }
            } catch (err) {
                console.error(err);
                alert("Error al eliminar: " + err.message);
            }
        }
    });

    // Redirigir a agregar usuario
    const btnAgregar = document.getElementById("btn-agregar-usuario");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            window.location.href = "/ArchivosAdministrador/AgregarUsuario/agregar_usuario.html";
        });
    }

    // Inicializar
    obtenerUsuarios();
});
