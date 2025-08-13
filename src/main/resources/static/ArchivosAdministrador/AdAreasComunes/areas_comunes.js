const API_BASE = '/api/administrador';

const formArea   = document.getElementById('form-area');
const tablaAreas = document.getElementById('tabla-areas');
const btnSubmit  = document.getElementById('btn-submit');

let editId = null; // id del área que estamos editando

document.addEventListener('DOMContentLoaded', () => {
    cargarAreas();
});

formArea.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre      = document.getElementById('nombre-area').value.trim();
    const precioRaw   = document.getElementById('precio-area').value;
    const precio      = parseFloat(precioRaw);
    const descripcion = document.getElementById('descripcion-area').value.trim();

    if (!nombre || isNaN(precio) || !descripcion) {
        alert('Completa todos los campos correctamente.');
        return;
    }

    const payload = { area: nombre, precio: precio, descripcion: descripcion };

    try {
        if (editId) {
            // actualizar (PUT con id como requestParam)
            const res = await fetch(`${API_BASE}/actualizarAreaComun?id=${encodeURIComponent(editId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Error al actualizar');
            }
            resetForm();
            await cargarAreas();
        } else {
            // crear (POST)
            const res = await fetch(`${API_BASE}/añadirAreaComun`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Error al crear');
            }
            resetForm();
            await cargarAreas();
        }
    } catch (err) {
        console.error(err);
        alert('Error: ' + (err.message || err));
    }
});

async function cargarAreas() {
    tablaAreas.innerHTML = '';
    try {
        const res = await fetch(`${API_BASE}/obtenerAreas`);
        if (!res.ok) throw new Error('No se pudo obtener la lista');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Respuesta inválida del servidor');
        data.forEach(area => crearFila(area));
    } catch (err) {
        console.error(err);
        tablaAreas.innerHTML = `<tr><td colspan="4">Error cargando áreas: ${err.message}</td></tr>`;
    }
}

function crearFila(area) {
    // Detecta el id (tu entidad usa 'id')
    const id = area.id;
    const fila = tablaAreas.insertRow();
    fila.dataset.id = id;

    fila.insertCell(0).textContent = area.area ?? '';
    fila.insertCell(1).textContent = (typeof area.precio === 'number') ? `$ ${area.precio}` : (area.precio ?? '');
    fila.insertCell(2).textContent = area.descripcion ?? '';

    const acciones = fila.insertCell(3);
    acciones.innerHTML = `
        <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>
    `;

    acciones.querySelector('.btn-delete').addEventListener('click', () => eliminarArea(id, fila));
    acciones.querySelector('.btn-edit').addEventListener('click', () => startEdit(id));
}

async function startEdit(id) {
    try {
        const res = await fetch(`${API_BASE}/obtenerAreaComun?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('No se pudo obtener el área');
        const area = await res.json();
        // llenar formulario
        document.getElementById('nombre-area').value      = area.area ?? '';
        document.getElementById('precio-area').value      = area.precio ?? '';
        document.getElementById('descripcion-area').value = area.descripcion ?? '';
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Guardar';
        document.getElementById('form-title').textContent = 'Editar Área';
        editId = id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error(err);
        alert('Error al cargar datos del área: ' + (err.message || err));
    }
}

async function eliminarArea(id, filaDom) {
    if (!confirm('¿Eliminar esta área?')) return;
    try {
        const res = await fetch(`${API_BASE}/eliminarAreaComun?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Error al eliminar');
        }
        // si la eliminación fue exitosa, recargar o quitar la fila
        if (filaDom && filaDom.remove) filaDom.remove();
        else await cargarAreas();
    } catch (err) {
        console.error(err);
        alert('No se pudo eliminar: ' + (err.message || err));
    }
}

function resetForm() {
    formArea.reset();
    editId = null;
    btnSubmit.innerHTML = '<i class="fas fa-plus"></i> Agregar';
    document.getElementById('form-title').textContent = 'Nueva Área';
}