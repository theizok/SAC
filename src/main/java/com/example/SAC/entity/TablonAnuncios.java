package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tablonanuncios" )
public class TablonAnuncios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idtablonAnuncios;
    private int idPublicacion;
}
