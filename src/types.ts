export type ThemeAccent = 'emerald' | 'black' | 'blue';
export type Language = 'es' | 'en';
export type UserRole = 'owner' | 'collaborator';

export type LightRequirement = 'direct' | 'partial' | 'shadow';
export type HardwareType = 'esp32_central' | 'esp32_cam';
export type AlarmSeverity = 'critical' | 'warning' | 'system';
export type CareType = 'watering' | 'fertilizer' | 'pruning' | 'repotting' | 'fumigation';
export type WateringTrigger = 'autonomous_threshold' | 'scheduled' | 'manual_app';

export interface Plant {
  id: string;
  name: string;
  species: string;
  potLabel: string;
  photoUrl: string;
  plantedAt: string;
  targetMoistureMin: number;
  targetMoistureMax: number;
  lightRequirement: LightRequirement;
  optimalTempC: number;
  notes: string;
  zoneId: string;
  deviceId: string;
  currentMoisture: number;
  lastWatered?: string;
  healthPct: number;
}

export interface Device {
  id: string;
  name: string;
  mac: string;
  hardwareType: HardwareType;
  firmwareVersion: string;
  batteryVoltage: number;
  wifiRssi: number;
  isOnline: boolean;
  ipAddress: string;
  zoneId: string;
  lastSeen: string;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Telemetry {
  timestamp: string;
  soilMoisture: number;    // % 0-100
  temperature: number;     // °C
  humidity: number;        // %
  soundDb: number;         // dB
  co2Ppm: number;          // ppm
  waterTankLevel: number;  // % 0-100
  waterTankOk: boolean;
  pumpActive: boolean;
  pumpDurationRemaining?: number;
}

export interface WateringEvent {
  id: string;
  plantId: string;
  plantName: string;
  triggerType: WateringTrigger;
  durationSeconds: number;
  estimatedLiters: number;
  executedAt: string;
}

export interface Alarm {
  id: string;
  severity: AlarmSeverity;
  code: string;
  title: string;
  description: string;
  isAcknowledged: boolean;
  createdAt: string;
  plantId?: string;
}

export interface CareReminder {
  id: string;
  plantId: string;
  plantName: string;
  careType: CareType;
  title: string;
  dueDate: string;
  recurrenceDays: number;
  isCompleted: boolean;
  lastCompletedAt?: string;
}

export interface PestDiagnosis {
  id: string;
  plantName: string;
  imageUrl: string;
  leafHealthPct: number;
  pestDetected: string;
  pestConfidence: number;
  organicTreatment: {
    steps: string[];
    products: string[];
    schedule: string;
  };
  timestamp: string;
}

export interface SpeciesCareGuide {
  species: string;
  commonName: string;
  watering: string;
  light: string;
  temperature: string;
  humidity: string;
  fertilizer: string;
  petToxicity: 'Segura para mascotas' | 'Tóxica para gatos/perros';
  isPetSafe: boolean;
  description: string;
  proTips: string[];
}

export interface GrowthPhoto {
  id: string;
  plantId: string;
  imageUrl: string;
  date: string;
  notes: string;
  daysSincePlanting: number;
}

export interface WeatherForecast {
  temp: number;
  rainProbabilityPct: number;
  condition: 'soleado' | 'lluvia' | 'nublado';
  windKmh: number;
  smartSkipRecommended: boolean;
}
