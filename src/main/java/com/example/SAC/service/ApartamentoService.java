package com.example.SAC.service;

import com.example.SAC.entity.Apartamento;
import com.example.SAC.repository.ApartamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApartamentoService {
    @Autowired
    private ApartamentoRepository apartamentoRepository;

    public List<Apartamento> buscarApartamentos() {
        return apartamentoRepository.findAll();
    }

    public Apartamento agregarApartamento(Apartamento apartamento) {
        return apartamentoRepository.save(apartamento);
    }

}
