package com.example.SAC.service;

import com.example.SAC.entity.Reserva;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.ReservaRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservaServiceTest {

    //Inyeccion de repositorios y servicios

    @Mock
    ReservaRepository reservaRepository;

    @InjectMocks
    ReservaService reservaService;

    @Test
    public void testAgregarReserva() {
        // Arrange
        Reserva reserva = new Reserva();
        reserva.setIdResidente(1);

        // Simular repositorio
        when(reservaRepository.save(reserva)).thenReturn(reserva);

        // Act
        Reserva reservaCreada = reservaService.agregarReserva(reserva);

        // Assert

        //Se verifican las reservas creadas
        Assertions.assertEquals(reserva,reservaCreada);

    }

    @Test
    public void testObtenerReservaPorId() {
        // Arrange
        Long id = 1L;
        Reserva reserva = new Reserva();
        reserva.setIdReserva(id);

        // Simular repositorio
        when(reservaRepository.findById(id)).thenReturn(Optional.of(reserva));

        // Act
        Optional<Reserva> reservaObtenida = reservaService.obtenerReservaPorId(id);

        // Assert

        //Comparamos si hay un residente en reservaObtenida
        Assertions.assertTrue(reservaObtenida.isPresent());

        //Comparamos reservas
        Assertions.assertEquals(reserva,reservaObtenida.get());
    }

    @Test
    public void testEliminarReserva() {
        // Arrange
        Long id = 1L;

        // Simular repositorio
        doNothing().when(reservaRepository).deleteById(id);

        // Act
        reservaService.eliminarReserva(id);

        // Assert

        //Verificamos que se ejecuta el deleteById()
        verify(reservaRepository, times(1)).deleteById(id);
    }

}
