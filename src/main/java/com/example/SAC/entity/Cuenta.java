package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="cuenta")
public class Cuenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idcuenta")
    private long idCuenta;
    @Column(name="numerodecuenta")
    private String numeroDeCuenta;
}
