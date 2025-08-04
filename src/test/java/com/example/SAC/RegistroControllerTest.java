package com.example.SAC;

import com.example.SAC.controller.RegistroController;
import com.example.SAC.entity.Residente;
import com.example.SAC.service.AdministradorService;
import com.example.SAC.service.EmailService;
import com.example.SAC.service.PropietarioService;
import com.example.SAC.service.ResidenteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RegistroController.class)
@AutoConfigureMockMvc(addFilters = false) // ⬅️ Desactiva filtros de seguridad
public class RegistroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResidenteService residenteService;

    @MockBean
    private PropietarioService propietarioService; // Agregado

    @MockBean
    private AdministradorService administradorService; // Agregado

    @MockBean
    private EmailService emailService; // Agregado

    @Test
    public void testRegistrarResidente() throws Exception {
        Residente residente = new Residente("Carlos", "clave123", 25, "carlos@mail.com", "0987654321", "12345678", 1L);

        // Simula la respuesta esperada del servicio
        Mockito.when(residenteService.crearResidente(Mockito.any(Residente.class))).thenReturn(residente);

        ObjectMapper objectMapper = new ObjectMapper();

        mockMvc.perform(post("/api/register/residente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(residente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Carlos"))
                .andExpect(jsonPath("$.correo").value("carlos@mail.com"));
    }
}
