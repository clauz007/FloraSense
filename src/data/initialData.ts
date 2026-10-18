import { Plant, Device, Zone, SpeciesCareGuide, Alarm, CareReminder, GrowthPhoto } from '../types';

export const INITIAL_ZONES: Zone[] = [
  { id: 'zone-01', name: 'Zona A – Aromáticas y Semillero', description: 'Mesa sur con luz natural y riego de precisión', icon: 'Sprout', color: 'emerald' },
  { id: 'zone-02', name: 'Zona B – Tropicales e Interior', description: 'Zona protegida con microclima húmedo', icon: 'Flower2', color: 'blue' },
  { id: 'zone-03', name: 'Zona C – Huerto y Frutales', description: 'Canteros con exposición solar directa', icon: 'Apple', color: 'amber' }
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-esp32-01',
    name: 'ESP32 Invernadero Central',
    mac: '24:6F:28:AB:12:34',
    hardwareType: 'esp32_central',
    firmwareVersion: '2.4.1',
    batteryVoltage: 4.18,
    wifiRssi: -54,
    isOnline: true,
    ipAddress: '192.168.1.142',
    zoneId: 'zone-01',
    lastSeen: 'Hace 3 segundos'
  },
  {
    id: 'dev-cam-01',
    name: 'ESP32-CAM Visión IA (OV2640)',
    mac: '24:6F:28:CD:56:78',
    hardwareType: 'esp32_cam',
    firmwareVersion: '1.2.0',
    batteryVoltage: 4.12,
    wifiRssi: -62,
    isOnline: true,
    ipAddress: '192.168.1.145',
    zoneId: 'zone-01',
    lastSeen: 'Hace 12 segundos'
  }
];

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'plt-01',
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    potLabel: 'Maceta #3 Cerámica',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
    plantedAt: '2026-03-12',
    targetMoistureMin: 40,
    targetMoistureMax: 75,
    lightRequirement: 'partial',
    optimalTempC: 22.5,
    notes: 'Sustrato aireado con perlita y corteza de pino. Evitar sol directo.',
    zoneId: 'zone-01',
    deviceId: 'dev-esp32-01',
    currentMoisture: 58,
    lastWatered: 'Ayer, 08:30 AM',
    healthPct: 94
  },
  {
    id: 'plt-02',
    name: 'Albahaca Genovesa',
    species: 'Ocimum basilicum',
    potLabel: 'Maceta #1 Balcón',
    photoUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80',
    plantedAt: '2026-07-01',
    targetMoistureMin: 50,
    targetMoistureMax: 85,
    lightRequirement: 'direct',
    optimalTempC: 24.0,
    notes: 'Requiere riego frecuente en verano y poda de inflorescencias para estimular follaje.',
    zoneId: 'zone-01',
    deviceId: 'dev-esp32-01',
    currentMoisture: 38,
    lastWatered: 'Hace 2 días',
    healthPct: 88
  },
  {
    id: 'plt-03',
    name: 'Ficus Lyrata (Hoja de Violín)',
    species: 'Ficus lyrata',
    potLabel: 'Maceta #5 Terraza',
    photoUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    plantedAt: '2026-01-15',
    targetMoistureMin: 35,
    targetMoistureMax: 65,
    lightRequirement: 'partial',
    optimalTempC: 21.0,
    notes: 'Sensible a encharcamientos. Limpiar el polvo de las hojas cada mes.',
    zoneId: 'zone-02',
    deviceId: 'dev-esp32-01',
    currentMoisture: 62,
    lastWatered: 'Hace 4 días',
    healthPct: 96
  },
  {
    id: 'plt-04',
    name: 'Tomate Cherry Baby',
    species: 'Solanum lycopersicum var. cerasiforme',
    potLabel: 'Jardinera #2 Huerto',
    photoUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    plantedAt: '2026-08-10',
    targetMoistureMin: 55,
    targetMoistureMax: 80,
    lightRequirement: 'direct',
    optimalTempC: 25.0,
    notes: 'En floración. Alta demanda de potasio y riego uniforme para evitar rajado.',
    zoneId: 'zone-03',
    deviceId: 'dev-esp32-01',
    currentMoisture: 49,
    lastWatered: 'Hoy, 06:15 AM',
    healthPct: 91
  }
];

