import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Fingerprint, 
  Camera, 
  WifiOff, 
  Database, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  Moon, 
  Sun, 
  Check, 
  Download,
  UploadCloud
} from 'lucide-react';
import { ThemeAccent, Language } from '../types';
import { downloadCompleteProjectZip } from '../services/zipExportService';

interface Props {
  accent: ThemeAccent;
  onChangeAccent: (accent: ThemeAccent) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  offlineQueueCount: number;
  onExportBackup: () => void;
  onFactoryReset: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
  accent,
  onChangeAccent,
  language,
  onChangeLanguage,
  isOfflineMode,
  onToggleOffline,
  offlineQueueCount,
  onExportBackup,
  onFactoryReset
}) => {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [cameraInterval, setCameraInterval] = useState('30 min');
  const [pushAlerts, setPushAlerts] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Ajustes & Preferencias</h2>
          <p className="text-xs text-slate-500">Configuración Global de FloraSense</p>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          v2.4.1-rel
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* ========================================================
            PALETA DE TEMA (Fondo siempre blanco; acento verde, negro, azul)
            CORRECCIÓN: Sin íconos de Bluetooth sobrantes
           ======================================================== */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Palette size={16} className="text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Paleta Botánica (Acento)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Fondo blanco puro para legibilidad en exteriores con acento cromático personalizado:
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {[
              { id: 'emerald' as ThemeAccent, label: 'Verde Botánico', hex: '#10B981', ring: 'ring-emerald-500' },
              { id: 'black' as ThemeAccent, label: 'Negro Obsidiana', hex: '#111827', ring: 'ring-slate-900' },
              { id: 'blue' as ThemeAccent, label: 'Azul Océano', hex: '#2563EB', ring: 'ring-blue-600' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onChangeAccent(item.id)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  accent === item.id
                    ? `bg-slate-50 border-slate-400 ring-2 ${item.ring}`
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full mb-2 flex items-center justify-center shadow-xs" style={{ backgroundColor: item.hex }}>
                  {accent === item.id && <Check size={12} className="text-white stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            MODO SIN CONEXIÓN & SINCRONIZACIÓN
           ======================================================== */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <WifiOff size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Modo Sin Conexión (Caché Local)</h4>
                <p className="text-[11px] text-slate-500">Encola órdenes y telemetría en ausencia de Wi-Fi</p>
              </div>
            </div>

            <button
              onClick={onToggleOffline}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                isOfflineMode ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isOfflineMode ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {offlineQueueCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between">
              <span>{offlineQueueCount} órdenes pendientes en cola</span>
              <span className="font-semibold text-amber-700 text-[11px]">Sincronización diferida</span>
            </div>
          )}
        </div>

        {/* ========================================================
            SEGURIDAD BIOMÉTRICA & IDIOMA
           ======================================================== */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Seguridad & Sistema
          </h3>

          {/* Bloqueo Biométrico */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Fingerprint size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Bloqueo Biométrico (Huella/Facial)</h4>
                <p className="text-[11px] text-slate-500">Exigir autenticación para riegos manuales</p>
              </div>
            </div>
            <button
              onClick={() => setBiometricEnabled(!biometricEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                biometricEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                biometricEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Idioma */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Idioma de la Aplicación</h4>
                <p className="text-[11px] text-slate-500">Español / English</p>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => onChangeLanguage('es')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  language === 'es' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Intervalo de Cámara ESP32-CAM */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Camera size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Frecuencia ESP32-CAM</h4>
                <p className="text-[11px] text-slate-500">Foto periódica para diagnóstico ML</p>
              </div>
            </div>
            <select
              value={cameraInterval}
              onChange={(e) => setCameraInterval(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
            >
              <option value="15 min">Cada 15 min</option>
              <option value="30 min">Cada 30 min</option>
              <option value="1 h">Cada 1 hora</option>
              <option value="6 h">Cada 6 horas</option>
            </select>
          </div>
        </div>

        {/* ========================================================
            EXPORTACIÓN DE BACKUP Y RESTABLECIMIENTO
           ======================================================== */}
        <div className="space-y-2 pt-1">
          <button
            onClick={async () => {
              try {
                await downloadCompleteProjectZip();
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Download size={16} className="text-white" />
              <span>Descargar Proyecto Completo a mi Laptop (.ZIP)</span>
            </div>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
              Código + Docs
            </span>
          </button>

          <button
            onClick={onExportBackup}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Download size={16} className="text-emerald-600" />
              <span>Exportar Copia de Seguridad (JSON & CSV)</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          <button
            onClick={onFactoryReset}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50/50 text-rose-700 text-xs font-bold shadow-2xs flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw size={16} className="text-rose-600" />
              <span>Restablecer Ajustes de Fábrica</span>
            </div>
            <ChevronRight size={16} className="text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
