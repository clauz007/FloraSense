-- ====================================================
-- FloraSense Database Schema (MySQL 8.0)
-- ====================================================

CREATE DATABASE IF NOT EXISTS florasense_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE florasense_db;

-- 1. Usuarios y Roles (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'collaborator') NOT NULL DEFAULT 'collaborator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Zonas del Invernadero
CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(40) DEFAULT 'sprout',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Dispositivos Registrados (ESP32 y ESP32-CAM)
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    zone_id VARCHAR(36),
    device_mac VARCHAR(24) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    hardware_type ENUM('esp32_central', 'esp32_cam') NOT NULL DEFAULT 'esp32_central',
    firmware_version VARCHAR(20) DEFAULT '2.4.1',
    battery_voltage DECIMAL(4,2) DEFAULT 4.15,
    wifi_rssi INT DEFAULT -58,
    is_online BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
);

-- 4. Inventario de Plantas
CREATE TABLE IF NOT EXISTS plants (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    zone_id VARCHAR(36),
    device_id VARCHAR(36),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(120) NOT NULL,
    pot_label VARCHAR(50) NOT NULL,
    photo_url TEXT,
    planted_at DATE NOT NULL,
    target_moisture_min INT NOT NULL DEFAULT 40,
    target_moisture_max INT NOT NULL DEFAULT 75,
    light_requirement ENUM('direct', 'partial', 'shadow') DEFAULT 'partial',
    optimal_temp_c DECIMAL(4,1) DEFAULT 22.0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

-- 5. Telemetría de Sensores en Tiempo Real
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    plant_id VARCHAR(36),
    soil_moisture_pct DECIMAL(5,2) NOT NULL,
    temperature_c DECIMAL(4,2) NOT NULL,
    air_humidity_pct DECIMAL(5,2) NOT NULL,
    sound_db DECIMAL(4,2) NOT NULL,
    co2_ppm INT DEFAULT 420,
    water_tank_level_pct INT DEFAULT 85,
    water_tank_ok BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_time (device_id, created_at),
    INDEX idx_plant_time (plant_id, created_at),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
);

-- 6. Eventos y Registro de Riego
CREATE TABLE IF NOT EXISTS watering_events (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    plant_id VARCHAR(36) NOT NULL,
    trigger_type ENUM('autonomous_threshold', 'scheduled', 'manual_app') NOT NULL,
    duration_seconds INT NOT NULL,
    estimated_liters DECIMAL(5,3) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- 7. Registro de Alarmas y Eventos del Sistema
CREATE TABLE IF NOT EXISTS alarms (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    device_id VARCHAR(36),
    plant_id VARCHAR(36),
    severity ENUM('critical', 'warning', 'system') NOT NULL DEFAULT 'warning',
    code VARCHAR(40) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
);

-- 8. Calendario de Cuidados y Tareas
CREATE TABLE IF NOT EXISTS care_reminders (
    id VARCHAR(36) PRIMARY KEY,
    plant_id VARCHAR(36) NOT NULL,
    care_type ENUM('watering', 'fertilizer', 'pruning', 'repotting', 'fumigation') NOT NULL,
    title VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    recurrence_days INT DEFAULT 7,
    is_completed BOOLEAN DEFAULT FALSE,
    last_completed_at TIMESTAMP NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- 9. Capturas de Cámara y Diagnósticos de ML
CREATE TABLE IF NOT EXISTS camera_captures (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(36) NOT NULL,
    plant_id VARCHAR(36),
    image_url TEXT NOT NULL,
    leaf_health_pct DECIMAL(5,2) NOT NULL,
    pest_detected VARCHAR(60) NOT NULL DEFAULT 'Ninguna',
    pest_confidence DECIMAL(5,2) NOT NULL DEFAULT 98.5,
    treatment_recommended TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
);

-- Semilla de datos iniciales
INSERT INTO users (id, name, email, password_hash, role) VALUES 
('usr-001', 'Claudia Dueña', 'claudia.av2006@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$dummyhash', 'owner')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO zones (id, user_id, name, description, icon) VALUES
('zone-01', 'usr-001', 'Zona A: Aromáticas y Huerto', 'Planta baja con luz natural matutina', 'leaf'),
('zone-02', 'usr-001', 'Zona B: Tropicales e Interior', 'Mesa de cultivo con humedad controlada', 'sun')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO devices (id, user_id, zone_id, device_mac, name, hardware_type, firmware_version, battery_voltage, wifi_rssi, is_online) VALUES
('dev-esp32-01', 'usr-001', 'zone-01', '24:6F:28:AB:12:34', 'ESP32 Invernadero Central', 'esp32_central', '2.4.1', 4.18, -52, TRUE),
('dev-cam-01', 'usr-001', 'zone-01', '24:6F:28:CD:56:78', 'ESP32-CAM AI-Thinker Visión', 'esp32_cam', '1.2.0', 4.12, -61, TRUE)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO plants (id, user_id, zone_id, device_id, name, species, pot_label, photo_url, planted_at, target_moisture_min, target_moisture_max, light_requirement, optimal_temp_c, notes) VALUES
('plt-01', 'usr-001', 'zone-01', 'dev-esp32-01', 'Monstera Deliciosa', 'Monstera deliciosa', 'Maceta #3 Cerámica', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80', '2026-03-12', 45, 80, 'partial', 22.5, 'Sustrato aireado con perlita y corteza de pino.'),
('plt-02', 'usr-001', 'zone-01', 'dev-esp32-01', 'Albahaca Genovesa', 'Ocimum basilicum', 'Maceta #1 Balcón', 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80', '2026-07-01', 50, 85, 'direct', 24.0, 'Requiere riego frecuente en verano y corte de inflorescencias.'),
('plt-03', 'usr-001', 'zone-02', 'dev-esp32-01', 'Ficus Lyrata', 'Ficus lyrata', 'Maceta #5 Terraza', 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80', '2026-01-15', 35, 65, 'partial', 21.0, 'Sensible a corrientes de aire frío y encharcamientos.')
ON DUPLICATE KEY UPDATE name=name;
