package com.example.SAC.service;

import com.example.SAC.entity.Mensaje;
import com.example.SAC.repository.MensajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MensajeService {
    @Autowired
    private MensajeRepository mensajeRepository;

    public List<Mensaje> findAllMensajes() {
        return mensajeRepository.findAll();
    }

    //Encontrar mensajes para residente
    public List<Mensaje> findMensajeByIdCuentaResidente(long idCuenta) {
        return mensajeRepository.encontrarMensajesporidCuentaResidentes(idCuenta);
    }

    //Encontrar mensajes para propietario
    public List<Mensaje> findMensajeByIdCuentaPropietario(long idCuenta) {
        return mensajeRepository.encontrarMensajesporidCuentaPropietario(idCuenta);
    }

    public Mensaje sendMensaje(Mensaje mensaje) {
        return mensajeRepository.save(mensaje);
    }




}
