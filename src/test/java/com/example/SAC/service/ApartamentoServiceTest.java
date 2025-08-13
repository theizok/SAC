package com.example.SAC.service;

import com.example.SAC.entity.Apartamento;
import com.example.SAC.repository.ApartamentoRepository;
import org.junit.jupiter.api.DisplayName;
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
class ApartamentoServiceTest {

    @Mock
    private ApartamentoRepository apartamentoRepository;

    @InjectMocks
    private ApartamentoService apartamentoService;

    @Test
    @DisplayName("mostrarApartamentos: retorna lista desde el repositorio")
    void testMostrarApartamentos() {
        // Arrange
        Apartamento a1 = new Apartamento();
        Apartamento a2 = new Apartamento();
        when(apartamentoRepository.findAll()).thenReturn(Arrays.asList(a1, a2));

        // Act
        List<Apartamento> result = apartamentoService.mostrarApartamentos();

        // Assert
        assertEquals(2, result.size());
        assertSame(a1, result.get(0));
        assertSame(a2, result.get(1));
        verify(apartamentoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("obtenerApartamentos: retorna lista desde el repositorio")
    void testObtenerApartamentos() {
        // Arrange
        Apartamento a1 = new Apartamento();
        when(apartamentoRepository.findAll()).thenReturn(List.of(a1));

        // Act
        List<Apartamento> result = apartamentoService.obtenerApartamentos();

        // Assert
        assertEquals(1, result.size());
        assertSame(a1, result.get(0));
        verify(apartamentoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("agregarApartamento: guarda y retorna el apartamento")
    void testAgregarApartamento() {
        // Arrange
        Apartamento nuevo = new Apartamento();
        when(apartamentoRepository.save(nuevo)).thenReturn(nuevo);

        // Act
        Apartamento res = apartamentoService.agregarApartamento(nuevo);

        // Assert
        assertSame(nuevo, res);
        verify(apartamentoRepository, times(1)).save(nuevo);
    }

    @Test
    @DisplayName("editarApartamento: guarda y retorna el apartamento")
    void testEditarApartamento() {
        // Arrange
        Apartamento editado = new Apartamento();
        when(apartamentoRepository.save(editado)).thenReturn(editado);

        // Act
        Apartamento res = apartamentoService.editarApartamento(editado);

        // Assert
        assertSame(editado, res);
        verify(apartamentoRepository, times(1)).save(editado);
    }

    @Test
    @DisplayName("eLiminarApartamento: elimina por id en el repositorio")
    void testEliminarApartamento() {
        // Arrange
        long id = 42L;
        doNothing().when(apartamentoRepository).deleteById(id);

        // Act
        apartamentoService.eLiminarApartamento(id);

        // Assert
        verify(apartamentoRepository, times(1)).deleteById(id);
        verifyNoMoreInteractions(apartamentoRepository);
    }
}
