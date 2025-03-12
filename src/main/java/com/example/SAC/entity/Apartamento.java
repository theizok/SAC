package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="apartamento")
public class Apartamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idapartamento")
    private long idApartamento;
    @Column(name="numeroapartamento")
    private long numeroApartamento;
    @Column(name="idresidente")
    private long idResidente;
    /*
    @Column(name="idPropietario")
    private long idPropietario;*/
}
