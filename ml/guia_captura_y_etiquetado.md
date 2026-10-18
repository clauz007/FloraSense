# GUÍA DE CAPTURA FOTOGRÁFICA Y ETIQUETADO DE DATOS – FloraSense ML

Esta guía detalla el protocolo para recopilar y etiquetar fotografías tanto con el teléfono móvil como con la **ESP32-CAM (AI-Thinker)** para alimentar y afinar los modelos de Machine Learning (Fase B y C).

---

## 1. Protocolo de Captura con el Teléfono Móvil y ESP32-CAM

### Iluminación y Ángulo
- **Luz difusa natural:** Tomar fotos temprano en la mañana (8:00–10:30 am) o a última hora de la tarde (4:30–6:30 pm), o bajo sombra parcial. Evitar luz solar directa cenital que genere reflejos especulares blancos en la cutícula de las hojas.
- **Enfoque macro y distancia:** Para el celular, distancia de 10 a 20 cm manteniendo el foco nítido en el envés de la hoja (donde suelen anidar plagas como cochinilla y pulgón).
- **Enfoque de la ESP32-CAM:** La lente de la cámara OV2640 viene pegada con una gota de adhesivo. Si las fotos salen borrosas a corta distancia, desenroscar con cuidado la lente 1/4 a 1/2 de vuelta en sentido antihorario para ajustar el enfoque focal a 15–25 cm.
- **Fondo:** Si es posible, colocar una cartulina o palma limpia detrás de la hoja para contrastar el borde foliar y evitar confusiones con el sustrato o macetas de fondo.

---

## 2. Clases de Plagas y Características Visuales

| Clase / Etiqueta | Nombre Científico / Común | Dónde buscar y qué fotografiar |
|---|---|---|
| `cochinilla` | *Planococcus citri* (Cochinilla algodonosa) | Masas blancas algodonosas o cerosas en axilas de hojas, tallos y envés foliar. |
| `pulgon` | *Aphidoidea* (Pulgón verde, negro o amarillo) | Colonias apretadas en brotes tiernos, flores y ápices de crecimiento. Presencia de melaza brillante. |
| `mosca_blanca` | *Bemisia tabaci* / *Trialeurodes* | Pequeñas moscas blancas de 1-2 mm que vuelan al mover la hoja; ninfas transparentes/amarillentas pegadas al envés. |
| `acaros` | *Tetranychidae* (Araña roja / ácaros) | Finos punteados amarillos/bronceados en la haz de la hoja; finas telarañas visibles a contraluz en brotes. |
| `sana` | Hoja Saludable | Tejido turgente, color verde uniforme, sin clorosis, necrosis ni parásitos visibles. |

---

## 3. Estructura de Carpetas para el Entrenamiento

Organiza las imágenes recolectadas en la siguiente estructura antes de subirlas a Google Drive para los cuadernos Colab:

```
dataset_florasense/
├── train/
│   ├── sana/
│   ├── cochinilla/
│   ├── pulgon/
│   ├── mosca_blanca/
│   └── acaros/
└── val/
    ├── sana/
    ├── cochinilla/
    ├── pulgon/
    ├── mosca_blanca/
    └── acaros/
```

- **Cantidad recomendada:** Mínimo 80 a 150 fotos por clase para transfer learning efectivo.
- **Data Augmentation:** Los scripts de Colab aplican automáticamente rotación aleatoria, zoom (0.2), flip horizontal y ajustes de brillo para multiplicar el dataset x5.
