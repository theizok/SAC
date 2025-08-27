package com.example.SAC.service;

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

        // Validar correo
        if (!residente.getCorreo().equals(nuevosDatos.getCorreo())
                && validacionService.verificarCorreoRegistrado(nuevosDatos.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // Validar documento
        if (!residente.getDocumento().equals(nuevosDatos.getDocumento())
                && validacionService.verificarDocumentoRegistrado(nuevosDatos.getDocumento())) {
            throw new RuntimeException("El documento ya está registrado");
        }

        // Validar teléfono
        if (!residente.getTelefono().equals(nuevosDatos.getTelefono())
                && validacionService.verificarNumeroRegistrado(nuevosDatos.getTelefono())) {
            throw new RuntimeException("El número ya está registrado");
        }

        // Actualizar datos
        residente.setNombre(nuevosDatos.getNombre());
        residente.setDocumento(nuevosDatos.getDocumento());
        residente.setCorreo(nuevosDatos.getCorreo());
        residente.setTelefono(nuevosDatos.getTelefono());

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

