package com.example.SAC.service;

import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Pago;
import com.example.SAC.repository.PagoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    @Mock
    private PagoRepository pagoRepository;

    @InjectMocks
    private PagoService pagoService;

    private Pago pago;

    @BeforeEach
    void setUp() {
        pago = new Pago();
        pago.setIdPago(1L);
        pago.setValor(25000.0f);
        pago.setFecha(LocalDateTime.now());
        pago.setDescripcion("Pago mensual");
        pago.setCategoria("Administración");
        pago.setEstadoPago("Pendiente");

        // Puedes omitir cuenta si no se usa directamente en los métodos a probar
        pago.setCuenta(null);
    }

    @Test
    void testActualizarEstadoPagoExistente() {
        // Given
        when(pagoRepository.findById(1L)).thenReturn(Optional.of(pago));

        // When
        pagoService.actualizarEstadoPago(1L, "Pagado");

        // Then
        assertEquals("Pagado", pago.getEstadoPago(), "El estado del pago debe actualizarse");
        verify(pagoRepository, times(1)).save(pago);
    }

    @Test
    void testActualizarEstadoPagoNoExistente() {
        // Given
        when(pagoRepository.findById(99L)).thenReturn(Optional.empty());

        // When
        pagoService.actualizarEstadoPago(99L, "Pagado");

        // Then
        verify(pagoRepository, never()).save(any());
    }

    @Test
    void testObtenerPagos() {
        // Given
        Pago otroPago = new Pago();
        otroPago.setIdPago(2L);
        otroPago.setValor(30000.0f);
        otroPago.setFecha(LocalDateTime.now());
        otroPago.setDescripcion("Extra");
        otroPago.setCategoria("Mantenimiento");
        otroPago.setEstadoPago("Pagado");

        when(pagoRepository.findAll()).thenReturn(Arrays.asList(pago, otroPago));

        // When
        List<Pago> pagos = pagoService.obtenerPagos();

        // Then
        assertEquals(2, pagos.size());
        assertEquals("Pago mensual", pagos.get(0).getDescripcion());
        verify(pagoRepository, times(1)).findAll();
    }
}
