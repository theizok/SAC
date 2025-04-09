package com.example.SAC.service;

import com.example.SAC.dto.UsuarioDTO;
import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.repository.AdministradorRepository;
import com.example.SAC.repository.CuentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class AdministradorService {

    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AdministradorRepository administradorRepository;
    @Autowired
    CuentaRepository cuentaRepository;
    @Autowired
    private ResidenteService residenteService;
    @Autowired
    private PropietarioService propietarioService;


    public Administrador agregarAdministrador(Administrador administrador){
        //Se crea la cuenta
        Cuenta cuentanueva = new Cuenta();
        //Se define el tipo de cuenta que se crea
        cuentanueva.setTipoCuenta("Administrador");

        //Se guarda la cuenta en la bd
        cuentaRepository.save(cuentanueva);

        //El propietario obtiene su id de cuenta
        administrador.setIdCuenta(cuentanueva.getIdCuenta());

        administrador.setContraseña(passwordEncoder.encode(administrador.getContraseña()));//Encriptar la contraseña antes de ingresarla en la base de datos
        return administradorRepository.save(administrador);
    }

    public Optional<Administrador> obtenerAdministradorPorId(Long id){
        return administradorRepository.findById(id);
    }

}
