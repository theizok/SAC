const formArea   = document.getElementById('form-area');
const tablaAreas = document.getElementById('tabla-areas');
const btnSubmit  = document.getElementById('btn-submit');
let editRow      = null;

formArea.addEventListener('submit', e => {
    e.preventDefault();
    const nombre      = document.getElementById('nombre-area').value.trim();
    const precio      = document.getElementById('precio-area').value;
    const descripcion = document.getElementById('descripcion-area').value.trim();
    if (!nombre || !precio || !descripcion) return;

    if (editRow) {
        // Actualizar fila existente
        editRow.cells[0].textContent = nombre;
        editRow.cells[1].textContent = `$ ${precio}`;
        editRow.cells[2].textContent = descripcion;
        resetForm();
    } else {
        // Crear nueva fila
        const fila = tablaAreas.insertRow();
        fila.insertCell(0).textContent = nombre;
        fila.insertCell(1).textContent = `$ ${precio}`;
        fila.insertCell(2).textContent = descripcion;
        const acciones = fila.insertCell(3);
        acciones.innerHTML = `
      <button class="btn-edit"><i class="fas fa-edit"></i></button>
      <button class="btn-delete"><i class="fas fa-trash"></i></button>
    `;
        // Asignar eventos
        acciones.querySelector('.btn-delete')
            .addEventListener('click', () => fila.remove());
        acciones.querySelector('.btn-edit')
            .addEventListener('click', () => startEdit(fila));
        resetForm();
    }
});

function startEdit(fila) {
    editRow = fila;
    document.getElementById('nombre-area').value      = fila.cells[0].textContent;
    document.getElementById('precio-area').value      = fila.cells[1].textContent.replace(/\D/g, '');
    document.getElementById('descripcion-area').value = fila.cells[2].textContent;
    btnSubmit.innerHTML = '<i class="fas fa-save"></i> Guardar';
    document.getElementById('form-title').textContent = 'Editar Área';
}

function resetForm() {
    formArea.reset();
    editRow = null;
    btnSubmit.innerHTML = '<i class="fas fa-plus"></i> Agregar';
    document.getElementById('form-title').textContent = 'Nueva Área';
}