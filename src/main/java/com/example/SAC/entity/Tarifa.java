package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
public class Tarifa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_tarifa;
    @Column(name="categoria")
    private String categoria;
    @Column(name="valor")
    private float valor;
}
