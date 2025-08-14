package com.example.SAC.controller;

import com.example.SAC.dto.PasswordRequest;
import com.example.SAC.entity.AreaComun;
import com.example.SAC.entity.Mensaje;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.entity.Residente;
import com.example.SAC.service.AreaComunService;
import com.example.SAC.service.MensajeService;
import com.example.SAC.service.PublicacionService;
import com.example.SAC.service.ResidenteService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/residente")
public class ResidenteController {

    @Autowired
    private ResidenteService residenteService;

    @Autowired
    private PublicacionService publicacionService;
    @Autowired
    private MensajeService mensajeService;

    @Autowired
    private AreaComunService areaComunService;

    //Obtener residente por id
    @GetMapping("/obtenerPorId")
    public Optional<Residente> obtenerResidentePorId(@RequestParam long id){
        return residenteService.obtenerPorId(id);
    }

    //Se <actualiza wl residente
    @PutMapping("/actualizar")
    public Residente actualizarResidente(@RequestParam long id, @RequestBody Residente residente) {
        return residenteService.actualizarResidente(id, residente);
    }

    //Cambiar contraseña
    @PutMapping("/cambiarContraseña")
    public ResponseEntity<?> cambiarContraseña(@RequestBody PasswordRequest request) {
        try {
            residenteService.cambiarContraseña(request.getIdUsuario(), request.getPasswordActual(), request.getPasswordNueva());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    //Se elimina residente por id
    @DeleteMapping("eliminar")
    public ResponseEntity<?> eliminarResidente(@RequestParam Long id) {

        try
        {
            residenteService.eliminarResidentePorId(id);
            return ResponseEntity.ok(Map.of("message", "Cuenta Eliminada correctamente"));

        } catch(Exception ex)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }




    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }

    //Enviar mensaje
    @PostMapping("/enviarMensaje")
    public Mensaje enviarMensaje(@RequestBody Mensaje mensaje){
        return mensajeService.sendMensaje(mensaje);
    }

    //Encontrar mensajes de residente especifico
    @GetMapping("/obtenerMensajes") public List<Mensaje> obtenerMensajesPorIdCuentaResidente(@RequestParam long idCuenta ){
        return mensajeService.findMensajeByIdCuentaResidente(idCuenta);
    }

    // Obtener todas las áreas comunes
    @GetMapping("/obtenerAreasComunes")
    public List<AreaComun> obtenerAreasComunes() {
        return areaComunService.obtenerAreaComunes();
    }

    //Vistas
    @GetMapping("/dashboard")
    public RedirectView dashboard(){
        return new RedirectView("/ArchivosUsuarios/Inicio/Index.html");
    }

}
