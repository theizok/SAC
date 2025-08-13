package com.example.SAC.service;

import com.example.SAC.entity.Administrador;
import com.example.SAC.entity.Cuenta;
import com.example.SAC.repository.AdministradorRepository;
import com.example.SAC.repository.CuentaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdministradorServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AdministradorRepository administradorRepository;
    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private ResidenteService residenteService; // No usado por ahora, pero inyectado
    @Mock
    private PropietarioService propietarioService; // No usado por ahora, pero inyectado

    @InjectMocks
    private AdministradorService administradorService;

    @Test
    @DisplayName("agregarAdministrador: crea cuenta, codifica contraseña y guarda admin")
    void testAgregarAdministrador_creaCuentaCodificaYGuarda() {
        // Arrange
        Administrador input = new Administrador();
        input.setNombreAdministrador("Admin Uno");
        input.setCorreo("admin@correo.com");
        input.setTelefono("123");
        input.setDocumento("ABC123");
        input.setContraseña("plainPass");

        // Stubs
        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(invocation -> {
            Cuenta c = invocation.getArgument(0);
            // Simular que la BD asigna ID
            c.setIdCuenta(100L);
            return c;
        });
        when(passwordEncoder.encode("plainPass")).thenReturn("ENC(plainPass)");

        ArgumentCaptor<Administrador> adminCaptor = ArgumentCaptor.forClass(Administrador.class);
        when(administradorRepository.save(adminCaptor.capture())).thenAnswer(i -> i.getArgument(0));

        // Act
        Administrador result = administradorService.agregarAdministrador(input);

        // Assert
        assertNotNull(result);
        Administrador saved = adminCaptor.getValue();
        assertEquals(100L, saved.getIdCuenta());
        assertEquals("ENC(plainPass)", saved.getContraseña());
        verify(cuentaRepository, times(1)).save(any(Cuenta.class));
        verify(passwordEncoder, times(1)).encode("plainPass");
        verify(administradorRepository, times(1)).save(any(Administrador.class));
    }

    @Test
    @DisplayName("actualizarAdministrador: actualiza campos y guarda")
    void testActualizarAdministrador_actualizaCampos() {
        // Arrange
        Long id = 1L;
        Administrador existente = new Administrador();
        existente.setNombreAdministrador("Viejo");
        existente.setDocumento("DOC1");
        existente.setCorreo("old@mail.com");
        existente.setTelefono("111");

        Administrador nuevos = new Administrador();
        nuevos.setNombreAdministrador("Nuevo");
        nuevos.setDocumento("DOC2");
        nuevos.setCorreo("new@mail.com");
        nuevos.setTelefono("222");

        when(administradorRepository.findById(id)).thenReturn(Optional.of(existente));
        when(administradorRepository.save(any(Administrador.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Administrador actualizado = administradorService.actualizarAdministrador(id, nuevos);

        // Assert
        assertEquals("Nuevo", actualizado.getNombreAdministrador());
        assertEquals("DOC2", actualizado.getDocumento());
        assertEquals("new@mail.com", actualizado.getCorreo());
        assertEquals("222", actualizado.getTelefono());
        verify(administradorRepository).save(existente);
    }

    @Test
    @DisplayName("actualizarAdministrador: no encontrado lanza excepción")
    void testActualizarAdministrador_noEncontrado() {
        // Arrange
        Long id = 99L;
        when(administradorRepository.findById(id)).thenReturn(Optional.empty());

        // Act - Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> administradorService.actualizarAdministrador(id, new Administrador()));
        assertEquals("No se encontro el propietario", ex.getMessage());
        verify(administradorRepository, never()).save(any());
    }

    @Test
    @DisplayName("cambiarContraseña: éxito cuando la actual coincide")
    void testCambiarContrasena_ok() {
        // Arrange
        Long id = 5L;
        Administrador admin = new Administrador();
        admin.setContraseña("ENC(old)");

        when(administradorRepository.findById(id)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("old", "ENC(old)")).thenReturn(true);
        when(passwordEncoder.encode("new"))
                .thenReturn("ENC(new)");
        when(administradorRepository.save(any(Administrador.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        boolean changed = administradorService.cambiarContraseña(id, "old", "new");

        // Assert
        assertTrue(changed);
        assertEquals("ENC(new)", admin.getContraseña());
        verify(administradorRepository).save(admin);
    }

    @Test
    @DisplayName("cambiarContraseña: contraseña actual incorrecta lanza excepción")
    void testCambiarContrasena_actualIncorrecta() {
        // Arrange
        Long id = 6L;
        Administrador admin = new Administrador();
        admin.setContraseña("ENC(old)");
        when(administradorRepository.findById(id)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", "ENC(old)")).thenReturn(false);

        // Act - Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> administradorService.cambiarContraseña(id, "wrong", "new"));
        assertEquals("La contraseña actual es incorrecta", ex.getMessage());
        verify(administradorRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("cambiarContraseña: admin no encontrado lanza excepción")
    void testCambiarContrasena_noEncontrado() {
        // Arrange
        Long id = 7L;
        when(administradorRepository.findById(id)).thenReturn(Optional.empty());

        // Act - Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> administradorService.cambiarContraseña(id, "old", "new"));
        assertEquals("Residente no encontrado", ex.getMessage());
        verify(passwordEncoder, never()).matches(any(), any());
        verify(passwordEncoder, never()).encode(any());
        verify(administradorRepository, never()).save(any());
    }

    @Test
    @DisplayName("obtenerAdministradores: devuelve lista del repositorio")
    void testObtenerAdministradores() {
        // Arrange
        Administrador a = new Administrador();
        Administrador b = new Administrador();
        when(administradorRepository.findAll()).thenReturn(Arrays.asList(a, b));

        // Act
        List<Administrador> list = administradorService.obtenerAdministradores();

        // Assert
        assertEquals(2, list.size());
        verify(administradorRepository).findAll();
    }

    @Test
    @DisplayName("obtenerAdministradorPorId: devuelve Optional del repositorio")
    void testObtenerAdministradorPorId() {
        // Arrange
        Long id = 10L;
        Administrador a = new Administrador();
        when(administradorRepository.findById(id)).thenReturn(Optional.of(a));

        // Act
        Optional<Administrador> opt = administradorService.obtenerAdministradorPorId(id);

        // Assert
        assertTrue(opt.isPresent());
        assertSame(a, opt.get());
        verify(administradorRepository).findById(id);
    }
}
