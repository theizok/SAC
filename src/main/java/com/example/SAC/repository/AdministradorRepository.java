package com.example.SAC.repository;

import com.example.SAC.entity.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
    Optional<Administrador> findByCorreo(String correo);
    Optional<Administrador> findByTelefono(String telefono);
    Optional<Administrador> findByDocumento(String documento);
}
