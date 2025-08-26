package com.example.SAC.service;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegistroService {

    @Autowired
    ResidenteService residenteService;

    @Autowired
    PropietarioService propietarioService;

    @Autowired
    AdministradorService administradorService;

    public Residente registrarResidente(Residente residente) {
        if (verificarCorreoRegistrado(residente.getCorreo())) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        } else if(verificarDocumentoRegistrado(residente.getDocumento())) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        } else if(verificarNumeroRegistrado(residente.getTelefono())) {
            throw new RuntimeException("El numero de telefono ya se encuentra registrado");
        }
        return residenteService.crearResidente(residente);
    }

    public Propietario registrarPropietario(Propietario propietario) {
        if (verificarCorreoRegistrado(propietario.getCorreo())  & verificarNumeroRegistrado(propietario.getTelefonoPropietario())) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        } else if (verificarDocumentoRegistrado(propietario.getDocumento())) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        } else if (propietarioService.obtenerPropietarioPorTelefono(propietario.getTelefonoPropietario()).isPresent()) {
            throw new RuntimeException("El numero de telefono ya se encuentra registrado");
        }
        return propietarioService.agregarPropietario(propietario);
    }

    public Administrador registrarAdministrador(Administrador administrador) {
        if (verificarCorreoRegistrado(administrador.getCorreo())  ) {
            throw new RuntimeException("El correo ya se encuentra registrado");
        } else if (verificarDocumentoRegistrado(administrador.getDocumento())) {
            throw new RuntimeException("El documento ya se encuentra registrado");
        } else if (verificarNumeroRegistrado(administrador.getTelefono())) {
            throw new RuntimeException("El numero de telefono ya se encuentra registrado");
        }
        return administradorService.agregarAdministrador(administrador);
    }

    public boolean verificarCorreoRegistrado(String correo) {
        boolean existe = false;

        try {

            if (residenteService.obtenerResidentePorCorreo(correo).isPresent()) {
                existe = true;
            } else if (propietarioService.obtenerPropietarioPorCorreo(correo).isPresent()) {
                existe = true;
            } else if (administradorService.obtenerAdministradorPorCorreo(correo).isPresent()) {
                existe = true;
            }

            return existe;

        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el correo ingresado");
        }
    }

    public boolean verificarDocumentoRegistrado(String documento) {
        boolean existe = false;

        try {
            if (residenteService.obtenerResidentePorDocumento(documento).isPresent()) {
                existe = true;
            } else if (propietarioService.obtenerPropietarioPorDocumento(documento).isPresent()) {
                existe = true;
            } else if (administradorService.obtenerAdministradorPorDocumento(documento).isPresent()) {
                existe = true;
            }
            return existe;


        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el documento ingresado");
        }
    }

    public boolean verificarNumeroRegistrado(String numero) {
        boolean existe = false;
        try {
            if (residenteService.obtenerResidentePorTelefono(numero).isPresent()) {
               existe = true;
            }   else if (propietarioService.obtenerPropietarioPorTelefono(numero).isPresent()) {
                existe = true;
            } else if (administradorService.obtenerAdministradorPorTelefono(numero).isPresent()) {
                existe = true;
            }
            return existe;
        }
        catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia de un usuario con el numero ingresado");
        }
    }


}
