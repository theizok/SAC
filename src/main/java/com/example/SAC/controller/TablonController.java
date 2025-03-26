package com.example.SAC.controller;

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


    //Obtener todas las publicaciones
    @GetMapping("/publicaciones")
    public List<Publicacion> obtenerPublicaciones(){
        return publicacionService.obtenerPublicaciones();
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
