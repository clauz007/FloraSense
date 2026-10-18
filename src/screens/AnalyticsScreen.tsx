import React, { useState } from 'react';
import { 
  LineChart, 
  Droplet, 
  Volume2, 
  Thermometer, 
  Sparkles, 
  Clock, 
  TrendingDown, 
  BrainCircuit, 
  Calendar,
  Layers
} from 'lucide-react';
import { ThemeAccent, Telemetry } from '../types';

interface Props {
  accent: ThemeAccent;
  currentTelemetry: Telemetry;
}

export const AnalyticsScreen: React.FC<Props> = ({ accent, currentTelemetry }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<'moisture' | 'sound' | 'temperature'>('moisture');

  // Datos simulados para 24h, 7d y 30d
  const getGraphData = () => {
    if (timeRange === '24h') {
      return [
        { label: '00h', moisture: 68, sound: 38, temp: 19.8 },
        { label: '04h', moisture: 65, sound: 36, temp: 19.2 },
        { label: '08h', moisture: 60, sound: 44, temp: 21.5 },
        { label: '12h', moisture: 54, sound: 52, temp: 25.1 },
        { label: '16h', moisture: 47, sound: 48, temp: 24.3 },
        { label: '20h', moisture: 42, sound: 41, temp: 22.0 },
        { label: 'Ahora', moisture: currentTelemetry.soilMoisture, sound: currentTelemetry.soundDb, temp: currentTelemetry.temperature }
      ];
    } else if (timeRange === '7d') {
      return [
        { label: 'Lun', moisture: 75, sound: 42, temp: 22.1 },
        { label: 'Mar', moisture: 62, sound: 45, temp: 23.4 },
        { label: 'Mié', moisture: 50, sound: 40, temp: 21.9 },
        { label: 'Jue (Riego)', moisture: 78, sound: 54, temp: 24.0 },
        { label: 'Vie', moisture: 66, sound: 46, temp: 23.8 },
        { label: 'Sáb', moisture: 54, sound: 43, temp: 22.5 },
        { label: 'Dom', moisture: currentTelemetry.soilMoisture, sound: currentTelemetry.soundDb, temp: currentTelemetry.temperature }
      ];
    } else {
      return [
        { label: 'Sem 1', moisture: 64, sound: 42, temp: 22.0 },
        { label: 'Sem 2', moisture: 58, sound: 45, temp: 23.1 },
        { label: 'Sem 3', moisture: 71, sound: 41, temp: 24.2 },
        { label: 'Sem 4', moisture: currentTelemetry.soilMoisture, sound: currentTelemetry.soundDb, temp: currentTelemetry.temperature }
      ];
    }
  };

  const data = getGraphData();

  // Calcular SVG Path para gráfica suave
  const values = data.map(d => selectedMetric === 'moisture' ? d.moisture : selectedMetric === 'sound' ? d.sound : d.temp);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.15;
  const range = maxVal - minVal || 1;

  const width = 340;
  const height = 140;
  const paddingX = 20;
  const paddingY = 20;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Cálculos de regresión para predicción de riego
  const dryingRatePerHour = 0.85; // % de pérdida por hora estimado por Scikit-Learn
  const hoursUntilThreshold = Math.max(0, Math.round((currentTelemetry.soilMoisture - 35) / dryingRatePerHour));

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Análisis & Telemetría</h2>
          <p className="text-xs text-slate-500">Histórico de Sensores e Inteligencia Predictiva</p>
        </div>

        {/* Selector de Rango Temporal */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Selector de Métrica */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'moisture', label: 'Humedad', icon: Droplet, value: `${currentTelemetry.soilMoisture}%`, color: 'emerald' },
            { id: 'sound', label: 'Sonido dB', icon: Volume2, value: `${currentTelemetry.soundDb} dB`, color: 'blue' },
            { id: 'temperature', label: 'Temp °C', icon: Thermometer, value: `${currentTelemetry.temperature}°`, color: 'amber' },
          ].map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMetric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white/70 border-slate-200/80 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon size={14} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{m.id}</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900 block font-mono">{m.value}</span>
                <span className="text-[10px] text-slate-500">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gráfico SVG Principal */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 capitalize">
                Curva de {selectedMetric === 'moisture' ? 'Humedad del Suelo' : selectedMetric === 'sound' ? 'Nivel Sonoro SPL' : 'Temperatura Ambiental'}
              </h3>
              <p className="text-[11px] text-slate-400">Ventana de tiempo: {timeRange}</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {values[values.length - 1]} {selectedMetric === 'moisture' ? '%' : selectedMetric === 'sound' ? 'dB' : '°C'}
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full flex justify-center py-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Guías horizontales */}
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#f8fafc" strokeWidth="1" strokeDasharray="3 3" />

              {/* Área y línea */}
              <path d={areaD} fill="url(#curveGradient)" />
              <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

              {/* Puntos y etiquetas */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                  <text
                    x={pt.x}
                    y={height - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-medium"
                  >
                    {data[i].label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* ========================================================
            TARJETA "AI GROWTH INSIGHT" (Machine Learning Fase A)
           ======================================================== */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <BrainCircuit size={16} />
            </div>
            <h3 className="text-sm font-bold tracking-tight text-emerald-100">AI Growth Insight</h3>
            <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono ml-auto">
              Scikit-Learn ML
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] text-emerald-200/80 block mb-1">Próximo Riego Estimado</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white font-mono">~{hoursUntilThreshold}</span>
                <span className="text-xs text-emerald-300 font-semibold">horas</span>
              </div>
              <span className="text-[10px] text-emerald-200/60">Umbral objetivo: 35%</span>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] text-emerald-200/80 block mb-1">Tasa de Secado Actual</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white font-mono">-{dryingRatePerHour}%</span>
                <span className="text-xs text-emerald-300 font-semibold">/ hora</span>
              </div>
              <span className="text-[10px] text-emerald-200/60">Evapotranspiración normal</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
            💡 <strong>Recomendación Agronómica:</strong> La tasa de transpiración es estable. Dado que la humedad ambiente ronda el {currentTelemetry.humidity}%, no se requiere adelantar el ciclo de riego.
          </p>
        </div>
      </div>
    </div>
  );
};
