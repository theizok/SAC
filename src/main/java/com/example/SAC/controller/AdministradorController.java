package com.example.SAC.controller;

import com.example.SAC.dto.PasswordRequest;
import com.example.SAC.dto.PublicacionDTO;
import com.example.SAC.dto.UsuarioDTO;
import com.example.SAC.entity.*;
import com.example.SAC.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/administrador")
public class AdministradorController {

    @Autowired
    private PublicacionService publicacionService;

    @Autowired
    private ApartamentoService apartamentoService;

    @Autowired
    private PropietarioService propietarioService;

    @Autowired
    private ResidenteService residenteService;

    @Autowired
    private UsuarioDTOService usuarioDTOService;
    @Autowired
    private AdministradorService administradorService;
    @Autowired
    private MensajeService mensajeService;

    //Obtener todos los residentes
    @GetMapping("/obtenerResidentes")
    public List<Residente> getResidentes() {
        return residenteService.obtenerTodos();
    }

    //Obtener residente por nombre
    @GetMapping("/obtenerResidenteByNombre")
    public Residente getResidenteByNombre(String nombre) {
        return residenteService.obtenerResidentePorNombre(nombre);
    }

    //Obtener todos los propietarios
    @GetMapping ("/obtenerPropietarios")
    public List<Propietario> getPropietario() {
        return propietarioService.obtenerTodos();
    }

    //Obtener propietario por nombre
    @GetMapping("/obtenerPropietariopByNombre")
    public Propietario obtenerPropietarioPorNombre(String nombre) {
        return propietarioService.obtenerPropietarioPorNombre(nombre);
    }

    //Obtener administrador por id
    @GetMapping("obtenerPorId")
    public Optional<Administrador> obtenerPorId(Long id) {
        return administradorService.obtenerAdministradorPorId(id);
    }

    //Se <actualiza admin
    @PutMapping("/actualizar")
    public Administrador actualizarAdministrador(@RequestParam long id, @RequestBody Administrador administrador) {
        return administradorService.actualizarAdministrador(id, administrador);
    }

    //Obtener mensajes
    @GetMapping("/obtenerMensajes")
    public List<Mensaje> getMensajes() {
        return mensajeService.findAllMensajes();
    }

    //ELiminar publicaciones
    @DeleteMapping("/eliminarPublicacion")
    public void eliminarPublicacion(@RequestParam long id) {
        publicacionService.eliminarPublicacion(id);
    }


    //Cambiar Contraseña por id
    //Cambiar contraseña
    @PutMapping("/cambiarContraseña")
    public ResponseEntity<?> cambiarContraseña(@RequestBody PasswordRequest request) {
        try {
            administradorService.cambiarContraseña(request.getIdUsuario(), request.getPasswordActual(), request.getPasswordNueva());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
    //Obtener todos los usuarios
    @GetMapping("/obtenerUsuarios")
    public List<UsuarioDTO> obtenerUsuarios(){
        return usuarioDTOService.obtenerUsuarios();
    }

    //Agregar residente
    @PostMapping("/agregarResidente")
    public Residente addResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }

    //Agregar propietario
    @PostMapping("/agregarPropietario")
    public Propietario addPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
    }

    //Obtener apartamentos
    @GetMapping("/obtenerApartamentos")
    public List<Apartamento> getApartamentos() {
        return apartamentoService.obtenerApartamentos();
    }

    //Agregar apartamentos
    @PostMapping("/agregarApartamento")
    public Apartamento addApartamento(@RequestBody Apartamento apartamento) {
        return apartamentoService.agregarApartamento(apartamento);
    }

    //Editar apartamentos
    @PutMapping("/actualizarApartamento")
    public Apartamento updateApartamento(@RequestBody Apartamento apartamento) {
        return apartamentoService.editarApartamento(apartamento);
    }


    //Obtener todas las publicaciones
    @GetMapping("/ObtenerPublicacionesAdministrador")
    public List<PublicacionDTO> getPublicacion() {
        return publicacionService.obtenerPublicacionesAdministrador();
    }


    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }

    //Agregar admin
    @PostMapping("agregarAdministrador")
    public Administrador agregarAdministrador(@RequestBody Administrador administrador){
        return administradorService.agregarAdministrador(administrador);
    }

    //Vistas del administrador
    @GetMapping("/dashboard")
    public RedirectView dashboard(){
        return new RedirectView("/ArchivosAdministrador/Inicio/Index.html");
    }

}
