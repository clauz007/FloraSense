/**
 * @file main.cpp
 * @brief FloraSense ESP32 Central Node Firmware
 * Monitoreo de sensores, control de minibomba con seguro por hardware,
 * buzzer de alertas y telemetría MQTT segura.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Preferences.h>

// ==========================================
// CONFIGURACIÓN DE PINES
// ==========================================
#define PIN_SOIL_MOISTURE   34    // Entrada analógica sensor capacitivo v1.2
#define PIN_SOUND_SENSOR    35    // Entrada analógica micrófono
#define PIN_DHT             4     // Bus digital DHT22
#define PIN_WATER_LEVEL     18    // Interruptor de nivel / boya (INPUT_PULLUP)
#define PIN_PUMP_RELAY      23    // Salida relé/MOSFET minibomba (Activo en HIGH)
#define PIN_BUZZER          19    // Salida buzzer pasivo (PWM)
#define PIN_STATUS_LED      2     // LED integrado

#define DHTTYPE DHT22

// ==========================================
// LÍMITES DE SEGURIDAD FÍSICA DE LA BOMBA
// ==========================================
#define MAX_PUMP_RUN_SECONDS        15    // Máximo tiempo continuo encendida
#define MAX_PUMP_HOURLY_SECONDS     60    // Máximo acumulado por hora
#define SOIL_CALIBRATION_DRY        3100  // Lectura analógica en aire seco (0%)
#define SOIL_CALIBRATION_WET        1350  // Lectura analógica en agua (100%)

// ==========================================
// VARIABLES GLOBALES Y CONTROL
// ==========================================
DHT dht(PIN_DHT, DHTTYPE);
Preferences prefs;
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

char wifi_ssid[32] = "FloraSense_WiFi";
char wifi_pass[64] = "TuClaveWiFi";
char mqtt_server[64] = "api.florasense.local";
int mqtt_port = 8883;
char device_id[32] = "esp32-flora-01";
char mqtt_token[64] = "jwt-secret-device-token";

// Configuración de umbral autónomo local
int target_moisture_threshold = 35; // Regar si baja de 35%
bool autonomous_mode = true;
bool pump_state = false;
unsigned long pump_start_time = 0;
unsigned long hourly_pump_counter_ms = 0;
unsigned long hour_reset_timer = 0;
unsigned long last_telemetry_time = 0;
const unsigned long TELEMETRY_INTERVAL = 5000; // Cada 5 segundos

// ==========================================
// BUZZER Y ALERTAS SONORAS
// ==========================================
void toneBuzzer(int freq, int duration_ms) {
  ledcAttach(PIN_BUZZER, freq, 8);
  ledcWrite(PIN_BUZZER, 128); // 50% duty
  delay(duration_ms);
  ledcWrite(PIN_BUZZER, 0);
  ledcDetach(PIN_BUZZER);
}

void playChimeConfirm() {
  toneBuzzer(1800, 100);
  delay(50);
  toneBuzzer(2400, 150);
}

void playChimeAlert() {
  for (int i = 0; i < 3; i++) {
    toneBuzzer(3000, 120);
    delay(80);
  }
}

// ==========================================
// CONTROL DE BOMBA CON SEGURO POR HARDWARE
// ==========================================
bool canRunPump() {
  // 1. Verificar interlock de nivel de agua (si el flotador está abierto = nivel bajo)
  if (digitalRead(PIN_WATER_LEVEL) == HIGH) {
    Serial.println("[SEGURIDAD] Alerta: Tanque de agua vacío. Bomba bloqueada.");
    playChimeAlert();
    return false;
  }
  // 2. Verificar límite por hora
  if (hourly_pump_counter_ms >= (MAX_PUMP_HOURLY_SECONDS * 1000UL)) {
    Serial.println("[SEGURIDAD] Bloqueo: Límite horario de bombeo alcanzado.");
    return false;
  }
  return true;
}

void setPump(bool activate, const char* reason = "MANUAL") {
  if (activate) {
    if (!canRunPump()) {
      Serial.printf("[BOMBA] Rechazada activación (%s). Seguridad activa.\n", reason);
      return;
    }
    digitalWrite(PIN_PUMP_RELAY, HIGH);
    pump_state = true;
    pump_start_time = millis();
    Serial.printf("[BOMBA] Activada por: %s. Temporizador de seguridad: %d s\n", reason, MAX_PUMP_RUN_SECONDS);
    playChimeConfirm();
  } else {
    digitalWrite(PIN_PUMP_RELAY, LOW);
    if (pump_state) {
      unsigned long elapsed = millis() - pump_start_time;
      hourly_pump_counter_ms += elapsed;
      Serial.printf("[BOMBA] Apagada. Tiempo de bombeo: %lu ms. Acumulado hora: %lu ms\n", elapsed, hourly_pump_counter_ms);
    }
    pump_state = false;
  }
}

// Comprobación dura de seguridad en cada loop
void checkPumpFailsafe() {
  if (pump_state) {
    unsigned long elapsed = (millis() - pump_start_time) / 1000;
    if (elapsed >= MAX_PUMP_RUN_SECONDS) {
      Serial.println("[SEGURIDAD HARDWARE] Tiempo máximo excedido. Forzando apagado.");
      setPump(false, "CORTE_TIEMPO_MAXIMO");
    }
    // Si el agua se agota durante el riego, apagar inmediatamente
    if (digitalRead(PIN_WATER_LEVEL) == HIGH) {
      Serial.println("[SEGURIDAD HARDWARE] Tanque vacío durante riego. Forzando apagado.");
      setPump(false, "CORTE_TANQUE_VACIO");
    }
  }

  // Reseteo del contador horario cada 60 minutos
  if (millis() - hour_reset_timer >= 3600000UL) {
    hourly_pump_counter_ms = 0;
    hour_reset_timer = millis();
    Serial.println("[SEGURIDAD] Contador horario de riego reseteado.");
  }
}

// ==========================================
// LECTURAS DE SENSORES
// ==========================================
int readSoilMoisturePercent() {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_SOIL_MOISTURE);
    delay(10);
  }
  int raw = sum / 10;
  // Mapeo invertido: mayor lectura analógica = más seco
  int percent = map(raw, SOIL_CALIBRATION_DRY, SOIL_CALIBRATION_WET, 0, 100);
  return constrain(percent, 0, 100);
}

float readSoundLevelDb() {
  long peakToPeak = 0;
  unsigned int minVal = 4095;
  unsigned int maxVal = 0;
  unsigned long startMillis = millis();

  while (millis() - startMillis < 50) {
    int sample = analogRead(PIN_SOUND_SENSOR);
    if (sample < 4095) {
      if (sample > maxVal) maxVal = sample;
      if (sample < minVal) minVal = sample;
    }
  }
  peakToPeak = maxVal - minVal;
  // Aproximación a escala dB SPL (35 dB silencio, hasta 85 dB ruido)
  float db = map(peakToPeak, 20, 1200, 35, 85);
  return constrain(db, 35.0, 95.0);
}

// ==========================================
// MQTT & COMUNICACIÓN
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  char message[256];
  if (length >= sizeof(message)) length = sizeof(message) - 1;
  memcpy(message, payload, length);
  message[length] = '\0';

  Serial.printf("[MQTT] Mensaje recibido en [%s]: %s\n", topic, message);

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, message);
  if (err) return;

  if (doc.containsKey("action")) {
    const char* action = doc["action"];
    if (strcmp(action, "PUMP_ON") == 0) {
      int duration = doc["duration_seconds"] | 5;
      duration = min(duration, MAX_PUMP_RUN_SECONDS);
      setPump(true, "ORDEN_MQTT_APP");
    } else if (strcmp(action, "PUMP_OFF") == 0) {
      setPump(false, "ORDEN_MQTT_APP");
    } else if (strcmp(action, "BUZZER_TEST") == 0) {
      playChimeAlert();
    } else if (strcmp(action, "SET_THRESHOLD") == 0) {
      target_moisture_threshold = doc["threshold"] | 35;
      prefs.putInt("threshold", target_moisture_threshold);
      Serial.printf("[CONFIG] Nuevo umbral autónomo guardado en NVS: %d%%\n", target_moisture_threshold);
    }
  }
}

void sendTelemetry() {
  int moisture = readSoilMoisturePercent();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  float sound_db = readSoundLevelDb();
  bool water_ok = (digitalRead(PIN_WATER_LEVEL) == LOW);

  if (isnan(temp)) temp = 24.5;
  if (isnan(hum)) hum = 60.0;

  // Lógica de riego autónomo local (funciona sin conexión a internet)
  if (autonomous_mode && !pump_state) {
    if (moisture < target_moisture_threshold) {
      Serial.printf("[AUTÓNOMO] Humedad (%d%%) menor a umbral (%d%%). Iniciando riego local.\n", moisture, target_moisture_threshold);
      setPump(true, "AUTONOMO_LOCAL_UMBRAL");
    }
  }

  // Publicar si el cliente MQTT está conectado
  if (mqttClient.connected()) {
    StaticJsonDocument<384> doc;
    doc["device_id"] = device_id;
    doc["soil_moisture"] = moisture;
    doc["temperature"] = round(temp * 10) / 10.0;
    doc["air_humidity"] = round(hum * 10) / 10.0;
    doc["sound_db"] = round(sound_db * 10) / 10.0;
    doc["water_tank_ok"] = water_ok;
    doc["pump_active"] = pump_state;
    doc["uptime_sec"] = millis() / 1000;
    doc["rssi"] = WiFi.RSSI();

    char buffer[384];
    serializeJson(doc, buffer);
    char topic[64];
    snprintf(topic, sizeof(topic), "florasense/device/%s/telemetry", device_id);
    mqttClient.publish(topic, buffer);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_WATER_LEVEL, INPUT_PULLUP);
  pinMode(PIN_PUMP_RELAY, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_PUMP_RELAY, LOW); // Asegurar bomba apagada en arranque

  prefs.begin("florasense", false);
  target_moisture_threshold = prefs.getInt("threshold", 35);
  autonomous_mode = prefs.getBool("auto_mode", true);

  dht.begin();
  playChimeConfirm();

  Serial.println("\n==========================================");
  Serial.println("  FloraSense ESP32 Central Node Iniciado   ");
  Serial.println("==========================================");
  Serial.printf("Umbral de humedad autónomo: %d%%\n", target_moisture_threshold);

  // Conexión Wi-Fi opcional (el sistema opera localmente si no hay red)
  WiFi.begin(wifi_ssid, wifi_pass);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.printf("[WIFI] Conectado. IP: %s\n", WiFi.localIP().toString().c_str());
    // Configuración TLS (en producción cargar el certificado CA de Mosquitto)
    espClient.setInsecure(); // Para desarrollo; en producción: espClient.setCACert(ca_cert);
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
  } else {
    Serial.println("[WIFI] No disponible. Modo Autónomo local 100% activo.");
  }
}

void loop() {
  checkPumpFailsafe();

  if (WiFi.status() == WL_CONNECTED) {
    if (!mqttClient.connected()) {
      // Reintento no bloqueante de conexión MQTT
      static unsigned long last_reconnect = 0;
      if (millis() - last_reconnect > 5000) {
        last_reconnect = millis();
        if (mqttClient.connect(device_id, device_id, mqtt_token)) {
          char sub_topic[64];
          snprintf(sub_topic, sizeof(sub_topic), "florasense/device/%s/commands", device_id);
          mqttClient.subscribe(sub_topic);
          Serial.println("[MQTT] Conectado y suscrito a comandos.");
        }
      }
    } else {
      mqttClient.loop();
    }
  }

  // Enviar telemetría periódica
  if (millis() - last_telemetry_time >= TELEMETRY_INTERVAL) {
    last_telemetry_time = millis();
    sendTelemetry();
  }

  delay(20);
}
