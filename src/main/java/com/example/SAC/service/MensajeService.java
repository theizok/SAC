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

    public List<Mensaje> encontrarTodoslosMensajes() {
        return mensajeRepository.findAll();
    }

    public Mensaje enviarMensaje(Mensaje mensaje) {
        return mensajeRepository.save(mensaje);
    }

}
