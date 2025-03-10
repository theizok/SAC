/*package com.example.SAC.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class AuthService {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public AuthService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    public String authenticate(String email, String password) {
        String sql = "SELECT password, role FROM usuarios WHERE email = ?";

        try {
            Map<String, Object> userData = jdbcTemplate.queryForMap(sql, email);
            String hashedPassword = (String) userData.get("password");
            String role = (String) userData.get("role");

            if (passwordEncoder.matches(password, hashedPassword)) {
                return role;  // Retorna el rol si la autenticación es correcta
            } else {
                return null;  // Contraseña incorrecta
            }
        } catch (Exception e) {
            return null;  // Usuario no encontrado o error
        }
    }
}
*/