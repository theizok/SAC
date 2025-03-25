package com.example.SAC.service;

import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.repository.PropietarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class PropietarioService {

    @Autowired
    private PropietarioRepository propietarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //Obtener todos los propietarios
    public List<Propietario> obtenerTodos() {
        return propietarioRepository.findAll();
    }

    //Agregar propietario
    public Propietario agregarPropietario(Propietario propietario) {
        propietario.setContraseña(passwordEncoder.encode(propietario.getContraseña()));//Se encripta la contraseña del propietario con psword encoder
        return propietarioRepository.save(propietario);
    }

    //Obtener propietario por id
    public Optional<Propietario> obtenerPorId(Long id) {
        return propietarioRepository.findById(id);
    }

    //Obtener propietario por nombre
    public Propietario obtenerPropietarioPorNombre(String nombre) {
        return propietarioRepository.findByNombre(nombre);
    }




}
