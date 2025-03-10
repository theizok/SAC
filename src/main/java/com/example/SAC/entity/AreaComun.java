package com.example.SAC.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="areacomun")
public class AreaComun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idAreaComun;
    private String area;
    private float precio;
}
