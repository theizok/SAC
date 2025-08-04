package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="propietario")
public class  Propietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idpropietario")
    private long idPropietario;
    @Column(name="nombre")
    private String nombre;
    @Column(name="documento")
    private String documento;
    @Column (name = "correo")
    private String correo;
    @Column (name = "telefono")
    private String telefonoPropietario;
    @Column (name = "contraseña")
    private String contraseña;
    @Column(name = "idcuenta")
    private long idCuenta;


    @ManyToOne
    @JoinColumn (name = "idapartamento", nullable = true)
    private Apartamento apartamento;



}
