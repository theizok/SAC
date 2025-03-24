package com.example.SAC.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/Mensaje")
public class MensajeController {

    @GetMapping
    public RedirectView mensaje(){
        return new RedirectView("/Mensaje/mensaje.html");
    }


}
