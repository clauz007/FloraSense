import React, { useState } from 'react';
import { 
  Droplet, 
  Volume2, 
  Thermometer, 
  Wind, 
  CloudRain, 
  Power, 
  AlertTriangle, 
  CheckCircle, 
  Sprout, 
  ChevronRight, 
  ShieldCheck, 
  SlidersHorizontal,
  Menu,
  Clock,
  Sparkles
} from 'lucide-react';
import { Plant, Telemetry, ThemeAccent, WeatherForecast } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import confetti from 'canvas-confetti';

interface Props {
  plants: Plant[];
  telemetry: Telemetry;
  isPumpRunning: boolean;
  pumpDurationRemaining: number;
  weather: WeatherForecast;
  onTriggerPump: (seconds: number) => { success: boolean; message: string };
  onStopPump: () => void;
  accent: ThemeAccent;
  onSelectPlant: (plant: Plant) => void;
  onOpenMenu: () => void;
  onNavigateToDiagnosis: () => void;
}

export const DashboardScreen: React.FC<Props> = ({
  plants,
  telemetry,
  isPumpRunning,
  pumpDurationRemaining,
  weather,
  onTriggerPump,
  onStopPump,
  accent,
  onSelectPlant,
  onOpenMenu,
  onNavigateToDiagnosis
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleConfirmWatering = () => {
    const res = onTriggerPump(6);
    setStatusFeedback(res.message);
    if (res.success) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const isTankLow = telemetry.waterTankLevel <= 12;

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🌱
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">Invernadero Central</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ESP32 en línea • Sincronizado</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenMenu}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="Menú de Módulos"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4 space-y-4">
        {/* Weather Smart Riego Banner */}
        {weather.rainProbabilityPct > 40 && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs text-sky-900">
            <div className="flex items-start gap-2.5">
              <CloudRain size={20} className="text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Riego Inteligente con Pronóstico de Lluvia</span>
                Probabilidad del {weather.rainProbabilityPct}% de precipitaciones hoy. La automatización retrasará el riego exterior para ahorrar agua.
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK BANNER */}
        {statusFeedback && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 p-3 rounded-2xl text-xs font-semibold animate-in fade-in flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-700 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* ========================================================
            INTERRUPTOR DE LA BOMBA REPARADO (Espacioso, sin cortes)
           ======================================================== */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                isPumpRunning
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <Droplet size={22} className={isPumpRunning ? 'fill-white' : ''} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Minibomba de Riego (GPIO 23)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isPumpRunning
                    ? `Bombeando agua... Corte en ${pumpDurationRemaining}s`
                    : 'Modo autónomo por umbral & manual'}
                </p>
              </div>
            </div>

            {/* Switch Toggle Espacioso y Accesible */}
            {isPumpRunning ? (
              <button
                onClick={onStopPump}
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Power size={14} />
                <span>Detener ({pumpDurationRemaining}s)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isTankLow}
                className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isTankLow
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/25'
                }`}
              >
                <Droplet size={14} className="fill-white" />
                <span>Regar Ahora</span>
              </button>
            )}
          </div>

          {/* Estado de Seguridad del Hardware */}
          <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              Límite de firmware: máx 15s por ciclo
            </span>
            <span className="font-mono text-slate-500">
              Tanque: {telemetry.waterTankLevel}%
            </span>
          </div>
        </div>

        {/* ========================================================
            TARJETAS DE TELEMETRÍA EN TIEMPO REAL (Gauges)
           ======================================================== */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Humedad del Suelo */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Humedad Suelo</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Droplet size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {telemetry.soilMoisture}%
              </span>
            </div>
            {/* Barra de progreso de humedad */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, telemetry.soilMoisture)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Sensor capacitivo v1.2</p>
          </div>

          {/* 2. Sonido Ambiente (dB) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Sonido Ambiente</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Volume2 size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {telemetry.soundDb}
              </span>
              <span className="text-xs text-slate-500 font-bold">dB</span>
            </div>
            {/* Barra de dB */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (telemetry.soundDb / 90) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Nivel acústico seguro</p>
          </div>

          {/* 3. Temperatura */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Temperatura</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {telemetry.temperature}°
              </span>
              <span className="text-xs text-slate-500 font-bold">C</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">DHT22 Digital • Óptimo</p>
          </div>

          {/* 4. CO2 & Tanque */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Nivel de Tanque</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isTankLow ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'
              }`}>
                <Droplet size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-3xl font-extrabold tracking-tight font-mono ${
                isTankLow ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {telemetry.waterTankLevel}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              {isTankLow ? 'Alerta: rellenar agua' : 'Boya flotador OK'}
            </p>
          </div>
        </div>

        {/* ========================================================
            PLANTAS REGISTRADAS EN ESTA ZONA
           ======================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Plantas en el Invernadero ({plants.length})
            </h3>
            <button
              onClick={onNavigateToDiagnosis}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Diagnosticar con Cámara</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {plants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => onSelectPlant(plant)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={plant.photoUrl}
                    alt={plant.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {plant.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 italic">{plant.species}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {plant.potLabel}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        Humedad: {plant.currentMoisture}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-emerald-600 block">{plant.healthPct}% Salud</span>
                    <span className="text-[10px] text-slate-400">Ver Ficha</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Riego Manual con Seguro */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmWatering}
        title="Confirmar Riego Manual"
        message="¿Deseas activar la minibomba de 5V por 6 segundos? El agua fluirá por microgoteo directo a las raíces."
        durationSeconds={6}
      />
    </div>
  );
};
