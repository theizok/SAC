package com.example.SAC.controller;

import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
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

    @GetMapping("/residente")
    public Residente registrarResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }

}
