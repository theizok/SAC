package com.example.SAC.service;

import com.example.SAC.dto.UsuarioDTO;
import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Residente;
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

    //Actualizar residente
    public Administrador actualizarAdministrador(Long id, Administrador nuevosDatos) {
        return administradorRepository.findById(id).map(administrador -> {
            administrador.setNombreAdministrador(nuevosDatos.getNombreAdministrador());
            administrador.setDocumento(nuevosDatos.getDocumento());
            administrador.setCorreo(nuevosDatos.getCorreo());
            administrador.setTelefono(nuevosDatos.getTelefono());
            return administradorRepository.save(administrador);
        } ).orElseThrow(() -> new RuntimeException("No se encontro el propietario"));
    }

    //Cambiar contraseña
    public boolean cambiarContraseña(Long idResidente, String passwordActual, String passwordNueva) {
        Optional<Administrador> administradorOpt = administradorRepository.findById(idResidente);

        if (administradorOpt.isEmpty()) {
            throw new RuntimeException("Residente no encontrado");
        }

        Administrador administrador = administradorOpt.get();

        // Verificar si la contraseña actual es correcta
        if (!passwordEncoder.matches(passwordActual, administrador.getContraseña())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        // Guardar la nueva contraseña encriptada
        administrador.setContraseña(passwordEncoder.encode(passwordNueva));
        administradorRepository.save(administrador);

        return true; // Indica que se cambió la contraseña con éxito
    }



    public List<Administrador> obtenerAdministradores() {
        return administradorRepository.findAll();
    }

    public Optional<Administrador> obtenerAdministradorPorId(Long id){
        return administradorRepository.findById(id);
    }

    //Obtener administrador por correo
    public Optional<Administrador> obtenerAdministradorPorCorreo(String correo) {
        return administradorRepository.findByCorreo(correo);
    }

    //Obtener administrador por documento
    public Optional<Administrador> obtenerAdministradorPorDocumento(String documento) {
        return administradorRepository.findByDocumento(documento);
    }

    //Obtener administrador por telefono
    public Optional<Administrador> obtenerAdministradorPorTelefono(String telefono) {
        return administradorRepository.findByTelefono(telefono);
    }

}
