package com.example.SAC.controller;

import com.example.SAC.entity.Residente;
import com.example.SAC.service.ResidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;

@RestController
@RequestMapping("/api/residente")
public class ResidenteController {

    @Autowired
    private ResidenteService residenteService;

    @GetMapping
    public List<Residente> obtenerResidentes() {
        return residenteService.obtenerTodos();
    }

    @GetMapping("/actualizar")
    public void actualizarContraseñas(){
        residenteService.actualizarContraseñas();
    }

    @PostMapping("/crear")
    public Residente guardarResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }

    //Vistas
    @GetMapping("/dashboard")
    public RedirectView dashboard() {
        return new RedirectView("http://localhost:8080/Inicio/Inicio.html");
    }

}
