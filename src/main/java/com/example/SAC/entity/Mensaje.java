package com.example.SAC.entity;

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
        private long idMensaje;
        private String Asunto;
        private String Contenido;
        private Date fecha;
        private int idAdministrador;
        private int idResidente;

}
