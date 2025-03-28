package com.example.SAC.controller;

import com.example.SAC.entity.*;
import com.example.SAC.service.ApartamentoService;
import com.example.SAC.service.PropietarioService;
import com.example.SAC.service.PublicacionService;
import com.example.SAC.service.ResidenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;


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
    @GetMapping("/ObtenerPublicacion")
    public List<Publicacion> getPublicacion() {
        return publicacionService.obtenerPublicaciones();
    }


    //Crear Publicacion
    @PostMapping("/crearPublicacion")
    public Publicacion agregarPublicacion(@RequestBody Publicacion publicacion){
        return publicacionService.crearPublicacion(publicacion);
    }

    //Vistas del administrador
    @GetMapping("/dashboard")
    public RedirectView dashboard(){
        return new RedirectView("/ArchivosAdministrador/Inicio/Index.html");
    }

}
