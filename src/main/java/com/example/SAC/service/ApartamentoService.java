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

    public List<Apartamento> mostrarApartamentos() {
        return apartamentoRepository.findAll();
    }


    //Obtener Apartamentos
    public List<Apartamento> obtenerApartamentos(){
        return apartamentoRepository.findAll();
    }

    //Agregar apartamento
    public Apartamento agregarApartamento(Apartamento apartamento) {
        return apartamentoRepository.save(apartamento);
    }

    //Editar apartamento
    public Apartamento editarApartamento(Apartamento apartamento) {
        return apartamentoRepository.save(apartamento);
    }

    //Eliminar apartamento
    public void eLiminarApartamento(long id) {
        apartamentoRepository.deleteById(id);
    }

    //

}
