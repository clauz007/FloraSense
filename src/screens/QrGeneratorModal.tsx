import React, { useState } from 'react';
import { QrCode, Printer, X, Download, Sprout, Check } from 'lucide-react';
import { Plant, ThemeAccent } from '../types';

interface Props {
  plants: Plant[];
  isOpen: boolean;
  onClose: () => void;
  accent: ThemeAccent;
}

export const QrGeneratorModal: React.FC<Props> = ({ plants, isOpen, onClose, accent }) => {
  const [selectedPlant, setSelectedPlant] = useState<Plant>(plants[0] || {} as Plant);

  if (!isOpen) return null;

  // Generador de matriz visual QR SVG estilizado
  const generateQrPattern = (seedStr: string) => {
    const size = 21; // QR estándar 21x21
    const grid: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        // Esquinas fijas de alineamiento QR
        const isCorner = 
          (r < 7 && c < 7) ||
          (r < 7 && c >= size - 7) ||
          (r >= size - 7 && c < 7);

        if (isCorner) {
          const border = (r === 0 || r === 6 || c === 0 || c === 6) ||
                         (r === 0 || r === 6 || c === size - 7 || c === size - 1) ||
                         (r === size - 7 || r === size - 1 || c === 0 || c === 6);
          const center = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                         (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
                         (r >= size - 5 && r >= size - 5 && c >= 2 && c <= 4);
          grid[r][c] = border || center;
        } else {
          grid[r][c] = ((hash * (r * 31 + c * 17)) % 100) > 48;
        }
      }
    }
    return grid;
  };

  const qrMatrix = generateQrPattern(selectedPlant.id || 'florasense-01');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Etiquetas QR de Maceta</h3>
            <p className="text-[11px] text-slate-500">Escanea desde el celular para abrir la ficha</p>
          </div>
        </div>

        {/* Selector de Planta */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Seleccionar Planta</label>
          <select
            value={selectedPlant.id}
            onChange={(e) => {
              const p = plants.find(item => item.id === e.target.value);
              if (p) setSelectedPlant(p);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
          >
            {plants.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.potLabel})</option>
            ))}
          </select>
        </div>

        {/* Tarjeta de Etiqueta Imprimible */}
        <div id="printable-qr-tag" className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-5 text-center flex flex-col items-center justify-center mb-5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 mb-2">
            <span>🌱</span>
            <span>FloraSense Smart Tag</span>
          </div>

          {/* SVG QR Code */}
          <div className="w-36 h-36 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/80 mb-3 flex items-center justify-center">
            <svg viewBox="0 0 21 21" className="w-full h-full">
              {qrMatrix.map((row, r) =>
                row.map((val, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width="1"
                    height="1"
                    fill={val ? '#0f172a' : '#ffffff'}
                  />
                ))
              )}
            </svg>
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-tight">{selectedPlant.name}</h4>
          <p className="text-[11px] text-slate-500 italic mb-1">{selectedPlant.species}</p>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
            {selectedPlant.potLabel} • Humedad: {selectedPlant.targetMoistureMin}-{selectedPlant.targetMoistureMax}%
          </span>
          <span className="text-[9px] font-mono text-slate-400 mt-2">
            URI: florasense://plant/{selectedPlant.id}
          </span>
        </div>

        {/* Botón Imprimir / Compartir */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Imprimir Etiqueta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
