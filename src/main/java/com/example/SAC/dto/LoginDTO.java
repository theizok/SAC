package com.example.SAC.dto;

public class LoginDTO {
    private String correo;
    private String contraseña;


    public LoginDTO() {}

    public LoginDTO (String correo, String contraseña)
    {
        this.correo = correo;
        this.contraseña = contraseña;
    }

    //Metodos getters
    public String getCorreo() {
        return correo;
    }

    public String getContraseña(){
        return contraseña;
    }

}
