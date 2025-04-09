package com.example.SAC.controller;

import com.example.SAC.dto.PasswordRequest;
import com.example.SAC.entity.Apartamento;
import com.example.SAC.entity.Mensaje;
import com.example.SAC.entity.Propietario;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.service.ApartamentoService;
import com.example.SAC.service.MensajeService;
import com.example.SAC.service.PropietarioService;
import com.example.SAC.service.PublicacionService;
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

    //Agregar propietario
    @PostMapping("/agregarPropietario")
    public Propietario agregarPropietario(@RequestBody Propietario propietario) {
        return propietarioService.agregarPropietario(propietario);
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

    @GetMapping("/dashboard")
    public RedirectView dashboard() {
        return new RedirectView("/Inicio/Index.html");
    }


}
