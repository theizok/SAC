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
    private long idPublicacion;
    @Column(name="fecha")
    private LocalDateTime fechaPublicacion;
    @Column(name="contenido")
    private String contenidoPublicacion;
    @Column(name="idadministrador")
    private long idAdministrador;
    @Column(name="idresidente")
    private long idResidente;

}
