import React, { ReactNode } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor, Cpu, Sparkles, CloudRain, Download } from 'lucide-react';
import { ThemeAccent } from '../types';
import { downloadCompleteProjectZip } from '../services/zipExportService';

interface Props {
  children: ReactNode;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenSimulator: () => void;
  accent: ThemeAccent;
  isOffline: boolean;
  rainForecast?: boolean;
}

export const PhoneFrame: React.FC<Props> = ({
  children,
  isMobileFrame,
  onToggleFrame,
  onOpenSimulator,
  accent,
  isOffline,
  rainForecast
}) => {
  const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Control Bar */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-4 px-2 py-2.5 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">FloraSense</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                IoT & ML v2.4
              </span>
              {isOffline && (
                <span className="text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                  Modo Sin Conexión
                </span>
              )}
              {rainForecast && (
                <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1">
                  <CloudRain size={12} /> Lluvia pronosticada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Monitoreo y automatización de invernadero casero con ESP32, ESP32-CAM y ML
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Descargar a mi Laptop (.ZIP) */}
          <button
            onClick={async () => {
              try {
                await downloadCompleteProjectZip();
              } catch (e) {
                console.error(e);
                alert('Descargando archivo ZIP...');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
            title="Descargar todo el proyecto en formato ZIP a tu computadora"
          >
            <Download size={14} />
            <span>Descargar a mi Laptop (.ZIP)</span>
          </button>

          {/* Botón Simulador de Hardware */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-600/70 transition-all cursor-pointer"
            title="Abrir Simulador de Sensores ESP32 y Descarga de Código"
          >
            <Cpu size={14} />
            <span>Simulador & Docs</span>
          </button>

          {/* Toggle Vista Móvil / Escritorio */}
          <button
            onClick={onToggleFrame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 text-xs font-medium border border-slate-600/70 transition-all cursor-pointer"
            title={isMobileFrame ? 'Expandir a vista completa' : 'Ver en marco de móvil Android'}
          >
            {isMobileFrame ? (
              <>
                <Monitor size={14} />
                <span className="hidden md:inline">Vista Expandida</span>
              </>
            ) : (
              <>
                <Smartphone size={14} />
                <span className="hidden md:inline">Vista Móvil</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex justify-center items-start">
        {isMobileFrame ? (
          /* Marco de teléfono Android realista */
          <div className="relative w-full max-w-[420px] aspect-[9/19.5] max-h-[92vh] bg-slate-950 rounded-[46px] p-3 shadow-2xl ring-1 ring-slate-800 shadow-emerald-950/20 flex flex-col overflow-hidden border-4 border-slate-800">
            {/* Cámara frontal Punch Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 rounded-full border border-slate-800 z-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* Android Status Bar */}
            <div className="w-full pt-1 pb-2 px-6 flex items-center justify-between text-[11px] font-medium text-slate-800 bg-white select-none z-30 shrink-0">
              <span>{currentTime}</span>
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <span className="text-amber-500 text-[10px]">Sin Red</span>
                ) : (
                  <Wifi size={13} className="text-slate-700" />
                )}
                <Signal size={13} className="text-slate-700" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px]">94%</span>
                  <BatteryMedium size={14} className="text-slate-700" />
                </div>
              </div>
            </div>

            {/* Pantalla interna con fondo blanco */}
            <div className="relative flex-1 bg-white rounded-b-[36px] overflow-hidden flex flex-col text-slate-800 shadow-inner">
              {children}
            </div>

            {/* Barra de navegación gestual de Android */}
            <div className="w-full py-1.5 flex justify-center items-center bg-slate-950 shrink-0">
              <div className="w-32 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Vista de pantalla completa expandida */
          <div className="w-full max-w-5xl min-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
