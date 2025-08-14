package com.example.SAC.service;

import com.example.SAC.dto.PublicacionDTO;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Publicacion;
import com.example.SAC.repository.PublicacionRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PublicacionServiceTest {

    @Mock
    private PublicacionRepository publicacionRepository;

    @InjectMocks
    private PublicacionService publicacionService;

    @Test
    public void testCrearPublicacion() {
        // Arrange
        Cuenta cuenta = new Cuenta(1L, "Residente");
        LocalDateTime fecha = LocalDateTime.parse("2025-08-08T13:49:00");
        Publicacion publicacion = new Publicacion(1L, fecha, "Ejemplo", "Titulo Ejemplo", (cuenta));

        // Simular repositorio
        when(publicacionRepository.save(publicacion)).thenReturn(publicacion);

        // Act
        Publicacion publicacionCreada = publicacionService.crearPublicacion(publicacion);

        // Assert
        Assertions.assertEquals(publicacion, publicacionCreada);
        Assertions.assertEquals(publicacion.getContenido(), publicacionCreada.getContenido());
    }

    //Test Traer todas las publicaciones con Autor
    @Test
    public void testObtenerTodasLasPublicaciones() {

        //Simular repositorio de publicaciones
        when(publicacionRepository.showWithAuthorAll()).thenReturn(
                List.of(
                    new PublicacionDTO(
                            1L,
                            Timestamp.valueOf("2025-08-08 13:49:00"),
                            "Ejemplo de contenido",
                            "Ejemplo de título",
                            "Residente",
                            1L,
                            "Manolo Pérez"
                    ),
                    new PublicacionDTO(
                            2L,
                            Timestamp.valueOf("2025-08-09 09:15:00"),
                            "Otro contenido",
                            "Otro título",
                            "Administrador",
                            2L,
                            "Laura Gómez"
                    )
                )
        );

        // Act
        List<PublicacionDTO> publicaciones = publicacionService.obtenerPublicacionesAll();

        // Assert

        //Tamaño de la lista
        Assertions.assertEquals(2, publicaciones.size());

        //Contenido
        Assertions.assertEquals("Ejemplo de contenido", publicaciones.get(0).getContenido());
        Assertions.assertEquals("Otro contenido", publicaciones.get(1).getContenido());

        //Verificar el llamada del metodo del repositorio
        verify(publicacionRepository).showWithAuthorAll();
    }

    @Test
    public void testObtenerTodasLasPublicacionesAdministrador() {
        // Arrange
        PublicacionDTO publicacionDTO = new PublicacionDTO(
                1L,
                Timestamp.valueOf("2025-08-08 13:49:00"),
                "Ejemplo de contenido",
                "Ejemplo de título",
                "Administrador",
                1L,
                "Manolo Pérez"
        );

        // Simular repositorio
        when(publicacionRepository.showWithAuthorAdministrador()).thenReturn(List.of(publicacionDTO));

        // Act
        List<PublicacionDTO> publicaciones = publicacionService.obtenerPublicacionesAdministrador();

        // Assert

        //Tamaño lista
        Assertions.assertEquals(1, publicaciones.size());

        //Contenido
        Assertions.assertEquals(publicacionDTO, publicaciones.get(0));

        //Tipo cuenta
        Assertions.assertEquals("Administrador", publicaciones.get(0).getTipo_cuenta());

        // Verificación de uso del repositorio
        verify(publicacionRepository).showWithAuthorAdministrador();
    }

    @Test
    public void testObtenerTodasLasPublicacionesResidente() {
        // Arrange
        PublicacionDTO publicacionDTO = new PublicacionDTO(
                1L,
                Timestamp.valueOf("2025-08-08 13:49:00"),
                "Ejemplo de contenido",
                "Ejemplo de título",
                "Residente",
                1L,
                "Manolo Pérez"
        );


        // Simular repositorio
        when(publicacionRepository.showWithAuthorResidente()).thenReturn(List.of(publicacionDTO));

        // Act
        List<PublicacionDTO> publicaciones = publicacionService.obtenerPublicacionesResidentes();

        // Assert

        //Tamaño lista
        Assertions.assertEquals(1, publicaciones.size());

        //Contenido
        Assertions.assertEquals(publicacionDTO, publicaciones.get(0));

        //Tipo cuenta
        Assertions.assertEquals("Residente", publicaciones.get(0).getTipo_cuenta());

        // Verificación de uso del repositorio
        verify(publicacionRepository).showWithAuthorResidente();

    }

    @Test
    public void testObtenerTodasLasPublicacionesPropietario() {
        // Arrange
        PublicacionDTO publicacionDTO = new PublicacionDTO(
                1L,
                Timestamp.valueOf("2025-08-08 13:49:00"),
                "Ejemplo de contenido",
                "Ejemplo de título",
                "Propietario",
                1L,
                "Manolo Pérez"
        );


        // Simular repositorio
        when(publicacionRepository.showWithAuthorPropietario()).thenReturn(List.of(publicacionDTO));

        // Act
        List<PublicacionDTO> publicaciones = publicacionService.obtenerPublicacionesPropietarios();

        // Assert

        //Tamaño lista
        Assertions.assertEquals(1, publicaciones.size());

        //Contenido
        Assertions.assertEquals(publicacionDTO, publicaciones.get(0));

        //Tipo cuenta
        Assertions.assertEquals("Propietario", publicaciones.get(0).getTipo_cuenta());

        // Verificación de uso del repositorio
        verify(publicacionRepository).showWithAuthorPropietario();
    }

    @Test
    public void testEliminarPublicacion() {
        // Arrange
        Long id = 1L;

        // Simular repositorio
        doNothing().when(publicacionRepository).deleteById(id);

        // Act
        publicacionService.eliminarPublicacion(id);

        // Assert
        verify(publicacionRepository, times(1)).deleteById(id);
    }
}