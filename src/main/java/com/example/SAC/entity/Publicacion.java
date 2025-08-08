package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
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

