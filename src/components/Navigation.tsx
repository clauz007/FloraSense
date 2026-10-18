import React from 'react';
import { 
  LayoutDashboard, 
  LineChart, 
  Camera, 
  Bell, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { ThemeAccent } from '../types';

export type ScreenId = 
  | 'welcome' 
  | 'device-config' 
  | 'dashboard' 
  | 'analytics' 
  | 'alerts' 
  | 'settings' 
  | 'diagnosis'
  | 'care-library'
  | 'calendar'
  | 'zones'
  | 'growth-timeline'
  | 'qr-tags'
  | 'system-health';

interface Props {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  accent: ThemeAccent;
  unreadAlertsCount: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const Navigation: React.FC<Props> = ({
  currentScreen,
  onSelectScreen,
  accent,
  unreadAlertsCount,
  isMenuOpen,
  onToggleMenu
}) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'black': return 'text-slate-900 border-slate-900';
      case 'blue': return 'text-blue-600 border-blue-600';
      case 'emerald':
      default: return 'text-emerald-600 border-emerald-600';
    }
  };

  const activeColor = getAccentColor();

  const navItems = [
    { id: 'dashboard' as ScreenId, label: 'Inicio', icon: LayoutDashboard },
    { id: 'analytics' as ScreenId, label: 'Análisis', icon: LineChart },
    { id: 'diagnosis' as ScreenId, label: 'Cámara IA', icon: Camera, highlight: true },
    { id: 'alerts' as ScreenId, label: 'Alertas', icon: Bell, badge: unreadAlertsCount },
    { id: 'settings' as ScreenId, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="w-full bg-white border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        if (item.highlight) {
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className="relative -top-3 flex flex-col items-center justify-center p-2 group cursor-pointer focus:outline-hidden"
              title="Diagnóstico con Cámara"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                accent === 'black' ? 'bg-slate-900 shadow-slate-900/30' :
                accent === 'blue' ? 'bg-blue-600 shadow-blue-600/30' :
                'bg-emerald-600 shadow-emerald-600/35'
              } text-white`}>
                <Camera size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-700 mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onSelectScreen(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive ? activeColor : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className={`text-[11px] font-medium mt-0.5 ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
