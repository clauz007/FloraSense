import React, { useState } from 'react';
import { 
  History, 
  Play, 
  Pause, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Sprout, 
  Camera
} from 'lucide-react';
import { INITIAL_GROWTH_PHOTOS } from '../data/initialData';
import { GrowthPhoto, ThemeAccent } from '../types';

interface Props {
  accent: ThemeAccent;
}

export const GrowthTimelineScreen: React.FC<Props> = ({ accent }) => {
  const [photos, setPhotos] = useState<GrowthPhoto[]>(INITIAL_GROWTH_PHOTOS);
  const [currentIdx, setCurrentIdx] = useState(photos.length - 1);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);

  const activePhoto = photos[currentIdx];

  const handleToggleTimelapse = () => {
    if (isPlayingTimelapse) {
      setIsPlayingTimelapse(false);
      return;
    }
    setIsPlayingTimelapse(true);
    let step = 0;
    const interval = setInterval(() => {
      setCurrentIdx(step % photos.length);
      step++;
      if (step >= photos.length * 2) {
        clearInterval(interval);
        setIsPlayingTimelapse(false);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Línea de Tiempo de Crecimiento</h2>
          <p className="text-xs text-slate-500">Historial Visual & Timelapse Automatizado</p>
        </div>

        <button
          onClick={handleToggleTimelapse}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          {isPlayingTimelapse ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlayingTimelapse ? 'Pausar' : 'Timelapse'}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Visor de Timelapse */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3">
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200">
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.date}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
              {activePhoto.date}
            </div>
            <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Día {activePhoto.daysSincePlanting}
            </div>
          </div>

          {/* Slider de Tiempo */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Siembra (Día 1)</span>
              <strong className="text-emerald-700 font-bold">{activePhoto.date}</strong>
              <span>Actual (Día 120)</span>
            </div>
            <input
              type="range"
              min="0"
              max={photos.length - 1}
              step="1"
              value={currentIdx}
              onChange={(e) => setCurrentIdx(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-0.5">Nota de Evolución:</span>
            {activePhoto.notes}
          </div>
        </div>

        {/* Galería Secuencial */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Capturas Registradas por ESP32-CAM
          </span>

          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setCurrentIdx(idx)}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                  currentIdx === idx ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200'
                }`}
              >
                <img src={p.imageUrl} alt={p.date} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 text-white px-1.5 py-0.5 rounded-sm font-semibold">
                  Día {p.daysSincePlanting}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
