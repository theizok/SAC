package com.example.SAC.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.SAC.entity.Mensaje;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {



    //Mensajes para residente, es decir se muestran todos los resultados del residente
    @Query (value = "SELECT mensaje.idmensaje AS idmensaje ,mensaje.contenido AS contenido, mensaje.idcuenta AS idcuenta, mensaje.asunto AS asunto, mensaje.fecha AS fecha FROM  mensaje JOIN cuenta ON mensaje.idcuenta = cuenta.idcuenta JOIN residente ON cuenta.idcuenta = residente.idcuenta WHERE residente.idcuenta = ? ORDER BY mensaje.fecha DESC", nativeQuery = true)
    List<Mensaje> encontrarMensajesporidCuentaResidentes(long idCuenta);


    //Mensajes para propietario especifico
    @Query(value = "SELECT mensaje.idmensaje AS idmensaje, mensaje.contenido AS contenido,mensaje.idcuenta AS idcuenta, mensaje.asunto AS asunto, mensaje.fecha AS fecha FROM  mensaje JOIN cuenta ON mensaje.idcuenta = cuenta.idcuenta JOIN propietario ON cuenta.idcuenta = propietario.idcuenta WHERE propietario.idcuenta = ? ORDER BY mensaje.fecha DESC", nativeQuery = true)
    List<Mensaje> encontrarMensajesporidCuentaPropietario(long idCuenta);


}
