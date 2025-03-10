package com.example.SAC.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.SAC.entity.Apartamento;

@Repository
public interface ApartamentoRepository extends JpaRepository<Apartamento, Long> {
}
