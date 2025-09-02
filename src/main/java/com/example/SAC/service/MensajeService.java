package com.example.SAC.service;

import com.example.SAC.entity.Mensaje;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.MensajeRepository;
import com.example.SAC.repository.CuentaRepository;
import com.example.SAC.repository.PropietarioRepository;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MensajeService {

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private CuentaRepository cuentaRepository;

    @Autowired
    private MensajeRepository MensajeRepository;

    @Autowired
    private ResidenteRepository ResidenteRepository;

    @Autowired
    private PropietarioRepository PropietarioRepository;

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

    public List<Map<String, Object>> findAllMensajesConRemitente() {
        List<Mensaje> mensajes = mensajeRepository.findAll();
        List<Map<String, Object>> salida = new ArrayList<>(mensajes.size());

        for (Mensaje m : mensajes) {
            Map<String, Object> map = new HashMap<>();
            map.put("idMensaje", m.getIdMensaje());
            map.put("asunto", m.getAsunto());
            map.put("contenido", m.getContenido());
            map.put("fecha", m.getFecha());
            map.put("respuesta", m.getRespuesta());
            map.put("fechaRespuesta", m.getFechaRespuesta());

            String remitenteNombre = null;
            String remitenteCorreo = null;

            try {
                if (m.getCuenta() != null) {
                    Long idCuenta = m.getCuenta().getIdCuenta();
                    if (idCuenta != null) {
                        // buscar residente por idcuenta
                        Optional<Residente> optR = ResidenteRepository.findByIdcuenta(idCuenta);
                        if (optR.isPresent()) {
                            Residente r = optR.get();
                            remitenteNombre = r.getNombre();
                            remitenteCorreo = r.getCorreo();
                        } else {
                            // si no es residente, buscar propietario
                            Optional<Propietario> optP = PropietarioRepository.findByIdCuenta(idCuenta);
                            if (optP.isPresent()) {
                                Propietario p = optP.get();
                                remitenteNombre = p.getNombre();
                                remitenteCorreo = p.getCorreo();
                            }
                        }
                    }
                }
            } catch (Exception ex) {
            }

            map.put("remitenteNombre", remitenteNombre);
            map.put("remitenteCorreo", remitenteCorreo);

            salida.add(map);
        }

        return salida;
    }
}
