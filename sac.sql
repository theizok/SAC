-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-04-2025 a las 22:16:52
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sac`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `idadmnistrador` bigint(11) NOT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `telefono` varchar(100) DEFAULT NULL,
  `documento` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`idadmnistrador`, `nombre`, `idcuenta`, `correo`, `contraseña`, `telefono`, `documento`) VALUES
(4, 'Administrador', 8, 'administrador@gmail.com', '$2a$10$Kp4CfH3DgYfDBVIjJylc6.yyozj4Gk6Ptxs3W9eLPlfq3dcxLF5re', '300235123', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apartamento`
--

CREATE TABLE `apartamento` (
  `idapartamento` bigint(11) NOT NULL,
  `numeroapartamento` bigint(11) DEFAULT NULL,
  `idresidente` bigint(11) DEFAULT NULL,
  `idpropietario` bigint(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areacomun`
--

CREATE TABLE `areacomun` (
  `idareacomun` bigint(11) NOT NULL,
  `area` varchar(40) DEFAULT NULL,
  `precio` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta`
--

CREATE TABLE `cuenta` (
  `idcuenta` bigint(11) NOT NULL,
  `tipo_cuenta` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuenta`
--

INSERT INTO `cuenta` (`idcuenta`, `tipo_cuenta`) VALUES
(1, NULL),
(2, 'Residente'),
(3, 'Propietario'),
(4, 'Propietario'),
(5, 'Propietario'),
(6, 'Propietario'),
(7, 'Residente'),
(8, 'Administrador'),
(9, 'Residente'),
(10, 'Residente'),
(11, 'Residente'),
(12, 'Propietario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje`
--

CREATE TABLE `mensaje` (
  `idmensaje` bigint(11) NOT NULL,
  `contenido` varchar(250) DEFAULT NULL,
  `asunto` varchar(70) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensaje`
--

INSERT INTO `mensaje` (`idmensaje`, `contenido`, `asunto`, `fecha`, `idcuenta`) VALUES
(5, 'Mensaje de ejemplo', 'Probar los mensajes', '2025-04-04 05:48:47', 2),
(6, 'Segundo mensaje de prueba enviado desde el front', 'Mensaje Frontend', '2025-04-04 01:25:00', NULL),
(7, 'Segundo mensaje de prueba.', 'Mensaje Frontend', '2025-04-04 01:28:00', 2),
(9, 'Contenido de prueba post perdida', 'Mensaje Post perdida', '2025-04-04 04:21:00', 2),
(10, 'Hola mundo', 'Mensaje prueba', '2025-04-09 12:51:00', 2),
(11, 'Residente felipe', 'Residente Felipe', '2025-04-09 12:53:00', 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `idpago` bigint(11) NOT NULL,
  `valor` float DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `estado_pago` varchar(20) NOT NULL,
  `fecha_pago` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`idpago`, `valor`, `idcuenta`, `descripcion`, `categoria`, `estado_pago`, `fecha_pago`) VALUES
(1, 100000, NULL, NULL, NULL, '', NULL),
(3, 100000, NULL, NULL, NULL, '', NULL),
(6, 200000, 2, 'Pago administracion mes: abril', 'Administración', 'PENDENTE', NULL),
(7, 200000, 2, 'Pago administracion mes: enero', 'Administración', 'PENDENTE', NULL),
(8, 200000, 2, 'Pago administracion mes: marzo', 'Administración', 'PENDENTE', NULL),
(9, 200000, 2, 'Pago administracion mes: febrero', 'Administración', 'PENDENTE', NULL),
(10, 200000, 2, 'Pago administracion mes: noviembre', 'Administración', 'PENDENTE', NULL),
(11, 200000, 2, 'Pago administracion mes: noviembre', 'Administración', 'PENDENTE', NULL),
(12, 200000, 2, 'Pago administracion mes: enero', 'Administración', 'PENDENTE', NULL),
(13, 200000, 2, 'Pago administracion mes: mayo', 'Administración', 'PENDENTE', NULL),
(14, 200000, 2, 'Pago administracion mes: mayo', 'Administración', 'PENDENTE', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propietario`
--

CREATE TABLE `propietario` (
  `idpropietario` bigint(11) NOT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `idapartamento` bigint(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `telefono` varchar(10) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `propietario`
--

INSERT INTO `propietario` (`idpropietario`, `nombre`, `documento`, `idapartamento`, `correo`, `contraseña`, `telefono`, `idcuenta`) VALUES
(5, 'Papaleta Aleta', '1234567890', NULL, 'papaleta@gmail.com', '$2a$10$fwa6Tfz4BJWXZATv2VbsjuzZjHq8vk.cVs//s5SqYxPFEVRFyMy1e', '3012229858', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `idpublicacion` bigint(11) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `contenido` varchar(270) DEFAULT NULL,
  `titulo` varchar(50) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `publicacion`
--

INSERT INTO `publicacion` (`idpublicacion`, `fecha`, `contenido`, `titulo`, `idcuenta`) VALUES
(12, '2025-04-01 23:05:00', 'Publicación creada desde el frontend por un Residente', 'Publicacion creada desde el frontend (Residente)', 2),
(14, '2025-04-09 00:05:00', 'Publicacion creada por el administrador', 'Admin Publication', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro`
--

CREATE TABLE `registro` (
  `id` bigint(20) NOT NULL,
  `idpago` bigint(20) DEFAULT NULL,
  `valor` float DEFAULT NULL,
  `idadministrador` bigint(20) DEFAULT NULL,
  `idresidente` bigint(20) DEFAULT NULL,
  `idmetododepago` bigint(20) DEFAULT NULL,
  `idpropietario` bigint(20) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario` varchar(100) DEFAULT NULL,
  `detalle` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registro`
--

INSERT INTO `registro` (`id`, `idpago`, `valor`, `idadministrador`, `idresidente`, `idmetododepago`, `idpropietario`, `fecha`, `usuario`, `detalle`) VALUES
(1, 3, 100000, NULL, 2, NULL, NULL, '2025-03-28 18:41:44', 'root@localhost', 'Pago registrado con ID: 3');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `idreserva` bigint(11) NOT NULL,
  `tiempo` bigint(11) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `idareacomun` bigint(11) DEFAULT NULL,
  `idresidente` bigint(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `residente`
--

CREATE TABLE `residente` (
  `idresidente` bigint(11) NOT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `edad` bigint(11) DEFAULT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `telefono` varchar(10) DEFAULT NULL,
  `id_apartamento` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `residente`
--

INSERT INTO `residente` (`idresidente`, `nombre`, `edad`, `documento`, `idcuenta`, `correo`, `contraseña`, `telefono`, `id_apartamento`) VALUES
(8, 'Isaac Ramirez', 19, '12333213', 2, 'login@gmail.com', '$2a$10$XCrsgdwFkOX.quqWPrQuH.mN.p/0lqxSjwy4U2VeojUCt4zSpjkpa', '777777', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa`
--

CREATE TABLE `tarifa` (
  `id_tarifa` bigint(11) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `valor` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tarifa`
--

INSERT INTO `tarifa` (`id_tarifa`, `categoria`, `valor`) VALUES
(2, 'Administración', 200000);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`idadmnistrador`),
  ADD KEY `cuenta_idcuenta_administrador` (`idcuenta`);

--
-- Indices de la tabla `apartamento`
--
ALTER TABLE `apartamento`
  ADD PRIMARY KEY (`idapartamento`),
  ADD KEY `residente_idresidente_apartamento` (`idresidente`),
  ADD KEY `propietario_idpropietario_apartamento` (`idpropietario`);

--
-- Indices de la tabla `areacomun`
--
ALTER TABLE `areacomun`
  ADD PRIMARY KEY (`idareacomun`);

--
-- Indices de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  ADD PRIMARY KEY (`idcuenta`);

--
-- Indices de la tabla `mensaje`
--
ALTER TABLE `mensaje`
  ADD PRIMARY KEY (`idmensaje`),
  ADD KEY `fk_mensaje_cuenta` (`idcuenta`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`idpago`);

--
-- Indices de la tabla `propietario`
--
ALTER TABLE `propietario`
  ADD PRIMARY KEY (`idpropietario`),
  ADD KEY `apartamento_idapartamento_propietario` (`idapartamento`);

--
-- Indices de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD PRIMARY KEY (`idpublicacion`),
  ADD KEY `fk_publicacion_cuenta` (`idcuenta`);

--
-- Indices de la tabla `registro`
--
ALTER TABLE `registro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_registro_residente` (`idresidente`),
  ADD KEY `fk_registro_propietario` (`idpropietario`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`idreserva`),
  ADD KEY `areacomun_idareacomun_reserva` (`idareacomun`),
  ADD KEY `residente_idresidente_reserva` (`idresidente`);

--
-- Indices de la tabla `residente`
--
ALTER TABLE `residente`
  ADD PRIMARY KEY (`idresidente`),
  ADD KEY `cuenta_idcuenta_residente` (`idcuenta`);

--
-- Indices de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  ADD PRIMARY KEY (`id_tarifa`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `idadmnistrador` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `apartamento`
--
ALTER TABLE `apartamento`
  MODIFY `idapartamento` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `areacomun`
--
ALTER TABLE `areacomun`
  MODIFY `idareacomun` bigint(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  MODIFY `idcuenta` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `mensaje`
--
ALTER TABLE `mensaje`
  MODIFY `idmensaje` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `idpago` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `propietario`
--
ALTER TABLE `propietario`
  MODIFY `idpropietario` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `idpublicacion` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `registro`
--
ALTER TABLE `registro`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `residente`
--
ALTER TABLE `residente`
  MODIFY `idresidente` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  MODIFY `id_tarifa` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD CONSTRAINT `cuenta_idcuenta_administrador` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `apartamento`
--
ALTER TABLE `apartamento`
  ADD CONSTRAINT `propietario_idpropietario_apartamento` FOREIGN KEY (`idpropietario`) REFERENCES `propietario` (`idpropietario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `residente_idresidente_apartamento` FOREIGN KEY (`idresidente`) REFERENCES `residente` (`idresidente`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `mensaje`
--
ALTER TABLE `mensaje`
  ADD CONSTRAINT `fk_mensaje_cuenta` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`);

--
-- Filtros para la tabla `propietario`
--
ALTER TABLE `propietario`
  ADD CONSTRAINT `apartamento_idapartamento_propietario` FOREIGN KEY (`idapartamento`) REFERENCES `apartamento` (`idapartamento`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD CONSTRAINT `fk_publicacion_cuenta` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`);

--
-- Filtros para la tabla `registro`
--
ALTER TABLE `registro`
  ADD CONSTRAINT `fk_registro_propietario` FOREIGN KEY (`idpropietario`) REFERENCES `propietario` (`idpropietario`);

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `areacomun_idareacomun_reserva` FOREIGN KEY (`idareacomun`) REFERENCES `areacomun` (`idareacomun`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `residente_idresidente_reserva` FOREIGN KEY (`idresidente`) REFERENCES `residente` (`idresidente`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `residente`
--
ALTER TABLE `residente`
  ADD CONSTRAINT `cuenta_idcuenta_residente` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
