package com.example.SAC.repository;

import com.example.SAC.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByCuenta_IdCuenta(Long idCuenta);

    @Query("SELECT p FROM Pago p WHERE p.cuenta.idCuenta = :idCuenta")
    List<Pago> findByIdCuenta(@Param("idCuenta") Long idCuenta);
}
