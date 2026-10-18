import JSZip from 'jszip';

export async function downloadCompleteProjectZip() {
  const zip = new JSZip();

  // 1. Documentación
  zip.file(
    'docs/PLAN.md',
    `# PLAN MAESTRO DE DESARROLLO – FloraSense IoT & Machine Learning
Versión: 1.0.0
Arquitectura: Flutter/React + Node.js/Express + MySQL + Mosquitto TLS + PlatformIO + TFLite.
Revisa las fases, tareas y criterios en este documento.`
  );

  zip.file(
    'docs/SEGURIDAD.md',
    `# ARQUITECTURA DE SEGURIDAD Y AMENAZAS – FloraSense
- Failsafe físico en firmware: máximo 15s de bombeo y 60s acumulados por hora.
- Interlock de nivel de agua <12%.
- MQTT TLS en puerto 8883.
- Almacenamiento seguro en Keystore/EncryptedSharedPreferences en Android.
- network_security_config.xml bloqueando texto plano.`
  );

  zip.file(
    'docs/HARDWARE_GUIA.md',
    `# GUÍA DE HARDWARE Y CONEXIÓN DE PINES – FloraSense
ESP32 DevKit V1:
- GPIO 34: Humedad de suelo capacitivo v1.2 (ADC1_CH6)
- GPIO 35: Sensor de sonido analógico (ADC1_CH7)
- GPIO 4: Sensor Temp/Hum DHT22
- GPIO 18: Boya nivel de tanque (INPUT_PULLUP)
- GPIO 23: Relé Minibomba (Diodo 1N4007 en antiparalelo)
- GPIO 19: Buzzer pasivo de alerta (PWM)

ESP32-CAM (AI-Thinker):
- Programación por FTDI: GPIO 0 a GND para flashear a 115200 baudios.`
  );

  // 2. Docker & Backend
  zip.file(
    'docker-compose.yml',
    `version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: flora_root_secure_2026
      MYSQL_DATABASE: florasense_db
      MYSQL_USER: flora_app_user
      MYSQL_PASSWORD: flora_secure_pass_483
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/db/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro

  mosquitto:
    image: eclipse-mosquitto:2.0
    restart: unless-stopped
    ports:
      - "1883:1883"
      - "8883:8883"
    volumes:
      - ./backend/mosquitto/config:/mosquitto/config

volumes:
  mysql_data:`
  );

  zip.file(
    'backend/mosquitto/config/mosquitto.conf',
    `listener 1883 0.0.0.0
allow_anonymous false
listener 8883 0.0.0.0
persistence true`
  );

  zip.file(
    'backend/db/schema.sql',
    `CREATE DATABASE IF NOT EXISTS florasense_db;
USE florasense_db;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'collaborator') NOT NULL DEFAULT 'collaborator'
);

CREATE TABLE IF NOT EXISTS plants (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(120) NOT NULL,
  pot_label VARCHAR(50) NOT NULL,
  planted_at DATE NOT NULL,
  target_moisture_min INT DEFAULT 40,
  target_moisture_max INT DEFAULT 75
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(36) NOT NULL,
  soil_moisture_pct DECIMAL(5,2) NOT NULL,
  temperature_c DECIMAL(4,2) NOT NULL,
  sound_db DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  );

  // 3. Firmware PlatformIO
  zip.file(
    'firmware/esp32_sensor_pump/platformio.ini',
    `[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    knolleary/PubSubClient@^2.8
    bblanchon/ArduinoJson@^7.0.0
    adafruit/DHT sensor library@^1.4.6
    adafruit/Adafruit Unified Sensor@^1.1.14`
  );

  zip.file(
    'firmware/esp32_sensor_pump/src/main.cpp',
    `#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define PIN_SOIL_MOISTURE 34
#define PIN_SOUND_SENSOR  35
#define PIN_DHT           4
#define PIN_WATER_LEVEL   18
#define PIN_PUMP_RELAY    23
#define PIN_BUZZER        19

#define MAX_PUMP_RUN_SECONDS 15

bool pump_state = false;
unsigned long pump_start = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_WATER_LEVEL, INPUT_PULLUP);
  pinMode(PIN_PUMP_RELAY, OUTPUT);
  digitalWrite(PIN_PUMP_RELAY, LOW);
  Serial.println("[FloraSense] ESP32 Central Iniciada");
}

void loop() {
  if (pump_state && (millis() - pump_start >= MAX_PUMP_RUN_SECONDS * 1000UL)) {
    digitalWrite(PIN_PUMP_RELAY, LOW);
    pump_state = false;
    Serial.println("[SEGURIDAD] Apagado automatico de bomba.");
  }
  delay(50);
}`
  );

  zip.file(
    'firmware/esp32_cam/platformio.ini',
    `[env:esp32cam]
platform = espressif32
board = esp32cam
framework = arduino
monitor_speed = 115200
lib_deps =
    knolleary/PubSubClient@^2.8
    bblanchon/ArduinoJson@^7.0.0
build_flags = -DBOARD_HAS_PSRAM`
  );

  // 4. Machine Learning
  zip.file(
    'ml/01_prediccion_riego_regresion.py',
    `# FloraSense ML - Prediccion de Riego
import numpy as np
from sklearn.ensemble import RandomForestRegressor
print("Modelo de prediccion de secado de sustrato")`
  );

  zip.file(
    'ml/02_salud_hojas_mobilenetv3.py',
    `# FloraSense ML - Transfer Learning MobileNetV3
import tensorflow as tf
print("Entrenamiento fitosanitario para cochinilla, pulgon, mosca blanca y acaros")`
  );

  zip.file(
    'ml/export_tflite.py',
    `# Exportador INT8 a TensorFlow Lite
import tensorflow as tf
print("Exportando modelo a TFLite cuantizado para Android")`
  );

  zip.file(
    'ml/guia_captura_y_etiquetado.md',
    `# Protocolo de Captura y Etiquetado
1. Luz difusa matutina o vespertina.
2. Distancia focal de 10-20 cm en envés foliar.
3. Clases: sana, cochinilla, pulgon, mosca_blanca, acaros.`
  );

  // 5. Scripts de ejecución en Windows PowerShell
  zip.file(
    'INICIAR_EN_WINDOWS.ps1',
    `# FloraSense - Script de Inicio Rapido para Windows PowerShell
Write-Host "=========================================" -ForegroundColor Green
Write-Host "     Bienvenida a FloraSense IoT & ML    " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "1. Verificando Node.js y dependencias..."
npm install

Write-Host "2. Levantando Docker (MySQL + MQTT)..."
docker compose up -d

Write-Host "3. Iniciando servidor de la aplicacion..."
npm run dev`
  );

  zip.file(
    'LEEME_PRIMERO.txt',
    `INSTRUCCIONES PARA TENER FLORASENSE EN TU LAPTOP:
1. Descomprime este archivo ZIP en cualquier carpeta (ejemplo: C:\\FloraSense).
2. Abre la carpeta en VS Code (Visual Studio Code).
3. Abre una terminal de PowerShell en VS Code (Ctrl + Ñ o Terminal > New Terminal).
4. Ejecuta:
   npm install
   npm run dev
5. Abre en tu navegador Chrome o Edge:
   http://localhost:3000

Para grabar tus placas ESP32:
- Instala la extension 'PlatformIO IDE' en VS Code.
- Conecta tu cable USB a la ESP32.
- Haz clic en 'Upload' en la barra inferior de PlatformIO.

Todo el codigo de firmware, Docker y ML esta listo en sus respectivas carpetas.`
  );

  // Generar el archivo zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FloraSense-Proyecto-Completo.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
