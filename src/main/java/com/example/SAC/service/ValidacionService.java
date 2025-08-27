package com.example.SAC.service;

import com.example.SAC.repository.ResidenteRepository;
import com.example.SAC.repository.PropietarioRepository;
import com.example.SAC.repository.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ValidacionService {

    @Autowired
    private ResidenteRepository residenteRepository;

    @Autowired
    private PropietarioRepository propietarioRepository;

    @Autowired
    private AdministradorRepository administradorRepository;

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t.toLowerCase();
    }

    public boolean verificarCorreoRegistrado(String correo) {
        if (correo == null) return false;
        String c = normalize(correo);
        try {
            return residenteRepository.findByCorreo(c).isPresent()
                    || propietarioRepository.findByCorreo(c).isPresent()
                    || administradorRepository.findByCorreo(c).isPresent();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el correo ingresado");
        }
    }

    public boolean verificarDocumentoRegistrado(String documento) {
        if (documento == null) return false;
        String d = normalize(documento);
        try {
            return residenteRepository.findByDocumento(d).isPresent()
                    || propietarioRepository.findByDocumento(d).isPresent()
                    || administradorRepository.findByDocumento(d).isPresent();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el documento ingresado");
        }
    }

    public boolean verificarNumeroRegistrado(String numero) {
        if (numero == null) return false;
        String n = normalize(numero);
        try {
            return residenteRepository.findByTelefono(n).isPresent()
                    || propietarioRepository.findByTelefonoPropietario(n).isPresent()
                    || administradorRepository.findByTelefono(n).isPresent();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el número ingresado");
        }
    }
}
