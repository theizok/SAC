package com.example.SAC.service;

import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.CuentaRepository;
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
    CuentaRepository cuentaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RegistroService registroService;

    //Crear residente
    public Residente crearResidente(Residente residente) {

        //Creacion de cuenta antes de registrar el residente
        Cuenta nuevaCuenta = new Cuenta();
        //Se le asigna el tipo de cuenta al que se le relaciona
        nuevaCuenta.setTipoCuenta("Residente");
        //Se crea la cuenta en la base de datos
        cuentaRepository.save(nuevaCuenta);

        //Se le asigna el id de la cuenta creada al residente
        residente.setIdcuenta(nuevaCuenta.getIdCuenta());
        //Se encripta la contraseña
        residente.setContraseña(passwordEncoder.encode(residente.getContraseña()));//Encriptar la contraseña antes de ingresarla en la base de datos
        return residenteRepository.save(residente);}

    //Actualizar residente
    public Residente actualizarResidente(Long id, Residente nuevosDatos) {
        try {
            if (registroService.verificarCorreoRegistrado(nuevosDatos.getCorreo()) ) {
                throw new RuntimeException("El correo ya esta registrado");
            }   else if (registroService.verificarDocumentoRegistrado(nuevosDatos.getDocumento())) {
                throw new RuntimeException("El documento ya esta registrado");
            }    else if (registroService.verificarNumeroRegistrado(nuevosDatos.getTelefono())) {
                throw new RuntimeException("El numero ya esta registrado");
            }     else {
                return residenteRepository.findById(id).map( residente -> {
                    residente.setNombre(nuevosDatos.getNombre());
                    residente.setDocumento(nuevosDatos.getDocumento());
                    residente.setCorreo(nuevosDatos.getCorreo());
                    residente.setTelefono(nuevosDatos.getTelefono());
                    return residenteRepository.save(residente);
                }
                ).orElseThrow(() -> new RuntimeException("No se encontro el residente"));
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar el residente: " + e.getMessage() + "");
        }
    }

    //Eliminar residente
    public void eliminarResidente(String documento) {
        residenteRepository.deleteByDocumento(documento);
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

    //Eliminar residente por id
    public void eliminarResidentePorId(long Id) {
        residenteRepository.deleteById(Id);
    }

    //Obtener por id
    public Optional<Residente> obtenerPorId(long id) {
        return residenteRepository.findById(id);
    }

    //Obtener residente por correo
    public Optional<Residente> obtenerResidentePorCorreo(String correo) {
        return residenteRepository.findByCorreo(correo);
    }

    //Obtener residente por documento
    public Optional<Residente> obtenerResidentePorDocumento(String documento) {
        return residenteRepository.findByDocumento(documento);
    }

    //Obtener residente por telefono
    public Optional<Residente> obtenerResidentePorTelefono(String telefono) {
        return residenteRepository.findByTelefono(telefono);
    }
}
