package com.example.SAC.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.SAC.entity.Cuenta;
import org.springframework.stereotype.Repository;

@Repository
public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

}
