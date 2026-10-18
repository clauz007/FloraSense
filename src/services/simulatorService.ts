import { Telemetry, WateringEvent, Alarm, WeatherForecast } from '../types';
import { playPumpStartChime, playAlertAlarm } from './audioBuzzer';

export interface SimulatorState {
  telemetry: Telemetry;
  isPumpRunning: boolean;
  pumpDurationRemaining: number;
  hourlyPumpSeconds: number;
  isOfflineMode: boolean;
  offlineQueueCount: number;
  weather: WeatherForecast;
  selectedZoneId: string;
  selectedDeviceId: string;
}

type Listener = (state: SimulatorState) => void;

class FloraSimulator {
  private state: SimulatorState = {
    telemetry: {
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      soilMoisture: 48,
      temperature: 23.4,
      humidity: 62.1,
      soundDb: 42.0,
      co2Ppm: 465,
      waterTankLevel: 82,
      waterTankOk: true,
      pumpActive: false,
      pumpDurationRemaining: 0
    },
    isPumpRunning: false,
    pumpDurationRemaining: 0,
    hourlyPumpSeconds: 14,
    isOfflineMode: false,
    offlineQueueCount: 0,
    weather: {
      temp: 22,
      rainProbabilityPct: 15,
      condition: 'soleado',
      windKmh: 12,
      smartSkipRecommended: false
    },
    selectedZoneId: 'zone-01',
    selectedDeviceId: 'dev-esp32-01'
  };

  private listeners: Set<Listener> = new Set();
  private timer: any = null;
  private pumpTimer: any = null;

  constructor() {
    this.startTelemetryLoop();
  }

