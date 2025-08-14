package com.example.SAC.service;

import com.example.SAC.entity.AreaComun;
import com.example.SAC.repository.AreaComunRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AreaComunServiceTest {

    //Inyectar servicio y repositorio
    @Mock
    AreaComunRepository areaComunRepository;

    @InjectMocks
    AreaComunService areaComunService;

    //Prueba agregar area comun
    @Test
    public void testAgregarAreaComun(){
        //Arrange
        AreaComun areaComun = new AreaComun(1L, "Salon Social", 777);

        //Simular Repositorio
        when(areaComunRepository.save(areaComun)).thenReturn(areaComun);

        // Act
        AreaComun areaComunCreada = areaComunService.agregarAreaComun(areaComun);

        //Assert
        Assertions.assertEquals(areaComun, areaComunCreada);
        Assertions.assertEquals(areaComun.getArea(), areaComunCreada.getArea());

    }

    //Prueba obtener areas Comunes
    @Test
    public void testObtenerAreasComunes() {
        // Arrange
        AreaComun areaComun = new AreaComun(1L, "Salon Social", 777);
        AreaComun areaComun2 = new AreaComun(2L, "Cancha Aux", 888);

        // Simular repositorio
        when(areaComunRepository.findAll()).thenReturn(java.util.List.of(areaComun, areaComun2));

        // Act
        List<AreaComun> areasComunes = areaComunService.obtenerAreaComunes();

        // Assert
        Assertions.assertEquals(2, areasComunes.size());
        Assertions.assertEquals(areaComun.getArea(), areasComunes.get(0).getArea());
        verify(areaComunRepository).findAll();
    }

    //Prueba eliminar area común
    @Test
    public void testEliminarAreaComun() {
        // Arrange
        Long id = 1L;

        // Simular repositorio
        doNothing().when(areaComunRepository).deleteById(id);

        // Act
        areaComunRepository.deleteById(id);

        // Assert
        verify(areaComunRepository, times(1)).deleteById(id);
    }


    //Prueba actualizar area común
    @Test
    public void testActualizarAreaComun() {
        // Arrange
        AreaComun areaComunAntigua = new AreaComun(1L, "Salon Social", 777);
        AreaComun areaComunNueva = new AreaComun(1L, "Cancha Aux", 888);
        Long id = 1L;

        // Simular busqueda de area común
        when(areaComunRepository.findById(id)).thenReturn(java.util.Optional.of(areaComunAntigua));

        // Simular guardado de area común actualizado
        when(areaComunRepository.save(areaComunNueva)).thenReturn(areaComunNueva);

        // Act
        AreaComun areaComunActualizada = areaComunService.actualizarAreaComun(areaComunNueva, id);

        // Assert
        Assertions.assertEquals(areaComunNueva, areaComunActualizada);
    }
}
