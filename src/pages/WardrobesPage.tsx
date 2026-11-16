import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import {
  ArrowDown,
  ArrowUp,
  Box,
  Check,
  Columns2,
  DoorClosed,
  DoorOpen,
  Layers,
  Plus,
  Ruler,
  Shirt,
  Sliders,
  Trash2,
} from 'lucide-react';
import { WARDROBE_ACCESSORY_CATALOG } from '../data/presets';
import { useRoomStore } from '../store/useRoomStore';
import { KallaxCellConfig, WardrobeAccessoryCatalogItem } from '../types/room';

const KALLAX_CONTENT_OPTIONS: {
  value: KallaxCellConfig['contentType'];
  label: string;
}[] = [
  { value: 'manga', label: 'Volumi manga e libri' },
  { value: 'funko', label: 'Collezione Funko Pop' },
  { value: 'box_dark', label: 'Contenitore Drona antracite' },
  { value: 'box_white', label: 'Contenitore Drona bianco' },
  { value: 'two_drawers', label: 'Inserto 2 cassetti apribili' },
  { value: 'door', label: 'Anta singola apribile' },
  { value: 'empty', label: 'Vano libero a giorno' },
];

export const WardrobesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeMode,
    currentItems,
    newItems,
    selectedItemId,
    setActiveMode,
    setSelectedItemId,
    updateItem,
    toggleItemOpen,
    addWardrobeAccessory,
    updateWardrobeAccessory,
    removeWardrobeAccessory,
    updateKallaxCell,
  } = useRoomStore();

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

  const allConfigurableItems = useMemo(() => {
    const activeList = activeMode === 'current' ? currentItems : newItems;
    return activeList.filter(
      (i) => i.category === 'wardrobe' || i.category === 'bookcase'
    );
  }, [activeMode, currentItems, newItems]);

  const [activeUnitId, setActiveUnitId] = useState<string>(() => {
    if (selectedItemId) return selectedItemId;
    return 'new-elena-north';
  });

  const activeUnit = useMemo(() => {
    const found = allConfigurableItems.find((i) => i.id === activeUnitId);
    return found ?? allConfigurableItems[0] ?? null;
  }, [allConfigurableItems, activeUnitId]);

  useEffect(() => {
    if (activeUnit && activeUnit.id !== activeUnitId) {
      setActiveUnitId(activeUnit.id);
    }
  }, [activeUnit, activeUnitId]);

  const sortedAccessories = useMemo(() => {
    if (!activeUnit?.accessories) return [];
    return [...activeUnit.accessories].sort((a, b) => b.yCm - a.yCm);
  }, [activeUnit]);

  // Calcola gli spazi verticali liberi tra i ripiani/cassettiere (escludendo specchiera interna e tubi appendiabiti sottili)
  const verticalGaps = useMemo(() => {
    if (!activeUnit) return [];
    const usableHeight = activeUnit.height - 6;
    const structural = [...(activeUnit.accessories ?? [])]
      .filter((a) => a.type !== 'internal_mirror' && a.type !== 'hanger_rod')
      .sort((a, b) => a.yCm - b.yCm);

    const gaps: { fromCm: number; toCm: number; freeCm: number; label: string }[] = [];
    let cursor = 2;

    structural.forEach((acc) => {
      if (acc.yCm > cursor) {
        gaps.push({
          fromCm: cursor,
          toCm: acc.yCm,
          freeCm: Math.max(0, Math.round(acc.yCm - cursor)),
          label: `Sotto ${acc.name}`,
        });
      }
      cursor = Math.max(cursor, acc.yCm + acc.heightCm);
    });

    if (usableHeight > cursor) {
      gaps.push({
        fromCm: cursor,
        toCm: usableHeight,
        freeCm: Math.round(usableHeight - cursor),
        label: 'Vano superiore fino al cielo armadio',
      });
    }

    return gaps;
  }, [activeUnit]);

  const handleAddAccessory = (catalogItem: WardrobeAccessoryCatalogItem) => {
    if (!activeUnit) return;
    const defaultY =
      catalogItem.type === 'drawer_2c' || catalogItem.type === 'drawer_3c'
        ? 2
        : catalogItem.type === 'hanger_rod'
        ? 185
        : catalogItem.type === 'shelf'
        ? 120
        : 60;

    addWardrobeAccessory(activeUnit.id, {
      type: catalogItem.type,
      name: catalogItem.name,
      yCm: Math.min(activeUnit.height - catalogItem.defaultHeightCm - 4, defaultY),
      heightCm: catalogItem.defaultHeightCm,
      price: catalogItem.price,
      hasClothes: catalogItem.type === 'hanger_rod' || catalogItem.type === 'shelf',
      isOpen: false,
    });
  };

  const totalAccessoriesCost = useMemo(() => {
    const list = activeMode === 'current' ? currentItems : newItems;
    return list.reduce(
      (sum, item) =>
        sum +
        (item.accessories?.reduce((accSum, a) => accSum + (a.price ?? 0), 0) ?? 0),
      0
    );
  }, [activeMode, currentItems, newItems]);

  const currentUnitAccessoriesCost = useMemo(() => {
    if (!activeUnit?.accessories) return 0;
    return activeUnit.accessories.reduce((s, a) => s + (a.price ?? 0), 0);
  }, [activeUnit]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-8 font-normal">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Intestazione Pagina */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 inline-flex items-center gap-2">
                <Columns2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <span>Configuratore tecnico attrezzatura interna</span>
              </span>
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-normal text-zinc-400 inline-flex items-center">
                <span>Listino ufficiale Mondo Convenienza e Ikea</span>
              </span>
            </div>
            <h1 className="text-3xl font-medium text-zinc-100">
              Progettazione scompartimenti interni armadi e librerie
            </h1>
            <p className="text-sm font-normal text-zinc-400 max-w-3xl">
              Personalizza l’organizzazione interna di ciascun modulo armadio Elena (93 × 55 × 247 cm),
              della libreria angolare Billy e dello scaffale Kallax 2×4. Ogni modifica aggiorna in
              tempo reale il modello 3D nello studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 p-2 rounded-md border border-zinc-800 bg-zinc-900">
              <button
                type="button"
                onClick={() => setActiveMode('current')}
                className={`h-8 px-4 rounded-md text-xs font-medium transition-colors ${
                  activeMode === 'current'
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Camera attuale
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('new')}
                className={`h-8 px-4 rounded-md text-xs font-medium transition-colors ${
                  activeMode === 'new'
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Camera nuova
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeUnit) {
                  setSelectedItemId(activeUnit.id);
                }
                navigate('/studio');
              }}
              className="h-10 px-6 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <Box className="h-4 w-4" strokeWidth={1.5} />
              <span>Verifica questo mobile in 3D</span>
            </button>
          </div>
        </div>

        {/* Selettore Armadi / Librerie */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allConfigurableItems.map((item) => {
            const isSelected = activeUnit?.id === item.id;
            const accCount = item.accessories?.length ?? 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveUnitId(item.id);
                  setSelectedItemId(item.id);
                }}
                className={`p-4 rounded-md border text-left flex flex-col justify-between gap-4 transition-colors ${
                  isSelected
                    ? 'border-zinc-100 bg-zinc-900'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-normal text-zinc-400">
                      {item.brand ?? 'Modulo'}
                    </span>
                    {isSelected && (
                      <span className="h-8 px-2 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2">
                        <Check className="h-4 w-4" strokeWidth={1.5} />
                        <span>Selezionato</span>
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-100">{item.name}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-normal text-zinc-400">
                  <span>
                    {item.width} × {item.depth} × {item.height} cm
                  </span>
                  <span>
                    {item.modelType === 'kallax_2x4'
                      ? '8 scomparti'
                      : item.modelType === 'billy_corner'
                      ? `${item.shelfCount ?? 6} ripiani`
                      : `${accCount} accessori`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeUnit && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Colonna Sinistra (5 col): Prospetto Tecnico / Elevazione Frontale in Scala */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-normal text-zinc-400">
                      Prospetto tecnico frontale in scala
                    </span>
                    <h2 className="text-lg font-medium text-zinc-100">{activeUnit.name}</h2>
                  </div>

                  {activeUnit.canOpen && (
                    <button
                      type="button"
                      onClick={() => toggleItemOpen(activeUnit.id)}
                      className="h-10 px-4 rounded-md border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-100 inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                      {activeUnit.isOpen ? (
                        <>
                          <DoorOpen className="h-4 w-4" strokeWidth={1.5} />
                          <span>Ante aperte in 3D</span>
                        </>
                      ) : (
                        <>
                          <DoorClosed className="h-4 w-4" strokeWidth={1.5} />
                          <span>Apri ante in 3D</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Disegno Tecnico Elevazione */}
                {activeUnit.modelType === 'kallax_2x4' ? (
                  <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-6">
                    <div className="flex items-center justify-between text-xs font-normal text-zinc-400">
                      <span>Griglia 4 × 2 scomparti (vano interno 33,5 × 33,5 × 39 cm)</span>
                      <span>
                        {activeUnit.width} × {activeUnit.height} cm
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4 rounded-md border-2 border-zinc-700 bg-zinc-900">
                      {(
                        activeUnit.kallaxCells ??
                        Array.from({ length: 8 }, (_, idx) => ({
                          index: idx,
                          contentType: 'empty' as const,
                        }))
                      ).map((cell) => {
                        const optionLabel =
                          KALLAX_CONTENT_OPTIONS.find((o) => o.value === cell.contentType)
                            ?.label ?? 'Vuoto';
                        return (
                          <div
                            key={cell.index}
                            className="aspect-square p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between text-xs font-normal text-zinc-400">
                              <span>Vano #{cell.index + 1}</span>
                              <span>33×33</span>
                            </div>
                            <span className="text-xs font-medium text-zinc-100 leading-snug">
                              {optionLabel}
                            </span>
                            {(cell.contentType === 'two_drawers' ||
                              cell.contentType === 'door') && (
                              <span className="text-xs font-normal text-zinc-400">
                                {cell.isOpen ? 'Stato: aperto' : 'Stato: chiuso'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : activeUnit.modelType === 'billy_corner' ? (
                  <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-6">
                    <div className="flex items-center justify-between text-xs font-normal text-zinc-400">
                      <span>Altezza totale con rialzo: {activeUnit.height} cm</span>
                      <span>Profondità: {activeUnit.depth} cm</span>
                    </div>
                    <div className="relative h-96 w-full rounded-md border-2 border-zinc-700 bg-zinc-900 p-4 flex flex-col justify-between">
                      {Array.from({ length: activeUnit.shelfCount ?? 6 }).map((_, idx) => {
                        const shelfCount = activeUnit.shelfCount ?? 6;
                        const hCm = Math.round(
                          ((shelfCount - idx) / (shelfCount + 1)) * activeUnit.height
                        );
                        return (
                          <div
                            key={idx}
                            className="w-full border-b-2 border-zinc-700 pb-2 flex items-center justify-between text-xs font-normal text-zinc-300"
                          >
                            <span>Ripiano #{shelfCount - idx} (libri e manga)</span>
                            <span>Quota h {hCm} cm</span>
                          </div>
                        );
                      })}
                      <div className="text-xs font-normal text-zinc-400 flex items-center justify-between">
                        <span>Base pavimento</span>
                        <span>0 cm</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs font-normal text-zinc-400">
                      <span>Vano interno: {activeUnit.width - 5} cm larghezza netta</span>
                      <span>Altezza totale: {activeUnit.height} cm</span>
                    </div>

                    {/* Prospetto grafico verticale proporzionale */}
                    <div className="relative h-[520px] w-full rounded-md border-2 border-zinc-700 bg-zinc-900 overflow-hidden">
                      {/* Righello laterale sinistro */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between py-2 px-2 text-xs font-normal text-zinc-400">
                        <span>{activeUnit.height}</span>
                        <span>200</span>
                        <span>150</span>
                        <span>100</span>
                        <span>50</span>
                        <span>0 cm</span>
                      </div>

                      {/* Vano interno armadio */}
                      <div className="absolute left-12 right-0 top-0 bottom-0 p-2">
                        {sortedAccessories.map((acc) => {
                          const bottomPct = Math.max(
                            0,
                            Math.min(96, (acc.yCm / activeUnit.height) * 100)
                          );
                          const heightPct = Math.max(
                            3,
                            Math.min(90, (acc.heightCm / activeUnit.height) * 100)
                          );

                          if (acc.type === 'internal_mirror') {
                            return (
                              <div
                                key={acc.id}
                                style={{
                                  bottom: `${bottomPct}%`,
                                  height: `${heightPct}%`,
                                }}
                                className="absolute right-2 w-8 rounded-md border border-zinc-600 bg-zinc-800/60 flex items-center justify-center"
                                title={acc.name}
                              >
                                <span className="text-xs font-normal text-zinc-300 -rotate-90 whitespace-nowrap">
                                  Specchio interno
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={acc.id}
                              style={{
                                bottom: `${bottomPct}%`,
                                height: `${heightPct}%`,
                              }}
                              className="absolute left-2 right-12 rounded-md border border-zinc-600 bg-zinc-800 px-4 flex items-center justify-between"
                            >
                              <span className="text-xs font-medium text-zinc-100 truncate">
                                {acc.name}
                              </span>
                              <span className="text-xs font-normal text-zinc-300 shrink-0">
                                y: {acc.yCm} cm (h {acc.heightCm} cm)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Elenco quote verticali libere */}
                    <div className="flex flex-col gap-2 pt-2">
                      <span className="text-xs font-medium text-zinc-300">
                        Altezze nette utilizzabili tra gli elementi:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {verticalGaps.map((g, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-between text-xs"
                          >
                            <span className="font-normal text-zinc-400">
                              Da {g.fromCm} a {g.toCm} cm · {g.label}
                            </span>
                            <span className="font-medium text-zinc-100">
                              {g.freeCm} cm liberi
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Riepilogo Costi */}
                <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-normal text-zinc-400">
                    <span>Prezzo struttura base ({activeUnit.name})</span>
                    <span>{activeUnit.price ?? 0} €</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-normal text-zinc-400">
                    <span>Totale accessori interni su questo mobile</span>
                    <span>{currentUnitAccessoriesCost} €</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-zinc-100 pt-2 border-t border-zinc-800">
                    <span>Valore complessivo mobile configurato</span>
                    <span>{(activeUnit.price ?? 0) + currentUnitAccessoriesCost} €</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-normal text-zinc-400 pt-2">
                    <span>Totale accessori interni di tutta la camera</span>
                    <span>{totalAccessoriesCost} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonna Destra (7 col): Controlli Interattivi e Listino Ufficiale */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {activeUnit.modelType === 'kallax_2x4' ? (
                <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
                  <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
                    <h3 className="text-lg font-medium text-zinc-100">
                      Configurazione dei singoli cubotti Ikea Kallax 2×4
                    </h3>
                    <p className="text-xs font-normal text-zinc-400">
                      Scegli per ciascuno degli 8 scomparti cosa inserire (volumi manga, Funko Pop,
                      contenitori Drona, inserti 2 cassetti o anta apribile) e prova l’apertura.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(
                      activeUnit.kallaxCells ??
                      Array.from({ length: 8 }, (_, idx) => ({
                        index: idx,
                        contentType: 'empty' as const,
                      }))
                    ).map((cell) => (
                      <div
                        key={cell.index}
                        className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-100">
                            Scomparto #{cell.index + 1}
                          </span>
                          {(cell.contentType === 'two_drawers' ||
                            cell.contentType === 'door') && (
                            <button
                              type="button"
                              onClick={() =>
                                updateKallaxCell(activeUnit.id, cell.index, {
                                  isOpen: !cell.isOpen,
                                })
                              }
                              className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-100 hover:bg-zinc-800 transition-colors"
                            >
                              {cell.isOpen ? 'Chiudi scomparto' : 'Apri scomparto'}
                            </button>
                          )}
                        </div>

                        <select
                          value={cell.contentType}
                          onChange={(e) =>
                            updateKallaxCell(activeUnit.id, cell.index, {
                              contentType: e.target.value as KallaxCellConfig['contentType'],
                            })
                          }
                          className="h-10 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-normal text-zinc-100 focus:outline-none focus:border-zinc-600"
                        >
                          {KALLAX_CONTENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeUnit.modelType === 'billy_corner' ? (
                <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
                  <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
                    <h3 className="text-lg font-medium text-zinc-100">
                      Configurazione Libreria angolare Ikea Billy
                    </h3>
                    <p className="text-xs font-normal text-zinc-400">
                      Adatta il numero di ripiani e scegli tra la configurazione del link Ikea
                      (215 × 135 cm) o lo sviluppo completo dell’angolo nord-ovest (215 × 215 cm /
                      242 × 215 cm).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(activeUnit.id, {
                          width: 215,
                          secondaryWidth: 215,
                          x: 215 / 2,
                          z: 215 / 2,
                        })
                      }
                      className={`p-4 rounded-md border text-left flex flex-col gap-2 ${
                        activeUnit.width === 215 && activeUnit.secondaryWidth === 215
                          ? 'border-zinc-100 bg-zinc-950'
                          : 'border-zinc-800 bg-zinc-950'
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-100">
                        Angolo simmetrico 215 × 215 cm
                      </span>
                      <span className="text-xs font-normal text-zinc-400">
                        Calibrato sul tratto ovest di 215 cm prima della portafinestra
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateItem(activeUnit.id, {
                          width: 215,
                          secondaryWidth: 135,
                          x: 215 / 2,
                          z: 135 / 2,
                        })
                      }
                      className={`p-4 rounded-md border text-left flex flex-col gap-2 ${
                        activeUnit.secondaryWidth === 135
                          ? 'border-zinc-100 bg-zinc-950'
                          : 'border-zinc-800 bg-zinc-950'
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-100">
                        Combinazione standard Ikea 215 × 135 cm
                      </span>
                      <span className="text-xs font-normal text-zinc-400">
                        Dimensioni ufficiali scheda articolo 595.818.79
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateItem(activeUnit.id, {
                          width: 242,
                          secondaryWidth: 215,
                          x: 242 / 2,
                          z: 215 / 2,
                        })
                      }
                      className={`p-4 rounded-md border text-left flex flex-col gap-2 ${
                        activeUnit.width === 242
                          ? 'border-zinc-100 bg-zinc-950'
                          : 'border-zinc-800 bg-zinc-950'
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-100">
                        Estensione massima piantina 242 × 215 cm
                      </span>
                      <span className="text-xs font-normal text-zinc-400">
                        Copre l’intera parete nord-ovest fino allo stipite della porta
                      </span>
                    </button>
                  </div>

                  <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        Numero di ripiani per ciascuna colonna ({activeUnit.shelfCount ?? 6} ripiani)
                      </span>
                      <span className="text-xs font-normal text-zinc-400">
                        Incluso l’elemento supplementare superiore fino a 237 cm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[4, 5, 6, 7, 8].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => updateItem(activeUnit.id, { shelfCount: count })}
                          className={`h-10 w-10 rounded-md border text-xs font-medium ${
                            (activeUnit.shelfCount ?? 6) === count
                              ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Elenco Accessori Installati nell'Armadio con regolazione altezza al cm */}
                  <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-medium text-zinc-100">
                          Elementi installati nel vano ({sortedAccessories.length})
                        </h3>
                        <p className="text-xs font-normal text-zinc-400">
                          Regola l’altezza da terra (yCm) di ogni ripiano, tubo appendiabiti o
                          cassettiera con precisione al centimetro.
                        </p>
                      </div>
                    </div>

                    {sortedAccessories.length === 0 ? (
                      <div className="p-8 rounded-md border border-zinc-800 bg-zinc-950 text-center text-xs font-normal text-zinc-400">
                        Nessun accessorio interno presente. Seleziona un elemento dal listino
                        sottostante per aggiungerlo.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {sortedAccessories.map((acc) => (
                          <div
                            key={acc.id}
                            className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col gap-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-zinc-100">
                                  {acc.name}
                                </span>
                                <span className="text-xs font-normal text-zinc-400">
                                  Quota base da terra: {acc.yCm} cm · Ingombro verticale:{' '}
                                  {acc.heightCm} cm · Prezzo: {acc.price} €
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {(acc.type === 'hanger_rod' || acc.type === 'shelf') && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateWardrobeAccessory(activeUnit.id, acc.id, {
                                        hasClothes: !acc.hasClothes,
                                      })
                                    }
                                    className={`h-8 px-4 rounded-md border text-xs font-normal inline-flex items-center gap-2 transition-colors ${
                                      acc.hasClothes
                                        ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
                                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                                    }`}
                                  >
                                    <Shirt className="h-4 w-4" strokeWidth={1.5} />
                                    <span>{acc.hasClothes ? 'Abiti visibili' : 'Vano vuoto'}</span>
                                  </button>
                                )}

                                {(acc.type === 'drawer_2c' ||
                                  acc.type === 'drawer_3c' ||
                                  acc.type === 'pullout_basket' ||
                                  acc.type === 'pullout_shelf' ||
                                  acc.type === 'trouser_rack') && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateWardrobeAccessory(activeUnit.id, acc.id, {
                                        isOpen: !acc.isOpen,
                                      })
                                    }
                                    className={`h-8 px-4 rounded-md border text-xs font-normal inline-flex items-center gap-2 transition-colors ${
                                      acc.isOpen
                                        ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                                        : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                                    }`}
                                  >
                                    <span>{acc.isOpen ? 'Estrai: aperto' : 'Apri cassetto'}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => removeWardrobeAccessory(activeUnit.id, acc.id)}
                                  className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 inline-flex items-center justify-center transition-colors"
                                  title="Rimuovi accessorio"
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>

                            {/* Controllo Altezza yCm */}
                            <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
                              <span className="text-xs font-normal text-zinc-400 shrink-0">
                                Altezza yCm:
                              </span>
                              <input
                                type="range"
                                min={2}
                                max={Math.max(10, activeUnit.height - acc.heightCm - 4)}
                                value={acc.yCm}
                                onChange={(e) =>
                                  updateWardrobeAccessory(activeUnit.id, acc.id, {
                                    yCm: Number(e.target.value),
                                  })
                                }
                                className="flex-1 accent-zinc-100"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateWardrobeAccessory(activeUnit.id, acc.id, {
                                      yCm: Math.max(2, acc.yCm - 4),
                                    })
                                  }
                                  className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 inline-flex items-center justify-center"
                                >
                                  <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                                <span className="text-xs font-medium text-zinc-100 w-12 text-center">
                                  {acc.yCm} cm
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateWardrobeAccessory(activeUnit.id, acc.id, {
                                      yCm: Math.min(
                                        activeUnit.height - acc.heightCm - 4,
                                        acc.yCm + 4
                                      ),
                                    })
                                  }
                                  className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 inline-flex items-center justify-center"
                                >
                                  <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Catalogo Ufficiale Accessori Interni Mondo Convenienza */}
                  <div className="p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col gap-6">
                    <div className="flex flex-col gap-2 border-b border-zinc-800 pb-4">
                      <h3 className="text-lg font-medium text-zinc-100">
                        Aggiungi accessori dal listino Mondo Convenienza
                      </h3>
                      <p className="text-xs font-normal text-zinc-400">
                        Prezzi e ingombri rilevati dalla tabella ufficiale degli accessori interni
                        per armadi battenti componibili (vano 2 ante da 90 cm / modulo esterno 93 cm).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {WARDROBE_ACCESSORY_CATALOG.map((cat) => (
                        <div
                          key={cat.code}
                          className="p-4 rounded-md border border-zinc-800 bg-zinc-950 flex flex-col justify-between gap-4"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-zinc-100">
                                {cat.name}
                              </span>
                              <span className="h-8 px-2 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-100 inline-flex items-center shrink-0">
                                {cat.price} €
                              </span>
                            </div>
                            <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                              {cat.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                            <span className="text-xs font-normal text-zinc-400">
                              Altezza: {cat.defaultHeightCm} cm
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddAccessory(cat)}
                              className="h-8 px-4 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                              <Plus className="h-4 w-4" strokeWidth={1.5} />
                              <span>Aggiungi</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobesPage;
