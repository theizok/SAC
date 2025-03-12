package com.example.SAC.entity;

import jakarta.persistence.*;
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
    /*private String correo;*/
    @Column(name="documento")
    private String documento;
    @Column(name="idcuenta")
    private long idcuenta;
    @Column(name="idrol")
    private long idrol;
    @Column(name="idapartamento")
    private long idapartamento;


}
