# 🌿 FloraSense – Invernadero Inteligente IoT & Machine Learning

Sistema completo para el monitoreo en tiempo real, riego autónomo seguro y diagnóstico fitosanitario con visión por computador para invernaderos caseros mediante ESP32, ESP32-CAM y Machine Learning.

---

## 🚀 Inicio Rápido (Comandos para PowerShell / Windows)

### 1. Levantar Infraestructura Local (MySQL + Mosquitto MQTT TLS)
```powershell
docker compose up -d
```
Verifica que los contenedores estén corriendo:
```powershell
docker compose ps
```

### 2. Probar la Aplicación en Navegador / Celular
```powershell
npm run dev
```
Abre en tu navegador o celular en red local: `http://localhost:3000`

### 3. Grabar Firmware en ESP32 y ESP32-CAM (PlatformIO)
Para el nodo central de sensores y minibomba:
```powershell
pio run -d firmware/esp32_sensor_pump -t upload
pio device monitor -d firmware/esp32_sensor_pump -b 115200
```

Para la cámara ESP32-CAM (AI-Thinker con adaptador FTDI):
*Une GPIO 0 a GND antes de conectar el USB para entrar en modo bootloader.*
```powershell
pio run -d firmware/esp32_cam -t upload
```
*Desconecta GPIO 0 y presiona el botón RST.*

### 4. Entrenar y Cuantizar Modelos de Machine Learning
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install numpy pandas scikit-learn tensorflow joblib
python ml/01_prediccion_riego_regresion.py
python ml/export_tflite.py
```

---

## 📁 Estructura del Repositorio

- `docs/PLAN.md`: Plan maestro de desarrollo con fases, tareas y criterios de terminado.
- `docs/SEGURIDAD.md`: Matriz de amenazas, mitigación OWASP Mobile Top 10 y seguro de hardware.
- `docs/HARDWARE_GUIA.md`: Asignación de pines GPIO, diodo flyback 1N4007 y diagrama de cableado.
- `firmware/esp32_sensor_pump/`: Código C++ FreeRTOS para sensores, buzzer y bomba con corte a los 15s.
- `firmware/esp32_cam/`: Código C++ para la cámara OV2640 con envío HTTPS multipart.
- `ml/`: Scripts de predicción de secado de sustrato, MobileNetV3 para plagas y exportador `.tflite`.
- `backend/`: Esquema SQL relacional (`backend/db/schema.sql`) y configuración de Mosquitto MQTT.
- `src/`: Aplicación frontend completa con las 7 pantallas, simulador en tiempo real y extras.
