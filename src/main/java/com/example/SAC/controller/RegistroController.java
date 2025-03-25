package com.example.SAC.controller;

import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
import com.example.SAC.service.PropietarioService;
import com.example.SAC.service.ResidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/register")
public class RegistroController {
    @Autowired
    ResidenteService residenteService;

    @Autowired
    PropietarioController propietarioController;
    @Autowired
    private PropietarioService propietarioService;

    //Registrar residente
    @GetMapping("/residente")
    public Residente registrarResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }
    //Registrar propietario
    @GetMapping("/propietario")
    public Propietario registrarPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
    }



}
