package com.example.SAC.dto;

public class PagoReservaDTO {
    private com.example.SAC.entity.Pago pago;
    private com.example.SAC.entity.Reserva reserva;

    public PagoReservaDTO() {}

    public com.example.SAC.entity.Pago getPago() { return pago; }
    public void setPago(com.example.SAC.entity.Pago pago) { this.pago = pago; }

    public com.example.SAC.entity.Reserva getReserva() { return reserva; }
    public void setReserva(com.example.SAC.entity.Reserva reserva) { this.reserva = reserva; }
}
