package com.example.SAC.service;

import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResidenteService {

    @Autowired
    private ResidenteRepository residenteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Residente crearResidente(Residente residente) {
        residente.setContraseña(passwordEncoder.encode(residente.getContraseña()));//Encriptar la contraseña antes de ingresarla en la base de datos
        return residenteRepository.save(residente);}


    public void actualizarContraseñas() {
        List<Residente> residentes = residenteRepository.findAll();
        for (Residente residente : residentes) {
            if (!residente.getContraseña().startsWith("$2a$")) { // Si no está encriptada
                residente.setContraseña(passwordEncoder.encode(residente.getContraseña()));
                residenteRepository.save(residente);
            }
        }
    }

    public List<Residente> obtenerTodos() {
        return residenteRepository.findAll();
    }

    public Residente actualizarResidente(Residente residente) {return residenteRepository.save(residente);}

    public List<Residente> obtenerResidentePorDocumento(String documento) {
        return residenteRepository.findByDocumento(documento);
    }

    public void eliminarResidente(Residente residente) {}

}
