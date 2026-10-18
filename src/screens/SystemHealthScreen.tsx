import React, { useState } from 'react';
import { 
  Activity, 
  Wifi, 
  BatteryMedium, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  ShieldCheck, 
  Radio, 
  HardDrive
} from 'lucide-react';
import { ThemeAccent } from '../types';

interface Props {
  accent: ThemeAccent;
}

export const SystemHealthScreen: React.FC<Props> = ({ accent }) => {
  const [isUpdatingOta, setIsUpdatingOta] = useState(false);
  const [otaProgress, setOtaProgress] = useState(0);
  const [firmwareVersion, setFirmwareVersion] = useState('2.4.1');

  const handleStartOta = () => {
    setIsUpdatingOta(true);
    setOtaProgress(0);

    const interval = setInterval(() => {
      setOtaProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdatingOta(false);
          setFirmwareVersion('2.4.2-signed');
          alert('Actualización OTA firmada instalada con éxito en la ESP32.');
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Salud del Sistema & OTA</h2>
          <p className="text-xs text-slate-500">Diagnóstico de Hardware y Telemetría de Placa</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
          Hardware OK
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Nivel de Batería & Voltaje */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BatteryMedium size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Alimentación & Batería LiPo</h4>
                <p className="text-[11px] text-slate-500">Tensión de celda en terminales VIN/3.3V</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-extrabold text-slate-900">4.18 V</span>
              <span className="text-[10px] text-emerald-600 font-bold block">94% Carga</span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
          </div>
        </div>

        {/* Señal Wi-Fi RSSI */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wifi size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Intensidad de Señal Wi-Fi</h4>
                <p className="text-[11px] text-slate-500">Antena PCB de 2.4 GHz en ESP32</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-extrabold text-slate-900">-54 dBm</span>
              <span className="text-[10px] text-blue-600 font-bold block">Excelente Cobertura</span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Actualizaciones de Firmware OTA */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HardDrive size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Firmware Embebido (OTA)</h4>
                <p className="text-[11px] text-slate-500">Versión actual: v{firmwareVersion}</p>
              </div>
            </div>
          </div>

          {isUpdatingOta ? (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={13} className="animate-spin text-purple-600" />
                  Descargando binario firmado...
                </span>
                <span className="font-mono text-purple-600">{otaProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${otaProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartOta}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className="text-purple-400" />
              <span>Verificar & Actualizar OTA (Firmware v2.4.2)</span>
            </button>
          )}

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              La actualización verifica la firma ECDSA SHA-256 en la partición OTA_0 antes de aplicar el reinicio seguro.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
