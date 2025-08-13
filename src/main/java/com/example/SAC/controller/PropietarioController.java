package com.example.SAC.controller;

import com.example.SAC.dto.PasswordRequest;
import com.example.SAC.entity.*;
import com.example.SAC.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;



import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/propietario")
public class PropietarioController {

    @Autowired
    private ApartamentoService apartamentoService;

    @Autowired
    private PublicacionService publicacionService;

    @Autowired
    private PropietarioService propietarioService;
    @Autowired
    private MensajeService mensajeService;
    @Autowired
    private AreaComunService areaComunService;


    //Obtener propietario por id
    @GetMapping("ObtenerPropietarioById")
    public Optional<Propietario> obtenerPropietarioById(@RequestParam long id) {
        return propietarioService.obtenerPorId(id);
    }

    //Actualizar propietario
    @PutMapping("/actualizar")
    public void ActualizarPropietario(@RequestParam long id, @RequestBody Propietario propietario) {
        propietarioService.actualizarPropietario(id, propietario);
    }

    //Cambiar contraseña
    @PutMapping("/cambiarContraseña")
    public ResponseEntity<?> cambiarContraseña(@RequestBody PasswordRequest request) {
        try {
            propietarioService.cambiarContraseña(request.getIdUsuario(), request.getPasswordActual(), request.getPasswordNueva());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    //ELiminar cuenta por id
    @DeleteMapping("/eliminarCuenta")
    public ResponseEntity<?> eliminarCuenta(@RequestParam long id) {
        try
        {
            propietarioService.eliminarPropietarioPorId(id);
            return ResponseEntity.ok(Map.of("message", "Cuenta Eliminada correctamente"));

        } catch (Exception ex)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion) {
        return publicacionService.crearPublicacion(publicacion);
    }

    //Editar apartamentos
    @PutMapping("/actualizarApartamento")
    public Apartamento updateApartamento(@RequestBody Apartamento apartamento) {
        return apartamentoService.editarApartamento(apartamento);
    }

    //Enviar mensaje
    @PostMapping("/enviarMensaje")
    public Mensaje sendMensaje(@RequestBody Mensaje mensaje) {
        return mensajeService.sendMensaje(mensaje);
    }

    //Obtener Mensajes
    @GetMapping("/obtenerMensajes")
    public List<Mensaje> obtenerMensajes(@RequestParam long idCuenta) {
        return mensajeService.findMensajeByIdCuentaPropietario(idCuenta);
    }

    // Obtener todas las áreas comunes
    @GetMapping("/obtenerAreasComunes")
    public List<AreaComun> obtenerAreasComunes() {
        return areaComunService.obtenerAreaComunes();
    }

    //Vista de inicio
    @GetMapping("/dashboard")
    public RedirectView dashboard() {
        return new RedirectView("/ArchivosUsuarios/Inicio/Index.html");
    }


}
