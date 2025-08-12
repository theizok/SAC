package com.example.SAC.service;

import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Mensaje;
import com.example.SAC.repository.MensajeRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class MensajeServiceTest {

    //Inyectar servicio y repositorios

    @Mock
    MensajeRepository mensajeRepository;

    @InjectMocks
    MensajeService mensajeService;


    //Prueba encontrar todos los mensajes
    @Test
    public void testEncontrarTodosLosMensajes() {
        // Arrange
        Cuenta cuenta = new Cuenta(1L, "Residente");

        //Simular repositorio de mensajes (Busqueda de todos los mensajes)
        when(mensajeRepository.findAll()).thenReturn(java.util.List.of(new Mensaje(1L, "AEZAKMI", "hesoyam", LocalDateTime.of(2024, 10, 27, 15, 30, 0), (cuenta) )));

        // Act
        List<Mensaje> mensajes = mensajeRepository.findAll();

        // Assert
        //Verificar cantidad de mensajes en la lista
        Assertions.assertEquals(1, mensajes.size());
        //Verificar contenido en el mensaje (Asunto en este caso)
        Assertions.assertEquals("AEZAKMI", mensajes.get(0).getAsunto());
    }

    //Prueba encontrar mensajes para residente (Mensajes Especificos)
    @Test
    public void testEncontrarMensajesParaResidente() {
        // Arrange
        Long id = 1L;
        Cuenta cuenta = new Cuenta(1L, "Residente");
        cuenta.setIdCuenta(id);

        //Simular repositorio de mensajes (Busqueda de todos los mensajes)
        when(mensajeRepository.encontrarMensajesporidCuentaResidentes(id)).thenReturn(java.util.List.of(new Mensaje(1L, "AEZAKMI", "hesoyam", LocalDateTime.of(2024, 10, 27, 15, 30, 0), (cuenta) )));

        // Act
        List<Mensaje> mensajes = mensajeRepository.encontrarMensajesporidCuentaResidentes(id);

        // Assert
        //Verificar cantidad de mensajes en la lista
        Assertions.assertEquals(1, mensajes.size());
        //Verificar contenido en el mensaje (Asunto en este caso)
        Assertions.assertEquals("AEZAKMI", mensajes.get(0).getAsunto());
        //Verificar id de cuenta en el mensaje de la lista
        Assertions.assertEquals(id, mensajes.get(0).getCuenta().getIdCuenta());
    }

    //Prueba encontrar mensajes para propietario por id (Mensajes especificos)
    @Test
    public void testEncontrarMensajesParaPropietario() {
        //Arrange
        Long id = 1L;
        Cuenta cuenta = new Cuenta(1L, "Propietario");
        cuenta.setIdCuenta(id);

        //Simular repositorio de mensajes (Busqueda de todos los mensajes)
        when(mensajeRepository.encontrarMensajesporidCuentaPropietario(id)).thenReturn(java.util.List.of(new Mensaje(1L, "AEZAKMI", "hesoyam", LocalDateTime.of(2024, 10, 27, 15, 30, 0), (cuenta) )));

        // Act
        List<Mensaje> mensajes = mensajeRepository.encontrarMensajesporidCuentaPropietario(id);

        // Assert
        //Verificar cantidad de mensajes en la lista
        Assertions.assertEquals(1, mensajes.size());
        //Verificar contenido en el mensaje (Asunto en este caso)
        Assertions.assertEquals("AEZAKMI", mensajes.get(0).getAsunto());
        //Verificar id de cuenta en el mensaje de la lista
        Assertions.assertEquals(id, mensajes.get(0).getCuenta().getIdCuenta());
    }


}
