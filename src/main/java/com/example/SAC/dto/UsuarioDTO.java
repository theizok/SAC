package com.example.SAC.dto;

import lombok.Data;

@Data
public class    UsuarioDTO {
    public long id;
    public String nombre;
    public String correo;
    public String documento;
    public String telefono;
    public String tipoUsuario;
    public long idCuenta;


    public UsuarioDTO(long id,String nombre, String correo, String documento, String telefono, String tipoUsuario, long idCuenta) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.documento = documento;
        this.telefono = telefono;
        this.tipoUsuario = tipoUsuario;
        this.idCuenta = idCuenta;
    }
}
