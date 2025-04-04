package com.example.SAC.controller;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
import com.example.SAC.service.AdministradorService;
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
    @Autowired
    private AdministradorService administradorService;

    //Registrar residente
    @GetMapping("/residente")
    public Residente registrarResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }
    //Registrar propietario
    @PostMapping("/propietario")
    public Propietario registrarPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
    }

    @GetMapping("/administrador")
    public Administrador registrarAdministrador(@RequestBody Administrador administrador) {
        return administradorService.agregarAdministrador(administrador);
    }


}
