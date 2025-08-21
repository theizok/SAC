package com.example.SAC.service;

import com.example.SAC.entity.Reserva;
import com.example.SAC.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReservaService {

    @Autowired
    ReservaRepository reservaRepository;

    public Reserva agregarReserva(Reserva reserva) {
        // Validar que al menos uno de los campos esté presente
        if (reserva.getIdResidente() == null && reserva.getIdPropietario() == null) {
            throw new IllegalArgumentException("La reserva debe tener un residente o un propietario");
        }

        return reservaRepository.save(reserva);
    }

    public Optional<Reserva> obtenerReservaPorId(long id) {
        return reservaRepository.findById(id);
    }

    public void eliminarReserva(long id) {
        reservaRepository.deleteById(id);
    }
}