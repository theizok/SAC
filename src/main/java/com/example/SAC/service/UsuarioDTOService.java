package com.example.SAC.service;

import com.example.SAC.dto.UsuarioDTO;
import com.example.SAC.repository.ResidenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UsuarioDTOService {

    @Autowired
    ResidenteService residenteService;
    @Autowired
    PropietarioService propietarioService;
    @Autowired
    AdministradorService administradorService;

    public List<UsuarioDTO> obtenerUsuarios(){
        List<UsuarioDTO> usuarios = new ArrayList<>();

        residenteService.obtenerTodos().forEach(residente -> {
            usuarios.add(new UsuarioDTO(
                    residente.getIdresidente(),
                    residente.getNombre(),
                    residente.getCorreo(),
                    residente.getDocumento(),
                    residente.getTelefono(),
                    "Residente"
            ));
        });

        propietarioService.obtenerTodos().forEach(propietario -> {
            usuarios.add(new UsuarioDTO(
                    propietario.getIdPropietario(),
                    propietario.getNombre(),
                    propietario.getCorreo(),
                    propietario.getDocumento(),
                    propietario.getTelefonoPropietario(),
                    "Propietario"
            ));
        });

        administradorService.obtenerAdministradores().forEach(administrador -> {
            usuarios.add(new UsuarioDTO(
                    administrador.getIdAdministrador()
                    ,administrador.getNombreAdministrador()
                    ,administrador.getCorreo()
                    ,administrador.getDocumento()
                    , administrador.getTelefono(), "Administrador"
            ));
        });

        return usuarios;
    }

}
