package com.example.SAC.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="areacomun")
@AllArgsConstructor
@NoArgsConstructor
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
