package com.example.SAC.repository;

import com.example.SAC.entity.Propietario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PropietarioRepository extends JpaRepository<Propietario, Long> {
    Optional<Propietario> findByCorreo(String correo);
    Optional<Propietario> findByDocumento(String documento);
    Optional<Propietario> findByNombre(String nombre);
    Optional<Propietario> findByTelefonoPropietario(String telefonoPropietario);


    Optional<Propietario> findByIdCuenta(Long idCuenta);
    void deleteByDocumento(String document);
}
