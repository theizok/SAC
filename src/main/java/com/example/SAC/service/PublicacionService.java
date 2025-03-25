package com.example.SAC.service;

import com.example.SAC.entity.Publicacion;
import com.example.SAC.repository.PublicacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublicacionService {

    @Autowired
    private PublicacionRepository publicacionRepository;

    //Crear publicacion
    public Publicacion crearPublicacion(Publicacion publicacion){
        return publicacionRepository.save(publicacion);
    }

    //Obtener publicaciones
    public List<Publicacion> obtenerPublicaciones(){
        return publicacionRepository.findAll();
    }

    //Eliminar publicaciones
    public void eliminarPublicacion(long id){
        publicacionRepository.deleteById(id);
    }


}
