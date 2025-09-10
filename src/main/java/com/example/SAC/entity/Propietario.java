package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="propietario")
@AllArgsConstructor
@NoArgsConstructor
public class  Propietario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idpropietario")
    private long idPropietario;
    @Column(name="nombre")
    private String nombre;
    @Column(name = "documento", unique = true, nullable = false, length=10)
    private String documento;
    @Column(name = "correo", unique = true, nullable = false)
    private String correo;
    @Column(name = "telefono", unique = true, nullable = false, length=10)
    private String telefonoPropietario;
    @Column (name = "contraseña")
    private String contraseña;
    @Column(name = "idcuenta")
    private long idCuenta;


    @ManyToOne
    @JoinColumn (name = "idapartamento", nullable = true)
    private Apartamento apartamento;


    public Propietario(String nombre, String contraseña, String documento, String correo, String telefonoPropietario, long idCuenta) {
        this.nombre = nombre;
        this.contraseña = contraseña;
        this.documento = documento;
        this.correo = correo;
        this.telefonoPropietario = telefonoPropietario;
        this.idCuenta = idCuenta;
    }


}
