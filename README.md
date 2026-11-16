# CameraMia 3D Studio

Applicazione web interattiva di progettazione d'interni, simulazione tridimensionale e configurazione tecnica degli armadi componibili, sviluppata in scala reale 1:1 (precisione al centimetro) per la riprogettazione completa della camera.

---

## Caratteristiche principali

1. **Doppio scenario istantaneo (Camera attuale vs Camera nuova)**
   - **Camera attuale**: ricostruzione fedele dello stato di fatto rilevato da fotografie e video a 360 gradi (armadio a ponte verde e giallo `386 x 58 x 250 cm`, letto singolo turchese `96 x 202 cm`, comodino bianco, specchio a parete, scrivania `140 x 65 cm`, pensile verde e scaffale Ikea Kallax 2x4 verticale).
   - **Camera nuova (progetto piantina 1:50)**: nuovo layout composto da Libreria angolare Ikea Billy con rialzi (`215 x 215 x 28 cm`, h `237 cm`), scrivania studio posizionata frontalmente nell'angolo nord-ovest, letto contenitore 1.5 piazze Mondo Convenienza Big Town (`131 x 205 x 110 cm`) incorniciato da due armadi componibili Elena a 2 ante battenti (`93 x 55 x 247 cm` ciascuno), scaffale Ikea Kallax 2x4 orizzontale (`147 x 39 x 77 cm`) e poltrona girevole Melania (`79 x 71 x 98 cm`).

2. **Ambiente di progettazione 3D, Pianta 2D e Vista Divisa (Split 50/50)**
   - **Vista 3D interattiva** con React Three Fiber, tagli automatici delle pareti per l'ispezione interna, vista in prima persona ad altezza occhi (`170 cm`) e modalità Raggi X.
   - **Pianta tecnica 2D quotata** in SVG con trascinamento fluido, griglia metrica ogni `50 cm`, archi di apertura porte/ante e quote dinamiche verso le 4 pareti.
   - **Strumento Metro Punto-Punto** per misurare la distanza reale in centimetri tra qualsiasi coppia di punti nella stanza.

3. **Apertura mobili e Configuratore scompartimenti interni armadi**
   - Apertura interattiva di ante battenti, cassetti, rete sollevabile del letto contenitore Big Town, porta d'ingresso e portafinestra.
   - Pagina dedicata (`/armadi`) e modale nello studio per progettare al centimetro l'interno degli armadi componibili Elena utilizzando il **listino ufficiale accessori Mondo Convenienza** (ripiani da `90 cm`, tubi appendiabiti, cassettiere interne a 2 e 3 cassetti, cestelli estraibili, divisori ad alveare, porta pantaloni e specchiera interna).
   - Configurazione personalizzata degli 8 scomparti dello scaffale Ikea Kallax 2x4 e dei ripiani della libreria angolare Billy.

4. **Archivio fotografico, video e documentazione tecnica**
   - Pagina `/rilievo` con la piantina 1:50 ad alta risoluzione, il video panoramico della camera attuale e tutte le schede fotografate nello showroom Mondo Convenienza.
   - Pagina `/docs` con il manuale operativo completo e le tabelle dimensionali.

---

## Stack tecnologico

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Motore 3D**: Three.js + `@react-three/fiber` + `@react-three/drei`
- **Stato e Persistenza**: Zustand (`localStorage` key `cameramia-3d-storage-v1`)
- **Routing e Animazioni**: React Router v6, Lenis Smooth Scroll, GSAP, Motion
- **UI e Stile**: Tailwind CSS (Design System Dark Mode Tecnico Monocromatico su griglia multipla di 8px) + Radix UI primitives + Lucide React (`strokeWidth={1.5}`)

---

## Struttura del progetto

```text
CameraMia/
├── public/
│   └── reference/                  # Archivio organizzato di piantina, foto, video e listini
│       ├── camera-attuale/
│       ├── negozio/
│       ├── piantina/
│       └── video/
├── docs/                           # Documentazione tecnica approfondita
│   ├── architettura-e-stack.md
│   ├── guida-utilizzo.md
│   └── rilievo-e-catalogo-mobili.md
├── src/
│   ├── components/
│   │   ├── canvas/                 # RoomScene3D, FurnitureModels3D, MeasurementsOverlay3D, FloorPlan2D
│   │   ├── layout/                 # AppNavbar
│   │   ├── studio/                 # StudioToolbar, StudioSidebar, WardrobeConfiguratorModal
│   │   └── ui/                     # Componenti UI riutilizzabili
│   ├── data/
│   │   └── presets.ts              # Configurazione stanza, mobili attuali/nuovi, catalogo e listino accessori
│   ├── pages/
│   │   ├── OverviewPage.tsx        # Rotta /        - Presentazione e confronto architettonico
│   │   ├── StudioPage.tsx          # Rotta /studio  - Workspace 3D, 2D e Split
│   │   ├── WardrobesPage.tsx       # Rotta /armadi  - Configuratore scompartimenti interni
│   │   ├── SurveyGalleryPage.tsx   # Rotta /rilievo - Galleria foto, video e piantina
│   │   └── DocsPage.tsx            # Rotta /docs    - Documentazione e tabelle metriche
│   ├── store/
│   │   └── useRoomStore.ts         # Store Zustand con azioni geometriche e persistenza
│   ├── types/
│   │   └── room.ts                 # Modelli dati TypeScript
│   └── utils/
│       └── geometry.ts             # Calcolo bounding box, distanze muri e rilevamento collisioni
├── vercel.json                     # Configurazione rewrite SPA per deploy su Vercel
└── package.json
```

---

## Avvio rapido in locale

```bash
# 1. Installa le dipendenze
npm install

# 2. Avvia il server di sviluppo Vite
npm run dev

# 3. Compila per la produzione
npm run build
```
