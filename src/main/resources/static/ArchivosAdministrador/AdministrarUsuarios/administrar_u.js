document.addEventListener("DOMContentLoaded", () => {

    // Obtener usuarios (función original SIN cambios)
    async function obtenerUsuarios() {
        try {
            const response = await fetch("http://localhost:8080/api/administrador/obtenerUsuarios", {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error("Error al obtener los usuarios");
            }

            const data = await response.json();
            const tablaUsuarios = document.getElementById("users-table");

            data.forEach((usuario, index) => {
                const fila = document.createElement('tr');
                fila.setAttribute('id', index + 1);
                fila.innerHTML = `
                    <td><strong>${usuario.nombre}</strong></td>
                    <td><strong>${usuario.documento}</strong></td>
                    <td><strong>${usuario.correo}</strong></td>
                    <td><strong>${usuario.tipoUsuario}</strong></td>
                    <!-- Botones de acción agregados -->
                    <td class="acciones">
                        <button class="btn secondary btn-editar" data-documento="${usuario.documento}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn secondary btn-eliminar" data-documento="${usuario.documento}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </td>
                `;
                tablaUsuarios.appendChild(fila);
            });

            // =============================================
            // Lógica visual para los botones (nueva)
            // =============================================
            
            // Abrir modal al editar (simulación visual)
            document.addEventListener("click", (e) => {
                if (e.target.classList.contains("btn-editar") || e.target.closest(".btn-editar")) {
                    document.getElementById("modal-editar").style.display = "block";
                }
            });

            // Simular eliminación (solo frontend)
            document.addEventListener("click", (e) => {
                if (e.target.classList.contains("btn-eliminar") || e.target.closest(".btn-eliminar")) {
                    if (confirm("¿Estás seguro de eliminar este usuario? (Acción simulada)")) {
                        e.target.closest("tr").remove();
                    }
                }
            });

        } catch (e) {
            console.error("Error al obtener los usuarios\nError: " + e);
        }
    }

    // Cerrar modal (nuevo)
    document.querySelector(".cerrar")?.addEventListener("click", () => {
        document.getElementById("modal-editar").style.display = "none";
    });

    // Simular guardar cambios (nuevo)
    document.getElementById("form-editar-usuario")?.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Funcionalidad de guardar en construcción. El backend se encargará de esto.");
        document.getElementById("modal-editar").style.display = "none";
    });

    // Redirección original (sin cambios)
    document.getElementById("btn-agregar-usuario").addEventListener("click", function () {
        window.location.href = "http://localhost:8080/ArchivosAdministrador/AgregarUsuario/agregar_usuario.html";
    });

    obtenerUsuarios();
});
