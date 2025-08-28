package com.example.SAC.service;

import com.example.SAC.entity.Cuenta;
import com.example.SAC.entity.Propietario;
import com.example.SAC.repository.CuentaRepository;
import com.example.SAC.repository.PropietarioRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.inject.Inject;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
public class PropietarioServiceTest {

    //Inyección de repositorios y servicios

    @Mock
    PropietarioRepository propietarioRepository;

    @Mock
    CuentaRepository cuentaRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    PropietarioService propietarioService;


    //Prueba obtener propietarios
    @Test
    public void testObtenerPropietarios() {
        // Arrange
        //Simular repositorio de propietarios
        when(propietarioRepository.findAll()).thenReturn(java.util.List.of(new Propietario("Pepito", "Clave123", "123456789", "correo@gmail.com", "3013214567", 1L)));

        // Act
        List<Propietario> propietarios = propietarioRepository.findAll();

        // Asserts
        //Tamaño de la lista
        Assertions.assertEquals(1, propietarios.size());

        //Verificación de datos
        Assertions.assertEquals("Pepito", propietarios.get(0).getNombre());

        //Verificacón de llamado del repositorio
        verify(propietarioRepository).findAll();
    }

    //Prueba creación de propietario
    @Test
    public void testCrearPropietario() {
        //Arrange
        Propietario propietario = new Propietario( "Pepito", "Clave123", "123456789", "correo@gmail.com", "3013214567", 1L);

        //Simular repositorio de cuenta (Simular creacion de cuenta en la base de datos para asignar id)
        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer( invocation  -> {
            Cuenta cuenta = invocation.getArgument(0);
            cuenta.setIdCuenta(1L);
            return cuenta;
        });

        propietario.setIdCuenta(1L);

        //Simular encriptación de contraseña
        when(passwordEncoder.encode(propietario.getContraseña())).thenReturn("clave123_encriptada");

        propietario.setContraseña("clave123_encriptada");

        //Simular repositorio de propietario
        when(propietarioRepository.save(propietario)).thenReturn(propietario);

        // Act
        Propietario propietarioCreado = propietarioService.registrarPropietario(propietario);

        // Assert
        Assertions.assertEquals(propietario, propietarioCreado);
        Assertions.assertEquals(propietario.getContraseña(), propietarioCreado.getContraseña());
        Assertions.assertEquals(propietario.getIdCuenta(), propietarioCreado.getIdCuenta());
    }

