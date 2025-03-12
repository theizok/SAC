package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="pago")
public class Pago {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name="idpago")
   private long idPago;
   @Column(name="valor")
   private float valorPago;
   @Column(name="idadministrador")
   private int idAdministrador;
   @Column(name="idresidente")
   private int idResidente;
   @Column(name="idmetododepago")
   private int idMetodoDePago;
}
