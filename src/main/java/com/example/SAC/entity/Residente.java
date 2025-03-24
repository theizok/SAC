package com.example.SAC.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Null;
import lombok.Data;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@Data
@Entity
@Table(name="residente")
public class Residente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idresidente")
    private int idresidente;
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
    @Column(name="idrol")
    private long idrol;
    @Column(name="idapartamento")
    private long idapartamento;



    public Residente(String nombre, String contraseña, int edad, String correo, String telefono, String documento, long idcuenta, long idrol, long idapartamento) {
        this.nombre = nombre;
        this.contraseña = contraseña;
        this.edad = edad;
        this.correo = correo;
        this.telefono = telefono;
        this.documento = documento;
        this.idcuenta = idcuenta;
        this.idrol = idrol;
        this.idapartamento = idapartamento;
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
