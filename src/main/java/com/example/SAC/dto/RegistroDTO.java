package com.example.SAC.dto;

import lombok.Getter;

@Getter
public class RegistroDTO {

    private String nombre;
    private String documento;
    private String telefono;
    private String correo;
    private String contrasena;
    private String recaptchaToken;

}
