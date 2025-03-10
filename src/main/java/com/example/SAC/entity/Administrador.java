package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;


@Data
    @Entity
    @Table(name="administrador")
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAdministrador;
    private String nombreAdministrador;
    private String apellidoAdministrador;
    private String correoAdministrador;
    private String contraseñaAdministrador;
    private String idCuenta;
    private String idRol;

}
