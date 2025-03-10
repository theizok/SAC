package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="propietario")
public class Propietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idPropietario;
    private String nombrePropietario;
    private String apellidoPropietario;
    private String correoPropietario;
    private String telefonoPropietario;
    private String documentoPropietario;
    private String contraseñaPropietario;
}
