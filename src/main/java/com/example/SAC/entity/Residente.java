package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@Data
@Entity
@Table(name="residente")
public class Residente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idresidente;
    private String nombre;
    private int edad;
    private String correo;
    private String documento;

}
