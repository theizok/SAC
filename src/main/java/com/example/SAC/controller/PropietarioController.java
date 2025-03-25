package com.example.SAC.controller;

import com.example.SAC.entity.Apartamento;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.service.ApartamentoService;
import com.example.SAC.service.PropietarioService;
import com.example.SAC.service.PublicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class PropietarioController {

    @Autowired
    private ApartamentoService apartamentoService;

    @Autowired
    private PublicacionService publicacionService;

    @Autowired
    private PropietarioService propietarioService;


    //Obtener propietario por id
    @GetMapping("ObtenerPropietarioById")
    public Optional<Propietario> obtenerPropietarioById(Long id){
        return propietarioService.obtenerPorId(id);
    }

    //Actualizar propietario
    @PutMapping("/Actualizar")
    public void ActualizarPropietario(@RequestBody Propietario propietario){
        propietarioService.agregarPropietario(propietario);
    }


    //Eliminar propietario

    //Obtener todas las publicaciones
    @GetMapping("/ObtenerPublicacion")
    public List<Publicacion> getPublicacion() {
        return publicacionService.obtenerPublicaciones();
    }


    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }

    //Editar apartamentos
    @PutMapping("/actualizarApartamento")
    public Apartamento updateApartamento(@RequestBody Apartamento apartamento) {
        return apartamentoService.editarApartamento(apartamento);
    }


}
