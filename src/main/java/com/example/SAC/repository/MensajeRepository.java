package com.example.SAC.repository;

import com.example.SAC.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    @Query(value = "SELECT m.* FROM mensaje m " +
            "JOIN cuenta c ON m.idcuenta = c.idcuenta " +
            "JOIN residente r ON c.idcuenta = r.idcuenta " +
            "WHERE r.idcuenta = ?1 " +
            "ORDER BY m.fecha DESC",
            nativeQuery = true)
    List<Mensaje> encontrarMensajesporidCuentaResidentes(long idCuenta);

    @Query(value = "SELECT m.* FROM mensaje m " +
            "JOIN cuenta c ON m.idcuenta = c.idcuenta " +
            "JOIN propietario p ON c.idcuenta = p.idcuenta " +
            "WHERE p.idcuenta = ?1 " +
            "ORDER BY m.fecha DESC",
            nativeQuery = true)
    List<Mensaje> encontrarMensajesporidCuentaPropietario(long idCuenta);
}
