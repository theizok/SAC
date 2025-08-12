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
    AreaComunService areaComunService;

    @Autowired
    private MensajeService mensajeService;

    // ---------------- Mensajes ----------------

    // Obtener todos los mensajes (admin)
    @GetMapping("/obtenerMensajes")
    public List<Mensaje> getMensajes() {
        return mensajeService.findAllMensajes();
    }

    // Eliminar mensaje (admin)
    @DeleteMapping("/eliminarMensaje")
    public ResponseEntity<?> eliminarMensaje(@RequestParam long id) {
        try {
            mensajeService.deleteMensaje(id);
            return ResponseEntity.ok(Map.of("message", "Mensaje eliminado correctamente"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // DTO simple para recibir la respuesta
    public static class ResponderMensajeDTO {
        public long idMensaje;
        public String respuesta;
        public Long idCuentaRespondido; // opcional
    }

    // Responder mensaje (admin)
    @PostMapping("/responderMensaje")
    public ResponseEntity<?> responderMensaje(@RequestBody ResponderMensajeDTO dto) {
        try {
            Mensaje actualizado = mensajeService.responderMensaje(dto.idMensaje, dto.respuesta, dto.idCuentaRespondido);
            return ResponseEntity.ok(actualizado);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // ---------------- Usuarios / Residente / Propietario / Apartamento / Publicaciones / Admin restante ----------------

    // Usuarios General
    @GetMapping("/obtenerUsuarios")
    public List<UsuarioDTO> obtenerUsuarios(){
        return usuarioDTOService.obtenerUsuarios();
    }

    // Residente endpoints (CRUD por id)

    @GetMapping("/obtenerResidentes")
    public List<Residente> getResidentes() {
        return residenteService.obtenerTodos();
    }

    @GetMapping("/obtenerResidenteByNombre")
    public Residente getResidenteByNombre(String nombre) {
        return residenteService.obtenerResidentePorNombre(nombre);
    }

    @PostMapping("/agregarResidente")
    public Residente addResidente(@RequestBody Residente residente) {
        return residenteService.crearResidente(residente);
    }

    @PutMapping("/modificarResidente")
    public Residente updateResidente(@RequestParam Long id, @RequestBody Residente residente ) {
        return residenteService.actualizarResidente(id, residente);
    }

    @DeleteMapping("/eliminarResidente")
    public ResponseEntity<?> eliminarResidente(@RequestParam String document) {
        try {
            residenteService.eliminarResidente(document);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // --- Nuevos endpoints por id para que el frontend funcione (GET / PUT / DELETE) ---

    // Obtener residente por id (para precargar modal) — usa getters existentes en la entidad
    @GetMapping("/obtenerResidenteById")
    public ResponseEntity<?> obtenerResidenteById(@RequestParam Long id) {
        Optional<Residente> r = residenteService.obtenerPorId(id);
        if (r.isPresent()) {
            Residente residente = r.get();
            return ResponseEntity.ok(Map.of(
                    "id", residente.getIdresidente(),          // getter existente
                    "nombre", residente.getNombre(),
                    "documento", residente.getDocumento(),
                    "correo", residente.getCorreo(),
                    "telefono", residente.getTelefono(),
                    "tipoUsuario", "Residente"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Residente no encontrado"));
        }
    }

    // Actualizar residente por id (consumible desde tu JS)
    @PutMapping("/modificarResidenteById")
    public ResponseEntity<?> modificarResidenteById(@RequestParam Long id, @RequestBody Residente residente) {
        try {
            Residente actualizado = residenteService.actualizarResidente(id, residente);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // Eliminar residente por id (consumible desde tu JS)
    @DeleteMapping("/eliminarResidenteById")
    public ResponseEntity<?> eliminarResidenteById(@RequestParam Long id) {
        try {
            residenteService.eliminarResidentePorId(id);
            return ResponseEntity.ok(Map.of("message", "Residente eliminado correctamente"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // Propietario endpoints (mantener los existentes)
    @PostMapping("/agregarPropietario")
    public Propietario addPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
    }

    @PutMapping("/modificarPropietario")
    public Propietario updatePropietario(@RequestParam long id ,@RequestBody Propietario propietario) {
        return propietarioService.actualizarPropietario(id ,propietario);
    }

    @GetMapping ("/obtenerPropietarios")
    public List<Propietario> getPropietario() {
        return propietarioService.obtenerTodos();
    }

    @GetMapping("/obtenerPropietariopByNombre")
    public Propietario obtenerPropietarioPorNombre(String nombre) {
        return propietarioService.obtenerPropietarioPorNombre(nombre);
    }

    @DeleteMapping("/eliminarPropietario")
    public ResponseEntity<?> eliminarPropietario(@RequestParam String document) {
        try {
            propietarioService.eliminarPropietariobyDocumento(document);
            return ResponseEntity.ok(Map.of("message", "Cuenta eliminada correctamente"));
        } catch(Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // --- Nuevos endpoints por id para propietarios (GET / PUT / DELETE) ---

    @GetMapping("/obtenerPropietarioById")
    public ResponseEntity<?> obtenerPropietarioById(@RequestParam Long id) {
        Optional<Propietario> p = propietarioService.obtenerPorId(id);
        if (p.isPresent()) {
            Propietario propietario = p.get();
            return ResponseEntity.ok(Map.of(
                    "id", propietario.getIdPropietario(),               // getter existente (Lombok)
                    "nombre", propietario.getNombre(),
                    "documento", propietario.getDocumento(),
                    "correo", propietario.getCorreo(),
                    "telefono", propietario.getTelefonoPropietario(),  // getter existente
                    "tipoUsuario", "Propietario"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Propietario no encontrado"));
        }
    }

    // Actualizar propietario por id (recepciona un JSON genérico y mapea campos)
    @PutMapping("/modificarPropietarioById")
    public ResponseEntity<?> modificarPropietarioById(@RequestParam Long id, @RequestBody Map<String, Object> payload) {
        try {
            Propietario nuevosDatos = new Propietario();
            // Mapeo defensivo: aceptamos "telefono" o "telefonoPropietario"
            String telefono = null;
            if (payload.get("telefono") != null) telefono = payload.get("telefono").toString();
            else if (payload.get("telefonoPropietario") != null) telefono = payload.get("telefonoPropietario").toString();

            nuevosDatos.setNombre(payload.getOrDefault("nombre", "").toString());
            nuevosDatos.setDocumento(payload.getOrDefault("documento", "").toString());
            nuevosDatos.setCorreo(payload.getOrDefault("correo", "").toString());
            nuevosDatos.setTelefonoPropietario(telefono);

            Propietario actualizado = propietarioService.actualizarPropietario(id, nuevosDatos);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/eliminarPropietarioById")
    public ResponseEntity<?> eliminarPropietarioById(@RequestParam Long id) {
        try {
            propietarioService.eliminarPropietarioPorId(id);
            return ResponseEntity.ok(Map.of("message", "Propietario eliminado correctamente"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    // Apartamento
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

    // Publicaciones
    @GetMapping("/ObtenerPublicacionesAdministrador")
    public List<PublicacionDTO> getPublicacion() {
        return publicacionService.obtenerPublicacionesAdministrador();
    }

    @DeleteMapping("/eliminarPublicacion")
    public void eliminarPublicacion(@RequestParam long id) {
        publicacionService.eliminarPublicacion(id);
    }

    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }

    // Administrador
    @PostMapping("agregarAdministrador")
    public Administrador agregarAdministrador(@RequestBody Administrador administrador){
        return administradorService.agregarAdministrador(administrador);
    }

    @GetMapping("/dashboard")
    public RedirectView dashboard(){
        return new RedirectView("/ArchivosAdministrador/Inicio/Index.html");
    }

    @GetMapping("obtenerPorId")
    public Optional<Administrador> obtenerPorId(Long id) {
        return administradorService.obtenerAdministradorPorId(id);
    }

    @PutMapping("/actualizar")
    public Administrador actualizarAdministrador(@RequestParam long id, @RequestBody Administrador administrador) {
        return administradorService.actualizarAdministrador(id, administrador);
    }

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
