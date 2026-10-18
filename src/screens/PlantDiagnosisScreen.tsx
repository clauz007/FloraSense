import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle, 
  RefreshCw, 
  Plus, 
  Droplet, 
  Sun, 
  Bug, 
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import { ThemeAccent, Plant } from '../types';
import { analyzePlantImage, PlantAiResult } from '../services/geminiAiService';
import { ORGANIC_PEST_TREATMENTS } from '../data/initialData';
import confetti from 'canvas-confetti';

interface Props {
  accent: ThemeAccent;
  onAddPlantToInventory: (newPlant: Partial<Plant>) => void;
  onNavigateToDashboard: () => void;
}

export const PlantDiagnosisScreen: React.FC<Props> = ({
  accent,
  onAddPlantToInventory,
  onNavigateToDashboard
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<PlantAiResult | null>(null);
  const [useEsp32CamLive, setUseEsp32CamLive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Muestras predeterminadas para prueba rápida
  const sampleImages = [
    {
      title: 'Monstera con Cochinilla',
      url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
      label: 'Cochinilla'
    },
    {
      title: 'Albahaca Saludable',
      url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80',
      label: 'Sana'
    },
    {
      title: 'Ficus con Ácaros',
      url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
      label: 'Ácaros'
    }
  ];

  const handleRunAnalysis = async (imgUrl: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePlantImage(imgUrl);
      setDiagnosisResult(result);
      if (result.pestDetected === 'sana') {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        handleRunAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateEsp32CamSnapshot = () => {
    setUseEsp32CamLive(true);
    setIsAnalyzing(true);
    setTimeout(() => {
      setSelectedImage('https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80');
      handleRunAnalysis('https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80');
      setUseEsp32CamLive(false);
    }, 1400);
  };

  const handleSaveToInventory = () => {
    if (!diagnosisResult) return;
    onAddPlantToInventory({
      name: diagnosisResult.commonName,
      species: diagnosisResult.species,
      potLabel: 'Maceta Nueva #4',
      photoUrl: selectedImage,
      plantedAt: new Date().toISOString().split('T')[0],
      targetMoistureMin: 45,
      targetMoistureMax: 75,
      lightRequirement: 'partial',
      optimalTempC: 22.0,
      notes: `${diagnosisResult.notes} - Tratamiento orgánico recomendado guardado.`,
      healthPct: diagnosisResult.leafHealthPct,
      currentMoisture: 55
    });
    alert(`¡${diagnosisResult.commonName} añadida con éxito a tu inventario de FloraSense!`);
    onNavigateToDashboard();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Visión por Computador & IA</h2>
          <p className="text-xs text-slate-500">Identificación, Salud Foliar y Plagas</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
          MobileNetV3 & Gemini
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* ========================================================
            VISOR DE FOTO / CAPTURA ESP32-CAM
           ======================================================== */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3">
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
            <img
              src={selectedImage}
              alt="Muestra de planta o cultivo"
              className="w-full h-full object-cover"
            />

            {/* Overlay de procesamiento */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                <RefreshCw size={32} className="text-emerald-400 animate-spin mb-3" />
                <span className="text-sm font-bold tracking-tight">
                  {useEsp32CamLive ? 'Adquiriendo frame de ESP32-CAM...' : 'Ejecutando Inferencia de ML...'}
                </span>
                <span className="text-xs text-slate-300 mt-1">
                  Segmentación foliar y clasificación de patógenos
                </span>
              </div>
            )}

            {/* Badge de fuente */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/20">
              Sensor OV2640 • 800x600 SVGA
            </div>
          </div>

          {/* Botones de Captura */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSimulateEsp32CamSnapshot}
              disabled={isAnalyzing}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Camera size={14} className="text-emerald-400" />
              <span>Foto ESP32-CAM</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload size={14} className="text-slate-500" />
              <span>Subir de Celular</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Selector de Fotos de Ejemplo */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              O selecciona una muestra botánica de prueba:
            </span>
            <div className="flex gap-2">
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(s.url);
                    handleRunAnalysis(s.url);
                  }}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            RESULTADO DEL DIAGNÓSTICO FITOSANITARIO
           ======================================================== */}
        {diagnosisResult ? (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Tarjeta de Especie & Salud */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Especie Identificada
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {diagnosisResult.commonName}
                  </h3>
                  <p className="text-xs text-slate-500 italic">{diagnosisResult.species}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Salud Foliar
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600 font-mono">
                    {diagnosisResult.leafHealthPct}%
                  </span>
                </div>
              </div>

              {/* Plaga Detectada & Confianza */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                diagnosisResult.pestDetected === 'sana'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    diagnosisResult.pestDetected === 'sana'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    <Bug size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight capitalize">
                      {diagnosisResult.pestDetected === 'sana'
                        ? 'Planta Libre de Plagas'
                        : `Plaga: ${diagnosisResult.pestDetected}`}
                    </h4>
                    <p className="text-[11px] opacity-80">
                      Confianza de Inferencia: {diagnosisResult.pestConfidence}%
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-current">
                  {diagnosisResult.pestDetected === 'sana' ? 'Óptimo' : 'Tratamiento'}
                </span>
              </div>

              {/* Guía de Tratamiento Orgánico */}
              {diagnosisResult.treatmentSteps && diagnosisResult.treatmentSteps.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <HeartHandshake size={14} className="text-emerald-600" />
                    <span>Protocolo de Tratamiento Orgánico Recomendado:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {diagnosisResult.treatmentSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Productos recomendados */}
                  {diagnosisResult.treatmentProducts && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {diagnosisResult.treatmentProducts.map((p, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                          🌿 {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón Guardar en Inventario */}
              <button
                onClick={handleSaveToInventory}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Añadir a mi Inventario de Plantas</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 text-center space-y-2">
            <Sparkles size={28} className="text-emerald-500 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">Listo para Diagnosticar</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Presiona "Foto ESP32-CAM" o sube una fotografía para que los modelos de visión analicen la salud foliar y plagas en segundos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
