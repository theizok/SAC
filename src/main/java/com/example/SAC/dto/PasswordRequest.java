package com.example.SAC.dto;


public class PasswordRequest {
    private Long idUsuario;
    private String passwordActual;
    private String passwordNueva;

    //Metodos setters y getters

    public String getPasswordActual() {
        return passwordActual;
    }
    public void setPasswordActual(String passwordActual) {
        this.passwordActual = passwordActual;
    }
    public String getPasswordNueva() {
        return passwordNueva;
    }
    public void setPasswordNueva(String passwordNueva) {
        this.passwordNueva = passwordNueva;
    }
    public Long getIdUsuario() {
        return idUsuario;
    }
}
