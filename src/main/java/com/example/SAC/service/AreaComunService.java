package com.example.SAC.service;

import com.example.SAC.entity.AreaComun;
import com.example.SAC.repository.AreaComunRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AreaComunService {

    @Autowired
    private AreaComunRepository areaComunRepository;

    public  AreaComun agregarAreaComun(AreaComun areaComun){
        return areaComunRepository.save(areaComun);
    }

    public List<AreaComun> obtenerAreaComunes(){
        return areaComunRepository.findAll();
    }

    public void eliminarAreaComunporId(long id){
        areaComunRepository.deleteById(id);
    }

    public AreaComun obtenerAreaComunPorId(long id){
        return areaComunRepository.findById(id).orElse(null);
    }

    public AreaComun actualizarAreaComun(AreaComun areaActualizada, long id){
        return areaComunRepository.findById(id).map( areaComun -> {
            areaComun.setArea(areaActualizada.getArea());
            areaComun.setPrecio(areaActualizada.getPrecio());
            return areaComunRepository.save(areaComun);
        } ).orElseThrow(() -> new RuntimeException("No se encontro el área comun"));
    }

}


