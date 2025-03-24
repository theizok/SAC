package com.example.SAC.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/noAuth/")
public class VistaController {

    @GetMapping("Login")
    public RedirectView Login(){
        return new RedirectView("/Login/Index.html");
    }
}






