package com.example.SAC.service;

import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResidenteService {

    @Autowired
    private ResidenteRepository residenteRepository;

    public Residente crear(Residente residente) {return residenteRepository.save(residente);}


    public List<Residente> obtenerTodos() {
        return residenteRepository.findAll();
    }

}
