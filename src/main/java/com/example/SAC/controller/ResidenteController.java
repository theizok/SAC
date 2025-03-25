package com.example.SAC.controller;

import com.example.SAC.entity.Publicacion;
import com.example.SAC.entity.Residente;
import com.example.SAC.service.PublicacionService;
import com.example.SAC.service.ResidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/residente")
public class ResidenteController {

    @Autowired
    private ResidenteService residenteService;

    @Autowired
    private PublicacionService publicacionService;

    //Obtener residente por id
    @GetMapping("/obtenerPorId")
    public Optional<Residente> obtenerResidentePorId(long id){
        return residenteService.obtenerPorId(id);
    }

    //Se <actualiza wl residente
    @PutMapping("/actualizar")
    public Residente actualizarResidente(@RequestBody Residente residente) {
        return residenteService.actualizarResidente(residente);
    }

    //Se elimina residente por id
    @DeleteMapping("eliminar")
    public void eliminarResidente(@RequestParam Long id) {
        residenteService.eliminarResidentePorId(id);
    }

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

}
