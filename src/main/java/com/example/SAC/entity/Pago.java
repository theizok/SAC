package com.example.SAC.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="pago")
public class Pago {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private long idPago;
   private float valorPago;
   private int idAdministrador;
   private int idResidente;
   private int idMetodoDePago;
}
