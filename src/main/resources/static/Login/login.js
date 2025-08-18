document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Evita que el formulario recargue la página

    // Obtener valores del formulario
    const correo = document.getElementById("correo").value;
    const contraseña = document.getElementById("contraseña").value;

    // Crear objeto JSON para enviar al backend
    const usuario = JSON.stringify({
        correo: correo,
        contraseña: contraseña
    });

    try {
        const respuesta = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: usuario,
            credentials: "include" // Incluye cookies para mantener la sesión
        });

        if (!respuesta.ok) {
            document.getElementById("responseMessage").innerText = "Credenciales incorrectas";
            return;
        } 

        
        const data = await respuesta.json();
        const role = data.userType;
        sessionStorage.setItem("userType", data.userType); //Almacenar tipo de usuario en navegador mientras la pestaña este abierta
        sessionStorage.setItem("id", data.id);//Almacenar id en navegador
        sessionStorage.setItem("idCuenta", data.idCuenta);

        

        //Redireccion segun rol
        if (role === "ADMINISTRADOR") {
            window.location.href = "/api/administrador/dashboard";
        }else if (role === "RESIDENTE") {
            window.location.href = "/api/residente/dashboard"
        }else if (role === "PROPIETARIO") {
            window.location.href = "/api/propietario/dashboard"
        } else {
            window.location.href="/";
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("responseMessage").innerText = "Error de conexión";
    }
});