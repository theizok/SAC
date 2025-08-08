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
@CrossOrigin(origins = "http://localhost:5500")
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

    // ----------------------------
    // Mensajes
    // ----------------------------
    @GetMapping("/obtenerMensajes")
    public List<Mensaje> getMensajes() {
        return mensajeService.findAllMensajes();
    }

    // ----------------------------
    // Usuarios General
    // ----------------------------
    @GetMapping("/obtenerUsuarios")
    public List<UsuarioDTO> obtenerUsuarios() {
        return usuarioDTOService.obtenerUsuarios();
    }

    // ----------------------------
    // Residente
    // ----------------------------
    @GetMapping("/obtenerResidentes")
    public List<Residente> getResidentes() {
        return residenteService.obtenerTodos();
    }

    @GetMapping("/obtenerResidenteByNombre")
    public Residente getResidenteByNombre(@RequestParam String nombre) {
        return residenteService.obtenerResidentePorNombre(nombre);
    }

    @PostMapping("/agregarResidente")
    public Residente addResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }

    @PutMapping("/modificarResidente")
    public Residente updateResidente(@RequestParam Long id, @RequestBody Residente residente) {
        return residenteService.actualizarResidente(id, residente);
    }

    @DeleteMapping("/eliminarResidente")
    public ResponseEntity<?> eliminarResidente(@RequestParam String document) {
        try {
            residenteService.eliminarResidente(document);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // --- Nuevos endpoints para front funcional ---
    /** Obtener un residente por ID */
    @GetMapping("/obtenerResidenteById")
    public ResponseEntity<Residente> obtenerResidenteById(@RequestParam long id) {
        Optional<Residente> opt = residenteService.obtenerPorId(id);
        return opt.map(r -> ResponseEntity.ok(r))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Actualizar residente por ID */
    @PutMapping("/modificarResidenteById")
    public ResponseEntity<Residente> modificarResidenteById(
            @RequestParam long id,
            @RequestBody Residente nuevosDatos) {
        try {
            Residente actualizado = residenteService.actualizarResidente(id, nuevosDatos);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /** Eliminar residente por ID */
    @DeleteMapping("/eliminarResidenteById")
    public ResponseEntity<Map<String, String>> eliminarResidenteById(@RequestParam long id) {
        try {
            residenteService.eliminarResidentePorId(id);
            return ResponseEntity.ok(Map.of("message", "Residente eliminado correctamente"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // ----------------------------
    // Propietario
    // ----------------------------
    @PostMapping("/agregarPropietario")
    public Propietario addPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
    }

    @PutMapping("/modificarPropietario")
    public Propietario updatePropietario(@RequestParam long id, @RequestBody Propietario propietario) {
        return propietarioService.actualizarPropietario(id, propietario);
    }

    @GetMapping("/obtenerPropietarios")
    public List<Propietario> getPropietarios() {
        return propietarioService.obtenerTodos();
    }

    @GetMapping("/obtenerPropietarioByNombre")
    public Propietario obtenerPropietarioPorNombre(@RequestParam String nombre) {
        return propietarioService.obtenerPropietarioPorNombre(nombre);
    }

    @DeleteMapping("/eliminarPropietario")
    public ResponseEntity<?> eliminarPropietario(@RequestParam String document) {
        try {
            propietarioService.eliminarPropietariobyDocumento(document);
            return ResponseEntity.ok(Map.of("message", "Cuenta eliminada correctamente"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // ----------------------------
    // Apartamento
    // ----------------------------
    @GetMapping("/obtenerApartamentos")
    public List<Apartamento> getApartamentos() {
        return apartamentoService.obtenerApartamentos();
    }

    @PostMapping("/agregarApartamento")
    public Apartamento addApartamento(@RequestBody Apartamento apartamento) {
        return apartamentoService.agregarApartamento(apartamento);
    }

    @PutMapping("/actualizarApartamento")
    public Apartamento updateApartamento(@RequestBody Apartamento apartamento) {
        return apartamentoService.editarApartamento(apartamento);
    }

    // ----------------------------
    // Publicaciones
    // ----------------------------
    @GetMapping("/ObtenerPublicacionesAdministrador")
    public List<PublicacionDTO> getPublicacion() {
        return publicacionService.obtenerPublicacionesAdministrador();
    }

    @DeleteMapping("/eliminarPublicacion")
    public void eliminarPublicacion(@RequestParam long id) {
        publicacionService.eliminarPublicacion(id);
    }

    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion) {
        return publicacionService.crearPublicacion(publicacion);
    }

    // ----------------------------
    // Administrador
    // ----------------------------
    @PostMapping("/agregarAdministrador")
    public Administrador agregarAdministrador(@RequestBody Administrador administrador) {
        return administradorService.agregarAdministrador(administrador);
    }

    @GetMapping("/dashboard")
    public RedirectView dashboard() {
        return new RedirectView("/ArchivosAdministrador/Inicio/Index.html");
    }

    @GetMapping("/obtenerPorId")
    public Optional<Administrador> obtenerPorId(@RequestParam long id) {
        return administradorService.obtenerAdministradorPorId(id);
    }

    @PutMapping("/actualizar")
    public Administrador actualizarAdministrador(
            @RequestParam long id,
            @RequestBody Administrador administrador) {
        return administradorService.actualizarAdministrador(id, administrador);
    }

    @PutMapping("/cambiarContraseña")
    public ResponseEntity<?> cambiarContraseña(@RequestBody PasswordRequest request) {
        try {
            administradorService.cambiarContraseña(
                    request.getIdUsuario(),
                    request.getPasswordActual(),
                    request.getPasswordNueva()
            );
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
