package com.example.SAC.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ResponderMensajeDTO{

    @NotNull(message = "idMensaje es requerido")
    private Long idMensaje;

    @NotBlank(message = "respuesta no puede estar vacía")
    @Size(max = 2000, message = "respuesta no puede exceder 2000 caracteres")
    private String respuesta;

    private Long idCuentaRespondido;

    public Long getIdMensaje() { return idMensaje; }
    public void setIdMensaje(Long idMensaje) { this.idMensaje = idMensaje; }
    public String getRespuesta() { return respuesta; }
    public void setRespuesta(String respuesta) { this.respuesta = respuesta; }
    public Long getIdCuentaRespondido() { return idCuentaRespondido; }
    public void setIdCuentaRespondido(Long idCuentaRespondido) { this.idCuentaRespondido = idCuentaRespondido; }
}
