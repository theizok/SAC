-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 21-08-2025 a las 03:39:31
-- Versión del servidor: 8.0.43
-- Versión de PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `SAC2`
--
CREATE DATABASE IF NOT EXISTS `SAC2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `SAC2`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `idadmnistrador` bigint NOT NULL,
  `nombre` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idcuenta` bigint DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contraseña` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `documento` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL
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
  `idapartamento` bigint NOT NULL,
  `numeroapartamento` bigint DEFAULT NULL,
  `idresidente` bigint DEFAULT NULL,
  `idpropietario` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areacomun`
--

CREATE TABLE `areacomun` (
  `idareacomun` bigint NOT NULL,
  `area` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `precio` float DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areacomun`
--

INSERT INTO `areacomun` (`idareacomun`, `area`, `precio`, `descripcion`) VALUES
(1, 'Lugar de panico', 20000, 'Es una sala del panico para Isaac'),
(2, 'Gimnasio', 35000, 'Es un Gimnasio'),
(3, 'Algo', 10000, 'Algo mas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta`
--

CREATE TABLE `cuenta` (
  `idcuenta` bigint NOT NULL,
  `tipo_cuenta` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL
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
(12, 'Propietario'),
(13, 'Propietario'),
(14, 'Residente'),
(15, 'Residente'),
(16, 'Residente'),
(17, 'Residente'),
(18, 'Residente'),
(19, 'Residente'),
(20, 'Propietario'),
(21, 'Propietario'),
(22, 'Propietario'),
(23, 'Propietario'),
(24, 'Propietario'),
(25, 'Propietario'),
(26, 'Propietario'),
(27, 'Propietario'),
(28, 'Propietario'),
(29, 'Residente'),
(30, 'Propietario'),
(31, 'Propietario'),
(32, 'Propietario'),
(33, 'Propietario'),
(34, 'Propietario'),
(35, 'Residente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje`
--

CREATE TABLE `mensaje` (
  `idmensaje` bigint NOT NULL,
  `contenido` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `asunto` varchar(70) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `idcuenta` bigint DEFAULT NULL,
  `respuesta` text COLLATE utf8mb4_general_ci,
  `fecha_respuesta` datetime DEFAULT NULL,
  `idcuenta_respondido` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensaje`
--

INSERT INTO `mensaje` (`idmensaje`, `contenido`, `asunto`, `fecha`, `idcuenta`, `respuesta`, `fecha_respuesta`, `idcuenta_respondido`) VALUES
(6, 'Segundo mensaje de prueba enviado desde el front', 'Mensaje Frontend', '2025-04-04 01:25:00', NULL, NULL, NULL, NULL),
(7, 'Segundo mensaje de prueba.', 'Mensaje Frontend', '2025-04-04 01:28:00', 2, NULL, NULL, NULL),
(9, 'Contenido de prueba post perdida', 'Mensaje Post perdida', '2025-04-04 04:21:00', 2, NULL, NULL, NULL),
(10, 'Hola mundo', 'Mensaje prueba', '2025-04-09 12:51:00', 2, NULL, NULL, NULL),
(11, 'Residente felipe', 'Residente Felipe', '2025-04-09 12:53:00', 11, NULL, NULL, NULL),
(12, 'Hola mi nombre es Sergio', 'Necesito que me respondas este mensaje', '2025-08-11 13:45:00', 13, 'Te estoy respondiendo Sergio', '2025-08-11 13:46:33', NULL),
(13, 'Mensaje Numero 2', 'Respuesta 2', '2025-08-11 15:11:00', 13, NULL, NULL, NULL),
(14, 'HESOYAM', 'PERRA', '2025-08-11 16:23:00', 13, 'NOSE', '2025-08-11 16:24:39', 8),
(16, 'Mateo porque te fuiste', 'Mateo vuelve', '2025-08-11 16:50:00', 19, 'NO', '2025-08-11 16:51:18', 8),
(17, 'Estoy mandando un mensaje para ver si aun funciona la respuesta', 'Respondeme Bien', '2025-08-11 19:47:00', 19, 'Te respondo', '2025-08-11 19:48:05', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `idpago` bigint NOT NULL,
  `valor` float DEFAULT NULL,
  `idcuenta` bigint DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado_pago` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
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
(14, 200000, 2, 'Pago administracion mes: mayo', 'Administración', 'PENDENTE', NULL),
(15, 42000, 2, 'Reserva de Gimnasio — Es un Gimnasio - 20/08/2025 - tarde', 'Reserva', 'PENDENTE', NULL),
(16, 28000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 20/08/2025 - noche', 'Reserva', 'PENDENTE', NULL),
(17, 24000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 19/08/2025 - tarde', 'Reserva', 'PENDENTE', NULL),
(18, 20000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-20 - manana', 'Reserva', 'PENDIENTE', NULL),
(19, 20000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-20 - manana', 'Reserva', 'PENDIENTE', NULL),
(20, 20000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-20 - manana', 'Reserva', 'PENDIENTE', NULL),
(21, 200000, 2, 'Pago administración mes: enero', 'Administración', 'PENDIENTE', '2025-08-19 11:51:51'),
(22, 24000, NULL, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-27 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 18:56:04'),
(23, 20000, NULL, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-27 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 18:56:17'),
(24, 35000, 2, 'Reserva de Gimnasio — Es un Gimnasio - 2025-08-27 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 19:09:31'),
(25, 24000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-27 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 19:27:39'),
(26, 10000, 2, 'Reserva de Algo — Algo mas - 2025-08-22 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 19:32:22'),
(27, 200000, 2, 'Pago administración mes: enero', 'Administración', 'PENDIENTE', '2025-08-20 19:34:06'),
(28, 35000, 2, 'Reserva de Gimnasio — Es un Gimnasio - 2025-08-26 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 19:34:21'),
(29, 24000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-27 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 19:49:31'),
(30, 20000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-22 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 19:52:39'),
(31, 200000, 2, 'Pago administración mes: enero', 'Administración', 'PENDIENTE', '2025-08-20 19:52:54'),
(32, 200000, 34, 'Pago administración mes: enero', 'Administración', 'PENDIENTE', '2025-08-20 19:57:44'),
(33, 28000, 34, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-28 - noche', 'Reserva', 'PENDIENTE', '2025-08-20 19:58:02'),
(34, 10000, 2, 'Reserva de Algo — Algo mas - 2025-08-26 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 19:59:01'),
(35, 49000, 2, 'Reserva de Gimnasio — Es un Gimnasio - 2025-08-28 - noche', 'Reserva', 'PENDIENTE', '2025-08-20 20:15:44'),
(36, 200000, 34, 'Pago administración mes: enero', 'Administración', 'PENDIENTE', '2025-08-20 20:16:27'),
(37, 42000, 34, 'Reserva de Gimnasio — Es un Gimnasio - 2025-08-27 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 20:16:52'),
(38, 42000, 34, 'Reserva de Gimnasio — Es un Gimnasio - 2025-08-26 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 20:21:54'),
(39, 24000, 34, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-27 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 21:00:54'),
(40, 42000, 34, 'Reserva de Gimnasio — Es un Gimnasio - 2025-08-27 - tarde', 'Reserva', 'PENDIENTE', '2025-08-20 21:03:09'),
(41, 200000, 34, 'Pago administración mes: abril', 'Administración', 'PENDIENTE', '2025-08-20 21:08:26'),
(42, 200000, 19, 'Pago administración mes: julio', 'Administración', 'PENDIENTE', '2025-08-20 21:09:13'),
(43, 10000, 19, 'Reserva de Algo — Algo mas - 2025-08-31 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 21:09:29'),
(44, 28000, 34, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-09-24 - noche', 'Reserva', 'PENDIENTE', '2025-08-20 21:10:36'),
(45, 49000, 34, 'Reserva de Gimnasio — Es un Gimnasio - 2025-10-29 - noche', 'Reserva', 'PENDIENTE', '2025-08-20 21:33:04'),
(46, 20000, 2, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-27 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 22:30:15'),
(47, 20000, 34, 'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-22 - manana', 'Reserva', 'PENDIENTE', '2025-08-20 22:30:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propietario`
--

CREATE TABLE `propietario` (
  `idpropietario` bigint NOT NULL,
  `nombre` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `documento` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idapartamento` bigint DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contraseña` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idcuenta` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `propietario`
--

INSERT INTO `propietario` (`idpropietario`, `nombre`, `documento`, `idapartamento`, `correo`, `contraseña`, `telefono`, `idcuenta`) VALUES
(17, 'Mariano1', '1231231235', NULL, 'Marinillo22@gmail.com', '$2a$10$SUsKvEloKWv3lmzYoFKSjuKNtXHxX/xRZWFnGAhY7.Ei8Tf2XPWga', '543141355', 34);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `idpublicacion` bigint NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `contenido` varchar(270) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `titulo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idcuenta` bigint DEFAULT NULL
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
  `id` bigint NOT NULL,
  `idpago` bigint DEFAULT NULL,
  `valor` float DEFAULT NULL,
  `idadministrador` bigint DEFAULT NULL,
  `idresidente` bigint DEFAULT NULL,
  `idmetododepago` bigint DEFAULT NULL,
  `idpropietario` bigint DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `detalle` text COLLATE utf8mb4_general_ci
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
  `idreserva` bigint NOT NULL,
  `tiempo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `idareacomun` bigint DEFAULT NULL,
  `idresidente` bigint DEFAULT NULL,
  `idpropietario` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`idreserva`, `tiempo`, `fecha`, `idareacomun`, `idresidente`, `idpropietario`) VALUES
(3, 'manana', '2025-08-20 09:00:00', 1, 8, NULL),
(4, 'manana', '2025-08-20 09:00:00', 1, 8, NULL),
(5, 'manana', '2025-08-20 09:00:00', 1, 8, NULL),
(13, 'manana', '2025-08-22 09:00:00', 1, 8, NULL),
(15, 'manana', '2025-08-26 09:00:00', 3, 8, NULL),
(16, 'noche', '2025-08-28 19:00:00', 2, 8, NULL),
(19, 'tarde', '2025-08-27 15:00:00', 1, NULL, 17),
(20, 'tarde', '2025-08-27 15:00:00', 2, NULL, 17),
(21, 'manana', '2025-08-31 09:00:00', 3, 16, NULL),
(22, 'noche', '2025-09-24 19:00:00', 1, NULL, 17),
(23, 'noche', '2025-10-29 19:00:00', 2, NULL, 17),
(24, 'manana', '2025-08-27 09:00:00', 1, 8, NULL),
(25, 'manana', '2025-08-22 09:00:00', 1, NULL, 17);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `residente`
--

CREATE TABLE `residente` (
  `idresidente` bigint NOT NULL,
  `nombre` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `edad` bigint DEFAULT NULL,
  `documento` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idcuenta` bigint DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contraseña` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_apartamento` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `residente`
--

INSERT INTO `residente` (`idresidente`, `nombre`, `edad`, `documento`, `idcuenta`, `correo`, `contraseña`, `telefono`, `id_apartamento`) VALUES
(8, 'Isaac Ramirez', 19, '12333213', 2, 'login@gmail.com', '$2a$10$XCrsgdwFkOX.quqWPrQuH.mN.p/0lqxSjwy4U2VeojUCt4zSpjkpa', '777777', NULL),
(16, 'AlejandriaA', 0, '31312312', 19, 'Alejandria16@gmail.com', '$2a$10$X1luCHQmD.HP73Pr/SUJiOM9VlynzBLFRGyTIGRpWPiHpfKQJWl72', '1231231231', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa`
--

CREATE TABLE `tarifa` (
  `id_tarifa` bigint NOT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
  ADD KEY `fk_mensaje_cuenta` (`idcuenta`),
  ADD KEY `fk_mensaje_respondido` (`idcuenta_respondido`);

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
  MODIFY `idadmnistrador` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `apartamento`
--
ALTER TABLE `apartamento`
  MODIFY `idapartamento` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `areacomun`
--
ALTER TABLE `areacomun`
  MODIFY `idareacomun` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cuenta`
--
ALTER TABLE `cuenta`
  MODIFY `idcuenta` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `mensaje`
--
ALTER TABLE `mensaje`
  MODIFY `idmensaje` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `idpago` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `propietario`
--
ALTER TABLE `propietario`
  MODIFY `idpropietario` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `idpublicacion` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `registro`
--
ALTER TABLE `registro`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `idreserva` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `residente`
--
ALTER TABLE `residente`
  MODIFY `idresidente` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  MODIFY `id_tarifa` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD CONSTRAINT `cuenta_idcuenta_administrador` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`);

--
-- Filtros para la tabla `apartamento`
--
ALTER TABLE `apartamento`
  ADD CONSTRAINT `propietario_idpropietario_apartamento` FOREIGN KEY (`idpropietario`) REFERENCES `propietario` (`idpropietario`),
  ADD CONSTRAINT `residente_idresidente_apartamento` FOREIGN KEY (`idresidente`) REFERENCES `residente` (`idresidente`);

--
-- Filtros para la tabla `mensaje`
--
ALTER TABLE `mensaje`
  ADD CONSTRAINT `fk_mensaje_cuenta` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`),
  ADD CONSTRAINT `fk_mensaje_respondido` FOREIGN KEY (`idcuenta_respondido`) REFERENCES `cuenta` (`idcuenta`);

--
-- Filtros para la tabla `propietario`
--
ALTER TABLE `propietario`
  ADD CONSTRAINT `apartamento_idapartamento_propietario` FOREIGN KEY (`idapartamento`) REFERENCES `apartamento` (`idapartamento`);

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
  ADD CONSTRAINT `areacomun_idareacomun_reserva` FOREIGN KEY (`idareacomun`) REFERENCES `areacomun` (`idareacomun`),
  ADD CONSTRAINT `residente_idresidente_reserva` FOREIGN KEY (`idresidente`) REFERENCES `residente` (`idresidente`);

--
-- Filtros para la tabla `residente`
--
ALTER TABLE `residente`
  ADD CONSTRAINT `cuenta_idcuenta_residente` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
