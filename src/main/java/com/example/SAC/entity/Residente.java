package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
@Table(name="residente")
public class Residente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idresidente")
    private Long idresidente;
    @Column(name="nombre")
    private String nombre;
    @Column(name="edad")
    private int edad;
    @Column (name = "correo")
    private String correo;
    @Column (name = "contraseña")
    private String contraseña;
    @Column (name = "telefono")
    private String telefono;
    @Column(name="documento")
    private String documento;
    @Column(name="idcuenta")
    private long idcuenta;

    @ManyToOne
    @JoinColumn(name="id_apartamento", nullable=true)
    private Apartamento apartamento;



    public Residente(String nombre, String contraseña, int edad, String correo, String telefono, String documento, long idcuenta) {
        this.nombre = nombre;
        this.contraseña = contraseña;
        this.edad = edad;
        this.correo = correo;
        this.telefono = telefono;
        this.documento = documento;
        this.idcuenta = idcuenta;
    }

    public Residente() {

    }


    //Getters
    //Get Correo

    public String getCorreo() {
        return correo;
    }
    //Get Contraseña
    public String getContraseña(){
        return contraseña;
    }

    public Long getIdresidente() {
        return idresidente;
    }

    //Setters

    //Set correo
    public void setCorreo(String correo) {
        this.correo = correo;
    }

    //Set contraseña
    public void setContraseña(){
        this.contraseña = contraseña;
    }

}
