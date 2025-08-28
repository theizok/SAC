package com.example.SAC.service;

import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Residente;
import com.example.SAC.repository.CuentaRepository;
import com.example.SAC.repository.ResidenteRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResidenteServiceTest {

        //Se inyectan los repositorios

        @Mock
        ResidenteRepository residenteRepository;

        @Mock
        CuentaRepository cuentaRepository;

        @Mock
        PasswordEncoder passwordEncoder;

        @Mock
        ValidacionService validacionService;

        @InjectMocks
        ResidenteService residenteService;

        //Prueba creación de Residente
        @Test
        void testCrearResidente_ok() {
            // Arrange
            Residente residente = new Residente(
                    "Carlos",
                    "clave123",
                    25,
                    "carlos@mail.com",
                    "0987654321",
                    "12345678",
                    1L
            );

            // Ningún dato ya registrado
            when(validacionService.verificarCorreoRegistrado("carlos@mail.com")).thenReturn(false);
            when(validacionService.verificarDocumentoRegistrado("12345678")).thenReturn(false);
            when(validacionService.verificarNumeroRegistrado("0987654321")).thenReturn(false);

            // Simular guardado de cuenta
            when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(invocation -> {
                Cuenta cuenta = invocation.getArgument(0);
                cuenta.setIdCuenta(99L);
                return cuenta;
            });

            // Simular encriptación de contraseña
            when(passwordEncoder.encode("clave123")).thenReturn("clave123_encriptada");

            // Capturar lo que se guarda
            ArgumentCaptor<Residente> residenteCaptor = ArgumentCaptor.forClass(Residente.class);
            when(residenteRepository.save(residenteCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            Residente residenteGuardado = residenteService.registrarResidente(residente);

            // Assert
            assertNotNull(residenteGuardado);
            assertEquals("clave123_encriptada", residenteGuardado.getContraseña());
            assertEquals(99L, residenteGuardado.getIdcuenta());

            // Verificaciones
            verify(validacionService).verificarCorreoRegistrado("carlos@mail.com");
            verify(validacionService).verificarDocumentoRegistrado("12345678");
            verify(validacionService).verificarNumeroRegistrado("0987654321");
            verify(cuentaRepository).save(any(Cuenta.class));
            verify(residenteRepository).save(any(Residente.class));
        }


    //Prueba actualización de residente
        @Test
        public void testActualizarResidente() {
            // Arrange
            Long id = 1L;
            Residente residenteOriginal = new Residente("Carlos", "clave123", 25, "<EMAIL>", "0987654321", "12345678", 1L);
            residenteOriginal.setIdresidente(id);

            Residente residenteActualizado = new Residente("Antonio", "clave123", 25, "<EMAIL>", "0987654321", "12345678", 1L);
            residenteActualizado.setIdresidente(id);

            //Se simula la busqueda del residente y se devuelve el residente original
            when(residenteRepository.findById(id)).thenReturn(java.util.Optional.of(residenteOriginal));

            //Se simula el guardado del residente
            //Cuando se llame el metodo save del repositorio, con cualquier instancia de residente
            //Se devuelve el residente mediante una lambda (invocation vendria a ser el objeto que representa la llamda al metodo)
            //Y mediante el getArgument(0) se obtiene el primer argumento que es el residente que se guarda.
            when(residenteRepository.save(any(Residente.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            Residente resultado = residenteService.actualizarResidente(id, residenteActualizado);

            // Assert
            Assertions.assertEquals(residenteActualizado, resultado);
            Assertions.assertEquals(residenteActualizado.getNombre(), resultado.getNombre());

            //Esta linea verifica que en la ejecución de la prueba se haya llamado a el metodo save() del residenteRepository al menos una vez.
            verify(residenteRepository).save(any(Residente.class));
        }

        //Prueba eliminar residente por documento
        @Test
        public void testEliminarResidente() {
            // Arrange
            String documento = "123456789";

            // Simular repositorio
            doNothing().when(residenteRepository).deleteByDocumento(documento);

            // Act
            residenteService.eliminarResidente(documento);

            // Assert
            // Simplemente se verifica que se llama al repositorio con el metodo de deleteByDocument al menos una vez.
            //Esto debido a que el metodo no devuelve nada, y no se comparan datos.
            verify(residenteRepository, times(1)).deleteByDocumento(documento);

        }

        //Prueba cambio de contraseña (Exito)
        @Test
        public void testCambioContraseña() {
            // Arrange
            Long idResidente = 1L;
            String passwordActual = "contraseña123";
            String passwordNueva = "contraseña1234";

            //ContraseñaenBd
            String contraseñaEnBd = "contraseña123";

            //Residente simulado
            Residente residente = new Residente("Carlos", contraseñaEnBd, 25, "<EMAIL>", "0987654321", "12345678", 1L);
            residente.setIdresidente(idResidente);

            //Simulamos el repositorio de residente (La busqueda del repositorio pues)
            when(residenteRepository.findById(idResidente)).thenReturn(Optional.of(residente));

            //  Simulamos el uso del passord encoder verificando contraseñas
            when(passwordEncoder.matches(passwordActual, contraseñaEnBd)).thenReturn(true);

            // Simulamos la encriptación de la contraseña
            when(passwordEncoder.encode(passwordNueva)).thenReturn(passwordNueva);

            // Simulamos el guardado de la contraseña y devolvemos el residente
            when(residenteRepository.save(residente)).thenAnswer(invocation -> invocation.getArgument(0));


            // Act
            Boolean resultado = residenteService.cambiarContraseña(idResidente, passwordActual, passwordNueva);

            // Assert
            Assertions.assertTrue(resultado);
            Assertions.assertEquals(passwordNueva, residente.getContraseña());

            // Verificar que se guardo el residente (O cualquier tipo de instancia de este)
            verify(residenteRepository).save(any(Residente.class));
        }

        //Prueba obtener residentes
        @Test
        public void testObtenerResidentes() {

            //Simhlar repositorio de residentes
            when(residenteRepository.findAll()).thenReturn(java.util.List.of(new Residente("Carlos", "clave123", 25, "<EMAIL>", "0987654321", "12345678", 1L)));

            // Act
            List<Residente> residentes = residenteRepository.findAll();

            // Asserts
            //Tamaño de la lista
            Assertions.assertEquals(1, residentes.size());

            //Verifica que el dato del residente en la lista si sea el mismo
            Assertions.assertEquals("Carlos", residentes.get(0).getNombre());

            //Verificar que se realiza la busqueda de usuarios, es decir se llama findAll() de residenteRepository.
            verify(residenteRepository).findAll();
        }

        //Prueba eliminar residente por id
        @Test
        public void testEliminarResidentePorId() {
            // Arrange
            String documento = "123456789";

            // Simular repositorio
            doNothing().when(residenteRepository).deleteByDocumento(documento);

            // Act
            residenteService.eliminarResidente(documento);

            // Assert
            // Simplemente se verifica que se llama al repositorio con el metodo de deleteByDocument al menos una vez.
            //Esto debido a que el metodo no devuelve nada, y no se comparan datos.
            verify(residenteRepository, times(1)).deleteByDocumento(documento);
        }

        //Obtener residente por id
        @Test
        public void testObtenerResidentePorId() {
            // Arrange
            Long id = 1L;
            Residente residente = new Residente("Carlos", "clave123", 25, "<EMAIL>", "0987654321", "12345678", 1L);
            residente.setIdresidente(id);

            // Simular repositorio
            when(residenteRepository.findById(id)).thenReturn(Optional.of(residente));

            // Act
            Optional<Residente> residenteObtenido = residenteService.obtenerPorId(id);

            // Assert

            // Se verifica que en el residente obtenido se encuentre un residente y no un null.
            Assertions.assertTrue(residenteObtenido.isPresent());

            //Se verifica que el residente que se obtiene sea el que se espera
            Assertions.assertEquals(residente, residenteObtenido.get());
        }

}
