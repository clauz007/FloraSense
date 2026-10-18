/**
 * @file main.cpp
 * @brief FloraSense ESP32-CAM Firmware (AI-Thinker OV2640)
 * Captura periódica de imágenes de cultivo para diagnóstico de plagas
 * y salud foliar con Machine Learning.
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// Definición de pines para módulo AI-Thinker ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4

const char* ssid = "FloraSense_WiFi";
const char* password = "TuClaveWiFi";
const char* server_host = "api.florasense.local";
const int server_port = 443;
const char* upload_path = "/api/camera/upload";
const char* device_token = "Bearer jwt-secure-device-token";

unsigned long last_capture_time = 0;
const unsigned long CAPTURE_INTERVAL = 1800000; // Cada 30 minutos

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_SVGA; // 800x600 para óptimo balance detalle/transferencia
    config.jpeg_quality = 12;            // 0-63 (menor número = mayor calidad)
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_VGA;  // 640x480 sin PSRAM externa
    config.jpeg_quality = 15;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAM] Error al inicializar cámara: 0x%x\n", err);
    return false;
  }
  return true;
}

void captureAndUpload() {
  Serial.println("[CAM] Capturando imagen del invernadero...");
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("[CAM] Fallo al capturar frame.");
    return;
  }

  Serial.printf("[CAM] Frame capturado: %zu bytes. Conectando a servidor...\n", fb->len);

  WiFiClientSecure client;
  client.setInsecure(); // En desarrollo; configurar CA en prod

  if (!client.connect(server_host, server_port)) {
    Serial.println("[CAM] Error de conexión HTTPS al servidor.");
    esp_camera_fb_return(fb);
    return;
  }

  String boundary = "----FloraSenseBoundary7MA4YWxkTrZu0gW";
  String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--" + boundary + "--\r\n";

  size_t totalLen = head.length() + fb->len + tail.length();

  client.println("POST " + String(upload_path) + " HTTP/1.1");
  client.println("Host: " + String(server_host));
  client.println("Authorization: " + String(device_token));
  client.println("Content-Type: multipart/form-data; boundary=" + boundary);
  client.println("Content-Length: " + String(totalLen));
  client.println("Connection: close");
  client.println();

  client.print(head);
  client.write(fb->buf, fb->len);
  client.print(tail);

  esp_camera_fb_return(fb);
  Serial.println("[CAM] Imagen enviada exitosamente para inferencia de ML.");
}

void setup() {
  Serial.begin(115200);
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!initCamera()) {
    Serial.println("[CAM] Reintento de inicialización requerido.");
    delay(2000);
    ESP.restart();
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[CAM] Conectada a Wi-Fi. IP: %s\n", WiFi.localIP().toString().c_str());

  // Primera captura al iniciar
  captureAndUpload();
}

void loop() {
  if (millis() - last_capture_time >= CAPTURE_INTERVAL) {
    last_capture_time = millis();
    captureAndUpload();
  }
  delay(100);
}
