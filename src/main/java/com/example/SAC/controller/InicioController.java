package com.example.SAC.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/")
public class InicioController {
    @GetMapping
    public RedirectView index() {
        return new RedirectView("InicioNoAuth/Inicio_no.html");
    }

}
