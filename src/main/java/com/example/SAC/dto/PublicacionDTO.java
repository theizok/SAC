package com.example.SAC.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class PublicacionDTO {
    private Long idpublicacion;
    @Setter
    @Getter
    private Timestamp fecha;
    @Setter
    @Getter
    private String contenido;
    @Setter
    @Getter
    private String titulo;
    @Setter
    @Getter
    private String tipo_cuenta;
    private Long idcuenta;
    @Setter
    @Getter
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



    public Long getIdPublicacion() { return idpublicacion; }
    public void setIdPublicacion(Long idpublicacion) { this.idpublicacion = idpublicacion; }

    public Long getIdCuenta() { return idcuenta; }
    public void setIdCuenta(Long idcuenta) { this.idcuenta = idcuenta; }

}
