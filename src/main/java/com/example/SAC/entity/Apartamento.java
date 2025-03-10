package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="apartamento")
public class Apartamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idApartamento;
    private String numeroApartamento;
    private int idResidente;
    private int idPropietario;
}
