package com.example.SAC.service;

import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResidenteService {

    @Autowired
    private ResidenteRepository residenteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //Crear residente
    public Residente crearResidente(Residente residente) {
        residente.setContraseña(passwordEncoder.encode(residente.getContraseña()));//Encriptar la contraseña antes de ingresarla en la base de datos
        return residenteRepository.save(residente);}


    //Actualizar residente
    public Residente actualizarResidente(Long id, Residente nuevosDatos) {
        return residenteRepository.findById(id).map(residente -> {
            residente.setNombre(nuevosDatos.getNombre());
            residente.setDocumento(nuevosDatos.getDocumento());
            residente.setCorreo(nuevosDatos.getCorreo());
            residente.setTelefono(nuevosDatos.getTelefono());
            return residenteRepository.save(residente);
        } ).orElseThrow(() -> new RuntimeException("No se encontro el propietario"));
    }

    //Cambiar contraseña
    public boolean cambiarContraseña(Long idResidente, String passwordActual, String passwordNueva) {
        Optional<Residente> residenteOpt = residenteRepository.findById(idResidente);

        if (residenteOpt.isEmpty()) {
            throw new RuntimeException("Residente no encontrado");
        }

        Residente residente = residenteOpt.get();

        // Verificar si la contraseña actual es correcta
        if (!passwordEncoder.matches(passwordActual, residente.getContraseña())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        // Guardar la nueva contraseña encriptada
        residente.setContraseña(passwordEncoder.encode(passwordNueva));
        residenteRepository.save(residente);

        return true; // Indica que se cambió la contraseña con éxito
    }

    //Obtener residentes
    public List<Residente> obtenerTodos() {
        return residenteRepository.findAll();
    }

    //Obtener residente por nombre
    public Residente obtenerResidentePorNombre(String nombre) {
        return residenteRepository.getByNombre(nombre);
    }

    //Obtener residente por id para obtener datos para actualizar
    public Residente actualizarResidente(Residente residente) {return residenteRepository.save(residente);}

    //Eliminar residente por id
    public void eliminarResidentePorId(long Id) {
        residenteRepository.deleteById(Id);
    }

    //Obtener por id
    public Optional<Residente> obtenerPorId(long id) {
        return residenteRepository.findById(id);
    }
}
