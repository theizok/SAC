package com.example.SAC.service;

import com.example.SAC.entity.Tarifa;
import com.example.SAC.repository.TarifaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TarifaService {

    @Autowired
    TarifaRepository tarifaRepository;

    public List<Tarifa> getAllTarifas(){
        return tarifaRepository.findAll();
    }

    public Tarifa saveTarifa(Tarifa tarifa){
        return tarifaRepository.save(tarifa);
    }


}
