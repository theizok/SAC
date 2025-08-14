package com.example.SAC.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
public class PublicacionDTO {
    private Long idpublicacion;
    private Timestamp fecha;
    private String contenido;
    private String titulo;
    private String tipo_cuenta;
    private Long idcuenta;
    private String nombre;


    // Constructor
    public PublicacionDTO(Long idpublicacion, Timestamp fecha, String contenido, String titulo,
                          String tipo_cuenta, Long idcuenta, String nombre) {
        this.idpublicacion = idpublicacion;
        this.fecha = fecha;
        this.contenido = contenido;
        this.titulo = titulo;
        this.tipo_cuenta = tipo_cuenta;
        this.idcuenta = idcuenta;
        this.nombre = nombre;
    }


}