-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-06-2024 a las 01:38:58
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `laboratorio2`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `descripcion`) VALUES
(1, 'ANALGESICOS'),
(2, 'ANTIBIOTICOS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `concentracion`
--

CREATE TABLE `concentracion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `concentracion`
--

INSERT INTO `concentracion` (`id`, `descripcion`) VALUES
(1, '0.3 ML'),
(2, '0.5 ML'),
(3, '1 ML'),
(9, '100 MG'),
(6, '125 MG'),
(4, '250 MG'),
(10, '5 ML'),
(5, '500 MG');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `familia`
--

CREATE TABLE `familia` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `familia`
--

INSERT INTO `familia` (`id`, `descripcion`) VALUES
(2, 'ANTI-INFECCIOSOS'),
(1, 'SISTEMA NERVIOSO CENTRAL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formafarmaceutica`
--

CREATE TABLE `formafarmaceutica` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `formafarmaceutica`
--

INSERT INTO `formafarmaceutica` (`id`, `descripcion`) VALUES
(1, 'CAPSULA'),
(3, 'INYECCION'),
(4, 'JARABE'),
(2, 'PASTILLA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lado`
--

CREATE TABLE `lado` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lado`
--

INSERT INTO `lado` (`id`, `descripcion`) VALUES
(1, 'DERECHO'),
(3, 'DERECHO E IZQUIERDO'),
(7, 'DERECHO,IZQUIERDO,FRENTE Y DORSO'),
(5, 'DORSO'),
(4, 'FRENTE'),
(6, 'FRENTE Y DORSO'),
(2, 'IZQUIERDO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento`
--

CREATE TABLE `medicamento` (
  `id` int(11) NOT NULL,
  `nombre_generico` varchar(255) NOT NULL,
  `nombre_comercial` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `familia_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamento`
--

INSERT INTO `medicamento` (`id`, `nombre_generico`, `nombre_comercial`, `activo`, `familia_id`, `categoria_id`) VALUES
(1, 'IBUPROFENO', NULL, 1, 1, 1),
(2, 'AMOXICILINA', NULL, 1, 2, 2),
(3, 'PARACETAMOL', NULL, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento_concentracion`
--

CREATE TABLE `medicamento_concentracion` (
  `medicamento_id` int(11) NOT NULL,
  `concentracion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamento_concentracion`
--

INSERT INTO `medicamento_concentracion` (`medicamento_id`, `concentracion_id`) VALUES
(1, 4),
(1, 5),
(1, 6),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(3, 2),
(3, 3),
(3, 4),
(3, 5),
(3, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento_formafarmaceutica`
--

CREATE TABLE `medicamento_formafarmaceutica` (
  `medicamento_id` int(11) NOT NULL,
  `formaFarmaceutica_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamento_formafarmaceutica`
--

INSERT INTO `medicamento_formafarmaceutica` (`medicamento_id`, `formaFarmaceutica_id`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento_presentacion`
--

CREATE TABLE `medicamento_presentacion` (
  `medicamento_id` int(11) NOT NULL,
  `presentacion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamento_presentacion`
--

INSERT INTO `medicamento_presentacion` (`medicamento_id`, `presentacion_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(3, 1),
(3, 2),
(3, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obrasocial`
--

CREATE TABLE `obrasocial` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `obrasocial`
--

INSERT INTO `obrasocial` (`id`, `nombre`, `estado`) VALUES
(1, 'FEMESA', 1),
(2, 'OSDE', 1),
(3, 'RED', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obrasocial_plan`
--

CREATE TABLE `obrasocial_plan` (
  `obraSocial_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `obrasocial_plan`
--

INSERT INTO `obrasocial_plan` (`obraSocial_id`, `plan_id`) VALUES
(1, 5),
(1, 6),
(1, 7),
(2, 5),
(2, 6),
(2, 7),
(3, 5),
(3, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `documento` bigint(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo` varchar(50) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `alergia` varchar(150) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`id`, `nombre`, `apellido`, `documento`, `fecha_nacimiento`, `sexo`, `telefono`, `alergia`, `estado`) VALUES
(1, 'GUSTAVO', 'CERATI', 20456456, '1945-05-03', 'MASCULINO', '2664098765', 'AL REGGAETON', 1),
(99, 'GABRIEL', 'TORREZ', 36018434, '1993-03-22', 'MASCULINO', '02664325477', 'LALALALA', 1),
(100, 'GERMAN', 'TORREZ', 36018435, '1993-03-22', 'MASCULINO', '', '', 1),
(115, 'LOPEZ', 'MARCELA', 1234567, '2002-11-12', 'FEMENINO', '2664050550', 'NINGUNA', 1),
(116, 'RUBEN', 'GONZALES', 40000008, '2024-05-28', 'MASCULINO', '2664332211', '', 1),
(117, 'HUGO', 'TORREZ', 13721055, '1959-12-05', 'MASCULINO', '', '', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_obrasocial`
--

CREATE TABLE `paciente_obrasocial` (
  `paciente_id` int(11) NOT NULL,
  `obra_social_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente_obrasocial`
--

INSERT INTO `paciente_obrasocial` (`paciente_id`, `obra_social_id`) VALUES
(1, 1),
(99, 2),
(115, 2),
(116, 3),
(117, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_plan`
--

CREATE TABLE `paciente_plan` (
  `paciente_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente_plan`
--

INSERT INTO `paciente_plan` (`paciente_id`, `plan_id`) VALUES
(1, 6),
(99, 7),
(115, 7),
(116, 5),
(117, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `resetPasswordToken` varchar(255) NOT NULL,
  `resetPasswordExpires` datetime NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `resetPasswordToken`, `resetPasswordExpires`, `createdAt`) VALUES
(40, 'GABRIELTORREZ9303@GMAIL.COM', '3116ec9e109152d28e1215c11dbe8f440f2e55d8', '2024-06-26 19:34:19', '2024-06-26 21:34:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan`
--

CREATE TABLE `plan` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan`
--

INSERT INTO `plan` (`id`, `nombre`) VALUES
(5, 'BASE'),
(6, 'COMPLETO'),
(7, 'COMPLETO PREMIUM');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prescripcion`
--

CREATE TABLE `prescripcion` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `vigencia` date NOT NULL,
  `diagnostico` varchar(500) NOT NULL,
  `prof_id_refeps` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prescripcion_medicamento`
--

CREATE TABLE `prescripcion_medicamento` (
  `prescripcion_id` int(11) NOT NULL,
  `medicamento_id` int(11) NOT NULL,
  `id_forma` int(11) NOT NULL,
  `id_presentacion` int(11) NOT NULL,
  `id_concentracion` int(11) NOT NULL,
  `administracion` varchar(500) NOT NULL,
  `duracion` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prescripcion_prestacion`
--

CREATE TABLE `prescripcion_prestacion` (
  `prescripcion_id` int(11) NOT NULL,
  `prestacion_id` int(11) NOT NULL,
  `lado_id` int(11) DEFAULT NULL,
  `indicacion` varchar(500) NOT NULL,
  `justificacion` varchar(500) NOT NULL,
  `conclucionFinal` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presentacion`
--

CREATE TABLE `presentacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `presentacion`
--

INSERT INTO `presentacion` (`id`, `descripcion`) VALUES
(4, '1 UNIDAD'),
(1, '10 UNIDADES'),
(2, '15 UNIDADES'),
(3, '30 UNIDADES');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestacion`
--

CREATE TABLE `prestacion` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `lado_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestacion`
--

INSERT INTO `prestacion` (`id`, `descripcion`, `estado`, `lado_id`) VALUES
(1, 'RADIOGRAFIA TORAX', 1, NULL),
(2, 'RADIOGRAFIA RODILLA', 1, NULL),
(3, 'ECOGRAFIA ABDOMINAL', 1, NULL),
(4, 'ECOGRAFIA HOMBRO ', 1, 7),
(5, 'EXAMEN IDENTIFICAR GRUPO SANGUINEO ', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesional`
--

CREATE TABLE `profesional` (
  `usuario_id` int(11) NOT NULL,
  `profesion` varchar(100) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `matricula` varchar(50) DEFAULT NULL,
  `domicilio` varchar(150) DEFAULT NULL,
  `caducidad` date NOT NULL,
  `id_refeps` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profesional`
--

INSERT INTO `profesional` (`usuario_id`, `profesion`, `especialidad`, `matricula`, `domicilio`, `caducidad`, `id_refeps`) VALUES
(9, 'MEDICO', 'GENERALISTA', 'M123', 'CORDOBA, VILLA MARIA. AVSAN MARTIN 455.', '2025-06-11', 1235),
(11, 'DOCTORA', 'PEDIATRIA', 'M1234', 'SAN LUIS CAPITAL, AV. SUCRE 870', '2025-06-12', 1234),
(12, 'MEDICO', 'GENERALISTA', 'M1243', 'NEUQUEN, BARILOCHE. BELGRANO 456.', '2023-06-07', 1236);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `rol_descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `rol_descripcion`) VALUES
(1, 'ADMINISTRADOR'),
(2, 'PROFESIONAL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('vMC8aeeVLwKHesE0JzgKX_KEWXTjvF-v', 1719448293, '{\"cookie\":{\"originalMaxAge\":3600000,\"expires\":\"2024-06-27T00:31:32.380Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":10,\"documento\":\"36018434\",\"roles\":[{\"id\":1,\"rol_descripcion\":\"ADMINISTRADOR\"}],\"datosProfesional\":{\"profesional\":\"caducado\"}}}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(55) NOT NULL,
  `apellido` varchar(55) NOT NULL,
  `documento` varchar(20) NOT NULL,
  `password` varchar(70) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `email` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido`, `documento`, `password`, `estado`, `email`) VALUES
(9, 'CARLOS', 'GONZALES', '12345780', '$2b$10$pubNYX8Z5y/OIuYj5aLisOn.Sc2PvutK9SGqJcMXQ6AaajaUM/ZkO', 0, 'EJEMPLO3@GMAIL.COM'),
(10, 'GABRIEL', 'TORREZ', '36018434', '$2b$10$Q9RFNyQqEjZb52OvW8y/sePXpfjqWLUiIhVU9grgCS1YD46hwDGMW', 1, 'GABRIELTORREZ9303@GMAIL.COM'),
(11, 'MARIA', 'GOMEZ', '12345678', '$2b$10$Bkc/FGFWQXj1LvgyKm3qbu6fa/zjrBHGXa.SkRUk5Xg4DVv9OWPxO', 1, 'GOMEZ@GMAIL.COM'),
(12, 'JUAN', 'LOPEZ', '123456789', '$2b$10$8dblOdHwVDGgRM0kKRWeo.aigaaZTopg8kFvm8ELWd8b/O2PdLm2G', 1, 'JUAN@GMAIL.COM');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_rol`
--

CREATE TABLE `usuario_rol` (
  `usuario_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_rol`
--

INSERT INTO `usuario_rol` (`usuario_id`, `rol_id`) VALUES
(9, 2),
(10, 1),
(11, 1),
(11, 2),
(12, 1),
(12, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `concentracion`
--
ALTER TABLE `concentracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `familia`
--
ALTER TABLE `familia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `formafarmaceutica`
--
ALTER TABLE `formafarmaceutica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `lado`
--
ALTER TABLE `lado`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_generico` (`nombre_generico`),
  ADD KEY `familia_id` (`familia_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `medicamento_concentracion`
--
ALTER TABLE `medicamento_concentracion`
  ADD PRIMARY KEY (`medicamento_id`,`concentracion_id`),
  ADD KEY `concentracion_id` (`concentracion_id`);

--
-- Indices de la tabla `medicamento_formafarmaceutica`
--
ALTER TABLE `medicamento_formafarmaceutica`
  ADD PRIMARY KEY (`medicamento_id`,`formaFarmaceutica_id`),
  ADD KEY `formaFarmaceutica_id` (`formaFarmaceutica_id`);

--
-- Indices de la tabla `medicamento_presentacion`
--
ALTER TABLE `medicamento_presentacion`
  ADD PRIMARY KEY (`medicamento_id`,`presentacion_id`),
  ADD KEY `presentacion_id` (`presentacion_id`);

--
-- Indices de la tabla `obrasocial`
--
ALTER TABLE `obrasocial`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `obrasocial_plan`
--
ALTER TABLE `obrasocial_plan`
  ADD PRIMARY KEY (`obraSocial_id`,`plan_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documento` (`documento`);

--
-- Indices de la tabla `paciente_obrasocial`
--
ALTER TABLE `paciente_obrasocial`
  ADD PRIMARY KEY (`paciente_id`,`obra_social_id`),
  ADD KEY `obra_social_id` (`obra_social_id`);

--
-- Indices de la tabla `paciente_plan`
--
ALTER TABLE `paciente_plan`
  ADD PRIMARY KEY (`paciente_id`,`plan_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `plan`
--
ALTER TABLE `plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `prescripcion`
--
ALTER TABLE `prescripcion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prof_id_refeps` (`prof_id_refeps`),
  ADD KEY `paciente_id` (`paciente_id`);

--
-- Indices de la tabla `prescripcion_medicamento`
--
ALTER TABLE `prescripcion_medicamento`
  ADD PRIMARY KEY (`prescripcion_id`,`medicamento_id`,`id_forma`,`id_presentacion`,`id_concentracion`),
  ADD KEY `medicamento_id` (`medicamento_id`),
  ADD KEY `id_forma` (`id_forma`),
  ADD KEY `id_presentacion` (`id_presentacion`),
  ADD KEY `id_concentracion` (`id_concentracion`);

--
-- Indices de la tabla `prescripcion_prestacion`
--
ALTER TABLE `prescripcion_prestacion`
  ADD PRIMARY KEY (`prescripcion_id`,`prestacion_id`),
  ADD KEY `prestacion_id` (`prestacion_id`),
  ADD KEY `lado_id` (`lado_id`);

--
-- Indices de la tabla `presentacion`
--
ALTER TABLE `presentacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`);

--
-- Indices de la tabla `prestacion`
--
ALTER TABLE `prestacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `descripcion` (`descripcion`),
  ADD KEY `lado_id` (`lado_id`);

--
-- Indices de la tabla `profesional`
--
ALTER TABLE `profesional`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `id_refeps` (`id_refeps`),
  ADD UNIQUE KEY `matricula` (`matricula`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documento` (`documento`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD PRIMARY KEY (`usuario_id`,`rol_id`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `concentracion`
--
ALTER TABLE `concentracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `familia`
--
ALTER TABLE `familia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `formafarmaceutica`
--
ALTER TABLE `formafarmaceutica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `lado`
--
ALTER TABLE `lado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `obrasocial`
--
ALTER TABLE `obrasocial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;

--
-- AUTO_INCREMENT de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `plan`
--
ALTER TABLE `plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `prescripcion`
--
ALTER TABLE `prescripcion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de la tabla `presentacion`
--
ALTER TABLE `presentacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `prestacion`
--
ALTER TABLE `prestacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `medicamento`
--
ALTER TABLE `medicamento`
  ADD CONSTRAINT `medicamento_ibfk_1` FOREIGN KEY (`familia_id`) REFERENCES `familia` (`id`),
  ADD CONSTRAINT `medicamento_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`);

--
-- Filtros para la tabla `medicamento_concentracion`
--
ALTER TABLE `medicamento_concentracion`
  ADD CONSTRAINT `medicamento_concentracion_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamento` (`id`),
  ADD CONSTRAINT `medicamento_concentracion_ibfk_2` FOREIGN KEY (`concentracion_id`) REFERENCES `concentracion` (`id`);

--
-- Filtros para la tabla `medicamento_formafarmaceutica`
--
ALTER TABLE `medicamento_formafarmaceutica`
  ADD CONSTRAINT `medicamento_formafarmaceutica_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamento` (`id`),
  ADD CONSTRAINT `medicamento_formafarmaceutica_ibfk_2` FOREIGN KEY (`formaFarmaceutica_id`) REFERENCES `formafarmaceutica` (`id`);

--
-- Filtros para la tabla `medicamento_presentacion`
--
ALTER TABLE `medicamento_presentacion`
  ADD CONSTRAINT `medicamento_presentacion_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamento` (`id`),
  ADD CONSTRAINT `medicamento_presentacion_ibfk_2` FOREIGN KEY (`presentacion_id`) REFERENCES `presentacion` (`id`);

--
-- Filtros para la tabla `obrasocial_plan`
--
ALTER TABLE `obrasocial_plan`
  ADD CONSTRAINT `obrasocial_plan_ibfk_1` FOREIGN KEY (`obraSocial_id`) REFERENCES `obrasocial` (`id`),
  ADD CONSTRAINT `obrasocial_plan_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plan` (`id`);

--
-- Filtros para la tabla `paciente_obrasocial`
--
ALTER TABLE `paciente_obrasocial`
  ADD CONSTRAINT `paciente_obrasocial_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id`),
  ADD CONSTRAINT `paciente_obrasocial_ibfk_2` FOREIGN KEY (`obra_social_id`) REFERENCES `obrasocial` (`id`);

--
-- Filtros para la tabla `paciente_plan`
--
ALTER TABLE `paciente_plan`
  ADD CONSTRAINT `paciente_plan_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id`),
  ADD CONSTRAINT `paciente_plan_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plan` (`id`);

--
-- Filtros para la tabla `prescripcion`
--
ALTER TABLE `prescripcion`
  ADD CONSTRAINT `prescripcion_ibfk_1` FOREIGN KEY (`prof_id_refeps`) REFERENCES `profesional` (`id_refeps`),
  ADD CONSTRAINT `prescripcion_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id`);

--
-- Filtros para la tabla `prescripcion_medicamento`
--
ALTER TABLE `prescripcion_medicamento`
  ADD CONSTRAINT `prescripcion_medicamento_ibfk_1` FOREIGN KEY (`prescripcion_id`) REFERENCES `prescripcion` (`id`),
  ADD CONSTRAINT `prescripcion_medicamento_ibfk_2` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamento` (`id`),
  ADD CONSTRAINT `prescripcion_medicamento_ibfk_3` FOREIGN KEY (`id_forma`) REFERENCES `formafarmaceutica` (`id`),
  ADD CONSTRAINT `prescripcion_medicamento_ibfk_4` FOREIGN KEY (`id_presentacion`) REFERENCES `presentacion` (`id`),
  ADD CONSTRAINT `prescripcion_medicamento_ibfk_5` FOREIGN KEY (`id_concentracion`) REFERENCES `concentracion` (`id`);

--
-- Filtros para la tabla `prescripcion_prestacion`
--
ALTER TABLE `prescripcion_prestacion`
  ADD CONSTRAINT `prescripcion_prestacion_ibfk_1` FOREIGN KEY (`prescripcion_id`) REFERENCES `prescripcion` (`id`),
  ADD CONSTRAINT `prescripcion_prestacion_ibfk_2` FOREIGN KEY (`prestacion_id`) REFERENCES `prestacion` (`id`),
  ADD CONSTRAINT `prescripcion_prestacion_ibfk_3` FOREIGN KEY (`lado_id`) REFERENCES `lado` (`id`);

--
-- Filtros para la tabla `prestacion`
--
ALTER TABLE `prestacion`
  ADD CONSTRAINT `prestacion_ibfk_1` FOREIGN KEY (`lado_id`) REFERENCES `lado` (`id`);

--
-- Filtros para la tabla `profesional`
--
ALTER TABLE `profesional`
  ADD CONSTRAINT `profesional_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD CONSTRAINT `usuario_rol_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `usuario_rol_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
