package com.example.SAC.repository;

import com.example.SAC.entity.Propietario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PropietarioRepository extends JpaRepository<Propietario, Long> {
    Optional<Propietario> findByCorreo(String correo);

    Propietario findByNombre(String nombre);

    void deleteByDocumentoPropietario(String document);
}
