package com.example.SAC.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    public long id;
    public String nombre;
    public String correo;
    public String documento;
    public String tipoUsuario;


    public UsuarioDTO(long id,String nombre, String correo, String documento, String tipoUsuario) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.documento = documento;
        this.tipoUsuario = tipoUsuario;
    }
}
