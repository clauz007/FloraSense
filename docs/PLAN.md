# PLAN MAESTRO DE DESARROLLO – FloraSense IoT & Machine Learning

**Versión:** 1.0.0  
**Fecha de inicio:** 2026-10-18  
**Arquitectura:** Flutter (App Android/Web) + Node.js/Express + MySQL + Eclipse Mosquitto (MQTT TLS) + PlatformIO (ESP32 & ESP32-CAM) + Scikit-Learn/TensorFlow Lite (ML).  

---

## 🎯 Resumen Ejecutivo y Criterios de Calidad

FloraSense es una plataforma integral para el monitoreo en tiempo real, riego autónomo seguro y diagnóstico fitosanitario con visión computacional para invernaderos caseros.

### Principios no negociables:
1. **Seguridad en Hardware (Fail-Safe):** La minibomba NUNCA depende del Wi-Fi ni de la app para apagarse. El firmware tiene límite duro de tiempo (máx. 15 s por riego continuo, máx. 60 s acumulados por hora) e interlock por nivel bajo de agua.
2. **Seguridad en Redes y Datos:** TLS en MQTT (puerto 8883), HTTPS en REST API, almacenamiento de tokens en Keystore/EncryptedSharedPreferences, contraseñas con Argon2, `network_security_config.xml` bloqueando tráfico en texto plano.
3. **Autonomía Operativa:** Riego por umbrales ejecuta en el loop de la ESP32 aun sin conexión de red. La app almacena en caché local y encola órdenes offline.
4. **Fidelidad de Diseño:** Tipografía Outfit, tarjetas redondeadas, paleta limpia sobre blanco (Verde Botánico #10B981, Negro Obsidiana #111827, Azul Océano #2563EB). Corrección de contraste, toggle de bomba accesible con confirmación y eliminación de iconos superfluos.

---

## 📋 Fases del Proyecto

| Fase | Título | Estado | Criterio de "Terminado" |
|---|---|---|---|
| **Fase 1** | **Arquitectura Base, Docs y Backend + Simulador IoT** | 🟡 En Curso | Docker Compose con MySQL, Mosquitto TLS y API Express operativa; esquema SQL ejecutado; simulador de telemetría ESP32 publicando por MQTT y websocket; tests automáticos pasando. |
| **Fase 2** | **Firmware ESP32 y ESP32-CAM (PlatformIO)** | 🟢 Diseñado | Código C++ con FreeRTOS para ESP32 (sensores DHT22/DS18B20, humedad suelo capacitiva, micrófono I2S/analógico, relé bomba, buzzer pasivo, EEPROM/NVS para umbrales locales) y ESP32-CAM (OV2640, snapshot HTTPs). Guía de pines y conexión exacta. |
| **Fase 3** | **Machine Learning (Colab & TFLite)** | 🟢 Diseñado | 3 Notebooks funcionales: Regresión de humedad y evaporación; Clasificación MobileNetV3 de salud foliar; Detección de plagas (cochinilla, pulgón, mosca blanca, ácaros). Scripts de cuantización INT8 a `.tflite`. |
| **Fase 4** | **Aplicación FloraSense (Frontend & Mobile UI)** | 🟢 Diseñado | Las 7 pantallas completas con tipografía Outfit, correcciones de diseño aplicadas, gráficos interactivos fl_chart equivalentes, simulación de bomba con feedback, alertas, diagnóstico de cámara en vivo y extras (cuidados, QR, clima, zonas). |
| **Fase 5** | **Integración Real, Seguridad & Pruebas** | 🟢 Diseñado | Validación de roles, pruebas de desconexión sin conexión, exportación de reportes CSV/PDF, documentación completa en `docs/SEGURIDAD.md` y `README.md`. |

---

## 🛠️ Detalle de Tareas por Fase

### Fase 1: Backend, Base de Datos y MQTT
- [x] Crear documentación inicial `docs/PLAN.md` y `docs/SEGURIDAD.md`.
- [x] Diseñar esquema relacional MySQL (`plants`, `telemetry_logs`, `watering_events`, `alarms`, `care_guides`, `zones`, `devices`).
- [x] Configuración de Docker Compose (`docker-compose.yml`) con MySQL 8, Mosquitto 2.0 con TLS y API Node.js.
- [x] Motor de simulación de telemetría ESP32 (humedad suelo, temperatura, sonido dB, CO2, nivel de agua, estado bomba).
- [x] API REST para autenticación JWT, registro de telemetría, historial de riegos, alarmas y catálogo de plantas.

### Fase 2: Firmware ESP32 y ESP32-CAM
- [x] Crear proyecto PlatformIO para ESP32 (`platformio.ini` y `src/main.cpp`).
- [x] Implementar driver para sensor de humedad de suelo capacitivo v1.2 (calibración seco/agua).
- [x] Implementar relé/transistor MOSFET de la minibomba con temporizador de seguridad de hardware por FreeRTOS software timer.
- [x] Lógica de riego autónomo en memoria no volátil (NVS) cuando falla la conexión Wi-Fi.
- [x] Melodías del buzzer pasivo (alerta crítica, confirmación de riego, conexión Wi-Fi).
- [x] Crear firmware para ESP32-CAM con módulo AI-Thinker (fotos JPEG periódicas y bajo demanda).
- [x] Documentar diagrama de conexiones cable a cable y tabla de pines GPIO en `docs/HARDWARE_GUIA.md`.

### Fase 3: Machine Learning
- [x] Cuaderno Colab Fase A: Regresión lineal polinomial y Random Forest para predecir tiempo hasta próximo riego según tasa de secado e insolación.
- [x] Cuaderno Colab Fase B: Transfer Learning con MobileNetV3 Small/Large para diagnóstico de hojas (Sana vs Enferma) con PlantVillage dataset.
- [x] Cuaderno Colab Fase C: Clasificador de plagas botánicas (Cochinilla algodonosa, Pulgón, Mosca blanca, Araña roja/ácaros).
- [x] Script `export_tflite.py` con cuantización post-entrenamiento a enteros INT8 (reducción de tamaño a <4 MB para celulares Android).
- [x] Guía de captura y etiquetado para las fotos tomadas con el celular y con la ESP32-CAM.

### Fase 4: Aplicación FloraSense
- [x] Configuración de tipografía Outfit, paletas de color botánicas y layout responsive (móvil Android enmarcado con opción pantalla completa).
- [x] Pantalla 1: Bienvenida (Onboarding botánico, estado rápido del ecosistema, métricas generales).
- [x] Pantalla 2: Configuración del Dispositivo (Emparejamiento BLE/AP, selección de pines, calibración de bomba, token seguro).
- [x] Pantalla 3: Dashboard (Tarjetas de plantas, medidores circulares de humedad, nivel sonoro dB, temperatura, CO2, interruptor de bomba reparado con confirmación, nivel de tanque).
- [x] Pantalla 4: Análisis & Gráficos (Curvas históricas 24h/7d/30d, tasa de evaporación, AI Growth Insight).
- [x] Pantalla 5: Alertas & Logs (Contadores Crítico/Avisos/Sistema, filtros por gravedad y fecha, botón de limpieza, prueba de bocina).
- [x] Pantalla 6: Ajustes (Paleta de color verde/negro/azul con fondo blanco, selector de idioma ES/EN, bloqueo biométrico, backup, salud de batería y señal).
- [x] Pantalla 7: Identificador & Diagnóstico de Plagas (Cámara en tiempo real, detección de plagas con confianza %, recetas orgánicas y ficha automática).
- [x] Módulos extra: Calendario de cuidados, Zonas múltiples, Modo offline con cola de comandos, Clima exterior inteligente, Etiquetas QR generadas.

### Fase 5: Verificación y Entrega
- [x] Pruebas de compilación TypeScript y linting estricto.
- [x] Verificación de los criterios OWASP y seguridad de bomba.
- [x] Documentación de comandos de ejecución paso a paso para el usuario.
