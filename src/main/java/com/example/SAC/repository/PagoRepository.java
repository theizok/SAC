package com.example.SAC.repository;

import com.example.SAC.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByCuenta_IdCuenta(Long idCuenta);
}
