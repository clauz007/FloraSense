import React, { useState } from 'react';
import { 
  CalendarDays, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Scissors, 
  Sparkles, 
  Droplet, 
  Bug, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { CareReminder, ThemeAccent } from '../types';
import { INITIAL_REMINDERS } from '../data/initialData';
import confetti from 'canvas-confetti';

interface Props {
  accent: ThemeAccent;
}

export const CalendarScreen: React.FC<Props> = ({ accent }) => {
  const [reminders, setReminders] = useState<CareReminder[]>(INITIAL_REMINDERS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlantName, setNewPlantName] = useState('Monstera Deliciosa');
  const [newType, setNewType] = useState<'watering' | 'fertilizer' | 'pruning' | 'fumigation'>('fertilizer');

  const handleToggleTask = (id: string) => {
    setReminders(prev => prev.map(rem => {
      if (rem.id === id) {
        const nextState = !rem.isCompleted;
        if (nextState) {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        }
        return {
          ...rem,
          isCompleted: nextState,
          lastCompletedAt: nextState ? new Date().toISOString().split('T')[0] : rem.lastCompletedAt
        };
      }
      return rem;
    }));
  };

  const handleCreateReminder = () => {
    if (!newTitle.trim()) return;
    const item: CareReminder = {
      id: `rem-${Date.now()}`,
      plantId: 'plt-custom',
      plantName: newPlantName,
      careType: newType,
      title: newTitle,
      dueDate: '2026-10-25',
      recurrenceDays: 7,
      isCompleted: false
    };
    setReminders([item, ...reminders]);
    setNewTitle('');
    setShowAddForm(false);
  };

  const getCareIcon = (type: string) => {
    switch (type) {
      case 'watering': return <Droplet size={14} className="text-emerald-600" />;
      case 'fertilizer': return <Sparkles size={14} className="text-purple-600" />;
      case 'pruning': return <Scissors size={14} className="text-amber-600" />;
      case 'fumigation': return <Bug size={14} className="text-rose-600" />;
      default: return <Clock size={14} className="text-blue-600" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Calendario & Recordatorios</h2>
          <p className="text-xs text-slate-500">Poda, Abono, Fumigación & Riego</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Tarea</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Formulario de Nueva Tarea */}
        {showAddForm && (
          <div className="bg-white rounded-3xl p-4 border border-emerald-300 shadow-md space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-800">Agregar Recordatorio Agronómico</h4>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Título de la Labor</label>
              <input
                type="text"
                placeholder="Ej. Fertilización con humus de lombriz"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Tipo de Cuidado</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="fertilizer">Abonado</option>
                  <option value="pruning">Poda</option>
                  <option value="fumigation">Fumigación Orgánica</option>
                  <option value="watering">Riego Especial</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Planta Asignada</label>
                <input
                  type="text"
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleCreateReminder}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              Guardar Recordatorio
            </button>
          </div>
        )}

        {/* Lista de Tareas Programadas */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Tareas Próximas del Invernadero
          </span>

          {reminders.map(rem => (
            <div
              key={rem.id}
              onClick={() => handleToggleTask(rem.id)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                rem.isCompleted
                  ? 'bg-slate-100/70 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {rem.isCompleted ? (
                    <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center border border-slate-100">
                      {getCareIcon(rem.careType)}
                    </span>
                    <h4 className={`text-xs font-bold ${
                      rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                    }`}>
                      {rem.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {rem.plantName} • Vence: <strong className="text-slate-700">{rem.dueDate}</strong>
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                rem.isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {rem.isCompleted ? 'Completado' : `Cada ${rem.recurrenceDays}d`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
