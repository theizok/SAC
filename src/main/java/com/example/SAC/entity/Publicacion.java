package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name="publicacion")
public class Publicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idpublicacion")
    private long idpublicacion;

    @Column(name="fecha")
    private LocalDateTime fecha;

    @Column(name="contenido")
    private String contenido;

    @Column(name="titulo")
    private String titulo;

    @ManyToOne
    @JoinColumn(name = "idcuenta", nullable=false)
    private Cuenta cuenta;
}

