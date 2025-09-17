// com.example.SAC.entity.Mensaje
package com.example.SAC.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "mensaje")
@AllArgsConstructor
@NoArgsConstructor
public class Mensaje {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "idmensaje")
        private long idMensaje;

        @Column(name = "asunto")
        private String Asunto;

        @Column(name = "contenido")
        private String Contenido;

        @Column(name = "fecha")
        private LocalDateTime fecha;

        @ManyToOne
        @JoinColumn(name = "idcuenta")
        private Cuenta cuenta;

        @Column(name = "respuesta", columnDefinition = "TEXT")
        private String respuesta;

        @Column(name = "fecha_respuesta")
        private LocalDateTime fechaRespuesta;

        @ManyToOne
        @JoinColumn(name = "idcuenta_respondido")
        private Cuenta cuentaRespondido;
}
