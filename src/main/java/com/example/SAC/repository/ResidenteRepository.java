package com.example.SAC.repository;

import com.example.SAC.entity.Residente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidenteRepository extends JpaRepository<Residente, Long> {
    List<Residente> findByNameContaining(String name);
    List<Residente> findByEmail(String email);
    List<Residente> findByDocumento(String documento);
}
