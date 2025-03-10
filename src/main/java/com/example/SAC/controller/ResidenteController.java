package com.example.SAC.controller;

import com.example.SAC.entity.Residente;
import com.example.SAC.service.ResidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
