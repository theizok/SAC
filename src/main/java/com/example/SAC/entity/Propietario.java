package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="propietario")
public class Propietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idpropietario")
    private long idPropietario;
    @Column(name="nombre")
    private String nombrePropietario;
    @Column(name="documento")
    private String documentoPropietario;
    @Column (name = "correo")
    private String correo;
    @Column (name = "telefono")
    private String telefonoPropietario;
    @Column (name = "contraseña")
    private String contraseña;
    @Column (name = "idapartamento")
    private long idApartamentoPropietario;



}
