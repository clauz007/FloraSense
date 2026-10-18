import React from 'react';
import { 
  Sprout, 
  Droplet, 
  Cpu, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  Thermometer,
  Activity
} from 'lucide-react';
import { ScreenId } from '../components/Navigation';
import { ThemeAccent } from '../types';

interface Props {
  onNavigate: (screen: ScreenId) => void;
  accent: ThemeAccent;
  activePlantsCount: number;
  devicesCount: number;
}

export const WelcomeScreen: React.FC<Props> = ({
  onNavigate,
  accent,
  activePlantsCount,
  devicesCount
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-5 overflow-y-auto bg-gradient-to-b from-emerald-50/40 via-white to-white">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30">
              🌱
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">FloraSense</h1>
              <p className="text-xs text-slate-500 font-medium">Invernadero Casero Inteligente</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
            En línea
          </span>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-xl shadow-emerald-700/20 mb-6">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-emerald-50 mb-3 border border-white/20">
              <Sparkles size={12} />
              <span>Automatización Segura IoT & IA</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Tus plantas bajo cuidado continuo
            </h2>
            <p className="text-emerald-100 text-xs leading-relaxed mb-4">
              Telemetría de suelo en tiempo real, corte seguro por hardware en la minibomba y diagnóstico visual de plagas con ESP32-CAM.
            </p>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full py-3 px-4 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Abrir Monitor de Invernadero</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick status pills */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sprout size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">{activePlantsCount}</span>
              <p className="text-[11px] text-slate-500 font-medium">Plantas Monitoreadas</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">{devicesCount} Nodos</span>
              <p className="text-[11px] text-slate-500 font-medium">ESP32 Conectadas</p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Accesos Rápidos
          </span>

          <button
            onClick={() => onNavigate('diagnosis')}
            className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles size={18} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-800">Diagnóstico de Plagas por Foto</h4>
                <p className="text-[11px] text-slate-500">Cochinilla, pulgón, ácaros y tratamiento</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('device-config')}
            className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Cpu size={18} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-800">Configuración de Hardware & Pines</h4>
                <p className="text-[11px] text-slate-500">Mapeo GPIO y emparejamiento local BLE</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Safety and Fail-Safe Footer Note */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
          <ShieldCheck size={14} className="text-emerald-600" />
          Failsafe de Bomba Activo (15s máx)
        </span>
        <span>v2.4.1</span>
      </div>
    </div>
  );
};