  private startTelemetryLoop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.tickTelemetry();
    }, 3000);
  }

  private tickTelemetry() {
    const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Si la bomba está encendida, la humedad sube gradualmente
    let newMoisture = this.state.telemetry.soilMoisture;
    let newTank = this.state.telemetry.waterTankLevel;

    if (this.state.isPumpRunning) {
      newMoisture = Math.min(95, newMoisture + 1.2);
      newTank = Math.max(0, newTank - 0.5);
    } else {
      // Evapotranspiración natural lenta
      const delta = (Math.random() * 0.15) - 0.08;
      newMoisture = Math.max(10, Math.min(95, newMoisture + delta));
    }

    // Pequeñas fluctuaciones físicas naturales
    const newTemp = Math.round((23.0 + Math.sin(Date.now() / 15000) * 1.5 + (Math.random() * 0.2 - 0.1)) * 10) / 10;
    const newHum = Math.round((60.0 + Math.cos(Date.now() / 18000) * 4.0 + (Math.random() * 0.4 - 0.2)) * 10) / 10;
    const newSound = Math.round((40.0 + Math.random() * 6.0) * 10) / 10;
    const newCo2 = Math.round(450 + Math.sin(Date.now() / 20000) * 25 + Math.random() * 10);

    const waterTankOk = newTank > 12;

    this.state = {
      ...this.state,
      telemetry: {
        timestamp: timeStr,
        soilMoisture: Math.round(newMoisture * 10) / 10,
        temperature: newTemp,
        humidity: newHum,
        soundDb: newSound,
        co2Ppm: newCo2,
        waterTankLevel: Math.round(newTank),
        waterTankOk,
        pumpActive: this.state.isPumpRunning,
        pumpDurationRemaining: this.state.pumpDurationRemaining
      }
    };

    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  public getState(): SimulatorState {
    return this.state;
  }

  /**
   * Activación de minibomba con seguro estricto de firmware:
   * - Max 15 segundos continuos
   * - Interlock si el tanque tiene < 15% de agua
   * - Acumulado horario
   */
  public triggerPump(seconds = 6, reason = 'manual_app'): { success: boolean; message: string; wateringEvent?: WateringEvent } {
    if (this.state.isOfflineMode) {
      // Modo sin conexión: encolar orden
      this.state.offlineQueueCount += 1;
      this.notify();
      return {
        success: true,
        message: 'Dispositivo sin conexión a internet. Orden de riego encolada localmente (se sincronizará al reconectar).'
      };
    }

    if (this.state.telemetry.waterTankLevel <= 12) {
      playAlertAlarm();
      return {
        success: false,
        message: 'Fallo de seguridad: Tanque de agua en nivel crítico (<12%). La bomba se ha bloqueado físicamente para evitar sobrecalentamiento.'
      };
    }

    if (this.state.hourlyPumpSeconds >= 60) {
      playAlertAlarm();
      return {
        success: false,
        message: 'Límite de seguridad de hardware: La bomba ha operado 60 s durante esta hora. Bloqueada por protección térmica.'
      };
    }

    // Forzar límite máximo de 15 segundos del firmware
    const safeSeconds = Math.min(seconds, 15);

    this.state.isPumpRunning = true;
    this.state.pumpDurationRemaining = safeSeconds;
    this.state.hourlyPumpSeconds += safeSeconds;
    this.state.telemetry.pumpActive = true;
    this.state.telemetry.pumpDurationRemaining = safeSeconds;

    playPumpStartChime();
    this.notify();

    if (this.pumpTimer) clearInterval(this.pumpTimer);

    this.pumpTimer = setInterval(() => {
      this.state.pumpDurationRemaining -= 1;
      this.state.telemetry.pumpDurationRemaining = this.state.pumpDurationRemaining;
      
      if (this.state.pumpDurationRemaining <= 0) {
        this.stopPump();
      } else {
        this.notify();
      }
    }, 1000);

    const estLiters = Math.round((safeSeconds * 0.025) * 1000) / 1000;
    const event: WateringEvent = {
      id: `wtr-${Date.now()}`,
      plantId: 'plt-01',
      plantName: 'Monstera Deliciosa',
      triggerType: reason as any,
      durationSeconds: safeSeconds,
      estimatedLiters: estLiters,
      executedAt: 'Hace un instante'
    };

    return {
      success: true,
      message: `Riego iniciado (${safeSeconds}s, ~${estLiters}L). Corte automático activo.`,
      wateringEvent: event
    };
  }

  public stopPump() {
    if (this.pumpTimer) clearInterval(this.pumpTimer);
    this.state.isPumpRunning = false;
    this.state.pumpDurationRemaining = 0;
    this.state.telemetry.pumpActive = false;
    this.state.telemetry.pumpDurationRemaining = 0;
    this.notify();
  }

  public toggleOfflineMode(forceOffline?: boolean) {
    const target = forceOffline !== undefined ? forceOffline : !this.state.isOfflineMode;
    this.state.isOfflineMode = target;
    if (!target && this.state.offlineQueueCount > 0) {
      // Sincronizar órdenes acumuladas
      const count = this.state.offlineQueueCount;
      this.state.offlineQueueCount = 0;
      setTimeout(() => {
        playPumpStartChime();
      }, 500);
      alert(`[Sincronización FloraSense] Se han sincronizado y enviado ${count} órdenes encoladas al reconectar.`);
    }
    this.notify();
  }

  public setSimulatedMoisture(value: number) {
    this.state.telemetry.soilMoisture = value;
    this.notify();
  }

  public setSimulatedTank(value: number) {
    this.state.telemetry.waterTankLevel = value;
    this.state.telemetry.waterTankOk = value > 12;
    if (value <= 12) {
      playAlertAlarm();
    }
    this.notify();
  }

  public setSimulatedWeatherRain(rainProb: number) {
    this.state.weather.rainProbabilityPct = rainProb;
    this.state.weather.condition = rainProb > 50 ? 'lluvia' : rainProb > 25 ? 'nublado' : 'soleado';
    this.state.weather.smartSkipRecommended = rainProb > 60;
    this.notify();
  }
}

export const floraSimulator = new FloraSimulator();