export const SPECIES_CARE_LIBRARY: SpeciesCareGuide[] = [
  {
    species: 'Monstera deliciosa',
    commonName: 'Costilla de Adán / Monstera',
    watering: 'Cada 7-10 días en verano, cada 15 días en invierno. Dejar secar el primer tercio del sustrato.',
    light: 'Luz indirecta brillante. Tolera semisombra, pero no sol directo que queme sus hojas.',
    temperature: '18°C a 27°C. Proteger de corrientes menores a 12°C.',
    humidity: 'Media a alta (60-80%). Agradece pulverizado o tutor de musgo húmedo.',
    fertilizer: 'Fertilizante líquido para plantas verdes cada 3 semanas en primavera y verano.',
    petToxicity: 'Tóxica para gatos/perros',
    isPetSafe: false,
    description: 'Planta trepadora icónica de la selva tropical con fenestraciones naturales en sus hojas adultas.',
    proTips: [
      'Entierra las raíces aéreas en el sustrato para absorber nutrientes extra.',
      'Limpia sus hojas con un paño húmedo con agua tibia para maximizar la fotosíntesis.'
    ]
  },
  {
    species: 'Ocimum basilicum',
    commonName: 'Albahaca Genovesa',
    watering: 'Riego constante y regular. El sustrato debe mantenerse ligeramente húmedo sin encharcar.',
    light: 'Pleno sol (mínimo 6 horas de sol directo al día).',
    temperature: '20°C a 28°C. Muy sensible a las heladas.',
    humidity: 'Media (40-60%). Evitar mojar las hojas al regar para prevenir hongos.',
    fertilizer: 'Abono orgánico (humus de lombriz) cada mes durante su fase activa.',
    petToxicity: 'Segura para mascotas',
    isPetSafe: true,
    description: 'Hierba aromática culinaria indispensable, con aroma penetrante y propiedades repelentes.',
    proTips: [
      'Pellizca los ápices cuando comience a florecer para alargar la producción de hojas tiernas.',
      'Corta siempre justo por encima de un nudo de hojas para que ramifique en dos tallos.'
    ]
  },
  {
    species: 'Ficus lyrata',
    commonName: 'Higuera de hoja de violín',
    watering: 'Moderado. Regar solo cuando los primeros 5 cm de tierra estén secos al tacto.',
    light: 'Luz brillante filtrada. Evitar cambios bruscos de ubicación.',
    temperature: '16°C a 24°C.',
    humidity: '50-70%. Lejos de aires acondicionados o estufas.',
    fertilizer: 'Abono equilibrado NPK 10-10-10 una vez al mes en primavera.',
    petToxicity: 'Tóxica para gatos/perros',
    isPetSafe: false,
    description: 'Árbol ornamental de porte majestuoso con grandes hojas coriáceas en forma de lira.',
    proTips: [
      'Rota la maceta 90 grados cada semana para que el tronco crezca erguido y simétrico.',
      'Si caen hojas inferiores, revisa si hay exceso de agua o corrientes de aire frío.'
    ]
  },
  {
    species: 'Epipremnum aureum',
    commonName: 'Poto / Potus Dorado',
    watering: 'Riego espaciado. Tolera sequía mejor que exceso de agua. Regar cada 7-12 días.',
    light: 'Se adapta desde baja luminosidad hasta luz indirecta abundante.',
    temperature: '15°C a 26°C.',
    humidity: 'Muy tolerante a ambientes secos de interiores (40-60%).',
    fertilizer: 'Fertilizante foliar suave cada 4 semanas en primavera.',
    petToxicity: 'Tóxica para gatos/perros',
    isPetSafe: false,
    description: 'Una de las plantas de interior más resistentes y purificadoras de aire según la NASA.',
    proTips: [
      'Enraíza esquejes en agua en solo 10 días para multiplicar tu cultivo.',
      'Si las hojas pierden el veteado amarillo y se vuelven verdes oscuras, necesita un poco más de luz.'
    ]
  },
  {
    species: 'Solanum lycopersicum var. cerasiforme',
    commonName: 'Tomate Cherry',
    watering: 'Abundante y constante, especialmente en fase de engorde del fruto.',
    light: 'Sol directo pleno (8 horas diarias mínimo).',
    temperature: '22°C a 30°C.',
    humidity: '50-70%. Buena ventilación para evitar botritis.',
    fertilizer: 'Rico en fósforo y potasio con aporte de calcio para evitar podredumbre apical.',
    petToxicity: 'Tóxica para gatos/perros',
    isPetSafe: false,
    description: 'Variedad prolífica de tomates pequeños y dulces ideal para macetohuertos.',
    proTips: [
      'Coloca tutores o cañas firmes antes de que la planta alcance 30 cm de altura.',
      'Poda los brotes axilares (chupones) para concentrar la energía en los racimos florales.'
    ]
  }
];

