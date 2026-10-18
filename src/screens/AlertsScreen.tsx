import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Trash2, 
  Volume2, 
  CheckCircle, 
  Filter,
  Check
} from 'lucide-react';
import { Alarm, AlarmSeverity, ThemeAccent } from '../types';
import { playAlertAlarm, playBuzzerBeep } from '../services/audioBuzzer';

interface Props {
  alarms: Alarm[];
  onAcknowledgeAlarm: (id: string) => void;
  onClearAllAlarms: () => void;
  onTriggerTestAlarm: () => void;
  accent: ThemeAccent;
}

export const AlertsScreen: React.FC<Props> = ({
  alarms,
  onAcknowledgeAlarm,
  onClearAllAlarms,
  onTriggerTestAlarm,
  accent
}) => {
  const [filter, setFilter] = useState<'all' | AlarmSeverity>('all');
  const [isBuzzerTesting, setIsBuzzerTesting] = useState(false);

  const criticalCount = alarms.filter(a => a.severity === 'critical' && !a.isAcknowledged).length;
  const warningCount = alarms.filter(a => a.severity === 'warning' && !a.isAcknowledged).length;
  const systemCount = alarms.filter(a => a.severity === 'system' && !a.isAcknowledged).length;

  const filteredAlarms = alarms.filter(a => {
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const handleTestBuzzer = () => {
    setIsBuzzerTesting(true);
    playAlertAlarm();
    setTimeout(() => setIsBuzzerTesting(false), 900);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Alertas & Logs del Sistema</h2>
          <p className="text-xs text-slate-500">Historial de Eventos del Invernadero</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Sonido en Bocina ESP32 */}
          <button
            onClick={handleTestBuzzer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Activar tono de prueba en el buzzer GPIO 19"
          >
            <Volume2 size={13} className={isBuzzerTesting ? 'text-amber-400 animate-bounce' : ''} />
            <span>{isBuzzerTesting ? 'Sonando' : 'Probar Bocina'}</span>
          </button>

          {alarms.length > 0 && (
            <button
              onClick={onClearAllAlarms}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Borrar todas las alertas"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Contadores Crítico / Avisos / Sistema */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setFilter('critical')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'critical'
                ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-400'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <ShieldAlert size={16} className="text-rose-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Crítico</span>
            </div>
            <span className="text-xl font-extrabold text-rose-600 font-mono block">
              {criticalCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Acción Inmediata</span>
          </button>

          <button
            onClick={() => setFilter('warning')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'warning'
                ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <AlertTriangle size={16} className="text-amber-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Avisos</span>
            </div>
            <span className="text-xl font-extrabold text-amber-600 font-mono block">
              {warningCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Preventivo</span>
          </button>

          <button
            onClick={() => setFilter('system')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'system'
                ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Info size={16} className="text-blue-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sistema</span>
            </div>
            <span className="text-xl font-extrabold text-blue-600 font-mono block">
              {systemCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Logs MQTT</span>
          </button>
        </div>

        {/* Barra de Filtro Rápido */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'critical', label: 'Críticas' },
              { id: 'warning', label: 'Avisos' },
              { id: 'system', label: 'Sistema' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onTriggerTestAlarm}
            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            + Simular Alerta
          </button>
        </div>

        {/* Lista de Alertas */}
        <div className="space-y-2.5">
          {filteredAlarms.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Todo en Orden</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No hay alertas activas en esta categoría. El firmware reporta todos los subsistemas nominales.
              </p>
            </div>
          ) : (
            filteredAlarms.map((alarm) => {
              const isCrit = alarm.severity === 'critical';
              const isWarn = alarm.severity === 'warning';

              return (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    alarm.isAcknowledged
                      ? 'bg-white/70 border-slate-200 opacity-75'
                      : isCrit
                      ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                      : isWarn
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCrit ? 'bg-rose-100 text-rose-600' :
                        isWarn ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {isCrit ? <ShieldAlert size={16} /> :
                         isWarn ? <AlertTriangle size={16} /> :
                         <Info size={16} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {alarm.title}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                            isCrit ? 'bg-rose-100 text-rose-700' :
                            isWarn ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alarm.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          {alarm.description}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alarm.createdAt} • Código: {alarm.code}
                        </span>
                      </div>
                    </div>

                    {!alarm.isAcknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlarm(alarm.id)}
                        className="shrink-0 p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 transition-colors cursor-pointer"
                        title="Marcar como atendida"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
