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
    @Autowired
    private AreaComunService areaComunService;


    //Mensajes

    //Obtener mensajes
    @GetMapping("/obtenerMensajes")
    public List<Mensaje> getMensajes() {
        return mensajeService.findAllMensajes();
    }

    //Usuarios General

    //Obtener todos los usuarios
    @GetMapping("/obtenerUsuarios")
    public List<UsuarioDTO> obtenerUsuarios(){
        return usuarioDTOService.obtenerUsuarios();
    }

    //Residente

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

    //Agregar residente
    @PostMapping("/agregarResidente")
    public Residente addResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }

    //Actualizar cuenta residente
    @PutMapping("/modificarResidente")
    public Residente updateResidente(@RequestParam Long id, @RequestBody Residente residente ) {
        return residenteService.actualizarResidente(id, residente);
    }

    //Eliminar cuenta residente
    @DeleteMapping("/eliminarResidente")
            public ResponseEntity<?> eliminarResidente(@RequestParam String document)
    {
        try
        {
            residenteService.eliminarResidente(document);
            return ResponseEntity.ok().build();

        } catch (Exception ex)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }


    //Propietario

    //Agregar propietario
    @PostMapping("/agregarPropietario")
    public Propietario addPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
    }

    //Editar datos propietario
    @PutMapping("/modificarPropietario")
    public Propietario updatePropietario(@RequestParam long id ,@RequestBody Propietario propietario) {
        return propietarioService.actualizarPropietario(id ,propietario);
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

    //Eliminar cuenta propietario
    @DeleteMapping("/eliminarPropietario")
    public ResponseEntity<?> eliminarPropietario(@RequestParam String document)
    {
        try
        {
            propietarioService.eliminarPropietariobyDocumento(document);
            return ResponseEntity.ok(Map.of("message", "Cuenta eliminada correctamente"));
        } catch(Exception ex)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }



    //Apartamento

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

    //Publicaciones

    //Obtener todas las publicaciones
    @GetMapping("/ObtenerPublicacionesAdministrador")
    public List<PublicacionDTO> getPublicacion() {
        return publicacionService.obtenerPublicacionesAdministrador();
    }


    //ELiminar publicaciones
    @DeleteMapping("/eliminarPublicacion")
    public void eliminarPublicacion(@RequestParam long id) {
        publicacionService.eliminarPublicacion(id);
    }

    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }


    //Administrador

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

    //Cambiar Contraseña por id
    @PutMapping("/cambiarContraseña")
    public ResponseEntity<?> cambiarContraseña(@RequestBody PasswordRequest request) {
        try {
            administradorService.cambiarContraseña(request.getIdUsuario(), request.getPasswordActual(), request.getPasswordNueva());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }


    //Acciones sobre áreas comunes. (Área Comun)

    //Añadir área común.
    @PostMapping("/añadirAreaComun")
    public ResponseEntity<?> agregarAreaComun(@RequestBody AreaComun areaComun){
        try {
            areaComunService.agregarAreaComun(areaComun);
            return ResponseEntity.ok(Map.of("message", "Área comun agregada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    //Eliminar área común.
    public ResponseEntity<?> eliminarAreaComun(@RequestParam long id){
        try {
            areaComunService.eliminarAreaComunporId(id);
            return ResponseEntity.ok(Map.of("message", "Área comun eliminada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    //Actualizar área comun.
    public ResponseEntity<?> actualizarAreaComun(@RequestParam long id, @RequestBody AreaComun areaComun){
        try {
            areaComunService.actualizarAreaComun(areaComun, id);
            return ResponseEntity.ok(Map.of("message", "Área común actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }


}
