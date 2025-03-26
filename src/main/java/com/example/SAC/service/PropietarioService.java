package com.example.SAC.service;

import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.entity.Residente;
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

    //Actualizar propietario
    public Propietario actualizarPropietario(Long id, Propietario nuevosDatos) {
        return propietarioRepository.findById(id).map(propietario -> {
            propietario.setNombre(nuevosDatos.getNombre());
            propietario.setDocumentoPropietario(nuevosDatos.getDocumentoPropietario());
            propietario.setCorreo(nuevosDatos.getCorreo());
            propietario.setTelefonoPropietario(nuevosDatos.getTelefonoPropietario());
            return propietarioRepository.save(propietario);
        } ).orElseThrow(() -> new RuntimeException("No se encontro el propietario"));
    }

    //Cambiar contraseña
    //Cambiar contraseña
    public boolean cambiarContraseña(Long idPropietario, String passwordActual, String passwordNueva) {
        Optional<Propietario> propietarioOpt = propietarioRepository.findById(idPropietario);

        if (propietarioOpt.isEmpty()) {
            throw new RuntimeException("Residente no encontrado");
        }

        Propietario propietario = propietarioOpt.get();

        // Verificar si la contraseña actual es correcta
        if (!passwordEncoder.matches(passwordActual, propietario.getContraseña())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        // Guardar la nueva contraseña encriptada
        propietario.setContraseña(passwordEncoder.encode(passwordNueva));
        propietarioRepository.save(propietario);

        return true; // Indica que se cambió la contraseña con éxito
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
