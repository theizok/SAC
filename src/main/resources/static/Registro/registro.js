document.getElementById('registro-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const documento = document.getElementById('documento').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('email').value; // Campo correo
    const contraseña = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;

    let apiUrl = ""
    let nuevoUsuario = "";

    // Crear nuevo usuario con todos los campos
    //Propietario
    const propietario = JSON.stringify({
        nombre:nombre,
        correo:correo,
        documento:documento,
        telefonoPropietario:telefono,
        contraseña:contraseña
    });
    //Residente
    const residente = JSON.stringify({
        nombre:nombre,
        correo:correo,
        documento:documento,
        telefono:telefono,
        contraseña:contraseña
    })

    const rolMinuscula = rol.toLowerCase();

    switch(rolMinuscula) {
        case("residente"):
            apiUrl = "http://localhost:8080/api/register/residente";
            nuevoUsuario = residente;
            break;
        case("propietario"):
            apiUrl="http://localhost:8080/api/register/propietario";
            nuevoUsuario = propietario;
            break;
        default:
    }

    try {
        const response = await fetch(apiUrl,{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            }
            ,body:nuevoUsuario
        })
        if(!response.ok){
            alert("Fallo al registrarse")

        }
        alert("Usuario creado correctamente")
        windowlocation.href='/InicioNoAuth/Inicio_no.html'


    } catch(e){
        console.log("Error al crear la cuenta\nError :" + e)
    }

});