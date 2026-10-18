# ARQUITECTURA DE SEGURIDAD Y AMENAZAS – FloraSense

Este documento describe la matriz de amenazas, mitigaciones y lineamientos criptográficos implementados en FloraSense en cumplimiento con **OWASP Mobile Top 10** y principios de ingeniería de sistemas críticos de automatización.

---

## 1. Matriz de Amenazas y Mitigaciones

| Amenaza | Vector de Ataque | Mitigación Implementada |
|---|---|---|
| **Inundación por fallo de red o software** | Pérdida de conexión Wi-Fi mientras la bomba está activa o bug en la app enviando comando `PUMP_ON` sin `PUMP_OFF`. | **Hardware Fail-Safe en Firmware:** Temporizador de software FreeRTOS en la ESP32 que fuerza el apagado tras 15 segundos continuos. Bloqueo horario máximo de 60 s/hora. Si la app o el broker mueren, la bomba se apaga sola físicamente. |
| **Bomba quemada por falta de agua** | Funcionamiento en seco de la minibomba sumergible. | **Interlock por Sensor de Nivel:** Si el sensor de nivel de agua (ultrasónico o boya) reporta <10%, el relé se inhibe a nivel eléctrico/firmware y emite tono de alarma en el buzzer. |
| **Ataque Man-in-the-Middle (MitM) en IoT** | Sniffing de paquetes MQTT en la red local o internet. | **MQTT sobre TLS (puerto 8883):** Autenticación mutua o cliente con usuario/contraseña cifrada, CA raíz validada por la ESP32 con `WiFiClientSecure`. No se permiten puertos no cifrados en producción. |
| **Tráfico en texto plano en Android** | Interceptación de datos entre app Flutter y API. | **Android `network_security_config.xml`:** `cleartextTrafficPermitted="false"`. Solo se admiten conexiones HTTPS con TLS 1.3 y pinning de certificados opcional. |
| **Robo de credenciales en reposo en el móvil** | Extracción de tokens desde el almacenamiento de la app. | **Android Keystore con `flutter_secure_storage`:** Las llaves JWT, tokens de actualización y credenciales se encriptan con AES-GCM respaldado por hardware (KeyStore/StrongBox). Prohibido guardar secretos en SharedPreferences simples. |
| **Inyección SQL** | Manipulación de campos de búsqueda o telemetría. | **Consultas parametrizadas:** Todo acceso a la base de datos MySQL se realiza mediante Prepared Statements con librerías ORM/Query Builder seguras (`mysql2/promise` con `execute`). |
| **Fuerza bruta y robo de contraseñas** | Ataques de diccionario contra cuentas de usuario. | **Hashing con Argon2id:** Salt criptográfico único por usuario, parámetros de memoria y costo computacional ajustados. Rate-limiting de 5 intentos por minuto por IP en `/api/auth/login`. |
| **Inyección de Wi-Fi no autorizada** | Envío de credenciales de red local a través de la nube. | **Provisionamiento Local:** El SSID y contraseña del Wi-Fi se transmiten directamente de la app a la ESP32 vía Bluetooth Low Energy (BLE) cifrado o punto de acceso temporal (SoftAP WPA2), NUNCA por servidores web remotos. |
| **Actualización de Firmware Maliciosa (OTA Poisoning)** | Inyección de binario modificado en la ESP32. | **Firma Criptográfica de Binarios:** Las actualizaciones OTA verifican la firma ECDSA SHA-256 con la clave pública embebida en el bootloader antes de flashear el sector de la app. |

---

## 2. Checklist OWASP Mobile Top 10

- [x] **M1: Uso inadecuado de la plataforma:** No se usan Intents inseguros; WebViews están restringidas sin acceso a archivos locales; se emplea BiometricPrompt con cifrado CryptoObject.
- [x] **M2: Almacenamiento inseguro de datos:** Tokens sensibles residen exclusivamente en hardware Keystore. Base de datos SQLite/Hive local cifrada con AES-256.
- [x] **M3: Comunicación insegura:** Forzado de HTTPS y MQTTS (TLS 1.2+). Deshabilitado explícito de HTTP en el Manifest.
- [x] **M4: Autenticación insegura:** JWTs de acceso de 15 minutos, Refresh Tokens rotativos almacenados de forma segura con revocación por dispositivo.
- [x] **M5: Criptografía insuficiente:** No se utiliza MD5 ni SHA1 para seguridad. Todo hash usa Argon2 o SHA-256; cifrado simétrico con AES-256-GCM con IV único de 12 bytes.
- [x] **M6: Autorización insegura:** Control de acceso basado en roles (RBAC): `Dueño` (control total, riego manual, configuración de hardware) y `Colaborador` (solo lectura, registro de notas, vista de fotos).
- [x] **M7: Calidad del código del cliente:** Código Flutter compilado en modo `--release` con ofuscación de símbolos (`--obfuscate --split-debug-info`).
- [x] **M8: Manipulación de código:** Verificación de integridad de la APK y detección de root/jailbreak en tiempo de inicio.
- [x] **M9: Ingeniería inversa:** Strings sensibles y endpoints ofuscados mediante variables de compilación (`--dart-define`).
- [x] **M10: Funcionalidades extrañas:** Backdoors, logs de depuración y endpoints de desarrollo eliminados de los builds de producción.

---

## 3. Configuración de Seguridad en Android

Archivo requerido en la app Android (`android/app/src/main/res/xml/network_security_config.xml`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">florasense.local</domain>
        <domain includeSubdomains="true">api.florasense.io</domain>
        <pin-set expiration="2027-01-01">
            <pin digest="SHA-256">47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```
