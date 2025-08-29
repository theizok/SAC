package com.example.SAC.service;

import org.springframework.dao.DataIntegrityViolationException;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.CuentaRepository;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ResidenteService {

    @Autowired
    private ResidenteRepository residenteRepository;
    @Autowired
    CuentaRepository cuentaRepository;
    @Autowired
    ValidacionService validacionService;

    @Autowired
    private PasswordEncoder passwordEncoder;


    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t.toLowerCase();
    }


    //Crear residente - Registrarlo

    @Transactional
    public Residente registrarResidente(Residente residente) {
        String correo = normalize(residente.getCorreo());
        String documento = normalize(residente.getDocumento());
        String telefono = normalize(residente.getTelefono());

        if (correo != null && validacionService.verificarCorreoRegistrado(correo)) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        }
        if (documento != null && validacionService.verificarDocumentoRegistrado(documento)) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        }
        if (telefono != null && validacionService.verificarNumeroRegistrado(telefono)) {
            throw new RuntimeException("El número de teléfono ya se encuentra registrado");
        }

        residente.setCorreo(correo);
        residente.setDocumento(documento);
        residente.setTelefono(telefono);

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
        return residenteRepository.save(residente);
    }


    // Actualizar residente
    public Residente actualizarResidente(Long id, Residente nuevosDatos) {
        Residente residente = residenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró el residente con id: " + id));

        // Normalizar entradas para comparación segura
        String nuevoCorreo = nuevosDatos.getCorreo() != null ? nuevosDatos.getCorreo().trim().toLowerCase() : null;
        String nuevoDocumento = nuevosDatos.getDocumento() != null ? nuevosDatos.getDocumento().trim().toLowerCase() : null;
        String nuevoTelefono = nuevosDatos.getTelefono() != null ? nuevosDatos.getTelefono().trim() : null;

        // 1) correo
        if (nuevoCorreo != null && !nuevoCorreo.equals(residente.getCorreo() != null ? residente.getCorreo().trim().toLowerCase() : null)) {
            Optional<Residente> porCorreo = residenteRepository.findByCorreo(nuevoCorreo);
            if (porCorreo.isPresent() && !porCorreo.get().getIdresidente().equals(id)) {
                throw new DataIntegrityViolationException("correo ya registrado");
            }
        }

        // 2) documento
        if (nuevoDocumento != null && !nuevoDocumento.equals(residente.getDocumento() != null ? residente.getDocumento().trim().toLowerCase() : null)) {
            Optional<Residente> porDocumento = residenteRepository.findByDocumento(nuevoDocumento);
            if (porDocumento.isPresent() && !porDocumento.get().getIdresidente().equals(id)) {
                throw new DataIntegrityViolationException("documento ya registrado");
            }
        }

        // 3) telefono
        if (nuevoTelefono != null && !nuevoTelefono.equals(residente.getTelefono() != null ? residente.getTelefono().trim() : null)) {
            Optional<Residente> porTelefono = residenteRepository.findByTelefono(nuevoTelefono);
            if (porTelefono.isPresent() && !porTelefono.get().getIdresidente().equals(id)) {
                throw new DataIntegrityViolationException("telefono ya registrado");
            }
        }

        // Aplicar cambios (conservando otros campos)
        if (nuevosDatos.getNombre() != null) residente.setNombre(nuevosDatos.getNombre());
        if (nuevosDatos.getCorreo() != null) residente.setCorreo(nuevosDatos.getCorreo());
        if (nuevosDatos.getDocumento() != null) residente.setDocumento(nuevosDatos.getDocumento());
        if (nuevosDatos.getTelefono() != null) residente.setTelefono(nuevosDatos.getTelefono());
        if (nuevosDatos.getEdad() != 0) residente.setEdad(nuevosDatos.getEdad());

        return residenteRepository.save(residente);
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

