package com.example.SAC.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Null;
import lombok.Data;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@Data
@Entity
@Table(name="residente")
public class Residente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idresidente")
    private int idresidente;
    @Column(name="nombre")
    private String nombre;
    @Column(name="edad")
    private int edad;
    @Column (name = "correo")
    private String correo;
    @Column (name = "contraseña")
    private String contraseña;
    @Column (name = "telefono")
    private String telefono;
    @Column(name="documento")
    private String documento;
    @Column(name="idcuenta")
    private long idcuenta;
    @Column(name="idrol")
    private long idrol;
    @Column(name="idapartamento")
    private long idapartamento;
}
