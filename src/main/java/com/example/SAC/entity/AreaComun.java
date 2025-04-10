package com.example.SAC.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="areacomun")
public class AreaComun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idareacomun")
    private long id;
    @Column(name="area")
    private String area;
    @Column(name="precio")
    private float precio;
}
