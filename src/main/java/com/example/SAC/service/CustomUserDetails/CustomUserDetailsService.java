package com.example.SAC.service.CustomUserDetails;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.AdministradorRepository;
import com.example.SAC.repository.PropietarioRepository;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.sql.SQLOutput;
import java.util.Collections;
import java.util.Optional;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    ResidenteRepository residenteRepository;

    @Autowired
    PropietarioRepository propietarioRepository;

    @Autowired
    AdministradorRepository administradorRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {



        //Se busca en residente el correo ingresado
        Optional<Residente> residente = residenteRepository.findByCorreo(correo);
        if (residente.isPresent()) {
            return buildUserDetails(residente.get(), "RESIDENTE");
        }

        //Busqueda de correo en propietario
        Optional<Propietario> propietario = propietarioRepository.findByCorreo(correo);
        if (propietario.isPresent()) {
            return buildUserDetails(propietario.get(), "PROPIETARIO");
        }
        //Busqueda de correo en administrador
        Optional<Administrador> administrador = administradorRepository.findByCorreo(correo);
        if(administrador.isPresent()) {
            return buildUserDetails(administrador.get(), "ADMINISTRADOR");
        }

        throw new UsernameNotFoundException("Usuario no encontrado");
    }

    //Metodo para contruir UserDetails
    private UserDetails buildUserDetails(Object usuario, String tipo) {

        String correo = "";
        String contraseña = "";
        //Id en su tabla
        long id = 0;
        //Id de cuenta
        long idCuenta = 0;

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(tipo));


        if (usuario instanceof Residente residente) {
            correo = residente.getCorreo();
            contraseña = residente.getContraseña();
            id = residente.getIdresidente();
            idCuenta = residente.getIdcuenta();
        }else if (usuario instanceof Propietario propietario) {
            correo = propietario.getCorreo();
            contraseña = propietario.getContraseña();
            id = propietario.getIdPropietario();
            idCuenta = propietario.getIdCuenta();
        }else if(usuario instanceof Administrador administrador) {
            correo = administrador.getCorreo();
            contraseña = administrador.getContraseña();
            id = administrador.getIdAdministrador();
            idCuenta = administrador.getIdCuenta();
        }

        System.out.println("Rol:" + tipo);
        System.out.println("Correo recibido: " + correo);
        System.out.println("Contraseña en BD: " + contraseña);
        System.out.println("Id en su tabla: " + id );
        System.out.println("Id de cuenta:" + idCuenta);


        return new CustomUserDetails(
                id,
                idCuenta,
                correo,
                contraseña,
                authorities
        );

    }

}
