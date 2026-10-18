import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Sliders, 
  Droplet, 
  Volume2, 
  CloudRain, 
  WifiOff, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Play, 
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { floraSimulator, SimulatorState } from '../services/simulatorService';
import { playAlertAlarm, playBuzzerBeep } from '../services/audioBuzzer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  simulatorState: SimulatorState;
}

export const HardwareSimulatorDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  simulatorState
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'firmware' | 'cam' | 'wiring' | 'docker' | 'ml'>('controls');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const firmwareCodeSnippet = `// FloraSense ESP32 Central Node - FreeRTOS Pump Safety Timer
#include <WiFi.h>
#include <PubSubClient.h>

#define PIN_SOIL_MOISTURE 34
#define PIN_SOUND_SENSOR  35
#define PIN_WATER_LEVEL   18
#define PIN_PUMP_RELAY    23
#define PIN_BUZZER        19

#define MAX_PUMP_RUN_SECONDS 15

void setPump(bool activate) {
  if (activate && digitalRead(PIN_WATER_LEVEL) == HIGH) {
    Serial.println("[FAILSAFE] Tanque vacio! Bomba bloqueada.");
    return;
  }
  digitalWrite(PIN_PUMP_RELAY, activate ? HIGH : LOW);
}`;

  const dockerComposeSnippet = `version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: flora_root_secure_2026
      MYSQL_DATABASE: florasense_db
    ports: ["3306:3306"]
  mosquitto:
    image: eclipse-mosquitto:2.0
    ports: ["1883:1883", "8883:8883"]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
              <Cpu size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Simulador Hardware ESP32 & Código Fuente</h3>
              <p className="text-[11px] text-slate-400">Pruebas en Vivo de Sensores, Failsafes y Descargas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 overflow-x-auto shrink-0">
          {[
            { id: 'controls', label: '🎛️ Controles en Vivo' },
            { id: 'wiring', label: '🔌 Conexión de Pines' },
            { id: 'firmware', label: '⚡ Firmware ESP32' },
            { id: 'cam', label: '📷 Firmware ESP32-CAM' },
            { id: 'docker', label: '🐳 Docker & MySQL' },
            { id: 'ml', label: '🧠 Cuadernos Colab ML' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <span className="text-emerald-700 text-base">ℹ️</span>
                <span>
                  Modifica los controles a continuación para ver cómo reacciona en tiempo real la app, el gráfico y el firmware emulado con sus seguros de seguridad.
                </span>
              </div>

              {/* Slider Humedad de Suelo */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplet size={14} className="text-emerald-600" />
                    Humedad del Suelo (Sensor Capacitivo v1.2)
                  </span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {simulatorState.telemetry.soilMoisture}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  step="1"
                  value={simulatorState.telemetry.soilMoisture}
                  onChange={(e) => floraSimulator.setSimulatedMoisture(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% (Muy Seco - Auto Riego)</span>
                  <span>50% (Normal)</span>
                  <span>95% (Saturado)</span>
                </div>
              </div>

              {/* Slider Nivel de Tanque de Agua */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplet size={14} className="text-blue-600" />
                    Nivel del Tanque de Agua (Boya Flotador GPIO 18)
                  </span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                    simulatorState.telemetry.waterTankLevel <= 12
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : 'bg-blue-50 text-blue-800'
                  }`}>
                    {simulatorState.telemetry.waterTankLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={simulatorState.telemetry.waterTankLevel}
                  onChange={(e) => floraSimulator.setSimulatedTank(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                {simulatorState.telemetry.waterTankLevel <= 12 && (
                  <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-xl flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    ¡Interlock Activo! Minibomba físicamente deshabilitada para evitar quemar motor.
                  </p>
                )}
              </div>

              {/* Acciones de prueba */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => playAlertAlarm()}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Volume2 size={14} className="text-amber-400" />
                  <span>Sonar Buzzer ESP32</span>
                </button>

                <button
                  onClick={() => floraSimulator.toggleOfflineMode()}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all ${
                    simulatorState.isOfflineMode
                      ? 'bg-amber-600 text-white'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <WifiOff size={14} />
                  <span>{simulatorState.isOfflineMode ? 'Reconectar Wi-Fi' : 'Simular Corte Wi-Fi'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wiring' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">Diagrama de Cableado Pin a Pin</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden font-mono">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 text-left">Módulo</th>
                      <th className="p-2 text-left">Pin Módulo</th>
                      <th className="p-2 text-left">ESP32 GPIO</th>
                      <th className="p-2 text-left">VCC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-2 font-semibold font-sans">Humedad Suelo</td><td className="p-2">AOUT</td><td className="p-2 text-emerald-700 font-bold">GPIO 34</td><td className="p-2">3.3V</td></tr>
                    <tr><td className="p-2 font-semibold font-sans">Sonido dB</td><td className="p-2">OUT</td><td className="p-2 text-emerald-700 font-bold">GPIO 35</td><td className="p-2">3.3V</td></tr>
                    <tr><td className="p-2 font-semibold font-sans">DHT22 Temp/Hum</td><td className="p-2">DATA</td><td className="p-2 text-emerald-700 font-bold">GPIO 4</td><td className="p-2">3.3V (10k Pullup)</td></tr>
                    <tr><td className="p-2 font-semibold font-sans">Sensor Tanque</td><td className="p-2">Boya</td><td className="p-2 text-emerald-700 font-bold">GPIO 18</td><td className="p-2">GND (INPUT_PULLUP)</td></tr>
                    <tr><td className="p-2 font-semibold font-sans">Relé Minibomba</td><td className="p-2">IN</td><td className="p-2 text-amber-700 font-bold">GPIO 23</td><td className="p-2">5V (Diodo 1N4007)</td></tr>
                    <tr><td className="p-2 font-semibold font-sans">Buzzer Pasivo</td><td className="p-2">(+)</td><td className="p-2 text-blue-700 font-bold">GPIO 19</td><td className="p-2">GND (PWM)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'firmware' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">firmware/esp32_sensor_pump/src/main.cpp</span>
                <button
                  onClick={() => handleCopy(firmwareCodeSnippet)}
                  className="flex items-center gap-1 text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72">
                {firmwareCodeSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'cam' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">firmware/esp32_cam/src/main.cpp (AI-Thinker OV2640)</span>
              <p className="text-xs text-slate-600">
                Graba en la ESP32-CAM uniendo GPIO 0 a GND con un adaptador FTDI a 115200 baudios. Al terminar, desconecta el puente GPIO 0 y pulsa RST.
              </p>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">docker-compose.yml</span>
                <button
                  onClick={() => handleCopy(dockerComposeSnippet)}
                  className="flex items-center gap-1 text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  <Copy size={12} />
                  <span>Copiar</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-sky-300 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72">
                {dockerComposeSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'ml' && (
            <div className="space-y-3 text-xs text-slate-700">
              <h4 className="font-bold text-slate-800">Modelos de Machine Learning Disponibles en /ml:</h4>
              <ul className="space-y-2">
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-emerald-800 block">1. Predicción de Riego (Fase A)</strong>
                  Regresión Random Forest sobre telemetría de suelo y evaporación: <code>ml/01_prediccion_riego_regresion.py</code>
                </li>
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-emerald-800 block">2. Salud Foliar & Plagas (Fases B & C)</strong>
                  Transfer Learning con MobileNetV3 (PlantVillage + Cochinilla/Pulgón/Ácaros): <code>ml/02_salud_hojas_mobilenetv3.py</code>
                </li>
                <li className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-emerald-800 block">3. Exportador Cuantizado INT8 a TFLite</strong>
                  Conversión a formato ultra-ligero para Android: <code>ml/export_tflite.py</code>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