export const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'alm-01',
    severity: 'critical',
    code: 'WATER_RESERVOIR_LOW',
    title: 'Nivel Crítico de Agua en Tanque',
    description: 'El depósito principal reporta menos del 15% de capacidad. Se ha activado el interlock de seguridad de la minibomba para prevenir daños por funcionamiento en seco.',
    isAcknowledged: false,
    createdAt: 'Hoy, 10:14 AM'
  },
  {
    id: 'alm-02',
    severity: 'warning',
    code: 'SOIL_MOISTURE_LOW',
    title: 'Humedad Baja en Albahaca Genovesa',
    description: 'El sensor de suelo reporta 38%, por debajo del umbral mínimo configurado (50%). Riego autónomo programado para el ciclo vespertino.',
    isAcknowledged: false,
    createdAt: 'Hoy, 09:20 AM',
    plantId: 'plt-02'
  },
  {
    id: 'alm-03',
    severity: 'system',
    code: 'DEVICE_HEALTH_OK',
    title: 'Sincronización MQTT Exitosa',
    description: 'ESP32 Invernadero Central sincronizó 120 paquetes de telemetría a través del túnel seguro TLS 8883.',
    isAcknowledged: true,
    createdAt: 'Hoy, 08:00 AM'
  },
  {
    id: 'alm-04',
    severity: 'warning',
    code: 'NOISE_ANOMALY',
    title: 'Nivel Sonoro Inusual Detectado',
    description: 'El micrófono de la ESP32 registró un pico de 78 dB en el invernadero durante 12 segundos. Posible ráfaga de viento o vibración externa.',
    isAcknowledged: false,
    createdAt: 'Ayer, 11:45 PM'
  }
];

export const INITIAL_REMINDERS: CareReminder[] = [
  {
    id: 'rem-01',
    plantId: 'plt-01',
    plantName: 'Monstera Deliciosa',
    careType: 'fertilizer',
    title: 'Abono foliar bioestimulante',
    dueDate: '2026-10-20',
    recurrenceDays: 15,
    isCompleted: false
  },
  {
    id: 'rem-02',
    plantId: 'plt-02',
    plantName: 'Albahaca Genovesa',
    careType: 'pruning',
    title: 'Poda de ápices y floración',
    dueDate: '2026-10-19',
    recurrenceDays: 7,
    isCompleted: false
  },
  {
    id: 'rem-03',
    plantId: 'plt-03',
    plantName: 'Ficus Lyrata',
    careType: 'cleaning' as any,
    title: 'Limpieza de polvo foliar con esponja',
    dueDate: '2026-10-24',
    recurrenceDays: 30,
    isCompleted: true,
    lastCompletedAt: '2026-09-24'
  },
  {
    id: 'rem-04',
    plantId: 'plt-04',
    plantName: 'Tomate Cherry',
    careType: 'fumigation',
    title: 'Prevención orgánica con Jabón Potásico',
    dueDate: '2026-10-21',
    recurrenceDays: 14,
    isCompleted: false
  }
];

export const INITIAL_GROWTH_PHOTOS: GrowthPhoto[] = [
  {
    id: 'grw-01',
    plantId: 'plt-01',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    date: 'Día 1 – Siembra en maceta',
    notes: 'Plántula de 3 hojas con buen desarrollo radicular.',
    daysSincePlanting: 1
  },
  {
    id: 'grw-02',
    plantId: 'plt-01',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
    date: 'Día 45 – Primera fenestración',
    notes: 'Apareció la primera hoja con agujeros característicos. Tasa de secado estable.',
    daysSincePlanting: 45
  },
  {
    id: 'grw-03',
    plantId: 'plt-01',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
    date: 'Hoy – Día 120 (Estado Actual)',
    notes: 'Excelente turgencia, altura de 65 cm y nueva guía aérea lista.',
    daysSincePlanting: 120
  }
];

