package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="pago")
public class Pago {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name="idpago")
   private long idPago;
   @Column(name="valor")
   private float valor;
   @Column(name="fecha_pago")
   private LocalDateTime fecha;
   @OneToOne
   @JoinColumn(name="idcuenta")
   private Cuenta cuenta;
   @Column(name = "descripcion")
   private String descripcion;
   @Column(name = "categoria")
   private String categoria;
   @Column(name = "estado_pago")
   private String estadoPago;

}
