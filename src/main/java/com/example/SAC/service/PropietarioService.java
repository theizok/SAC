package com.example.SAC.service;

import org.springframework.dao.DataIntegrityViolationException;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Propietario;
import com.example.SAC.repository.CuentaRepository;
import com.example.SAC.repository.PropietarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;


@Service
public class PropietarioService {

    @Autowired
    private PropietarioRepository propietarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CuentaRepository cuentaRepository;

    @Autowired
    private ValidacionService validacionService;

    //Obtener todos los propietarios
    public List<Propietario> obtenerTodos() {
        return propietarioRepository.findAll();
    }

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t.toLowerCase();
    }

    //Agregar propietario - crear propietario
    @Transactional
    public Propietario registrarPropietario(Propietario propietario) {
        String correo = normalize(propietario.getCorreo());
        String documento = normalize(propietario.getDocumento());
        String telefono = normalize(propietario.getTelefonoPropietario());

        if (correo != null && validacionService.verificarCorreoRegistrado(correo)) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        }
        if (documento != null && validacionService.verificarDocumentoRegistrado(documento)) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        }
        if (telefono != null && validacionService.verificarNumeroRegistrado(telefono)) {
            throw new RuntimeException("El número de teléfono ya se encuentra registrado");
        }

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

    // Actualizar propietario
    public Propietario actualizarPropietario(Long id, Propietario nuevosDatos) {
        Propietario propietario = propietarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró el propietario con id: " + id));

        // Normalizar para comparar (trim/lowerCase donde aplique)
        String nuevoCorreo = nuevosDatos.getCorreo() != null ? nuevosDatos.getCorreo().trim().toLowerCase() : null;
        String nuevoDocumento = nuevosDatos.getDocumento() != null ? nuevosDatos.getDocumento().trim().toLowerCase() : null;
        String nuevoTelefono = nuevosDatos.getTelefonoPropietario() != null ? nuevosDatos.getTelefonoPropietario().trim() : null;

        // 1) correo
        if (nuevoCorreo != null && !nuevoCorreo.equals(propietario.getCorreo() != null ? propietario.getCorreo().trim().toLowerCase() : null)) {
            Optional<Propietario> porCorreo = propietarioRepository.findByCorreo(nuevoCorreo);
            if (porCorreo.isPresent() && !Objects.equals(porCorreo.get().getIdPropietario(), id)) {
                throw new DataIntegrityViolationException("correo ya registrado");
            }
        }

        // 2) documento
        if (nuevoDocumento != null && !nuevoDocumento.equals(propietario.getDocumento() != null ? propietario.getDocumento().trim().toLowerCase() : null)) {
            Optional<Propietario> porDocumento = propietarioRepository.findByDocumento(nuevoDocumento);
            if (porDocumento.isPresent() && !Objects.equals(porDocumento.get().getIdPropietario(), id)) {
                throw new DataIntegrityViolationException("documento ya registrado");
            }
        }

        // 3) telefono
        if (nuevoTelefono != null && !nuevoTelefono.equals(propietario.getTelefonoPropietario() != null ? propietario.getTelefonoPropietario().trim() : null)) {
            Optional<Propietario> porTelefono = propietarioRepository.findByTelefonoPropietario(nuevoTelefono);
            if (porTelefono.isPresent() && !Objects.equals(porTelefono.get().getIdPropietario(), id)) {
                throw new DataIntegrityViolationException("telefono ya registrado");
            }
        }

        // Aplicar cambios
        if (nuevosDatos.getNombre() != null) propietario.setNombre(nuevosDatos.getNombre());
        if (nuevosDatos.getCorreo() != null) propietario.setCorreo(nuevosDatos.getCorreo());
        if (nuevosDatos.getDocumento() != null) propietario.setDocumento(nuevosDatos.getDocumento());
        if (nuevosDatos.getTelefonoPropietario() != null) propietario.setTelefonoPropietario(nuevosDatos.getTelefonoPropietario());
        // otros campos si aplica...

        return propietarioRepository.save(propietario);
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

        return true;
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

    // Obtener propietario por correo
    public Optional<Propietario> obtenerPropietarioPorCorreo(String correo) {
        return propietarioRepository.findByCorreo(correo);
    }

    // Obtener propietario por documento
    public Optional<Propietario> obtenerPropietarioPorDocumento(String documento) {
        return propietarioRepository.findByDocumento(documento);
    }

    //Obtener propietario por telefono
    public Optional<Propietario> obtenerPropietarioPorTelefono(String telefono) {
        return propietarioRepository.findByTelefonoPropietario(telefono);
    }

}
