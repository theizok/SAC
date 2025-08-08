package com.example.SAC.service;

import com.example.SAC.entity.Tarifa;
import com.example.SAC.repository.TarifaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TarifaServiceTest {

    @Mock
    private TarifaRepository tarifaRepository;

    @InjectMocks
    private TarifaService tarifaService;

    private Tarifa t1;
    private Tarifa t2;

    @BeforeEach
    void setUp() {
        t1 = new Tarifa();
        t1.setId_tarifa(1L);
        t1.setCategoria("Residencial");
        t1.setValor(100.0f);

        t2 = new Tarifa();
        t2.setId_tarifa(2L);
        t2.setCategoria("Comercial");
        t2.setValor(200.0f);
    }

    @Test
    void testGetAllTarifas() {
        // Given
        List<Tarifa> listaMock = Arrays.asList(t1, t2);
        when(tarifaRepository.findAll()).thenReturn(listaMock);

        // When
        List<Tarifa> resultado = tarifaService.getAllTarifas();

        // Then
        assertNotNull(resultado, "La lista no debe ser null");
        assertEquals(2, resultado.size(), "Deben devolverse dos tarifas");
        assertIterableEquals(listaMock, resultado, "El contenido debe coincidir");
        verify(tarifaRepository, times(1)).findAll();
    }

    @Test
    void testSaveTarifa() {
        // Given
        when(tarifaRepository.save(t1)).thenReturn(t1);

        // When
        Tarifa guardada = tarifaService.saveTarifa(t1);

        // Then
        assertNotNull(guardada, "La tarifa guardada no debe ser null");
        assertEquals(1L, guardada.getId_tarifa());
        assertEquals("Residencial", guardada.getCategoria());
        assertEquals(100.0f, guardada.getValor());
        verify(tarifaRepository, times(1)).save(t1);
    }
}
