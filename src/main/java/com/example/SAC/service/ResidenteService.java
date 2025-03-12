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

    public Residente crearResidente(Residente residente) {return residenteRepository.save(residente);}

    public List<Residente> obtenerTodos() {
        return residenteRepository.findAll();
    }

    public Residente actualizarResidente(Residente residente) {return residenteRepository.save(residente);}

    public List<Residente> obtenerResidentePorDocumento(String documento) {
        return residenteRepository.findByDocumento(documento);
    }

    public void eliminarResidente(Residente residente) {}

}
