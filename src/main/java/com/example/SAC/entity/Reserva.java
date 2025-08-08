package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name="reserva")
@AllArgsConstructor
@NoArgsConstructor
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="idreserva")
    public long idReserva;
    @Column(name="tiempo")
    public String tiempoReserva;
    @Column(name="fecha")
    public LocalDateTime fechaReserva;
    @Column(name="idareacomun")
    public int idAreaComun;
    @Column(name="idresidente")
    public int idResidente;
}
