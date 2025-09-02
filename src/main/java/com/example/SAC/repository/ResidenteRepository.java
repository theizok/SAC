package com.example.SAC.repository;

import com.example.SAC.entity.Residente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface ResidenteRepository extends JpaRepository<Residente, Long> {

    Optional<Residente> findByCorreo(String correo);
    Optional<Residente> findByDocumento(String documento);
    Optional<Residente> findByTelefono(String telefono);

    Residente getByNombre(String nombre);


    Optional<Residente> findByIdcuenta(Long idCuenta);
    void deleteByDocumento(String documento);
}
