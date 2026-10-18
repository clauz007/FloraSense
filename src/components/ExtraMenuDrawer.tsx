import React from 'react';
import { 
  X, 
  Home, 
  Sliders, 
  BookOpen, 
  CalendarDays, 
  Layers, 
  History, 
  QrCode, 
  Activity, 
  UserCheck, 
  FileSpreadsheet, 
  Sparkles, 
  Cpu
} from 'lucide-react';
import { ScreenId } from './Navigation';
import { UserRole, ThemeAccent } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreen: (screen: ScreenId) => void;
  currentScreen: ScreenId;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenSimulator: () => void;
  onExportData: () => void;
  accent: ThemeAccent;
}

export const ExtraMenuDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectScreen,
  currentScreen,
  userRole,
  onToggleRole,
  onOpenSimulator,
  onExportData,
  accent
}) => {
  if (!isOpen) return null;

  const menuSections = [
    {
      title: 'Pantallas Principales',
      items: [
        { id: 'welcome' as ScreenId, label: '1. Bienvenida & Onboarding', icon: Home },
        { id: 'device-config' as ScreenId, label: '2. Configurar ESP32 & Pines', icon: Sliders },
        { id: 'dashboard' as ScreenId, label: '3. Dashboard de Riego', icon: Home },
        { id: 'analytics' as ScreenId, label: '4. Análisis & AI Insights', icon: Activity },
        { id: 'diagnosis' as ScreenId, label: '7. Identificar & Plagas', icon: Sparkles }
      ]
    },
    {
      title: 'Módulos Extra de Cultivo',
      items: [
        { id: 'care-library' as ScreenId, label: 'Biblioteca de Cuidados', icon: BookOpen },
        { id: 'calendar' as ScreenId, label: 'Calendario y Recordatorios', icon: CalendarDays },
        { id: 'zones' as ScreenId, label: 'Zonas y Multi-Dispositivos', icon: Layers },
        { id: 'growth-timeline' as ScreenId, label: 'Línea de Tiempo & Fotos', icon: History },
        { id: 'qr-tags' as ScreenId, label: 'Etiquetas QR para Macetas', icon: QrCode },
        { id: 'system-health' as ScreenId, label: 'Salud del Sistema & OTA', icon: Activity }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                🌱
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">FloraSense Menú</h4>
                <p className="text-[11px] text-slate-500">Módulos del Invernadero</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-500 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-900">
              <UserCheck size={14} className="text-emerald-600" />
              <span>Rol actual: <strong className="capitalize">{userRole === 'owner' ? 'Dueño (Total)' : 'Colaborador (Lectura)'}</strong></span>
            </div>
            <button
              onClick={onToggleRole}
              className="text-[10px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              Cambiar
            </button>
          </div>

          {/* Navigation sections */}
          <div className="p-3 space-y-4">
            {menuSections.map((sec, idx) => (
              <div key={idx}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                  {sec.title}
                </span>
                <div className="space-y-0.5">
                  {sec.items.map(item => {
                    const Icon = item.icon;
                    const isSelected = currentScreen === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectScreen(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenSimulator();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Cpu size={14} className="text-emerald-400" />
            <span>Simulador Hardware & Docs</span>
          </button>

          <button
            onClick={() => {
              onExportData();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-slate-500" />
            <span>Exportar Reporte CSV / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
