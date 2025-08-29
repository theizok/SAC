package com.example.SAC.dto;

import java.time.LocalDateTime;

public class PagoDTO {
    private Long idPago;
    private Float valor;
    private LocalDateTime fecha;
    private String descripcion;
    private String categoria;
    private String estadoPago;
    private Long idCuenta;

    // campos para mostrar info del usuario (nombre, documento) //
    private String usuarioNombre;
    private String usuarioDocumento;

    public Long getIdPago() { return idPago; }
    public void setIdPago(Long idPago) { this.idPago = idPago; }
    public Float getValor() { return valor; }
    public void setValor(Float valor) { this.valor = valor; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }
    public Long getIdCuenta() { return idCuenta; }
    public void setIdCuenta(Long idCuenta) { this.idCuenta = idCuenta; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }
    public String getUsuarioDocumento() { return usuarioDocumento; }
    public void setUsuarioDocumento(String usuarioDocumento) { this.usuarioDocumento = usuarioDocumento; }
}
