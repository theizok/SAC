package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tablonanuncios" )
public class TablonAnuncios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idtablonanuncios")
    private long idtablonAnuncios;
    @Column(name="idpublicacion")
    private int idPublicacion;
}
