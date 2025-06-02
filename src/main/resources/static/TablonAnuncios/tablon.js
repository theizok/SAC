 // Configurar evento para el botón "Crear publicación"
    const btnCrear = document.getElementById('btn-crear');
    if (btnCrear) {
        btnCrear.addEventListener('click', function() {
            window.location.href = '/api/tablon/crearPublicacion';
        });
    }
    
    // Configurar eventos para las opciones de filtro
    const opcionesFiltro = document.querySelectorAll('#filtro-opciones a');
    opcionesFiltro.forEach(opcion => {
        opcion.addEventListener('click', function(e) {
            e.preventDefault();
            const filtro = this.getAttribute('data-filter');
            filtrarPublicaciones(filtro);
        });
    });


    //Cargar las publicaciones
 document.addEventListener("DOMContentLoaded", async function () {
     const publicacionesContainer = document.getElementById("contenedor-publicaciones");
     const filtroOpciones = document.getElementById("filtro-opciones");

     async function obtenerPublicaiones(filtro) {
         let apiUrlBase = "";


         switch(filtro){
             case("administrador"):
                 apiUrlBase = "http://localhost:8080/api/tablon/publicacionesAdministrador";
                 break;
             case("residentes"):
                 apiUrlBase = "http://localhost:8080/api/tablon/publicacionesResidentes";
                break;
             case("propietarios"):
                 apiUrlBase = "http://localhost:8080/api/tablon/publicacionesPropietarios";
                 break;
             default:
                 apiUrlBase = "http://localhost:8080/api/tablon/publicacionesAll";
         }

         try {
             console.log("URL de la API:", apiUrlBase);
             //Peticion al back
             const response = await fetch(apiUrlBase);
             if(!response.ok) {
                 throw new Error("Error al obtener publicaciones");
             }
             const publicaciones = await response.json();

             //Verificacion de publicaciones (Si hay o no)
             if (publicaciones.length === 0) {
                 publicacionesContainer.innerHTML = "<p>No hay publicaciones disponibles.</p>";
                 return;
             }

             // Iterar sobre las publicaciones y agregarlas al DOM
             publicaciones.forEach(publicacion => {
                 const divPublicacion = document.createElement("div");
                 divPublicacion.className = "publicacion";
                 divPublicacion.setAttribute("data-id", publicacion.id);

                 divPublicacion.innerHTML = `
                <div class="publicacion-header">
                    <h3>${publicacion.titulo}</h3>
                    <button class="btn-eliminar" title="Eliminar publicación">×</button>
                </div>
                <div class="publicacion-body">
                    <p><strong>Por:</strong>${publicacion.tipo_cuenta}<span class="fecha">${publicacion.nombre}</span><span class="fecha"><strong>Fecha:</strong> ${publicacion.fecha}</span></p>
                    <p>${publicacion.contenido}</p>
                </div>
            `;
                 // Agregar publicación al contenedor
                 publicacionesContainer.appendChild(divPublicacion);
             });
         } catch (error) {
             console.error("Error al cargar publicaciones:", error);
             publicacionesContainer.innerHTML = "<p>Error al cargar las publicaciones.</p>";
         }
     };

     //Cargado de filtro
     filtroOpciones.addEventListener("click", function (event){
         event.preventDefault();
         publicacionesContainer.innerHTML = "";
         const filtro = event.target.getAttribute("data-filter");

         if(filtro) {
             obtenerPublicaiones(filtro)
         }
         else{}
     });

     obtenerPublicaiones("todos");
 })
