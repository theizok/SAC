package com.example.SAC.controller;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.service.AdministradorService;
import com.example.SAC.service.PropietarioService;
import com.example.SAC.service.RegistroService;
import com.example.SAC.service.ResidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/register")
public class RegistroController {
    @Autowired
    RegistroService registroService;

    //Registrar residente
    @PostMapping("/residente")
    public Residente registrarResidente(@RequestBody Residente residente) {
        return registroService.registrarResidente(residente);
    }
    //Registrar propietario
    @PostMapping("/propietario")
    public Propietario registrarPropietario(@RequestBody Propietario propietario) {
        return registroService.registrarPropietario(propietario);
    }

    //Registrar admin
    @PostMapping("/1603aeZakmi/administrador")
    public Administrador registrarAdministrador(@RequestBody Administrador administrador) {
        return registroService.registrarAdministrador(administrador);
    }


}
