package com.example.SAC.service;

import com.example.SAC.entity.Administrador;
import com.example.SAC.repository.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdministradorService {

    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AdministradorRepository administradorRepository;

    public Administrador agregarAdministrador(Administrador administrador){
        administrador.setContraseña(passwordEncoder.encode(administrador.getContraseña()));//Encriptar la contraseña antes de ingresarla en la base de datos
        return administradorRepository.save(administrador);
    }
}
