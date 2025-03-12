package com.example.SAC.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Null;
import lombok.Data;


@Data
    @Entity
    @Table(name="administrador")
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idadmnistrador")
    private Long idAdministrador;
    @Column(name = "nombre")
    private String nombreAdministrador;
    /*private String correoAdministrador;/*
    /*
    private String contraseñaAdministrador;*/
    @Column(name ="idcuenta")
    private long idCuenta;
    @Column(name="idrol")
    private long idRol;

}
