package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="metodospago")
public class MetodosPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idmetododepago")
    private long IdMetodoDePago;
    @Column(name="metododepago")
    private String metodoDePago;
}
