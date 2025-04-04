package com.example.SAC.service;

import com.example.SAC.dto.PublicacionDTO;
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

    //Obtener todas las publicaciones
    public List<PublicacionDTO> obtenerPublicacionesAll(){
        return publicacionRepository.showWithAuthorAll();
    }

    //Obtener publicaciones administrador
    public List<PublicacionDTO> obtenerPublicacionesAdministrador(){
        return publicacionRepository.showWithAuthorAdministrador();
    }

    //Obtener publicaciones residentes
    public List<PublicacionDTO> obtenerPublicacionesResidentes(){
        return publicacionRepository.showWithAuthorResidente();
    }

    //Obtener publicaciones propietarios
    public List<PublicacionDTO> obtenerPublicacionesPropietarios(){
        return publicacionRepository.showWithAuthorPropietario();
    }

    //Eliminar publicaciones
    public void eliminarPublicacion(long id){
        publicacionRepository.deleteById(id);
    }


}
