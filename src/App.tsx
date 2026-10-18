import React, { useState, useEffect } from 'react';
import { 
  ThemeAccent, 
  Language, 
  UserRole, 
  Plant, 
  Alarm, 
  WateringEvent 
} from './types';
import { INITIAL_PLANTS, INITIAL_ALARMS } from './data/initialData';
import { floraSimulator, SimulatorState } from './services/simulatorService';
import { ScreenId, Navigation } from './components/Navigation';
import { PhoneFrame } from './components/PhoneFrame';
import { ExtraMenuDrawer } from './components/ExtraMenuDrawer';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { DeviceConfigScreen } from './screens/DeviceConfigScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PlantDiagnosisScreen } from './screens/PlantDiagnosisScreen';
import { CareLibraryScreen } from './screens/CareLibraryScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ZonesMultiDeviceScreen } from './screens/ZonesMultiDeviceScreen';
import { GrowthTimelineScreen } from './screens/GrowthTimelineScreen';
import { QrGeneratorModal } from './screens/QrGeneratorModal';
import { SystemHealthScreen } from './screens/SystemHealthScreen';
import { HardwareSimulatorDrawer } from './screens/HardwareSimulatorDrawer';
import { playAlertAlarm, playPumpStartChime } from './services/audioBuzzer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [plants, setPlants] = useState<Plant[]>(INITIAL_PLANTS);
  const [alarms, setAlarms] = useState<Alarm[]>(INITIAL_ALARMS);
  const [accent, setAccent] = useState<ThemeAccent>('emerald');
  const [language, setLanguage] = useState<Language>('es');
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Modales y menús
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Estado del simulador ESP32
  const [simState, setSimState] = useState<SimulatorState>(floraSimulator.getState());

  useEffect(() => {
    const unsubscribe = floraSimulator.subscribe((newState) => {
      setSimState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Handlers para la minibomba y telemetría
  const handleTriggerPump = (seconds: number) => {
    if (userRole === 'collaborator') {
      return {
        success: false,
        message: 'Acceso Denegado: Los colaboradores tienen rol de solo lectura. Solicita permisos de Dueño para regar.'
      };
    }
    const result = floraSimulator.triggerPump(seconds, 'manual_app');
    return result;
  };

  const handleStopPump = () => {
    floraSimulator.stopPump();
  };

  // Handlers de Alertas
  const handleAcknowledgeAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, isAcknowledged: true } : a));
  };

  const handleClearAllAlarms = () => {
    setAlarms([]);
  };

  const handleTriggerTestAlarm = () => {
    playAlertAlarm();
    const testAlarm: Alarm = {
      id: `alm-${Date.now()}`,
      severity: 'critical',
      code: 'ANOMALY_MANUAL_TEST',
      title: 'Prueba de Alarma Crítica en Invernadero',
      description: 'El sensor de sonido detectó un nivel de 82 dB acompañado de un descenso súbito de humedad en Zona A.',
      isAcknowledged: false,
      createdAt: 'Ahora mismo'
    };
    setAlarms([testAlarm, ...alarms]);
  };

  // Añadir nueva planta desde el identificador de cámara
  const handleAddPlantToInventory = (newPlantData: Partial<Plant>) => {
    const newPlant: Plant = {
      id: `plt-${Date.now()}`,
      name: newPlantData.name || 'Nueva Planta',
      species: newPlantData.species || 'Especie Botánica',
      potLabel: newPlantData.potLabel || 'Maceta #4',
      photoUrl: newPlantData.photoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
      plantedAt: newPlantData.plantedAt || new Date().toISOString().split('T')[0],
      targetMoistureMin: newPlantData.targetMoistureMin || 40,
      targetMoistureMax: newPlantData.targetMoistureMax || 75,
      lightRequirement: newPlantData.lightRequirement || 'partial',
      optimalTempC: newPlantData.optimalTempC || 22.0,
      notes: newPlantData.notes || '',
      zoneId: 'zone-01',
      deviceId: 'dev-esp32-01',
      currentMoisture: newPlantData.currentMoisture || 55,
      healthPct: newPlantData.healthPct || 90
    };
    setPlants([newPlant, ...plants]);
  };

  // Exportar reporte CSV / PDF
  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Planta,Especie,Maceta,Humedad_Suelo,Salud_Pct,Fecha_Siembra\n" +
      plants.map(p => `"${p.id}","${p.name}","${p.species}","${p.potLabel}",${p.currentMoisture},${p.healthPct},"${p.plantedAt}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `florasense_reporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFactoryReset = () => {
    if (confirm('¿Deseas restablecer los datos de FloraSense a los valores de fábrica iniciales?')) {
      setPlants(INITIAL_PLANTS);
      setAlarms(INITIAL_ALARMS);
      setAccent('emerald');
      floraSimulator.setSimulatedMoisture(48);
      floraSimulator.setSimulatedTank(82);
      alert('Valores de fábrica restablecidos.');
    }
  };

  const unreadAlertsCount = alarms.filter(a => !a.isAcknowledged).length;

  return (
    <PhoneFrame
      isMobileFrame={isMobileFrame}
      onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
      onOpenSimulator={() => setIsSimulatorOpen(true)}
      accent={accent}
      isOffline={simState.isOfflineMode}
      rainForecast={simState.weather.rainProbabilityPct > 40}
    >
      {/* Contenido de la Pantalla Activa */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            accent={accent}
            activePlantsCount={plants.length}
            devicesCount={2}
          />
        )}

        {currentScreen === 'device-config' && (
          <DeviceConfigScreen
            accent={accent}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            plants={plants}
            telemetry={simState.telemetry}
            isPumpRunning={simState.isPumpRunning}
            pumpDurationRemaining={simState.pumpDurationRemaining}
            weather={simState.weather}
            onTriggerPump={handleTriggerPump}
            onStopPump={handleStopPump}
            accent={accent}
            onSelectPlant={(plant) => {
              setCurrentScreen('analytics');
            }}
            onOpenMenu={() => setIsMenuOpen(true)}
            onNavigateToDiagnosis={() => setCurrentScreen('diagnosis')}
          />
        )}

        {currentScreen === 'analytics' && (
          <AnalyticsScreen
            accent={accent}
            currentTelemetry={simState.telemetry}
          />
        )}

        {currentScreen === 'alerts' && (
          <AlertsScreen
            alarms={alarms}
            onAcknowledgeAlarm={handleAcknowledgeAlarm}
            onClearAllAlarms={handleClearAllAlarms}
            onTriggerTestAlarm={handleTriggerTestAlarm}
            accent={accent}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            accent={accent}
            onChangeAccent={(acc) => setAccent(acc)}
            language={language}
            onChangeLanguage={(lang) => setLanguage(lang)}
            isOfflineMode={simState.isOfflineMode}
            onToggleOffline={() => floraSimulator.toggleOfflineMode()}
            offlineQueueCount={simState.offlineQueueCount}
            onExportBackup={handleExportData}
            onFactoryReset={handleFactoryReset}
          />
        )}

        {currentScreen === 'diagnosis' && (
          <PlantDiagnosisScreen
            accent={accent}
            onAddPlantToInventory={handleAddPlantToInventory}
            onNavigateToDashboard={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'care-library' && (
          <CareLibraryScreen accent={accent} />
        )}

        {currentScreen === 'calendar' && (
          <CalendarScreen accent={accent} />
        )}

        {currentScreen === 'zones' && (
          <ZonesMultiDeviceScreen accent={accent} />
        )}

        {currentScreen === 'growth-timeline' && (
          <GrowthTimelineScreen accent={accent} />
        )}

        {currentScreen === 'system-health' && (
          <SystemHealthScreen accent={accent} />
        )}
      </div>

      {/* Barra de Navegación Inferior (Estilo FlutterFlow) */}
      <Navigation
        currentScreen={currentScreen}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
        accent={accent}
        unreadAlertsCount={unreadAlertsCount}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Menú Drawer para Módulos Extra */}
      <ExtraMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
        currentScreen={currentScreen}
        userRole={userRole}
        onToggleRole={() => {
          const nextRole = userRole === 'owner' ? 'collaborator' : 'owner';
          setUserRole(nextRole);
          alert(`Rol cambiado a: ${nextRole === 'owner' ? 'Dueño (Control Total)' : 'Colaborador (Solo Lectura)'}`);
        }}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onExportData={handleExportData}
        accent={accent}
      />

      {/* Modal de Etiquetas QR */}
      <QrGeneratorModal
        plants={plants}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        accent={accent}
      />

      {/* Modal de Simulador Hardware ESP32 & Código Fuente */}
      <HardwareSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        simulatorState={simState}
      />
    </PhoneFrame>
  );
}
