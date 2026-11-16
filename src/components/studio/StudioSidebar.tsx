import React from 'react';
import {
  Sliders,
  Plus,
  RefreshCw,
  Copy,
  Trash2,
  ExternalLink,
  DoorOpen,
  DoorClosed,
  Columns2,
  RotateCw,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  ArrowUpDown,
  Compass,
  Box,
} from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { CATALOG_TEMPLATES } from '../../data/presets';
import { analyzeRoomClearances, getWallDistances } from '../../utils/geometry';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { cn } from '../../utils/cn';

const NEUTRAL_FINISH_SWATCHES = [
  { label: 'Grigio cemento', color: '#8f9194' },
  { label: 'Antracite scuro', color: '#3f4145' },
  { label: 'Rovere scuro', color: '#4a3525' },
  { label: 'Marrone nero', color: '#26211e' },
  { label: 'Rovere naturale', color: '#d9b99b' },
  { label: 'Sabbia tessuto', color: '#c2b59f' },
  { label: 'Bianco opaco', color: '#f1f3f5' },
  { label: 'Nero tecnico', color: '#18181b' },
];

export const StudioSidebar: React.FC = () => {
  const activeMode = useRoomStore((s) => s.activeMode);
  const currentItems = useRoomStore((s) => s.currentItems);
  const newItems = useRoomStore((s) => s.newItems);
  const savedScenarios = useRoomStore((s) => s.savedScenarios);
  const room = useRoomStore((s) => s.room);

  const selectedItemId = useRoomStore((s) => s.selectedItemId);
  const setSelectedItemId = useRoomStore((s) => s.setSelectedItemId);
  const activeSidebarTab = useRoomStore((s) => s.activeSidebarTab);
  const setActiveSidebarTab = useRoomStore((s) => s.setActiveSidebarTab);
  const setWardrobeModalItemId = useRoomStore((s) => s.setWardrobeModalItemId);

  const updateItem = useRoomStore((s) => s.updateItem);
  const moveItemTo = useRoomStore((s) => s.moveItemTo);
  const setItemDistanceFromWall = useRoomStore((s) => s.setItemDistanceFromWall);
  const rotateItem = useRoomStore((s) => s.rotateItem);
  const toggleItemOpen = useRoomStore((s) => s.toggleItemOpen);
  const addItemFromTemplate = useRoomStore((s) => s.addItemFromTemplate);
  const replaceItemWithTemplate = useRoomStore((s) => s.replaceItemWithTemplate);
  const duplicateItem = useRoomStore((s) => s.duplicateItem);
  const deleteItem = useRoomStore((s) => s.deleteItem);

  const updateRoom = useRoomStore((s) => s.updateRoom);
  const clampToWalls = useRoomStore((s) => s.clampToWalls);
  const setClampToWalls = useRoomStore((s) => s.setClampToWalls);

  const customMeasurements = useRoomStore((s) => s.customMeasurements);
  const removeMeasurementLine = useRoomStore((s) => s.removeMeasurementLine);
  const clearMeasurements = useRoomStore((s) => s.clearMeasurements);

  const activeItems = React.useMemo(() => {
    if (activeMode === 'current') return currentItems;
    if (activeMode === 'new') return newItems;
    const found = savedScenarios.find((s) => s.id === activeMode);
    return found ? found.items : newItems;
  }, [activeMode, currentItems, newItems, savedScenarios]);

  const selectedItem = React.useMemo(
    () => activeItems.find((i) => i.id === selectedItemId) ?? null,
    [activeItems, selectedItemId]
  );

  const warnings = React.useMemo(
    () => analyzeRoomClearances(activeItems, room),
    [activeItems, room]
  );

  const selectedWallDistances = React.useMemo(
    () => (selectedItem ? getWallDistances(selectedItem, room) : null),
    [selectedItem, room]
  );

  const canManageCompartments =
    selectedItem &&
    (selectedItem.modelType === 'elena_wardrobe' ||
      selectedItem.modelType === 'current_green_bridge' ||
      selectedItem.modelType === 'billy_corner' ||
      selectedItem.modelType === 'kallax_2x4');

  const currentTabValue =
    activeSidebarTab === 'photos' ? 'inspector' : activeSidebarTab;

  return (
    <aside className="w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 h-full overflow-hidden">
      <Tabs
        value={currentTabValue}
        onValueChange={(val) =>
          setActiveSidebarTab(
            val as 'inspector' | 'catalog' | 'room' | 'measurements'
          )
        }
        className="flex flex-col h-full"
      >
        <div className="p-4 border-b border-zinc-800 shrink-0">
          <TabsList className="w-full grid grid-cols-4 h-10 p-2 gap-2">
            <TabsTrigger value="inspector" className="h-8 px-2 text-xs">
              Proprietà
            </TabsTrigger>
            <TabsTrigger value="catalog" className="h-8 px-2 text-xs">
              Catalogo
            </TabsTrigger>
            <TabsTrigger value="room" className="h-8 px-2 text-xs">
              Misure stanza
            </TabsTrigger>
            <TabsTrigger value="measurements" className="h-8 px-2 text-xs">
              Misure e avvisi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Proprietà (inspector) */}
        <TabsContent
          value="inspector"
          className="flex-1 overflow-y-auto p-4 mt-0 flex flex-col gap-6"
        >
          {/* Lista rapida dei mobili presenti nella stanza */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                Mobili in stanza ({activeItems.length})
              </span>
              {selectedItem && (
                <button
                  type="button"
                  onClick={() => setSelectedItemId(null)}
                  className="text-xs font-normal text-zinc-400 hover:text-zinc-100"
                >
                  Deseleziona
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900 p-2">
              {activeItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      'h-8 px-2 rounded-md text-xs flex items-center justify-between gap-2 text-left transition-colors',
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800 font-normal'
                    )}
                  >
                    <span className="truncate">{item.name}</span>
                    <span
                      className={cn(
                        'text-xs shrink-0',
                        isSelected ? 'text-zinc-800' : 'text-zinc-400'
                      )}
                    >
                      {item.width}×{item.depth} cm
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedItem ? (
            <div className="flex flex-col gap-6">
              {/* Intestazione mobile selezionato */}
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-zinc-100">
                      {selectedItem.name}
                    </h3>
                    {selectedItem.price !== undefined && (
                      <Badge variant="active" className="shrink-0">
                        {selectedItem.price} €
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {selectedItem.brand && <span>{selectedItem.brand}</span>}
                    {selectedItem.code && (
                      <Badge variant="muted">Cod. {selectedItem.code}</Badge>
                    )}
                  </div>

                  {selectedItem.productUrl && (
                    <a
                      href={selectedItem.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-medium text-zinc-200 hover:text-zinc-100 underline underline-offset-4"
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                      <span>Apri scheda prodotto originale</span>
                    </a>
                  )}
                </div>

                {/* Azioni prominenti sul mobile */}
                <div className="flex flex-col gap-2">
                  {selectedItem.canOpen && (
                    <Button
                      type="button"
                      variant={selectedItem.isOpen ? 'default' : 'secondary'}
                      onClick={() => toggleItemOpen(selectedItem.id)}
                      className="w-full h-10 justify-center"
                    >
                      {selectedItem.isOpen ? (
                        <>
                          <DoorClosed className="h-4 w-4" strokeWidth={1.5} />
                          <span>Chiudi ante / cassetti / rete</span>
                        </>
                      ) : (
                        <>
                          <DoorOpen className="h-4 w-4" strokeWidth={1.5} />
                          <span>Apri mobile (verifica ingombro)</span>
                        </>
                      )}
                    </Button>
                  )}

                  {canManageCompartments && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => setWardrobeModalItemId(selectedItem.id)}
                      className="w-full h-10 justify-center"
                    >
                      <Columns2 className="h-4 w-4" strokeWidth={1.5} />
                      <span>Gestisci scompartimenti interni</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Opzione specifica Libreria Billy Corner */}
              {selectedItem.modelType === 'billy_corner' && (
                <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
                    <span>Configurazione bracci angolari Billy</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        selectedItem.width === 215 &&
                        selectedItem.secondaryWidth === 135
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() =>
                        updateItem(selectedItem.id, {
                          width: 215,
                          secondaryWidth: 135,
                          x: Math.round(215 / 2),
                          z: Math.round(135 / 2),
                        })
                      }
                      className="h-8 justify-start px-4"
                    >
                      Misura link Ikea (215×135 cm)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        selectedItem.width === 242 &&
                        selectedItem.secondaryWidth === 215
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() =>
                        updateItem(selectedItem.id, {
                          width: 242,
                          secondaryWidth: 215,
                          x: Math.round(242 / 2),
                          z: Math.round(215 / 2),
                        })
                      }
                      className="h-8 justify-start px-4"
                    >
                      Misura piantina (242×215 cm)
                    </Button>
                  </div>
                </div>
              )}

              {/* Opzione specifica Scaffale Kallax 2x4 */}
              {selectedItem.modelType === 'kallax_2x4' && (
                <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <ArrowUpDown className="h-4 w-4" strokeWidth={1.5} />
                    <span>Orientamento scaffale Kallax 2×4</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedItem.width >= selectedItem.height ? 'default' : 'outline'}
                      onClick={() => {
                        updateItem(selectedItem.id, {
                          width: 147,
                          depth: 39,
                          height: 77,
                          name: 'Scaffale Ikea Kallax 2×4 orizzontale',
                        });
                        setTimeout(() => {
                          moveItemTo(selectedItem.id, selectedItem.x, selectedItem.z);
                        }, 0);
                      }}
                      className="h-8 justify-start px-4"
                    >
                      Orizzontale a terra (147×39×77 cm)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedItem.height > selectedItem.width ? 'default' : 'outline'}
                      onClick={() => {
                        updateItem(selectedItem.id, {
                          width: 77,
                          depth: 39,
                          height: 147,
                          name: 'Scaffale Ikea Kallax 2×4 verticale',
                        });
                        setTimeout(() => {
                          moveItemTo(selectedItem.id, selectedItem.x, selectedItem.z);
                        }, 0);
                      }}
                      className="h-8 justify-start px-4"
                    >
                      Verticale (77×39×147 cm)
                    </Button>
                  </div>
                </div>
              )}

              {/* Controlli numerici Dimensioni e Rotazione */}
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                  <Sliders className="h-4 w-4" strokeWidth={1.5} />
                  <span>Dimensioni e quota (cm)</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal text-zinc-400">
                      Larghezza (cm)
                    </label>
                    <Input
                      type="number"
                      value={selectedItem.width}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          width: Math.max(10, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal text-zinc-400">
                      Profondità (cm)
                    </label>
                    <Input
                      type="number"
                      value={selectedItem.depth}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          depth: Math.max(4, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal text-zinc-400">
                      Altezza (cm)
                    </label>
                    <Input
                      type="number"
                      value={selectedItem.height}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          height: Math.max(10, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal text-zinc-400">
                      Altezza da terra (cm)
                    </label>
                    <Input
                      type="number"
                      value={selectedItem.y}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          y: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-zinc-400">
                      Rotazione ({selectedItem.rotation}°)
                    </span>
                    <RotateCw className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 90, 180, 270].map((deg) => (
                      <Button
                        key={deg}
                        type="button"
                        size="sm"
                        variant={selectedItem.rotation === deg ? 'default' : 'outline'}
                        onClick={() => {
                          updateItem(selectedItem.id, { rotation: deg });
                          setTimeout(() => {
                            moveItemTo(selectedItem.id, selectedItem.x, selectedItem.z);
                          }, 0);
                        }}
                        className="h-8 px-2"
                      >
                        {deg}°
                      </Button>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => rotateItem(selectedItem.id, 45)}
                      className="h-8 px-2"
                    >
                      +45°
                    </Button>
                  </div>
                </div>
              </div>

              {/* Distanza esatta dai 4 muri */}
              {selectedWallDistances && (
                <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                    <Compass className="h-4 w-4" strokeWidth={1.5} />
                    <span>Distanza esatta dai 4 muri (cm)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-normal text-zinc-400">
                        Parete nord (porta)
                      </label>
                      <Input
                        type="number"
                        value={selectedWallDistances.north}
                        onChange={(e) =>
                          setItemDistanceFromWall(
                            selectedItem.id,
                            'north',
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-normal text-zinc-400">
                        Parete sud (termosifone)
                      </label>
                      <Input
                        type="number"
                        value={selectedWallDistances.south}
                        onChange={(e) =>
                          setItemDistanceFromWall(
                            selectedItem.id,
                            'south',
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-normal text-zinc-400">
                        Parete ovest (balcone)
                      </label>
                      <Input
                        type="number"
                        value={selectedWallDistances.west}
                        onChange={(e) =>
                          setItemDistanceFromWall(
                            selectedItem.id,
                            'west',
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-normal text-zinc-400">
                        Parete est (letto/armadi)
                      </label>
                      <Input
                        type="number"
                        value={selectedWallDistances.east}
                        onChange={(e) =>
                          setItemDistanceFromWall(
                            selectedItem.id,
                            'east',
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Finitura neutra e azioni Duplica / Elimina */}
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
                <span className="text-xs font-medium text-zinc-200">
                  Colore e finitura
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {NEUTRAL_FINISH_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.color}
                      type="button"
                      onClick={() =>
                        updateItem(selectedItem.id, { color: swatch.color })
                      }
                      title={swatch.label}
                      className={cn(
                        'h-8 rounded-md border flex items-center justify-center transition-colors',
                        selectedItem.color === swatch.color
                          ? 'border-zinc-100'
                          : 'border-zinc-800 hover:border-zinc-600'
                      )}
                      style={{ backgroundColor: swatch.color }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => duplicateItem(selectedItem.id)}
                    className="h-8"
                  >
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                    <span>Duplica</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(selectedItem.id)}
                    className="h-8"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    <span>Elimina</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center justify-center gap-2 text-center">
              <Box className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
              <p className="text-xs font-normal text-zinc-400">
                Seleziona un mobile dalla vista o dall’elenco qui sopra per
                modificarne misure, distanza dai muri o scompartimenti interni.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Catalogo */}
        <TabsContent
          value="catalog"
          className="flex-1 overflow-y-auto p-4 mt-0 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-zinc-100">
              Catalogo mobili e varianti
            </h3>
            <p className="text-xs font-normal text-zinc-400">
              Aggiungi un nuovo elemento al centro della stanza oppure sostituisci
              il mobile attualmente selezionato mantenendone la posizione.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {CATALOG_TEMPLATES.map((tpl, idx) => (
              <div
                key={`${tpl.code ?? tpl.modelType}-${idx}`}
                className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-100">
                      {tpl.name}
                    </span>
                    {tpl.price !== undefined && (
                      <Badge variant="default">{tpl.price} €</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {tpl.brand && <span>{tpl.brand}</span>}
                    <span>
                      {tpl.width} × {tpl.depth} × {tpl.height} cm
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => addItemFromTemplate(tpl)}
                    className="h-8 px-4 flex-1"
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    <span>Aggiungi in stanza</span>
                  </Button>
                  {selectedItem && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        replaceItemWithTemplate(selectedItem.id, tpl)
                      }
                      className="h-8 px-4 flex-1"
                    >
                      <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
                      <span>Sostituisci selezionato</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Misure stanza */}
        <TabsContent
          value="room"
          className="flex-1 overflow-y-auto p-4 mt-0 flex flex-col gap-6"
        >
          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
            <span className="text-xs font-medium text-zinc-200">
              Dimensioni strutturali camera (cm)
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Larghezza parete sud (cm)
                </label>
                <Input
                  type="number"
                  value={room.southWidth}
                  onChange={(e) => {
                    const val = Math.max(200, Number(e.target.value) || 468);
                    updateRoom({ southWidth: val, northWidth: val });
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Profondità est/ovest (cm)
                </label>
                <Input
                  type="number"
                  value={room.depth}
                  onChange={(e) =>
                    updateRoom({
                      depth: Math.max(200, Number(e.target.value) || 424),
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Altezza soffitto (cm)
                </label>
                <Input
                  type="number"
                  value={room.ceilingHeight}
                  onChange={(e) =>
                    updateRoom({
                      ceilingHeight: Math.max(200, Number(e.target.value) || 285),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
            <span className="text-xs font-medium text-zinc-200">
              Porta, portafinestra e termosifone (cm)
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Distanza porta da ovest
                </label>
                <Input
                  type="number"
                  value={room.doorOffsetWest}
                  onChange={(e) =>
                    updateRoom({
                      doorOffsetWest: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Larghezza porta (cm)
                </label>
                <Input
                  type="number"
                  value={room.doorWidth}
                  onChange={(e) =>
                    updateRoom({
                      doorWidth: Math.max(60, Number(e.target.value) || 90),
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Portafinestra da nord
                </label>
                <Input
                  type="number"
                  value={room.windowOffsetNorth}
                  onChange={(e) =>
                    updateRoom({
                      windowOffsetNorth: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-normal text-zinc-400">
                  Termosifone da ovest
                </label>
                <Input
                  type="number"
                  value={room.radiatorOffsetWest}
                  onChange={(e) =>
                    updateRoom({
                      radiatorOffsetWest: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-normal text-zinc-300">
                Porta d’ingresso aperta (battente interno)
              </span>
              <Switch
                checked={room.doorIsOpen}
                onCheckedChange={(checked) => updateRoom({ doorIsOpen: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-zinc-300">
                Vincola mobili dentro i muri (snap 4 cm)
              </span>
              <Switch
                checked={clampToWalls}
                onCheckedChange={(checked) => setClampToWalls(checked)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Misure e avvisi */}
        <TabsContent
          value="measurements"
          className="flex-1 overflow-y-auto p-4 mt-0 flex flex-col gap-6"
        >
          {/* Avvisi di collisione e ingombro */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-200">
              Verifica collisioni e ingombri ({warnings.length})
            </span>

            {warnings.length === 0 ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>
                  Nessuna collisione rilevata tra i mobili e i muri della stanza.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {warnings.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedItemId(w.itemId);
                      setActiveSidebarTab('inspector');
                    }}
                    className="rounded-md border border-zinc-700 bg-zinc-900 p-4 flex items-start gap-2 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <AlertTriangle
                      className="h-4 w-4 text-zinc-200 shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-normal text-zinc-200">
                      {w.message}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Misure prese col Metro punto-punto */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-200">
                Metro punto-punto ({customMeasurements.length})
              </span>
              {customMeasurements.length > 0 && (
                <button
                  type="button"
                  onClick={clearMeasurements}
                  className="text-xs font-normal text-zinc-400 hover:text-zinc-100"
                >
                  Azzera tutte
                </button>
              )}
            </div>

            {customMeasurements.length === 0 ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-400">
                Nessuna misura manuale attiva. Attiva &quot;Metro punto-punto&quot;
                nella barra superiore e clicca due punti nella scena.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {customMeasurements.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium text-zinc-100">
                        {m.label ?? 'Misura punto-punto'}
                      </span>
                      <span className="text-xs font-normal text-zinc-400">
                        ({m.start.x}, {m.start.z}) → ({m.end.x}, {m.end.z}) cm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="active">{m.distanceCm} cm</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeasurementLine(m.id)}
                        title="Elimina misura"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Riepilogo distanze dai muri di ogni mobile */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
              <Ruler className="h-4 w-4" strokeWidth={1.5} />
              <span>Riepilogo distanze dai muri</span>
            </div>

            <div className="flex flex-col gap-2">
              {activeItems.map((item) => {
                const d = getWallDistances(item, room);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setActiveSidebarTab('inspector');
                    }}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2 text-left hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-100 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-normal text-zinc-400 shrink-0">
                        {item.width}×{item.depth}×{item.height} cm
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs font-normal text-zinc-400">
                      <span>Nord: {d.north} cm</span>
                      <span>Sud: {d.south} cm</span>
                      <span>Ovest: {d.west} cm</span>
                      <span>Est: {d.east} cm</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
};
