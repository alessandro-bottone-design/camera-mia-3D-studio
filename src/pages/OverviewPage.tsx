import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Box,
  Camera,
  Check,
  Columns2,
  Compass,
  ExternalLink,
  Layers,
  Maximize2,
  Ruler,
  Sliders,
} from 'lucide-react';
import {
  CATALOG_TEMPLATES,
  CURRENT_ROOM_ITEMS,
  NEW_ROOM_ITEMS,
  REFERENCE_IMAGES,
} from '../data/presets';
import { useRoomStore } from '../store/useRoomStore';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { room, newItems, setActiveMode, setSelectedItemId, setWardrobeModalItemId } =
    useRoomStore();

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

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-item',
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const baseFurnitureTotal = newItems.reduce((acc, item) => acc + (item.price ?? 0), 0);
  const accessoriesTotal = newItems.reduce(
    (acc, item) =>
      acc +
      (item.accessories?.reduce((sum, a) => sum + (a.price ?? 0), 0) ?? 0),
    0
  );
  const grandTotal = Math.round((baseFurnitureTotal + accessoriesTotal) * 100) / 100;

  const openStudioWithMode = (mode: 'current' | 'new', selectId?: string) => {
    setActiveMode(mode);
    if (selectId) {
      setSelectedItemId(selectId);
    }
    navigate('/studio');
  };

  return (
    <div ref={heroRef} className="min-h-screen bg-zinc-950 text-zinc-100 font-normal">
      {/* Sezione Hero Tecnica */}
      <section className="border-b border-zinc-800 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="gsap-hero-item flex items-center gap-2">
            <span className="inline-flex items-center gap-2 h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300">
              <Compass className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              <span>Rilievo architettonico in scala 1:1 · Precisione al centimetro</span>
            </span>
            <span className="inline-flex items-center gap-2 h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-normal text-zinc-400">
              <span>Pianta {room.southWidth} × {room.depth} cm</span>
            </span>
          </div>

          <div className="gsap-hero-item flex flex-col gap-4 max-w-4xl">
            <h1 className="text-4xl font-medium tracking-tight text-zinc-100 leading-tight">
              CameraMia 3D Studio — Progettazione tecnica, ingombri e configurazione armadi
            </h1>
            <p className="text-base font-normal text-zinc-400 leading-relaxed">
              Ambiente di simulazione tridimensionale e planimetrica progettato sulle quote reali
              della stanza ({room.southWidth} × {room.depth} cm, altezza soffitto{' '}
              {room.ceilingHeight} cm). Confronta lo stato attuale con il nuovo progetto basato
              sulla piantina, verifica i passaggi liberi al centimetro, apri ante e cassetti e
              personalizza ogni scompartimento interno degli armadi componibili Elena, della
              libreria Billy e dello scaffale Kallax.
            </p>
          </div>

          <div className="gsap-hero-item flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openStudioWithMode('new')}
              className="h-12 px-6 rounded-md bg-zinc-100 text-zinc-950 text-sm font-medium inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <Box className="h-4 w-4" strokeWidth={1.5} />
              <span>Apri lo studio 3D e 2D</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/armadi')}
              className="h-12 px-6 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 text-sm font-medium inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Columns2 className="h-4 w-4" strokeWidth={1.5} />
              <span>Configura gli scompartimenti</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/rilievo')}
              className="h-12 px-6 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-300 text-sm font-normal inline-flex items-center gap-2 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
            >
              <Camera className="h-4 w-4" strokeWidth={1.5} />
              <span>Archivio foto, video e piantina</span>
            </button>
          </div>

          {/* 4 Schede Metriche Tecniche */}
          <div className="gsap-hero-item grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-zinc-400">Dimensioni camera</span>
                <Ruler className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-medium text-zinc-100">
                  {room.southWidth} × {room.depth} cm
                </span>
                <span className="text-xs font-normal text-zinc-400">
                  Parete nord-ovest 242 × 215 cm prima di porta e portafinestra
                </span>
              </div>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-zinc-400">Altezza soffitto</span>
                <Maximize2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-medium text-zinc-100">
                  {room.ceilingHeight} cm
                </span>
                <span className="text-xs font-normal text-zinc-400">
                  Margine superiore 38 cm sopra armadi Elena (h 247 cm)
                </span>
              </div>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-zinc-400">Superficie calpestabile</span>
                <Layers className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-medium text-zinc-100">19,8 m²</span>
                <span className="text-xs font-normal text-zinc-400">
                  Pavimento in graniglia di marmo con zona studio e zona notte distinte
                </span>
              </div>
            </div>

            <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-zinc-400">
                  Investimento stimato nuovi arredi
                </span>
                <Sliders className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-medium text-zinc-100">
                  {grandTotal.toLocaleString('it-IT')} €
                </span>
                <span className="text-xs font-normal text-zinc-400">
                  Include mobili ({baseFurnitureTotal.toLocaleString('it-IT')} €) + accessori interni ({accessoriesTotal.toLocaleString('it-IT')} €)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confronto Architettonico Camera Attuale vs Camera Nuova */}
      <section className="border-b border-zinc-800 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-400">
              Analisi comparativa degli spazi
            </span>
            <h2 className="text-2xl font-medium text-zinc-100">
              Confronto architettonico: camera attuale vs camera nuova
            </h2>
            <p className="text-sm font-normal text-zinc-400 max-w-3xl">
              Passa in qualsiasi momento tra il rilievo dello stato di fatto e il nuovo progetto
              arredativo per verificare come cambia la distribuzione dei volumi, la luce naturale e
              la capienza contenitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scheda Camera Attuale */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-8 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col justify-between gap-8"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-normal text-zinc-400">
                      Stato di fatto rilevato dalle foto e dal video
                    </span>
                    <h3 className="text-xl font-medium text-zinc-100">
                      1. Camera che è adesso ({CURRENT_ROOM_ITEMS.length} elementi)
                    </h3>
                  </div>
                  <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-950 text-xs font-normal text-zinc-400 inline-flex items-center">
                    Preset attuale
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      Parete est — Armadio a ponte verde e giallo (386 × 58 × 250 cm)
                    </span>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      Grande struttura componibile con colonne laterali, cassettiere a vista e vano
                      ponte centrale che ospita il secondo letto singolo.
                    </p>
                  </div>

                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      Angolo nord-ovest — Letto singolo turchese + comodino e specchio
                    </span>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      Letto singolo (96 × 202 cm) posizionato sotto lo split del climatizzatore,
                      affiancato dal comodino bianco (48 × 42 cm) e dallo specchio verticale.
                    </p>
                  </div>

                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      Parete sud — Scrivania studio, pensile verde e Kallax verticale
                    </span>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      Postazione studio (140 × 65 cm) con pensile sospeso superiore e scaffale Ikea
                      Kallax 2×4 orientato in verticale (77 × 39 × 147 cm) vicino al termosifone.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openStudioWithMode('current')}
                className="h-10 px-6 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs font-medium inline-flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Box className="h-4 w-4" strokeWidth={1.5} />
                <span>Esplora la camera attuale in 3D e 2D</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </motion.div>

            {/* Scheda Camera Nuova */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="p-8 rounded-md border border-zinc-700 bg-zinc-900 flex flex-col justify-between gap-8"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-normal text-zinc-400">
                      Nuovo layout progettato sulla piantina 1:50
                    </span>
                    <h3 className="text-xl font-medium text-zinc-100">
                      2. Come sarà la camera ({NEW_ROOM_ITEMS.length} elementi)
                    </h3>
                  </div>
                  <span className="h-8 px-4 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2">
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                    <span>Progetto attivo</span>
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      Angolo studio nord-ovest — Libreria angolare Ikea Billy + scrivania
                    </span>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      Libreria angolare Billy (215 × 215 × 28 cm, h 237 cm) nell’angolo 242 × 215 cm,
                      con la scrivania posizionata frontalmente e lo spazio operativo dedicato per
                      la sedia girevole all’interno della L.
                    </p>
                  </div>

                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      Parete est — Letto 1.5 piazze Big Town tra due armadi Elena 2 ante
                    </span>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      Letto contenitore una piazza e mezza Big Town (131 × 205 × 110 cm) incorniciato
                      simmetricamente da due moduli armadio Elena a 2 ante battenti (93 × 55 × 247 cm
                      ciascuno), lasciando 61 cm di passaggio verso la scrivania.
                    </p>
                  </div>

                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                    <span className="text-sm font-medium text-zinc-100">
                      Parete sud — Kallax 2×4 orizzontale + poltrona girevole Melania
                    </span>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      Scaffale Kallax ruotato in orizzontale (147 × 39 × 77 cm) affiancato alla
                      poltrona girevole Melania (79 × 71 × 98 cm) e compatibile con la variante
                      divano letto Parma.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openStudioWithMode('new')}
                className="h-10 px-6 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                <Box className="h-4 w-4" strokeWidth={1.5} />
                <span>Apri il nuovo progetto nello studio 3D</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Catalogo Tecnico Nuovi Mobili con Link Ufficiali */}
      <section className="border-b border-zinc-800 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-zinc-400">
                Specifiche dimensionali e codici prodotto
              </span>
              <h2 className="text-2xl font-medium text-zinc-100">
                Catalogo tecnico nuovi mobili e varianti ufficiali
              </h2>
              <p className="text-sm font-normal text-zinc-400 max-w-3xl">
                Tutti gli arredi inseriti nel progetto e nel catalogo laterale sono modellati in
                scala reale 1:1 con le misure ufficiali Ikea e Mondo Convenienza.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/armadi')}
              className="h-10 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-100 inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <Columns2 className="h-4 w-4" strokeWidth={1.5} />
              <span>Configura interni e listino accessori</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEW_ROOM_ITEMS.map((item) => {
              const accCost =
                item.accessories?.reduce((s, a) => s + (a.price ?? 0), 0) ?? 0;
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-normal text-zinc-400">
                          {item.brand ?? 'Progetto'} {item.code ? `· Cod. ${item.code}` : ''}
                        </span>
                        <h3 className="text-base font-medium text-zinc-100 leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      {item.price !== undefined && (
                        <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-100 inline-flex items-center shrink-0">
                          {item.price} €
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-4 rounded-md border border-zinc-800 bg-zinc-950">
                      <div className="flex flex-col">
                        <span className="text-xs font-normal text-zinc-400">Larghezza</span>
                        <span className="text-sm font-medium text-zinc-100">
                          {item.width}
                          {item.secondaryWidth ? ` / ${item.secondaryWidth}` : ''} cm
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-normal text-zinc-400">Profondità</span>
                        <span className="text-sm font-medium text-zinc-100">
                          {item.depth} cm
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-normal text-zinc-400">Altezza</span>
                        <span className="text-sm font-medium text-zinc-100">
                          {item.height} cm
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    {item.accessories && item.accessories.length > 0 && (
                      <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex items-center justify-between">
                        <span className="text-xs font-normal text-zinc-400">
                          {item.accessories.length} accessori interni configurati
                        </span>
                        <span className="text-xs font-medium text-zinc-200">
                          + {accCost} €
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => openStudioWithMode('new', item.id)}
                      className="flex-1 h-10 px-4 rounded-md bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-100 inline-flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                      <Box className="h-4 w-4" strokeWidth={1.5} />
                      <span>Ispeziona in 3D</span>
                    </button>

                    {(item.category === 'wardrobe' || item.category === 'bookcase') && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode('new');
                          setSelectedItemId(item.id);
                          setWardrobeModalItemId(item.id);
                          navigate('/armadi');
                        }}
                        className="h-10 px-4 rounded-md border border-zinc-800 bg-zinc-950 text-xs font-normal text-zinc-300 inline-flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                      >
                        <Columns2 className="h-4 w-4" strokeWidth={1.5} />
                        <span>Interni</span>
                      </button>
                    )}

                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-10 w-10 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-300 inline-flex items-center justify-center hover:bg-zinc-800 hover:text-zinc-100 transition-colors shrink-0"
                        title="Apri scheda prodotto ufficiale"
                      >
                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Varianti extra a catalogo (Ponte 6 ante Elena, Divano letto Parma, Elena 1 e 3 ante) */}
          <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium text-zinc-100">
                Varianti alternative pronte nel catalogo dello studio
              </h3>
              <p className="text-xs font-normal text-zinc-400">
                Puoi sostituire o aggiungere con un clic queste varianti direttamente dalla barra
                laterale dello studio 3D e 2D.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATALOG_TEMPLATES.filter(
                (t) =>
                  t.code === 'g93m' ||
                  t.code === 'a5at / joi6' ||
                  t.code === '7jys-1a' ||
                  t.code === '7jys-3a'
              ).map((tpl) => (
                <div
                  key={tpl.name}
                  className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-normal text-zinc-400">
                      {tpl.brand} · {tpl.code}
                    </span>
                    <span className="text-sm font-medium text-zinc-100">{tpl.name}</span>
                    <span className="text-xs font-normal text-zinc-400">
                      Dimensioni: {tpl.width} × {tpl.depth} × {tpl.height} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-xs font-medium text-zinc-200">{tpl.price} €</span>
                    {tpl.productUrl && (
                      <a
                        href={tpl.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-normal text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-2"
                      >
                        <span>Scheda</span>
                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Anteprima Visiva Rilievo e Documentazione */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-zinc-400">
                Riferimenti fotografici e piantina quotata
              </span>
              <h2 className="text-2xl font-medium text-zinc-100">
                Rilievo metrico, piantina 1:50 e foto showroom
              </h2>
              <p className="text-sm font-normal text-zinc-400 max-w-3xl">
                Consulta tutte le immagini ad alta risoluzione della piantina disegnata a mano, le
                foto della camera attuale, il video panoramico e i listini fotografati da Mondo
                Convenienza.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/rilievo')}
                className="h-10 px-4 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                <Camera className="h-4 w-4" strokeWidth={1.5} />
                <span>Apri galleria rilievo completa</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/docs')}
                className="h-10 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs font-medium inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                <span>Manuale e documentazione</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REFERENCE_IMAGES.slice(0, 4).map((img) => (
              <div
                key={img.id}
                onClick={() => navigate('/rilievo')}
                className="cursor-pointer group rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="h-48 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800">
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <span className="text-sm font-medium text-zinc-100">{img.title}</span>
                  <p className="text-xs font-normal text-zinc-400 line-clamp-2">
                    {img.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
