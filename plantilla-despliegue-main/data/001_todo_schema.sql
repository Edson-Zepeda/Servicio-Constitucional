-- Inicialización de base de datos y tabla para ToDo List
-- Ejecutable manualmente o por entrypoint si el contenedor se inicializa desde cero

-- Ajusta el nombre si cambiaste MYSQL_DATABASE en .env
CREATE DATABASE IF NOT EXISTS `dabaseName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dabaseName`;

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_completed_created` (`completed`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de ejemplo opcionales (puedes comentar si no los quieres)
INSERT INTO `tasks` (`title`, `description`, `completed`) VALUES
('Comprar pan', 'Ir a la panadería de la esquina', 0),
('Llamar al proveedor', 'Confirmar fecha de entrega', 0);

