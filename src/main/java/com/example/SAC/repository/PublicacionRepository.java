package com.example.SAC.repository;

import com.example.SAC.dto.PublicacionDTO;
import com.example.SAC.entity.Publicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {

    //Obtener publicacion con su respetivo autor (Si es residente).
    @Query(value = "SELECT publicacion.idpublicacion AS idpublicacion, publicacion.fecha AS fecha, publicacion.contenido AS contenido, publicacion.titulo AS titulo, cuenta.tipo_cuenta AS tipo_cuenta, cuenta.idcuenta AS idcuenta, residente.nombre AS nombre FROM publicacion JOIN cuenta ON publicacion.idcuenta = cuenta.idcuenta JOIN residente ON cuenta.idcuenta = residente.idcuenta ORDER BY publicacion.fecha DESC", nativeQuery = true)
    List<PublicacionDTO> showWithAuthorResidente();

    //Obtener publicacion con su respectivo autor (Si es propietario)
    @Query(value = "SELECT publicacion.idpublicacion, publicacion.fecha, publicacion.contenido, publicacion.titulo, cuenta.tipo_cuenta, cuenta.idcuenta, propietario.nombre FROM publicacion JOIN cuenta ON publicacion.idcuenta = cuenta.idcuenta JOIN propietario ON cuenta.idcuenta = propietario.idcuenta ORDER BY publicacion.fecha DESC", nativeQuery = true)
    List<PublicacionDTO> showWithAuthorPropietario();

    //Obtener publicacion con su respectivo autor (Si es administrador)
    @Query(value = "SELECT publicacion.idpublicacion, publicacion.fecha, publicacion.contenido, publicacion.titulo, cuenta.tipo_cuenta, cuenta.idcuenta, administrador.nombre FROM publicacion JOIN cuenta ON publicacion.idcuenta = cuenta.idcuenta JOIN administrador ON cuenta.idcuenta = administrador.idcuenta ORDER BY publicacion.fecha DESC", nativeQuery = true)
    List<PublicacionDTO> showWithAuthorAdministrador();

    //Obtener todas las publicaciones
    @Query(value = "SELECT \n" +
            "    p.idpublicacion,\n" +
            "    p.fecha,\n" +
            "    p.contenido,\n" +
            "    p.titulo,\n" +
            "    c.tipo_cuenta,\n" +
            "    c.idcuenta,\n" +
            "    COALESCE(r.nombre, pr.nombre, a.nombre) AS nombre_autor\n" +
            "FROM publicacion p\n" +
            "JOIN cuenta c ON p.idcuenta = c.idcuenta\n" +
            "LEFT JOIN residente r ON c.idcuenta = r.idcuenta\n" +
            "LEFT JOIN propietario pr ON c.idcuenta = pr.idcuenta\n" +
            "LEFT JOIN administrador a ON c.idcuenta = a.idcuenta\n" +
            "ORDER BY p.fecha DESC;", nativeQuery = true)
    List<PublicacionDTO> showWithAuthorAll();
}
