import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Droplet, 
  Sun, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { SPECIES_CARE_LIBRARY } from '../data/initialData';
import { SpeciesCareGuide, ThemeAccent } from '../types';

interface Props {
  accent: ThemeAccent;
  onSelectSpeciesForAdd?: (species: SpeciesCareGuide) => void;
}

export const CareLibraryScreen: React.FC<Props> = ({ accent, onSelectSpeciesForAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<SpeciesCareGuide | null>(SPECIES_CARE_LIBRARY[0]);

  const filteredGuides = SPECIES_CARE_LIBRARY.filter(g =>
    g.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Biblioteca de Cuidados</h2>
          <p className="text-xs text-slate-500">Fichas Agronómicas & Toxicidad Pet-Friendly</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
          {SPECIES_CARE_LIBRARY.length} Especies
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Barra de Búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre común o científico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Ficha Detallada Seleccionada */}
        {selectedGuide && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {selectedGuide.commonName}
                </h3>
                <p className="text-xs text-slate-500 italic">{selectedGuide.species}</p>
              </div>

              {/* Badge Toxicidad Mascotas */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                selectedGuide.isPetSafe
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {selectedGuide.isPetSafe ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                <span>{selectedGuide.petToxicity}</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {selectedGuide.description}
            </p>

            {/* Parámetros de cultivo */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Droplet size={14} className="text-emerald-600" />
                  <span>Riego</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{selectedGuide.watering}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Sun size={14} className="text-amber-500" />
                  <span>Luz Solar</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{selectedGuide.light}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Thermometer size={14} className="text-rose-500" />
                  <span>Clima</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{selectedGuide.temperature}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Sparkles size={14} className="text-purple-600" />
                  <span>Abono</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{selectedGuide.fertilizer}</p>
              </div>
            </div>

            {/* Consejos Pro */}
            {selectedGuide.proTips && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Consejos de Cuidado Experto
                </span>
                {selectedGuide.proTips.map((tip, i) => (
                  <div key={i} className="text-[11px] text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/70 flex items-start gap-2">
                    <span className="text-emerald-700 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lista de Especies */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Todas las Fichas Disponibles
          </span>
          {filteredGuides.map(guide => (
            <div
              key={guide.species}
              onClick={() => setSelectedGuide(guide)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                selectedGuide?.species === guide.species
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900">{guide.commonName}</h4>
                <p className="text-[11px] text-slate-500 italic">{guide.species}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
