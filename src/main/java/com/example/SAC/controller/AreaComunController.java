package com.example.SAC.controller;

import com.example.SAC.entity.AreaComun;
import com.example.SAC.service.AreaComunService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/areaComun")
public class AreaComunController {

    @Autowired
    AreaComunService areaComunService;

    @GetMapping("/obtenerAreas")
    public List<AreaComun> obtenerAreas(){
        return areaComunService.obtenerAreaComunes();
    }
}