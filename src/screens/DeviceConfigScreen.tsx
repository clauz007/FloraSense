import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  Bluetooth, 
  ShieldCheck, 
  Sliders, 
  Volume2, 
  Key, 
  CheckCircle2, 
  RefreshCw, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ThemeAccent } from '../types';
import { playPumpStartChime, playAlertAlarm } from '../services/audioBuzzer';

interface Props {
  accent: ThemeAccent;
  onBack: () => void;
}

export const DeviceConfigScreen: React.FC<Props> = ({ accent, onBack }) => {
  const [activeTab, setActiveTab] = useState<'pairing' | 'gpio' | 'pump' | 'mqtt'>('pairing');
  const [ssid, setSsid] = useState('FloraSense_Invernadero');
  const [password, setPassword] = useState('••••••••••••');
  const [isScanning, setIsScanning] = useState(false);
  const [pairedSuccess, setPairedSuccess] = useState(true);
  const [maxPumpSeconds, setMaxPumpSeconds] = useState(15);
  const [buzzerTesting, setBuzzerTesting] = useState(false);

  const handleScanBle = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setPairedSuccess(true);
      playPumpStartChime();
    }, 1500);
  };

  const handleTestBuzzer = () => {
    setBuzzerTesting(true);
    playAlertAlarm();
    setTimeout(() => setBuzzerTesting(false), 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      {/* Top Bar con Corrección de Contraste (Texto oscuro legible, sin verde sobre verde) */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Configuración del Dispositivo</h2>
          <p className="text-xs text-slate-500">ESP32 & ESP32-CAM Hardware Manager</p>
        </div>
        {/* Badge de contraste corregido: fondo verde claro con texto verde muy oscuro */}
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
          Conectado BLE
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-3 bg-slate-50/70">
        {[
          { id: 'pairing', label: 'Emparejar', icon: Bluetooth },
          { id: 'gpio', label: 'Pines GPIO', icon: Cpu },
          { id: 'pump', label: 'Bomba & Bocina', icon: Sliders },
          { id: 'mqtt', label: 'Seguridad MQTT', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-950 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-emerald-700' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-5">
        {activeTab === 'pairing' && (
          <div className="space-y-4">
            {/* Aviso de seguridad local BLE */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-0.5">Provisionamiento Criptográfico Local</strong>
                Por estricta política de seguridad, las credenciales de Wi-Fi se transmiten directamente a la placa vía Bluetooth LE cifrado o SoftAP WPA2 temporal, nunca a través de servidores en la nube.
              </div>
            </div>

            {/* Selector de Dispositivos Detectados */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Dispositivos ESP32 Cercanos</span>
                <button
                  onClick={handleScanBle}
                  disabled={isScanning}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                  <span>{isScanning ? 'Buscando...' : 'Escanear'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ESP
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">FloraSense-Node-01 (ESP32)</h4>
                      <p className="text-[11px] text-slate-500 font-mono">MAC: 24:6F:28:AB:12:34 • -54 dBm</p>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      CAM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">FloraSense-CAM (OV2640)</h4>
                      <p className="text-[11px] text-slate-500 font-mono">MAC: 24:6F:28:CD:56:78 • -62 dBm</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Enlazado</span>
                </div>
              </div>
            </div>

            {/* Formulario de Wi-Fi Local */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-700">Configurar Red Wi-Fi del Invernadero</h3>
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">SSID de la Red (2.4 GHz Requerida)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  />
                  <Wifi size={14} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Contraseña Wi-Fi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => {
                  playPumpStartChime();
                  alert('Credenciales enviadas a la ESP32 por BLE.');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
              >
                Enviar Credenciales a la ESP32
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gpio' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mapeo de Pines GPIO ESP32</h3>
              <span className="text-[11px] text-slate-400 font-mono">DevKit V1</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Función / Periférico</th>
                    <th className="py-2.5 px-3 text-left">GPIO</th>
                    <th className="py-2.5 px-3 text-left">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Humedad Suelo Capacitivo v1.2</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 bg-emerald-50/40">GPIO 34</td>
                    <td className="py-2.5 px-3 text-slate-500">ADC1_CH6</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Sensor de Sonido (dB SPL)</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 bg-emerald-50/40">GPIO 35</td>
                    <td className="py-2.5 px-3 text-slate-500">ADC1_CH7</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Sensor Temp/Hum DHT22</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 bg-emerald-50/40">GPIO 4</td>
                    <td className="py-2.5 px-3 text-slate-500">Digital E/S (10kΩ pullup)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Sensor Nivel Tanque (Boya)</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 bg-emerald-50/40">GPIO 18</td>
                    <td className="py-2.5 px-3 text-slate-500">INPUT_PULLUP (Failsafe)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Relé / MOSFET Minibomba</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700 bg-amber-50">GPIO 23</td>
                    <td className="py-2.5 px-3 text-slate-500">Digital OUT (Diodo Flyback)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Buzzer Pasivo Alertas</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 bg-blue-50">GPIO 19</td>
                    <td className="py-2.5 px-3 text-slate-500">PWM LEDC (1–3 kHz)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Los GPIO 34 y 35 son solo de entrada en la ESP32 (sin pull-up/down interno), ideales para sensores analógicos libres de interferencias Wi-Fi al pertenecer a ADC1.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'pump' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Temporizador Failsafe de la Bomba</h4>
                  <p className="text-[11px] text-slate-500">Tope máximo impuesto por firmware (independiente de la app)</p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {maxPumpSeconds} segundos
                </span>
              </div>

              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={maxPumpSeconds}
                onChange={(e) => setMaxPumpSeconds(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>3 s (Mínimo)</span>
                <span>10 s (Estándar)</span>
                <span>15 s (Tope Failsafe)</span>
              </div>
            </div>

            {/* Prueba de Bocina / Buzzer */}
            <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Bocina / Buzzer de Alerta (GPIO 19)</h4>
                <p className="text-[11px] text-slate-500">Emite tono triple de 3000 Hz de advertencia</p>
              </div>
              <button
                onClick={handleTestBuzzer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 size={14} className={buzzerTesting ? 'text-amber-400 animate-bounce' : ''} />
                <span>{buzzerTesting ? 'Sonando...' : 'Probar'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'mqtt' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Broker Mosquitto TLS (Puerto 8883)</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Host del Broker</label>
                  <input
                    type="text"
                    disabled
                    value="mqtts://broker.florasense.local:8883"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Device JWT Token (Argon2 / Keystore)</label>
                  <input
                    type="text"
                    disabled
                    value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.florasense-dev-token-..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-700 truncate"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Canal MQTTS autenticado con certificados individuales por placa. Prohibido acceso anónimo.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
