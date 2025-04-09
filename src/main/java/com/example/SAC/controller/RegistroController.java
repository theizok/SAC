package com.example.SAC.controller;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
import com.example.SAC.service.AdministradorService;
import com.example.SAC.service.EmailService;
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
    @Autowired
    private EmailService emailService;

    //Registrar residente
    @PostMapping("/residente")
    public Residente registrarResidente(@RequestBody Residente residente) {
        String correo = residente.getCorreo();
        String asunto = "Creación de cuenta";
        String contenido = "Te has registrado de forma correcta en SAC";
        emailService.sendSimpleMail(correo,asunto,contenido);
        return residenteService.crearResidente(residente);
    }
    //Registrar propietario
    @PostMapping("/propietario")
    public Propietario registrarPropietario(@RequestBody Propietario propietario) {
        String correo = propietario.getCorreo();
        String asunto = "Creación de cuenta";
        String contenido = "Te has registrado de forma correcta en SAC";
        emailService.sendSimpleMail(correo,asunto,contenido);
        return propietarioService.agregarPropietario(propietario);
    }

    @PostMapping("/administrador")
    public Administrador registrarAdministrador(@RequestBody Administrador administrador) {

        return administradorService.agregarAdministrador(administrador);
    }


}
