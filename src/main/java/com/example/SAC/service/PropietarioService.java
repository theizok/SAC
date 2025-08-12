package com.example.SAC.service;

import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Propietario;
import com.example.SAC.repository.CuentaRepository;
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

    @Autowired
    private CuentaRepository cuentaRepository;

    //Obtener todos los propietarios
    public List<Propietario> obtenerTodos() {
        return propietarioRepository.findAll();
    }

    //Agregar propietario
    public Propietario agregarPropietario(Propietario propietario) {

        //Se crea la cuenta
        Cuenta cuentanueva = new Cuenta();
        //Se define el tipo de cuenta que se crea
        cuentanueva.setTipoCuenta("Propietario");

        //Se guarda la cuenta en la bd
        cuentaRepository.save(cuentanueva);

        //El propietario obtiene su id de cuenta
        propietario.setIdCuenta(cuentanueva.getIdCuenta());
        //Se encripta la contraseña ingresada antes de enviar el propietario a la bd
        propietario.setContraseña(passwordEncoder.encode(propietario.getContraseña()));//Se encripta la contraseña del propietario con psword encoder
        //Se guarda el propietario en la base de datos
        return propietarioRepository.save(propietario);
    }

    //Actualizar propietario
    public Propietario actualizarPropietario(Long id, Propietario nuevosDatos) {
        return propietarioRepository.findById(id).map(propietario -> {
            propietario.setNombre(nuevosDatos.getNombre());
            propietario.setDocumento(nuevosDatos.getDocumento());
            propietario.setCorreo(nuevosDatos.getCorreo());
            propietario.setTelefonoPropietario(nuevosDatos.getTelefonoPropietario());
            return propietarioRepository.save(propietario);
        } ).orElseThrow(() -> new RuntimeException("No se encontro el propietario"));
    }

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
    public Optional<Propietario> obtenerPropietarioPorNombre(String nombre) {
        return propietarioRepository.findByNombre(nombre);
    }

    //ELiminar propietario por documento
    public void eliminarPropietariobyDocumento(String document) {
        propietarioRepository.deleteByDocumento(document);
    }

    //ELiminar propietario por id
    public void eliminarPropietarioPorId(Long id) {
        propietarioRepository.deleteById(id);

    }
}
