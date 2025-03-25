package com.example.SAC.repository;

import com.example.SAC.entity.Residente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface ResidenteRepository extends JpaRepository<Residente, Long> {

    List<Residente> findByNombre(String nombre);
    Optional<Residente> findByCorreo(String correo);
    List<Residente> findByDocumento(String documento);

    Residente getByNombre(String nombre);
}
