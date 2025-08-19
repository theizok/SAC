package com.example.SAC.service;

import com.example.SAC.entity.Pago;
import com.example.SAC.repository.PagoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PagoService {
    @Autowired
    private PagoRepository pagoRepository;

    @Transactional
    public void actualizarEstadoPago(Long idPago, String nuevoEstado) {
        Optional<Pago> pagoOpt = pagoRepository.findById(idPago);
        if (pagoOpt.isPresent()) {
            Pago pago = pagoOpt.get();
            pago.setEstadoPago(nuevoEstado);
            pagoRepository.save(pago);
        }
    }

    public List<Pago> obtenerPagos() {
        return pagoRepository.findAll();
    }

    public List<Pago> obtenerPagosPorCuenta(Long idCuenta) {
        return pagoRepository.findByCuenta_IdCuenta(idCuenta);
    }
}
