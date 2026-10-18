# GUÍA DE HARDWARE Y CONEXIÓN DE PINES – FloraSense

Esta guía detalla los componentes, esquemas de conexión y asignación de pines exacta para el nodo central **ESP32 DevKit V1** y la cámara **ESP32-CAM (AI-Thinker)**.

---

## 1. Lista de Materiales (BOM)

| Componente | Especificación | Función |
|---|---|---|
| **ESP32 DevKit V1** | 30 o 38 pines, CP2102/CH340 | Controlador central y automatización de riego |
| **ESP32-CAM** | AI-Thinker con sensor OV2640 | Captura de imágenes y diagnóstico visual |
| **Sensor Humedad Suelo** | Capacitivo v1.2 (Resistente a corrosión) | Medición analógica de humedad en sustrato |
| **Sensor Temp / Humedad** | DHT22 (AM2302) o DS18B20 sumergible | Clima ambiental del invernadero |
| **Sensor de Sonido** | Módulo analógico MAX4466 o KY-037 | Detección de ruido anómalo / vibración |
| **Sensor Nivel de Agua** | Boya flotador vertical o Ultrasónico HC-SR04 | Interlock de seguridad en tanque |
| **Minibomba Sumergible** | 3V–5V DC (100–200 L/h) | Suministro de agua por goteo |
| **Módulo Relé u Optoacoplador** | Módulo de 1 canal 5V con optoacoplador o MOSFET IRLZ44N | Conmutación segura de la bomba |
| **Diodo Flyback** | 1N4007 o 1N4148 | Protección contra picos inductivos del motor |
| **Bocina / Buzzer** | Buzzer pasivo de 5V | Notificaciones acústicas y alarmas en sitio |
| **Módulo FTDI USB-UART** | 3.3V / 5V seleccionable | Grabación de la ESP32-CAM |
| **Fuente de Alimentación** | 5V DC 2.5A mínimo (o fuente step-down LM2596) | Alimentación estable sin caídas de tensión |

---

## 2. Asignación de Pines ESP32 (Nodo Central)

| Periférico / Sensor | Pin en el Módulo | Pin GPIO ESP32 | Tipo de Señal | Notas |
|---|---|---|---|---|
| **Sensor Humedad Suelo Capacitivo** | AOUT (Señal) | **GPIO 34 (ADC1_CH6)** | Entrada Analógica | Solo entrada en ESP32; rango 0–3.3V |
| | VCC | 3.3V | Alimentación | Usar 3.3V para prolongar vida útil |
| | GND | GND | Tierra común | |
| **Sensor DHT22 (Temp/Hum)** | DATA (Datos) | **GPIO 4** | E/S Digital | Resistencia Pull-up 10kΩ a 3.3V |
| | VCC | 3.3V | Alimentación | |
| | GND | GND | Tierra común | |
| **Sensor de Sonido (dB)** | OUT (Analógico) | **GPIO 35 (ADC1_CH7)** | Entrada Analógica | Solo entrada; no requiere pull-up |
| | VCC | 3.3V | Alimentación | |
| | GND | GND | Tierra común | |
| **Sensor de Nivel de Tanque** | Salida (Interruptor flotador) | **GPIO 18** | Entrada Digital | Pull-up interno habilitado (INPUT_PULLUP) |
| | Común | GND | Tierra | Al flotar, circuito cerrado a GND |
| **Relé / MOSFET de Minibomba** | IN (Disparo de señal) | **GPIO 23** | Salida Digital | Activo en HIGH (o LOW según módulo) |
| | VCC | 5V (VIN) | Alimentación | El módulo relé requiere 5V para el solenoide |
| | GND | GND | Tierra común | |
| **Buzzer Pasivo** | (+) Positivo | **GPIO 19** | Salida PWM (LEDC) | Frecuencia de 1000 a 3000 Hz |
| | (-) Negativo | GND | Tierra común | |
| **LED Indicador de Estado** | Ánodo (+) | **GPIO 2 (LED Onboard)** | Salida Digital | Parpadeo Wi-Fi / Fijo conectado |

⚠️ **CRÍTICO - Protección de la Minibomba:**
Conectar siempre un diodo 1N4007 en antiparalelo con los terminales de la minibomba (cátodo con franja plateada al terminal positivo de la bomba, ánodo al terminal negativo). Esto extingue la fuerza contraelectromotriz (Back-EMF) que de otro modo reiniciaría la ESP32 o dañaría el transistor.

---

## 3. Conexión de la ESP32-CAM (AI-Thinker) con Adaptador FTDI

Para programar la ESP32-CAM, no posee puerto USB integrado; se conecta con un adaptador serial FTDI USB a TTL:

```
Adaptador FTDI (Jumper en 3.3V o 5V)       ESP32-CAM (AI-Thinker)
--------------------------------------       ----------------------
VCC (5V recomendado para evitar cuelgues) -> 5V
GND ----------------------------------------> GND
TXD ----------------------------------------> U0R (GPIO 3)
RXD ----------------------------------------> U0T (GPIO 1)
                                             
PUENTE PARA MODO FLASH:
GPIO 0 -------------------------------------> GND (Unir antes de conectar el USB)
```

### Pasos para flashear:
1. Conectar **GPIO 0 a GND** en la ESP32-CAM con un cable jumper.
2. Conectar el FTDI a tu puerto USB de la computadora.
3. Presionar el botón físico **RST** de la ESP32-CAM.
4. En VS Code / PlatformIO o Arduino IDE ejecutar `Upload`.
5. Una vez terminada la carga (`Hash of data verified`), desconectar el cable jumper de **GPIO 0 a GND**.
6. Presionar nuevamente el botón **RST** para arrancar en modo normal de ejecución.
7. Abrir el Monitor Serie a **115200 baudios** para ver la dirección IP asignada.
