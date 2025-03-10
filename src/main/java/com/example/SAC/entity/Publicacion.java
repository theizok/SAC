package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;

@Data
@Entity
@Table(name="publicacion")
public class Publicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idPublicacion;
    private Date fechaPublicacion;
    private String contenidoPublicacion;
    private int idAdministrador;

}
