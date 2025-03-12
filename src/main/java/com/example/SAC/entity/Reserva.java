package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name="reserva")
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idreserva")
    public long idReserva;
    @Column(name="tiempo")
    public int tiempoReserva;
    @Column(name="fecha")
    public LocalDateTime fechaReserva;
    @Column(name="idareacomun")
    public int idAreaComun;
    @Column(name="idresidente")
    public int idResidente;
}
