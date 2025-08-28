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
    private ValidacionService validacionService;
    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private ResidenteService residenteService; // No usado por ahora, pero inyectado
    @Mock
    private PropietarioService propietarioService; // No usado por ahora, pero inyectado

    @InjectMocks
    private AdministradorService administradorService;

    @Test
    @DisplayName("registrarAdministrador: crea cuenta, valida duplicados, codifica contraseña y guarda admin")
    void testRegistrarAdministrador_ok() {
        // Arrange
        Administrador input = new Administrador();
        input.setNombreAdministrador("Admin Uno");
        input.setCorreo("admin@correo.com");
        input.setTelefono("123");
        input.setDocumento("abc123");
        input.setContraseña("plainPass");

        // Ningún dato ya registrado
        when(validacionService.verificarCorreoRegistrado(eq("admin@correo.com"))).thenReturn(false);
        when(validacionService.verificarDocumentoRegistrado(anyString())).thenReturn(false);
        when(validacionService.verificarNumeroRegistrado(eq("123"))).thenReturn(false);

        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(inv -> {
            Cuenta c = inv.getArgument(0);
            c.setIdCuenta(100L); // simular PK
            return c;
        });
        when(passwordEncoder.encode("plainPass")).thenReturn("ENC(plainPass)");

        ArgumentCaptor<Administrador> adminCaptor = ArgumentCaptor.forClass(Administrador.class);
        when(administradorRepository.save(adminCaptor.capture())).thenAnswer(i -> i.getArgument(0));

        // Act
        Administrador result = administradorService.registrarAdministrador(input);

        // Assert
        assertNotNull(result);

        Administrador saved = adminCaptor.getValue();
        assertEquals(100L, saved.getIdCuenta());
        assertEquals("ENC(plainPass)", saved.getContraseña());

        // Verificaciones
        verify(validacionService).verificarCorreoRegistrado("admin@correo.com");
        verify(validacionService).verificarDocumentoRegistrado("abc123"); // ✅ corregido
        verify(validacionService).verificarNumeroRegistrado("123");
        verify(cuentaRepository).save(any(Cuenta.class));
        verify(administradorRepository).save(any(Administrador.class));
    }


    @Test
    @DisplayName("actualizarAdministrador: actualiza campos y guarda")
    void testActualizarAdministrador_actualizaCampos() {
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

        // mockear validaciones para que no falle
        when(validacionService.verificarCorreoRegistrado("new@mail.com")).thenReturn(false);
        when(validacionService.verificarDocumentoRegistrado("DOC2")).thenReturn(false);
        when(validacionService.verificarNumeroRegistrado("222")).thenReturn(false);

        Administrador actualizado = administradorService.actualizarAdministrador(id, nuevos);

        assertEquals("Nuevo", actualizado.getNombreAdministrador());
        assertEquals("DOC2", actualizado.getDocumento());
        assertEquals("new@mail.com", actualizado.getCorreo());
        assertEquals("222", actualizado.getTelefono());
        verify(administradorRepository).save(existente);
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
