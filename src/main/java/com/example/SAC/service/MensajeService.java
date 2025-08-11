package com.example.SAC.service;

import com.example.SAC.entity.Mensaje;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.repository.MensajeRepository;
import com.example.SAC.repository.CuentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MensajeService {

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private CuentaRepository cuentaRepository;

    // Obtener todos los mensajes
    public List<Mensaje> findAllMensajes() {
        return mensajeRepository.findAll();
    }

    // Encontrar mensajes para residente
    public List<Mensaje> findMensajeByIdCuentaResidente(long idCuenta) {
        return mensajeRepository.encontrarMensajesporidCuentaResidentes(idCuenta);
    }

    // Encontrar mensajes para propietario
    public List<Mensaje> findMensajeByIdCuentaPropietario(long idCuenta) {
        return mensajeRepository.encontrarMensajesporidCuentaPropietario(idCuenta);
    }

    // Enviar/guardar mensaje (usuario -> admin)
    public Mensaje sendMensaje(Mensaje mensaje) {
        // configurar fecha si no viene
        if (mensaje.getFecha() == null) {
            mensaje.setFecha(LocalDateTime.now());
        }
        return mensajeRepository.save(mensaje);
    }

    // Eliminar mensaje por id (admin)
    public void deleteMensaje(long idMensaje) {
        if (!mensajeRepository.existsById(idMensaje)) {
            throw new RuntimeException("Mensaje no encontrado con id: " + idMensaje);
        }
        mensajeRepository.deleteById(idMensaje);
    }

    // Responder mensaje (admin)
    public Mensaje responderMensaje(long idMensaje, String contenidoRespuesta, Long idCuentaRespondido) {
        Optional<Mensaje> opt = mensajeRepository.findById(idMensaje);
        if (opt.isEmpty()) {
            throw new RuntimeException("Mensaje no encontrado con id: " + idMensaje);
        }
        Mensaje mensaje = opt.get();
        mensaje.setRespuesta(contenidoRespuesta);
        mensaje.setFechaRespuesta(LocalDateTime.now());

        if (idCuentaRespondido != null) {
            Cuenta cuenta = cuentaRepository.findById(idCuentaRespondido)
                    .orElseThrow(() -> new RuntimeException("Cuenta respondiente no encontrada con id: " + idCuentaRespondido));
            mensaje.setCuentaRespondido(cuenta);
        }

        return mensajeRepository.save(mensaje);
    }
}
