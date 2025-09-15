package com.example.SAC.controller;

import com.example.SAC.dto.RegistroDTO;
import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.service.AdministradorService;
import com.example.SAC.service.CaptchaService;
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
    PropietarioService propietarioService;

    @Autowired
    AdministradorService administradorService;

    @Autowired
    private CaptchaService captchaService;

    //Registrar residente
    @PostMapping("/residente")
    public Residente registrarResidente(@RequestBody RegistroDTO registroDTO) {

        if(!captchaService.validateCaptcha(registroDTO.getRecaptchaToken())) {
            throw new RuntimeException("Captcha invalido");
        }

        Residente residente = new Residente();
        residente.setNombre(registroDTO.getNombre());
        residente.setDocumento(registroDTO.getDocumento());
        residente.setTelefono(registroDTO.getTelefono());
        residente.setCorreo(registroDTO.getCorreo());
        residente.setContraseña(registroDTO.getContrasena());

        return residenteService.registrarResidente(residente);
    }
    //Registrar propietario
    @PostMapping("/propietario")
    public Propietario registrarPropietario(@RequestBody RegistroDTO registroDTO) {

        if(!captchaService.validateCaptcha(registroDTO.getRecaptchaToken())) {
            throw new RuntimeException("Captcha invalido");
        }

        Propietario propietario = new Propietario();
        propietario.setNombre(registroDTO.getNombre());
        propietario.setDocumento(registroDTO.getDocumento());
        propietario.setTelefonoPropietario(registroDTO.getTelefono());
        propietario.setCorreo(registroDTO.getCorreo());
        propietario.setContraseña(registroDTO.getContrasena());

        return propietarioService.registrarPropietario(propietario);
    }

    //Registrar admin
    @PostMapping("/1603aeZakmi/administrador")
    public Administrador registrarAdministrador(@RequestBody Administrador administrador) {
        return administradorService.registrarAdministrador(administrador);
    }


}
