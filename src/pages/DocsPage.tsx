import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import {
  BookOpen,
  Box,
  Columns2,
  Compass,
  DoorOpen,
  Eye,
  FolderTree,
  Layers,
  Move,
  Ruler,
  Sliders,
} from 'lucide-react';
import {
  CURRENT_ROOM_ITEMS,
  DEFAULT_ROOM_CONFIG,
  NEW_ROOM_ITEMS,
  WARDROBE_ACCESSORY_CATALOG,
} from '../data/presets';

export const DocsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-8 font-normal">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Intestazione */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <span>Manuale tecnico e specifiche di progetto</span>
              </span>
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-normal text-zinc-400 inline-flex items-center">
                <span>Versione 1.0 · Scala 1:1 in centimetri</span>
              </span>
            </div>
            <h1 className="text-3xl font-medium text-zinc-100">
              Documentazione tecnica e guida all’utilizzo
            </h1>
            <p className="text-sm font-normal text-zinc-400 max-w-3xl">
              Riferimento completo su comandi interattivi 3D e 2D, sistema di coordinate e
              misurazione al centimetro, quote architettoniche rilevate e struttura del software.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/studio')}
              className="h-10 px-6 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <Box className="h-4 w-4" strokeWidth={1.5} />
              <span>Apri lo studio interattivo</span>
            </button>
          </div>
        </div>

        {/* Sezione 1: Guida Operativa Studio 3D e 2D */}
        <section className="p-8 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
            <span className="text-xs font-medium text-zinc-400">
              1. Manuale operativo dello studio
            </span>
            <h2 className="text-xl font-medium text-zinc-100">
              Come utilizzare la vista 3D, la pianta 2D e gli strumenti di precisione
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <Move className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-sm font-medium">
                  Spostamento, trascinamento e snap ai muri
                </h3>
              </div>
              <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                Clicca su qualsiasi mobile in 3D o sulla pianta 2D e trascinalo sul pavimento. Con
                l’opzione di vincolo attiva, il mobile si aggancia magneticamente a filo parete
                quando si avvicina a meno di 4 cm dal muro e non può uscire dal perimetro.
              </p>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <Compass className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-sm font-medium">
                  Distanze esatte dai 4 muri e rotazione
                </h3>
              </div>
              <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                Nel pannello ispettore a destra puoi digitare la distanza esatta in centimetri
                dalla parete nord, sud, ovest o est, oppure ruotare l’elemento di 90° o a grado
                libero verificando istantaneamente gli ingombri.
              </p>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <DoorOpen className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-sm font-medium">
                  Apertura ante, cassetti, letto contenitore e porta
                </h3>
              </div>
              <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                Apri singolarmente o simultaneamente le ante battenti degli armadi Elena, la rete
                sollevabile del letto contenitore Big Town, i cassetti della scrivania, gli
                scomparti Kallax o il divano letto Parma per controllare i raggi di apertura.
              </p>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <Columns2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-sm font-medium">
                  Personalizzazione interna armadi e librerie
                </h3>
              </div>
              <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                Dalla pagina Scompartimenti armadi o dal modale nello studio puoi aggiungere,
                rimuovere e spostare in altezza ripiani, tubi appendiabiti, cassettiere interne a 2
                o 3 cassetti, cestelli estraibili e divisori ad alveare.
              </p>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <Ruler className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-sm font-medium">
                  Quote automatiche e metro laser punto-punto
                </h3>
              </div>
              <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                Selezionando un mobile compaiono le 4 linee di quota verso le pareti. Attivando lo
                strumento Metro nella barra superiore puoi cliccare due punti qualsiasi nella
                stanza per misurare la distanza reale in centimetri.
              </p>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <Eye className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-sm font-medium">
                  Modalità raggi X, vista divisa e prima persona
                </h3>
              </div>
              <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                Attiva la modalità raggi X per rendere semitrasparenti le scocche esterne e vedere
                sempre gli scomparti interni; usa la vista divisa 3D + 2D per progettare con doppia
                prospettiva o entra in prima persona ad altezza occhi (170 cm).
              </p>
            </div>
          </div>
        </section>

        {/* Sezione 2: Rilievo Metrico Architettonico della Stanza */}
        <section className="p-8 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
            <span className="text-xs font-medium text-zinc-400">
              2. Parametri geometrici della camera
            </span>
            <h2 className="text-xl font-medium text-zinc-100">
              Quote architettoniche rilevate dalla piantina 1:50 e dalle fotografie
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
              <span className="text-xs font-normal text-zinc-400">Larghezza parete sud / nord</span>
              <span className="text-lg font-medium text-zinc-100">
                {DEFAULT_ROOM_CONFIG.southWidth} cm
              </span>
              <span className="text-xs font-normal text-zinc-400">
                Spalla nord-ovest: 242 cm fino alla porta d’ingresso
              </span>
            </div>

            <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
              <span className="text-xs font-normal text-zinc-400">Profondità parete est / ovest</span>
              <span className="text-lg font-medium text-zinc-100">
                {DEFAULT_ROOM_CONFIG.depth} cm
              </span>
              <span className="text-xs font-normal text-zinc-400">
                Spalla nord-ovest: 215 cm prima della portafinestra
              </span>
            </div>

            <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
              <span className="text-xs font-normal text-zinc-400">Altezza soffitto e infissi</span>
              <span className="text-lg font-medium text-zinc-100">
                {DEFAULT_ROOM_CONFIG.ceilingHeight} cm
              </span>
              <span className="text-xs font-normal text-zinc-400">
                Porta: {DEFAULT_ROOM_CONFIG.doorWidth} × {DEFAULT_ROOM_CONFIG.doorHeight} cm ·
                Portafinestra: {DEFAULT_ROOM_CONFIG.windowWidth} × {DEFAULT_ROOM_CONFIG.windowHeight} cm
              </span>
            </div>

            <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
              <span className="text-xs font-normal text-zinc-400">Impianti a parete</span>
              <span className="text-lg font-medium text-zinc-100">
                Termosifone + Split clima
              </span>
              <span className="text-xs font-normal text-zinc-400">
                Termosifone sud-ovest ({DEFAULT_ROOM_CONFIG.radiatorWidth} ×{' '}
                {DEFAULT_ROOM_CONFIG.radiatorDepth} × {DEFAULT_ROOM_CONFIG.radiatorHeight} cm) ·
                Split a h {DEFAULT_ROOM_CONFIG.acHeightFromFloor} cm
              </span>
            </div>
          </div>
        </section>

        {/* Sezione 3: Tabella Completa Mobili e Accessori */}
        <section className="p-8 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
            <span className="text-xs font-medium text-zinc-400">
              3. Tabella tecnica comparativa arredi
            </span>
            <h2 className="text-xl font-medium text-zinc-100">
              Riepilogo dimensioni e codici: progetto nuovo, stato attuale e listino accessori
            </h2>
          </div>

          <div className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-medium text-zinc-300 bg-zinc-900">
                  <th className="p-4">Mobile / Elemento</th>
                  <th className="p-4">Produttore e codice</th>
                  <th className="p-4">Dimensioni (L × P × H)</th>
                  <th className="p-4">Posizione (X, Z)</th>
                  <th className="p-4">Prezzo</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-zinc-300">
                {NEW_ROOM_ITEMS.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800">
                    <td className="p-4 font-medium text-zinc-100">{item.name}</td>
                    <td className="p-4 text-zinc-400">
                      {item.brand} {item.code ? `(${item.code})` : ''}
                    </td>
                    <td className="p-4">
                      {item.width}
                      {item.secondaryWidth ? `/${item.secondaryWidth}` : ''} × {item.depth} ×{' '}
                      {item.height} cm
                    </td>
                    <td className="p-4 text-zinc-400">
                      x: {Math.round(item.x)} cm, z: {Math.round(item.z)} cm
                    </td>
                    <td className="p-4 font-medium text-zinc-100">
                      {item.price !== undefined ? `${item.price} €` : 'Già presente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Tabella Mobili Attuali */}
            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <h3 className="text-base font-medium text-zinc-100">
                Arredi rilevati nella camera attuale ({CURRENT_ROOM_ITEMS.length} elementi)
              </h3>
              <div className="flex flex-col gap-2">
                {CURRENT_ROOM_ITEMS.map((curr) => (
                  <div
                    key={curr.id}
                    className="p-2 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-200">{curr.name}</span>
                    <span className="font-normal text-zinc-400">
                      {curr.width} × {curr.depth} × {curr.height} cm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabella Listino Accessori Interni Armadio */}
            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <h3 className="text-base font-medium text-zinc-100">
                Listino ufficiale accessori interni armadi Mondo Convenienza
              </h3>
              <div className="flex flex-col gap-2">
                {WARDROBE_ACCESSORY_CATALOG.map((acc) => (
                  <div
                    key={acc.code}
                    className="p-2 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-200">{acc.name}</span>
                    <span className="font-normal text-zinc-400">
                      h {acc.defaultHeightCm} cm · {acc.price} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sezione 4: Architettura Tecnica del Repository */}
        <section className="p-8 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
            <span className="text-xs font-medium text-zinc-400">
              4. Architettura software e struttura del codice
            </span>
            <h2 className="text-xl font-medium text-zinc-100">
              Stack tecnologico e organizzazione modulare del progetto
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-zinc-100">
                  Stack tecnologico adottato
                </h3>
              </div>
              <ul className="flex flex-col gap-2 text-xs font-normal text-zinc-400 leading-relaxed">
                <li>
                  · React 18 + TypeScript + Vite per compilazione rapida e tipizzazione rigorosa.
                </li>
                <li>
                  · React Three Fiber + Three.js + Drei per il motore 3D parametrico in scala 1:1
                  (1 unità WebGL = 1 metro = 100 cm).
                </li>
                <li>
                  · Pianta tecnica 2D interattiva in SVG vettoriale sincronizzata in tempo reale
                  con lo stato 3D.
                </li>
                <li>
                  · Zustand con persistenza automatica in LocalStorage (`cameramia-3d-storage-v1`)
                  per salvare posizioni, scenari personalizzati e accessori interni.
                </li>
                <li>
                  · React Router per la navigazione multipagina, Lenis per lo smooth scrolling,
                  GSAP e Motion per le transizioni d’interfaccia.
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h3 className="text-base font-medium text-zinc-100">
                  Albero delle cartelle del repository
                </h3>
              </div>
              <pre className="p-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-normal text-zinc-300 overflow-x-auto leading-relaxed">
{`CameraMia/
├── public/
│   └── reference/              # Foto camera attuale, piantina 1:50, video e listini
├── docs/                       # Documentazione tecnica markdown
├── src/
│   ├── components/
│   │   ├── canvas/             # RoomScene3D, FurnitureModels3D, FloorPlan2D
│   │   ├── layout/             # AppNavbar
│   │   ├── studio/             # StudioToolbar, StudioSidebar, WardrobeConfiguratorModal
│   │   └── ui/                 # Componenti atomici monocromatici
│   ├── data/
│   │   └── presets.ts          # Mobili attuali, nuovi, catalogo e listino accessori
│   ├── pages/
│   │   ├── OverviewPage.tsx    # Presentazione e confronto architettonico
│   │   ├── StudioPage.tsx      # Workspace 3D / 2D / Split full-screen
│   │   ├── WardrobesPage.tsx   # Configuratore scompartimenti armadi e librerie
│   │   ├── SurveyGalleryPage.tsx # Archivio foto, video e piantina
│   │   └── DocsPage.tsx        # Manuale d'uso e specifiche
│   ├── store/
│   │   └── useRoomStore.ts     # Stato globale Zustand + persistenza
│   ├── types/
│   │   └── room.ts             # Interfacce TypeScript
│   └── utils/
│       └── geometry.ts         # Calcolo bounding box, distanze muri e collisioni
└── vercel.json                 # Configurazione deploy SPA`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocsPage;