    //Test actualizar propietario
    @Test
    public void testActualizarPropietario() {
        //Arrange (Parametros necesarios)
        Long id = 1L;
        Propietario propietarioOriginal = new Propietario("Pepito", "Clave123", "123456789", "correo@gmail.com", "3013214567", 1L);
        propietarioOriginal.setIdPropietario(id);

        Propietario propietarioActualizado = new Propietario("Maximiliano el master rodriguez", "Clave123", "123456789", "correo@gmail.com", "3013214567", 1L);
        propietarioActualizado.setIdPropietario(id);

        //Simulación busqueda de propietario donde se devuelve el propietarioOriginal
        when(propietarioRepository.findById(id)).thenReturn(Optional.of(propietarioOriginal));

        //Se simula el guardado del propietario
        //Cuando se llame el metodo save del repositorio, con cualquier instancia de propietario
        //Se devuelve el propietario mediante una lambda (invocation vendria a ser el objeto que representa la llamada al metodo)
        //Y mediante el getArgument(0) se obtiene el primer argumento que es el propietario que se guarda.
        when(propietarioRepository.save(any(Propietario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Propietario resultado = propietarioService.actualizarPropietario(id,propietarioActualizado);

        // Assert
        Assertions.assertEquals(propietarioActualizado, resultado);
        Assertions.assertEquals(propietarioActualizado.getNombre(), resultado.getNombre());

    }

    //Prueba cambiar contraseña
    @Test
    public void testCambiarContraseña() {
        // Arrange
        Long idPropietario = 1L;
        String passwordActual = "contrapassword123";
        String passwordNueva = "manoloRolexRichardMillie";

        //Contraseña en bd ("Encriptada")
        String passwordEnBd = "<PASSWORD>";

        //Propietario simulado
        Propietario propietario = new Propietario("Maximiliano el master rodriguez", passwordEnBd, "123456789", "correo@gmail.com", "3013214567", 1L);
        propietario.setIdPropietario(idPropietario);

        //Simular repositorio (Busqueda de propietario mediante id)
        when(propietarioRepository.findById(idPropietario)).thenReturn(Optional.of(propietario));

        //Simular verificación de contraseña (PasswordEncoder)
        when(passwordEncoder.matches(passwordActual, passwordEnBd)).thenReturn(true);

        //Simular encriptación de contraseña nueva (PasswordEncoder)
        when(passwordEncoder.encode(passwordNueva)).thenReturn(passwordNueva);

        //Simulación de guardado de contraseña - Responde con el propietario actualizado
        when(propietarioRepository.save(propietario)).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Boolean cambioContraseña = propietarioService.cambiarContraseña(idPropietario, passwordActual, passwordNueva);

        // Assert
        //Se verifica que el cambio de la contraseña haya sido exitoso (True)
        Assertions.assertTrue(cambioContraseña);

        //Se verifica el cambio de contraseña
        Assertions.assertEquals(passwordNueva, propietario.getContraseña());
    }


    //Prueba obtener propietario por id
    @Test
    public void testObtenerPropietarioPorId() {
        //Arrange

        Long id = 1L;
        //Se crea el propietario que se obtendra por el repositorio
        Propietario propietario = new Propietario("Maximiliano el master rodriguez", "contraseñita123", "123456789", "correo@gmail.com", "3013214567", 1L);
        propietario.setIdPropietario(1L);

        //Se simula el repositorio (Busqueda del propietario)
        when(propietarioRepository.findById(id)).thenReturn(Optional.of(propietario));

        // Act
        Optional<Propietario> propietarioEncontrado = propietarioService.obtenerPorId(id);

        // Assert
        //Verificar si el propietario esta presente o es null
        Assertions.assertTrue(propietarioEncontrado.isPresent());
        // Verificar si los propietarios coinciden
        Assertions.assertEquals(propietario, propietarioEncontrado.get());

    }

    //Prueba obtener propietario por nombre
    @Test
    public void testObtenerPropietarioPorNombre() {
        //Arrange
        String nombre = "Maximiliano el master rodriguez";
        Propietario propietario = new Propietario("Maximiliano el master rodriguez", "contraseñita123", "123456789", "correo@gmail.com", "3013214567", 1L);

        //Simular repositorio - Busqueda del propietario por nombre.
        when(propietarioRepository.findByNombre(nombre)).thenReturn(Optional.of(propietario));

        // Act
        Optional<Propietario> propietarioEncontrado = propietarioService.obtenerPropietarioPorNombre(nombre);

        // Assert
        //Verificar que el resultado tenga el propietario
        Assertions.assertTrue(propietarioEncontrado.isPresent());
        //Verificar los propietarios (Coinciden)
        Assertions.assertEquals(propietario, propietarioEncontrado.get());

    }

    //Prueba eliminar propietario por documento
    @Test
    public void testEliminarPropietarioPorDocumento() {
        //Arrange
        String documento = "123456789";

        //Simular repositorio
        doNothing().when(propietarioRepository).deleteByDocumento(documento);

        // Act
        propietarioRepository.deleteByDocumento(documento);

        //Assert

        //Verificamos la ejecución de la linea que elimina el propietario
        verify(propietarioRepository, times(1)).deleteByDocumento(documento);

    }

    //Prueba eliminar propietario por id
    @Test
    public void testEliminarPropietarioPorId() {
        //Arrange
        Long id = 1L;

        //Simular repositorio
        doNothing().when(propietarioRepository).deleteById(id);

        // Act
        propietarioService.eliminarPropietarioPorId(id);

        // Assert
        verify(propietarioRepository, times(1)).deleteById(id);
    }




}
