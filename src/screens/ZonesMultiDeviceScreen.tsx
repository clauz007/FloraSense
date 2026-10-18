import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Plus, 
  Wifi, 
  CheckCircle, 
  ChevronRight, 
  Sprout, 
  Server,
  Activity
} from 'lucide-react';
import { Zone, Device, ThemeAccent } from '../types';
import { INITIAL_ZONES, INITIAL_DEVICES } from '../data/initialData';

interface Props {
  accent: ThemeAccent;
}

export const ZonesMultiDeviceScreen: React.FC<Props> = ({ accent }) => {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedZone, setSelectedZone] = useState<string>('zone-01');

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Zonas & Multi-Dispositivos</h2>
          <p className="text-xs text-slate-500">Agrupación por Microclimas y Nodos ESP32</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
          {devices.length} Placas Activas
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Zonas de Cultivo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Zonas del Invernadero
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {zones.map(z => (
              <div
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedZone === z.id
                    ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Layers size={16} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{z.name}</h4>
                  </div>
                  {selectedZone === z.id && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Seleccionada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-10">{z.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nodos de Hardware Conectados */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Nodos ESP32 / ESP32-CAM Vinculados
          </span>

          <div className="space-y-2.5">
            {devices.map(dev => (
              <div
                key={dev.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                      dev.hardwareType === 'esp32_central' ? 'bg-emerald-600' : 'bg-slate-900'
                    }`}>
                      {dev.hardwareType === 'esp32_central' ? 'MCU' : 'CAM'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{dev.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {dev.mac} • IP: {dev.ipAddress}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <span className="text-slate-400 block text-[10px]">Firmware</span>
                    <strong className="text-slate-800 font-mono">{dev.firmwareVersion}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <span className="text-slate-400 block text-[10px]">Batería LiPo</span>
                    <strong className="text-slate-800 font-mono">{dev.batteryVoltage}V</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <span className="text-slate-400 block text-[10px]">Wi-Fi RSSI</span>
                    <strong className="text-slate-800 font-mono">{dev.wifiRssi} dBm</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
