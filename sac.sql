-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: sac2
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `idadmnistrador` bigint(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `telefono` varchar(100) DEFAULT NULL,
  `documento` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idadmnistrador`),
  KEY `cuenta_idcuenta_administrador` (`idcuenta`),
  CONSTRAINT `cuenta_idcuenta_administrador` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
INSERT INTO `administrador` VALUES (4,'Administrador',8,'administrador@gmail.com','$2a$10$Kp4CfH3DgYfDBVIjJylc6.yyozj4Gk6Ptxs3W9eLPlfq3dcxLF5re','300235123',NULL);
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apartamento`
--

DROP TABLE IF EXISTS `apartamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apartamento` (
  `idapartamento` bigint(11) NOT NULL AUTO_INCREMENT,
  `numeroapartamento` bigint(11) DEFAULT NULL,
  `idresidente` bigint(11) DEFAULT NULL,
  `idpropietario` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`idapartamento`),
  KEY `residente_idresidente_apartamento` (`idresidente`),
  KEY `propietario_idpropietario_apartamento` (`idpropietario`),
  CONSTRAINT `propietario_idpropietario_apartamento` FOREIGN KEY (`idpropietario`) REFERENCES `propietario` (`idpropietario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `residente_idresidente_apartamento` FOREIGN KEY (`idresidente`) REFERENCES `residente` (`idresidente`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apartamento`
--

LOCK TABLES `apartamento` WRITE;
/*!40000 ALTER TABLE `apartamento` DISABLE KEYS */;
/*!40000 ALTER TABLE `apartamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areacomun`
--

DROP TABLE IF EXISTS `areacomun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areacomun` (
  `idareacomun` bigint(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(40) DEFAULT NULL,
  `precio` float DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idareacomun`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areacomun`
--

LOCK TABLES `areacomun` WRITE;
/*!40000 ALTER TABLE `areacomun` DISABLE KEYS */;
INSERT INTO `areacomun` VALUES (1,'Lugar de panico',20000,'Es una sala del panico para Isaac'),(2,'Gimnasio',35000,'Es un Gimnasio');
/*!40000 ALTER TABLE `areacomun` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuenta`
--

DROP TABLE IF EXISTS `cuenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuenta` (
  `idcuenta` bigint(11) NOT NULL AUTO_INCREMENT,
  `tipo_cuenta` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idcuenta`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuenta`
--

LOCK TABLES `cuenta` WRITE;
/*!40000 ALTER TABLE `cuenta` DISABLE KEYS */;
INSERT INTO `cuenta` VALUES (1,NULL),(2,'Residente'),(3,'Propietario'),(4,'Propietario'),(5,'Propietario'),(6,'Propietario'),(7,'Residente'),(8,'Administrador'),(9,'Residente'),(10,'Residente'),(11,'Residente'),(12,'Propietario'),(13,'Propietario'),(14,'Residente'),(15,'Residente'),(16,'Residente'),(17,'Residente'),(18,'Residente'),(19,'Residente');
/*!40000 ALTER TABLE `cuenta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensaje`
--

DROP TABLE IF EXISTS `mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensaje` (
  `idmensaje` bigint(11) NOT NULL AUTO_INCREMENT,
  `contenido` varchar(250) DEFAULT NULL,
  `asunto` varchar(70) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `respuesta` text DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  `idcuenta_respondido` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`idmensaje`),
  KEY `fk_mensaje_cuenta` (`idcuenta`),
  KEY `fk_mensaje_respondido` (`idcuenta_respondido`),
  CONSTRAINT `fk_mensaje_cuenta` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`),
  CONSTRAINT `fk_mensaje_respondido` FOREIGN KEY (`idcuenta_respondido`) REFERENCES `cuenta` (`idcuenta`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensaje`
--

LOCK TABLES `mensaje` WRITE;
/*!40000 ALTER TABLE `mensaje` DISABLE KEYS */;
INSERT INTO `mensaje` VALUES (6,'Segundo mensaje de prueba enviado desde el front','Mensaje Frontend','2025-04-04 01:25:00',NULL,NULL,NULL,NULL),(7,'Segundo mensaje de prueba.','Mensaje Frontend','2025-04-04 01:28:00',2,NULL,NULL,NULL),(9,'Contenido de prueba post perdida','Mensaje Post perdida','2025-04-04 04:21:00',2,NULL,NULL,NULL),(10,'Hola mundo','Mensaje prueba','2025-04-09 12:51:00',2,NULL,NULL,NULL),(11,'Residente felipe','Residente Felipe','2025-04-09 12:53:00',11,NULL,NULL,NULL),(12,'Hola mi nombre es Sergio','Necesito que me respondas este mensaje','2025-08-11 13:45:00',13,'Te estoy respondiendo Sergio','2025-08-11 13:46:33',NULL),(13,'Mensaje Numero 2','Respuesta 2','2025-08-11 15:11:00',13,NULL,NULL,NULL),(14,'HESOYAM','PERRA','2025-08-11 16:23:00',13,'NOSE','2025-08-11 16:24:39',8),(16,'Mateo porque te fuiste','Mateo vuelve','2025-08-11 16:50:00',19,'NO','2025-08-11 16:51:18',8),(17,'Estoy mandando un mensaje para ver si aun funciona la respuesta','Respondeme Bien','2025-08-11 19:47:00',19,'Te respondo','2025-08-11 19:48:05',8);
/*!40000 ALTER TABLE `mensaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `idpago` bigint(11) NOT NULL AUTO_INCREMENT,
  `valor` float DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `estado_pago` varchar(20) NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  PRIMARY KEY (`idpago`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,100000,NULL,NULL,NULL,'',NULL),(3,100000,NULL,NULL,NULL,'',NULL),(6,200000,2,'Pago administracion mes: abril','Administración','PENDENTE',NULL),(7,200000,2,'Pago administracion mes: enero','Administración','PENDENTE',NULL),(8,200000,2,'Pago administracion mes: marzo','Administración','PENDENTE',NULL),(9,200000,2,'Pago administracion mes: febrero','Administración','PENDENTE',NULL),(10,200000,2,'Pago administracion mes: noviembre','Administración','PENDENTE',NULL),(11,200000,2,'Pago administracion mes: noviembre','Administración','PENDENTE',NULL),(12,200000,2,'Pago administracion mes: enero','Administración','PENDENTE',NULL),(13,200000,2,'Pago administracion mes: mayo','Administración','PENDENTE',NULL),(14,200000,2,'Pago administracion mes: mayo','Administración','PENDENTE',NULL),(15,42000,2,'Reserva de Gimnasio — Es un Gimnasio - 20/08/2025 - tarde','Reserva','PENDENTE',NULL),(16,28000,2,'Reserva de Lugar de panico — Es una sala del panico para Isaac - 20/08/2025 - noche','Reserva','PENDENTE',NULL),(17,24000,2,'Reserva de Lugar de panico — Es una sala del panico para Isaac - 19/08/2025 - tarde','Reserva','PENDENTE',NULL),(18,20000,2,'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-20 - manana','Reserva','PENDIENTE',NULL),(19,20000,2,'Reserva de Lugar de panico — Es una sala del panico para Isaac - 2025-08-20 - manana','Reserva','PENDIENTE',NULL);
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propietario`
--

DROP TABLE IF EXISTS `propietario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `propietario` (
  `idpropietario` bigint(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) DEFAULT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `idapartamento` bigint(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `telefono` varchar(10) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`idpropietario`),
  KEY `apartamento_idapartamento_propietario` (`idapartamento`),
  CONSTRAINT `apartamento_idapartamento_propietario` FOREIGN KEY (`idapartamento`) REFERENCES `apartamento` (`idapartamento`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propietario`
--

LOCK TABLES `propietario` WRITE;
/*!40000 ALTER TABLE `propietario` DISABLE KEYS */;
/*!40000 ALTER TABLE `propietario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacion`
--

DROP TABLE IF EXISTS `publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicacion` (
  `idpublicacion` bigint(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT NULL,
  `contenido` varchar(270) DEFAULT NULL,
  `titulo` varchar(50) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`idpublicacion`),
  KEY `fk_publicacion_cuenta` (`idcuenta`),
  CONSTRAINT `fk_publicacion_cuenta` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion`
--

LOCK TABLES `publicacion` WRITE;
/*!40000 ALTER TABLE `publicacion` DISABLE KEYS */;
INSERT INTO `publicacion` VALUES (12,'2025-04-01 23:05:00','Publicación creada desde el frontend por un Residente','Publicacion creada desde el frontend (Residente)',2),(14,'2025-04-09 00:05:00','Publicacion creada por el administrador','Admin Publication',8);
/*!40000 ALTER TABLE `publicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro`
--

DROP TABLE IF EXISTS `registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `idpago` bigint(20) DEFAULT NULL,
  `valor` float DEFAULT NULL,
  `idadministrador` bigint(20) DEFAULT NULL,
  `idresidente` bigint(20) DEFAULT NULL,
  `idmetododepago` bigint(20) DEFAULT NULL,
  `idpropietario` bigint(20) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario` varchar(100) DEFAULT NULL,
  `detalle` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_registro_residente` (`idresidente`),
  KEY `fk_registro_propietario` (`idpropietario`),
  CONSTRAINT `fk_registro_propietario` FOREIGN KEY (`idpropietario`) REFERENCES `propietario` (`idpropietario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro`
--

LOCK TABLES `registro` WRITE;
/*!40000 ALTER TABLE `registro` DISABLE KEYS */;
INSERT INTO `registro` VALUES (1,3,100000,NULL,2,NULL,NULL,'2025-03-28 18:41:44','root@localhost','Pago registrado con ID: 3');
/*!40000 ALTER TABLE `registro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `idreserva` bigint(20) NOT NULL AUTO_INCREMENT,
  `tiempo` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `idareacomun` bigint(11) DEFAULT NULL,
  `idresidente` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`idreserva`),
  KEY `areacomun_idareacomun_reserva` (`idareacomun`),
  KEY `residente_idresidente_reserva` (`idresidente`),
  CONSTRAINT `areacomun_idareacomun_reserva` FOREIGN KEY (`idareacomun`) REFERENCES `areacomun` (`idareacomun`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `residente_idresidente_reserva` FOREIGN KEY (`idresidente`) REFERENCES `residente` (`idresidente`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (3,'manana','2025-08-20 09:00:00',1,8),(4,'manana','2025-08-20 09:00:00',1,8);
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residente`
--

DROP TABLE IF EXISTS `residente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residente` (
  `idresidente` bigint(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) DEFAULT NULL,
  `edad` bigint(11) DEFAULT NULL,
  `documento` varchar(20) DEFAULT NULL,
  `idcuenta` bigint(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `telefono` varchar(10) DEFAULT NULL,
  `id_apartamento` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`idresidente`),
  KEY `cuenta_idcuenta_residente` (`idcuenta`),
  CONSTRAINT `cuenta_idcuenta_residente` FOREIGN KEY (`idcuenta`) REFERENCES `cuenta` (`idcuenta`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residente`
--

LOCK TABLES `residente` WRITE;
/*!40000 ALTER TABLE `residente` DISABLE KEYS */;
INSERT INTO `residente` VALUES (8,'Isaac Ramirez',19,'12333213',2,'login@gmail.com','$2a$10$XCrsgdwFkOX.quqWPrQuH.mN.p/0lqxSjwy4U2VeojUCt4zSpjkpa','777777',NULL),(16,'AlejandriaA',0,'31312311',19,'Alejandria15@gmail.com','$2a$10$X1luCHQmD.HP73Pr/SUJiOM9VlynzBLFRGyTIGRpWPiHpfKQJWl72','1231231232',NULL);
/*!40000 ALTER TABLE `residente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifa`
--

DROP TABLE IF EXISTS `tarifa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifa` (
  `id_tarifa` bigint(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(50) DEFAULT NULL,
  `valor` float DEFAULT NULL,
  PRIMARY KEY (`id_tarifa`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifa`
--

LOCK TABLES `tarifa` WRITE;
/*!40000 ALTER TABLE `tarifa` DISABLE KEYS */;
INSERT INTO `tarifa` VALUES (2,'Administración',200000);
/*!40000 ALTER TABLE `tarifa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sac2'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-13 16:27:14
