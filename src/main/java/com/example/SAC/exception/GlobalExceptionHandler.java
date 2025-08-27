package com.example.SAC.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.*;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = "Ya existe una cuenta con esos datos (correo o documento).";

        // Intentar afinar mensaje leyendo la causa más específica
        try {
            Throwable root = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause() : ex;
            String rootMsg = root.getMessage() != null ? root.getMessage().toLowerCase() : "";

            if (rootMsg.contains("correo") || rootMsg.contains("email")) {
                message = "El correo ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.";
            } else if (rootMsg.contains("documento")) {
                message = "El documento ya está registrado.";
            } else if (rootMsg.contains("telefono") || rootMsg.contains("telefono_propietario") || rootMsg.contains("telefono_residente")) {
                message = "El número de teléfono ya está registrado.";
            }
        } catch (Exception ignored) {
            // si algo falla, usamos mensaje genérico
        }

        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        body.put("error", "DataIntegrityViolation");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fe -> fe.getField(),
                        fe -> fe.getDefaultMessage(),
                        (existing, replacement) -> existing
                ));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Error de validación en los datos de entrada");
        body.put("errors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Error interno");
        body.put("error", "RuntimeException");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}