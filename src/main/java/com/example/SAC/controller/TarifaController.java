package com.example.SAC.controller;

import com.example.SAC.entity.Tarifa;
import com.example.SAC.service.TarifaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarifa")
public class TarifaController {

    @Autowired
    TarifaService tarifaService;

    //Obtener tarifas
    @GetMapping()
    public List<Tarifa> getTarifa() {
    return tarifaService.getAllTarifas();
    }

    //Guardar tarifa
    @PostMapping("/crearTarifa")
    public Tarifa crearTarifa(@RequestBody Tarifa tarifa) {
        return tarifaService.saveTarifa(tarifa);
    }

}
