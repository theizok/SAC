package com.example.SAC.controller;

import com.example.SAC.dto.PublicacionDTO;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.service.PublicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;


@RestController
@RequestMapping("/api/tablon")
public class TablonController {

    @Autowired
    PublicacionService publicacionService;


    //Obtener todas las publicaciones del administrador
    @GetMapping("/publicacionesAdministrador")
    public List<PublicacionDTO> obtenerPublicaciones(){
        return publicacionService.obtenerPublicacionesAdministrador();
    }

    //Obtener todas las publicaciones de residentes
    @GetMapping("/publicacionesResidentes")
    public List<PublicacionDTO> obtenerPublicacionesResidentes(){
        return publicacionService.obtenerPublicacionesResidentes();
    }

    //Obtener todas las publicaciones de propietarios
    @GetMapping("/publicacionesPropietarios")
    public List<PublicacionDTO> obtenerPublicacionesPropietarios(){
        return publicacionService.obtenerPublicacionesPropietarios();
    }


    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }

    //Vistas
    @GetMapping("/crearPublicacion")
    public RedirectView crearPublicacionVista() {
        return new RedirectView("/CrearPublicacion/crear_publi.html");
    }

}
