package com.example.SAC.service;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegistroService {

    @Autowired
    private ResidenteService residenteService;

    @Autowired
    private PropietarioService propietarioService;

    @Autowired
    private AdministradorService administradorService;

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t.toLowerCase();
    }

    @Transactional
    public Residente registrarResidente(Residente residente) {
        String correo = normalize(residente.getCorreo());
        String documento = normalize(residente.getDocumento());
        String telefono = normalize(residente.getTelefono());

        if (correo != null && verificarCorreoRegistrado(correo)) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        }
        if (documento != null && verificarDocumentoRegistrado(documento)) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        }
        if (telefono != null && verificarNumeroRegistrado(telefono)) {
            throw new RuntimeException("El número de teléfono ya se encuentra registrado");
        }

        residente.setCorreo(correo);
        residente.setDocumento(documento);
        residente.setTelefono(telefono);

        return residenteService.crearResidente(residente);
    }

    @Transactional
    public Propietario registrarPropietario(Propietario propietario) {
        String correo = normalize(propietario.getCorreo());
        String documento = normalize(propietario.getDocumento());
        String telefono = normalize(propietario.getTelefonoPropietario());

        if (correo != null && verificarCorreoRegistrado(correo)) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        }
        if (documento != null && verificarDocumentoRegistrado(documento)) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        }
        if (telefono != null && verificarNumeroRegistrado(telefono)) {
            throw new RuntimeException("El número de teléfono ya se encuentra registrado");
        }

        propietario.setCorreo(correo);
        propietario.setDocumento(documento);
        propietario.setTelefonoPropietario(telefono);

        return propietarioService.agregarPropietario(propietario);
    }

    @Transactional
    public Administrador registrarAdministrador(Administrador administrador) {
        String correo = normalize(administrador.getCorreo());
        String documento = normalize(administrador.getDocumento());
        String telefono = normalize(administrador.getTelefono());

        if (correo != null && verificarCorreoRegistrado(correo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya se encuentra registrado");
        }
        if (documento != null && verificarDocumentoRegistrado(documento)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El documento ya se encuentra registrado");
        }
        if (telefono != null && verificarNumeroRegistrado(telefono)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El número de teléfono ya se encuentra registrado");
        }

        administrador.setCorreo(correo);
        administrador.setDocumento(documento);
        administrador.setTelefono(telefono);

        return administradorService.agregarAdministrador(administrador);
    }

    public boolean verificarCorreoRegistrado(String correo) {
        if (correo == null) return false;
        String c = normalize(correo);
        try {
            return residenteService.obtenerResidentePorCorreo(c).isPresent()
                    || propietarioService.obtenerPropietarioPorCorreo(c).isPresent()
                    || administradorService.obtenerAdministradorPorCorreo(c).isPresent();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el correo ingresado");
        }
    }

    public boolean verificarDocumentoRegistrado(String documento) {
        if (documento == null) return false;
        String d = normalize(documento);
        try {
            return residenteService.obtenerResidentePorDocumento(d).isPresent()
                    || propietarioService.obtenerPropietarioPorDocumento(d).isPresent()
                    || administradorService.obtenerAdministradorPorDocumento(d).isPresent();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el documento ingresado");
        }
    }

    public boolean verificarNumeroRegistrado(String numero) {
        if (numero == null) return false;
        String n = normalize(numero);
        try {
            return residenteService.obtenerResidentePorTelefono(n).isPresent()
                    || propietarioService.obtenerPropietarioPorTelefono(n).isPresent()
                    || administradorService.obtenerAdministradorPorTelefono(n).isPresent();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el numero ingresado");
        }
    }
}
