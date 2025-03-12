package com.example.SAC.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Generated;
import org.hibernate.grammars.hql.HqlParser;

import java.sql.Date;

@Data
@Entity
@Table(name="mensaje")
public class Mensaje {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name="idmensaje")
        private long idMensaje;
        @Column(name="asunto")
        private String Asunto;
        @Column(name="contenido")
        private String Contenido;
        @Column(name="fecha")
        private  LocalDateTime fecha;
        @Column(name="idadmnistrador")
        private int idAdministrador;
        @Column(name="idresidente")
        private int idResidente;

}
