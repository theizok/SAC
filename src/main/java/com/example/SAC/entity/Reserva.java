package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;

@Data
@Entity
@Table(name="reserva")
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long idReserva;
    public int tiempoReserva;
    public Date fechaReserva;
    public int idAreaComun;
    public int idResidente;
}
