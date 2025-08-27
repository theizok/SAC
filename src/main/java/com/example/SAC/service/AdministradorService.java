package com.example.SAC.service;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.repository.AdministradorRepository;
import com.example.SAC.repository.CuentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    @Autowired
    private ValidacionService validacionService;

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t.toLowerCase();
    }


    //Agregar administrador -- Registrar administrador =D
    @Transactional
    public Administrador registrarAdministrador(Administrador administrador) {
        String correo = normalize(administrador.getCorreo());
        String documento = normalize(administrador.getDocumento());
        String telefono = normalize(administrador.getTelefono());

        if (correo != null && validacionService.verificarCorreoRegistrado(correo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya se encuentra registrado");
        }
        if (documento != null && validacionService.verificarDocumentoRegistrado(documento)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El documento ya se encuentra registrado");
        }
        if (telefono != null && validacionService.verificarNumeroRegistrado(telefono)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El número de teléfono ya se encuentra registrado");
        }

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

    // Actualizar administrador
    public Administrador actualizarAdministrador(Long id, Administrador nuevosDatos) {
        Administrador administrador = administradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró el administrador con id: " + id));

        try {
            // Validar correo solo si cambia y ya está registrado por otro
            if (!administrador.getCorreo().equals(nuevosDatos.getCorreo())
                    && validacionService.verificarCorreoRegistrado(nuevosDatos.getCorreo())) {
                throw new RuntimeException("El correo ya está registrado");
            }

            // Validar documento solo si cambia y ya está registrado por otro
            if (!administrador.getDocumento().equals(nuevosDatos.getDocumento())
                    && validacionService.verificarDocumentoRegistrado(nuevosDatos.getDocumento())) {
                throw new RuntimeException("El documento ya está registrado");
            }

            // Validar teléfono solo si cambia y ya está registrado por otro
            if (!administrador.getTelefono().equals(nuevosDatos.getTelefono())
                    && validacionService.verificarNumeroRegistrado(nuevosDatos.getTelefono())) {
                throw new RuntimeException("El número ya está registrado");
            }

            // Actualizar datos
            administrador.setNombreAdministrador(nuevosDatos.getNombreAdministrador());
            administrador.setCorreo(nuevosDatos.getCorreo());
            administrador.setTelefono(nuevosDatos.getTelefono());
            administrador.setDocumento(nuevosDatos.getDocumento());

            return administradorRepository.save(administrador);

        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar el administrador: " + e.getMessage(), e);
        }
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