export const ORGANIC_PEST_TREATMENTS: Record<string, {
  name: string;
  scientificName: string;
  symptoms: string;
  steps: string[];
  products: string[];
  schedule: string;
  prevention: string;
}> = {
  cochinilla: {
    name: 'Cochinilla Algodonosa',
    scientificName: 'Planococcus citri',
    symptoms: 'Masas blancas cerosas tipo algodón en nudos y axilas, secreción de melaza brillante y hojas amarillentas.',
    steps: [
      'Aislar la planta afectada para evitar contagio a macetas vecinas.',
      'Limpiar manualmente las colonias visibles usando un hisopo empapado en alcohol isopropílico al 70%.',
      'Pulverizar toda la planta (haz y envés foliar) con solución de Jabón Potásico (20 ml/L de agua).',
      'Tras 2 horas del jabón, aplicar Aceite de Neem (5 ml/L de agua con una gota de emulsionante).'
    ],
    products: ['Alcohol isopropílico 70%', 'Jabón Potásico concentrado', 'Aceite de Neem prensado en frío', 'Hisopos de algodón'],
    schedule: 'Aplicar al atardecer cada 4 a 5 días durante 3 semanas consecutivas.',
    prevention: 'Evitar excesos de nitrógeno en el abono y mantener ventilación constante.'
  },
  pulgon: {
    name: 'Pulgón / Áfidos',
    scientificName: 'Aphidoidea',
    symptoms: 'Colonias verdes/negras apiñadas en brotes tiernos, deformación de hojas jóvenes y presencia de hormigas.',
    steps: [
      'Lavar las partes afectadas con un chorro suave de agua a presión para desprender el 80% de los insectos.',
      'Pulverizar solución de Jabón Potásico (15 ml/L) asfixiando a los ejemplares restantes.',
      'Aplicar infusión de ajo concentrada con pimienta de cayena como repelente residual natural.'
    ],
    products: ['Jabón Potásico bio', 'Infusión de dientes de ajo y clavo', 'Pulverizador manual'],
    schedule: 'Aplicar cada 3 días hasta erradicación total (habitualmente 3 ciclos).',
    prevention: 'Favorecer fauna auxiliar como mariquitas (coccinélidos) y crisopas.'
  },
  mosca_blanca: {
    name: 'Mosca Blanca',
    scientificName: 'Bemisia tabaci / Trialeurodes',
    symptoms: 'Nubes de pequeños insectos blancos que levantan vuelo al sacudir la planta; ninfas en envés foliar.',
    steps: [
      'Instalar trampas cromáticas adhesivas amarillas a la altura de la canopia.',
      'Tratar con Jabón Potásico al 2% incidiendo en el envés de todas las hojas.',
      'Espolvorear suavemente Tierra de Diatomeas micronizada sobre el sustrato para cortar el ciclo de pupas.'
    ],
    products: ['Trampas adhesivas amarillas', 'Jabón potásico', 'Tierra de Diatomeas grado alimentario'],
    schedule: 'Cada 4 días durante 4 semanas seguidas.',
    prevention: 'Ventilación activa con ventiladores oscilantes en el invernadero.'
  },
  acaros: {
    name: 'Araña Roja / Ácaros',
    scientificName: 'Tetranychidae',
    symptoms: 'Punteado clorótico amarillento en haz foliar, aspecto bronceado y finísimas telarañas visibles a contraluz.',
    steps: [
      'Aumentar de inmediato la humedad ambiental (los ácaros proliferan en ambientes secos y cálidos).',
      'Bañar la planta con agua fresca pulverizada para romper las telarañas.',
      'Aplicar acaricida orgánico a base de Azufre mojable o extracto de canela y aceite de neem.'
    ],
    products: ['Azufre mojable orgánico', 'Aceite de Neem', 'Humidificador ultrasónico'],
    schedule: 'Cada 5 días por 3 aplicaciones al anochecer.',
    prevention: 'Mantener humedad relativa por encima del 60% en verano.'
  },
  sana: {
    name: 'Tejido Foliar Saludable',
    scientificName: 'Planta en Óptimo Estado',
    symptoms: 'Turgencia celular normal, coloración verde homogénea, cutícula brillante y sin lesiones patógenas.',
    steps: [
      'Mantener el ciclo de riego actual según la humedad de suelo reportada por la ESP32.',
      'Continuar con el régimen de nutrición equilibrado de la ficha botánica.',
      'Inspección visual semanal rutinaria con la ESP32-CAM.'
    ],
    products: ['Agua declorada', 'Bioestimulante de algas marinas preventivo'],
    schedule: 'Monitoreo continuo de telemetría.',
    prevention: 'Seguir las recomendaciones de AI Growth Insight en el panel de análisis.'
  }
};
