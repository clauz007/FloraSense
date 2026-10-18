import React from 'react';
import { AlertTriangle, Droplet, ShieldCheck, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  durationSeconds?: number;
}

export const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  durationSeconds = 6
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <Droplet size={24} className="fill-emerald-600" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{message}</p>

        {/* Aviso de seguridad del firmware */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-amber-800">
          <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Seguridad del Firmware Activa:</span>
            Corte duro automático a los 15s e interlock si el nivel de agua es insuficiente.
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 active:scale-98 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-medium text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Droplet size={16} />
            Regar ({durationSeconds}s)
          </button>
        </div>
      </div>
    </div>
  );
};
