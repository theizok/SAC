# Requisitos para el correcto funcionamiento del proyecto

1. Instalar **SDK 23 Amazon Corretto 23.0.2 Java 23** (preferiblemente) para asegurar la compatibilidad del proyecto.
2. Agregar y utilizar la base de datos que viene incluida junto al proyecto.

---

## Usuarios por defecto

En caso de no crear otros usuarios manualmente, puedes iniciar sesión con las siguientes cuentas predefinidas:

### Administrador
- **Correo:** administrador@gmail.com  
- **Contraseña:** 1234

### Residente
- **Correo:** login@gmail.com  
- **Contraseña:** 12345

### Propietario
- **Correo:** papaleta@gmail.co  
- **Contraseña:** 12345

## Configuración adicional

### Base de datos

Este proyecto está configurado para conectarse a una base de datos **MySQL** llamada `sac4` en `localhost`, utilizando las siguientes credenciales por defecto:

- **Usuario:** root  
- **Contraseña:** *(vacía)*

Asegúrate de que:
- La base de datos `sac4` exista en tu servidor MySQL.
- Las credenciales en el archivo `application.properties` coincidan con tu configuración local.
- Tienes el driver de MySQL correspondiente (por ejemplo, `mysql-connector-j`) incluido como dependencia en tu proyecto.

Configurar la contraseña y el usuario en caso de ser necesario para que funcione 
