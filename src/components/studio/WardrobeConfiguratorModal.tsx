import React, { useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Columns2,
  Ruler,
  Shirt,
  DoorOpen,
  Layers,
  Grid,
  ArrowUpDown,
  Package,
} from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { WARDROBE_ACCESSORY_CATALOG } from '../../data/presets';
import {
  KallaxCellConfig,
  WardrobeAccessoryCatalogItem,
  WardrobeAccessoryInstance,
} from '../../types/room';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { cn } from '../../utils/cn';

const KALLAX_CONTENT_OPTIONS: {
  value: KallaxCellConfig['contentType'];
  label: string;
  description: string;
}[] = [
  { value: 'empty', label: 'Vano libero', description: 'Cubo 33×33 cm vuoto a giorno' },
  { value: 'manga', label: 'Volumi manga / libri', description: 'Doppia fila di volumi ordinati' },
  { value: 'funko', label: 'Esposizione Funko Pop', description: 'Scatole da collezione in vista' },
  { value: 'box_dark', label: 'Contenitore Dröna scuro', description: 'Scatola in tessuto antracite 33×38×33 cm' },
  { value: 'box_white', label: 'Contenitore Dröna chiaro', description: 'Scatola in tessuto bianco caldo' },
  { value: 'two_drawers', label: 'Inserto 2 cassetti Kallax', description: 'Modulo a due cassetti apribili' },
  { value: 'door', label: 'Inserto con anta Kallax', description: 'Sportello frontale battente' },
];

export interface ClearanceSegment {
  id: string;
  fromCm: number;
  toCm: number;
  netHeightCm: number;
  label: string;
}

export const WardrobeConfiguratorModal: React.FC = () => {
  const wardrobeModalItemId = useRoomStore((s) => s.wardrobeModalItemId);
  const setWardrobeModalItemId = useRoomStore((s) => s.setWardrobeModalItemId);
  const activeMode = useRoomStore((s) => s.activeMode);
  const currentItems = useRoomStore((s) => s.currentItems);
  const newItems = useRoomStore((s) => s.newItems);
  const savedScenarios = useRoomStore((s) => s.savedScenarios);

  const addWardrobeAccessory = useRoomStore((s) => s.addWardrobeAccessory);
  const updateWardrobeAccessory = useRoomStore((s) => s.updateWardrobeAccessory);
  const removeWardrobeAccessory = useRoomStore((s) => s.removeWardrobeAccessory);
  const updateKallaxCell = useRoomStore((s) => s.updateKallaxCell);
  const updateItem = useRoomStore((s) => s.updateItem);

  const activeItems = useMemo(() => {
    if (activeMode === 'current') return currentItems;
    if (activeMode === 'new') return newItems;
    const found = savedScenarios.find((sc) => sc.id === activeMode);
    return found ? found.items : newItems;
  }, [activeMode, currentItems, newItems, savedScenarios]);

  const configurableItems = useMemo(
    () =>
      activeItems.filter(
        (i) =>
          i.modelType === 'elena_wardrobe' ||
          i.modelType === 'current_green_bridge' ||
          i.modelType === 'kallax_2x4' ||
          i.modelType === 'billy_corner'
      ),
    [activeItems]
  );

  const targetItem = useMemo(
    () => activeItems.find((i) => i.id === wardrobeModalItemId) ?? null,
    [activeItems, wardrobeModalItemId]
  );

  const accessories = useMemo(
    () => targetItem?.accessories ?? [],
    [targetItem]
  );

  // Calcolo delle altezze libere nette in cm tra uno scomparto e l'altro
  const clearanceSegments = useMemo<ClearanceSegment[]>(() => {
    if (!targetItem) return [];
    const totalH = targetItem.height;
    // Filtriamo gli elementi strutturali orizzontali (escludendo la specchiera su anta)
    const structural = [...accessories]
      .filter((a) => a.type !== 'internal_mirror')
      .sort((a, b) => a.yCm - b.yCm);

    const segments: ClearanceSegment[] = [];
    let cursorCm = 0;

    structural.forEach((acc, idx) => {
      const gap = Math.round(acc.yCm - cursorCm);
      if (gap > 2) {
        segments.push({
          id: `seg-${idx}`,
          fromCm: cursorCm,
          toCm: acc.yCm,
          netHeightCm: gap,
          label: cursorCm === 0 ? 'Vano inferiore' : `Vano intermedio`,
        });
      }
      cursorCm = Math.max(cursorCm, acc.yCm + acc.heightCm);
    });

    const topGap = Math.round(totalH - cursorCm);
    if (topGap > 2) {
      segments.push({
        id: 'seg-top',
        fromCm: cursorCm,
        toCm: totalH,
        netHeightCm: topGap,
        label: 'Vano superiore',
      });
    }

    return segments;
  }, [targetItem, accessories]);

  const accessoriesTotalCost = useMemo(
    () => accessories.reduce((acc, item) => acc + (item.price || 0), 0),
    [accessories]
  );

  if (!wardrobeModalItemId || !targetItem) {
    return null;
  }

  const isKallax = targetItem.modelType === 'kallax_2x4';
  const isBilly = targetItem.modelType === 'billy_corner';

  const handleAddCatalogAccessory = (catItem: WardrobeAccessoryCatalogItem) => {
    // Posiziona a un'altezza intelligente di default
    let defaultY = 120;
    if (catItem.type === 'drawer_2c' || catItem.type === 'drawer_3c') {
      defaultY = 2;
    } else if (catItem.type === 'hanger_rod') {
      defaultY = 188;
    } else if (catItem.type === 'shelf') {
      defaultY = 198;
    } else if (catItem.type === 'pullout_basket') {
      defaultY = 24;
    } else if (catItem.type === 'internal_mirror') {
      defaultY = 30;
    }

    addWardrobeAccessory(targetItem.id, {
      type: catItem.type,
      name: catItem.name,
      yCm: Math.min(targetItem.height - catItem.defaultHeightCm - 2, defaultY),
      heightCm: catItem.defaultHeightCm,
      price: catItem.price,
      hasClothes: catItem.type === 'hanger_rod' || catItem.type === 'shelf',
      isOpen: false,
    });
  };

  const kallaxCells: KallaxCellConfig[] =
    targetItem.kallaxCells ??
    Array.from({ length: 8 }, (_, idx) => ({
      index: idx,
      contentType: 'empty',
      isOpen: false,
    }));

  const billyShelfHeights = targetItem.shelfHeightsCm ?? [36, 72, 108, 144, 180, 202];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl h-full max-h-[90vh] rounded-md border border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">
        {/* Intestazione modale */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-100">
              <Columns2 className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-medium text-zinc-100">
                Configuratore scompartimenti interni — {targetItem.name}
              </h2>
              <span className="text-xs font-normal text-zinc-400">
                Misure esterne: {targetItem.width} × {targetItem.depth} × {targetItem.height} cm
                {!isKallax &&
                  !isBilly &&
                  ` · Costo attrezzatura interna: ${accessoriesTotalCost} €`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {configurableItems.length > 1 && (
              <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-2">
                {configurableItems.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setWardrobeModalItemId(it.id)}
                    className={cn(
                      'h-8 px-4 rounded-md text-xs font-medium transition-colors',
                      it.id === targetItem.id
                        ? 'bg-zinc-100 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-100'
                    )}
                  >
                    {it.name}
                  </button>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWardrobeModalItemId(null)}
              className="h-10 px-4"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
              <span>Chiudi configuratore</span>
            </Button>
          </div>
        </div>

        {/* Corpo modale */}
        {isKallax ? (
          /* Configuratore specifico per gli 8 cubi dello scaffale Kallax 2x4 */
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-md border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4 text-zinc-200" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-zinc-100">
                    Schema frontale 8 scomparti Kallax (33×33 cm per cubo)
                  </h3>
                </div>
                <Badge variant="default">
                  {targetItem.width >= targetItem.height
                    ? 'Orizzontale 4×2'
                    : 'Verticale 2×4'}
                </Badge>
              </div>

              <div
                className={cn(
                  'grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-6',
                  targetItem.width >= targetItem.height
                    ? 'grid-cols-4'
                    : 'grid-cols-2 max-w-md mx-auto w-full'
                )}
              >
                {kallaxCells.map((cell) => {
                  const option = KALLAX_CONTENT_OPTIONS.find(
                    (o) => o.value === cell.contentType
                  );
                  return (
                    <div
                      key={cell.index}
                      className="aspect-square rounded-md border border-zinc-700 bg-zinc-900 p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="muted">Cubo #{cell.index + 1}</Badge>
                        <span className="text-xs font-normal text-zinc-400">
                          33×33 cm
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-zinc-100">
                          {option?.label ?? 'Vano libero'}
                        </span>
                        {(cell.contentType === 'two_drawers' ||
                          cell.contentType === 'door') && (
                          <button
                            type="button"
                            onClick={() =>
                              updateKallaxCell(targetItem.id, cell.index, {
                                isOpen: !cell.isOpen,
                              })
                            }
                            className="h-8 px-2 rounded-md border border-zinc-700 bg-zinc-950 text-xs font-normal text-zinc-200 hover:bg-zinc-800"
                          >
                            {cell.isOpen ? 'Aperto' : 'Chiuso'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 rounded-md border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-200" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-zinc-100">
                  Personalizza contenuto di ciascuno degli 8 cubi
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {kallaxCells.map((cell) => (
                  <div
                    key={cell.index}
                    className="rounded-md border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-100">
                        Scomparto cubo #{cell.index + 1}
                      </span>
                      {(cell.contentType === 'two_drawers' ||
                        cell.contentType === 'door') && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal text-zinc-400">
                            Apri inserto in 3D
                          </span>
                          <Switch
                            checked={Boolean(cell.isOpen)}
                            onCheckedChange={(checked) =>
                              updateKallaxCell(targetItem.id, cell.index, {
                                isOpen: checked,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {KALLAX_CONTENT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            updateKallaxCell(targetItem.id, cell.index, {
                              contentType: opt.value,
                            })
                          }
                          className={cn(
                            'h-8 px-2 rounded-md border text-xs font-normal truncate transition-colors',
                            cell.contentType === opt.value
                              ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-medium'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isBilly ? (
          /* Configuratore specifico per i ripiani della Libreria Billy angolare */
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-md border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-zinc-200" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-zinc-100">
                    Prospetto altezze ripiani Billy ({targetItem.height} cm)
                  </h3>
                </div>
                <Badge variant="default">
                  {billyShelfHeights.length} ripiani attivi
                </Badge>
              </div>

              <div className="relative h-96 w-full rounded-md border border-zinc-800 bg-zinc-950 p-6 overflow-hidden">
                {billyShelfHeights.map((hCm, idx) => {
                  const bottomPct = Math.min(
                    96,
                    Math.max(2, (hCm / targetItem.height) * 100)
                  );
                  const prevCm = idx === 0 ? 0 : billyShelfHeights[idx - 1];
                  const netGap = Math.max(0, hCm - prevCm - 2);
                  return (
                    <div
                      key={idx}
                      style={{ bottom: `${bottomPct}%` }}
                      className="absolute left-6 right-6 border-t border-zinc-300 flex items-center justify-between pt-2"
                    >
                      <span className="text-xs font-medium text-zinc-200 bg-zinc-900 px-2 rounded-md border border-zinc-800">
                        Ripiano #{idx + 1} a {hCm} cm
                      </span>
                      <span className="text-xs font-normal text-zinc-400 bg-zinc-900 px-2 rounded-md border border-zinc-800">
                        Luce netta sotto: {netGap} cm
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 rounded-md border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-4">
              <h3 className="text-sm font-medium text-zinc-100">
                Regolazione millimetrica altezza ripiani (cm da terra)
              </h3>
              <div className="flex flex-col gap-4">
                {billyShelfHeights.map((hCm, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-100">
                        Ripiano #{idx + 1}
                      </span>
                      <span className="text-xs font-normal text-zinc-400">
                        Quota: {hCm} cm da terra
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={15}
                        max={targetItem.height - 15}
                        step={1}
                        value={[hCm]}
                        onValueChange={([val]) => {
                          const next = [...billyShelfHeights];
                          next[idx] = val;
                          next.sort((a, b) => a - b);
                          updateItem(targetItem.id, { shelfHeightsCm: next });
                        }}
                      />
                      <Input
                        type="number"
                        value={hCm}
                        onChange={(e) => {
                          const next = [...billyShelfHeights];
                          next[idx] = Math.max(
                            10,
                            Math.min(
                              targetItem.height - 10,
                              Number(e.target.value) || 0
                            )
                          );
                          next.sort((a, b) => a - b);
                          updateItem(targetItem.id, { shelfHeightsCm: next });
                        }}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Configuratore Armadio (Elena 247 cm o Ponte attuale) */
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Colonna Sinistra: Disegno tecnico frontale quotato + lista scomparti */}
            <div className="lg:col-span-7 border-r border-zinc-800 p-6 overflow-y-auto flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-zinc-200" strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-zinc-100">
                    Disegno tecnico frontale quotato (scala 1:1 su {targetItem.height} cm)
                  </h3>
                </div>
                <Badge variant="default">
                  {accessories.length} accessori installati
                </Badge>
              </div>

              {/* Vista tecnica frontale SVG + quote libere nette */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-6 rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col items-center gap-2">
                  <svg
                    viewBox={`0 0 240 ${targetItem.height + 24}`}
                    className="w-full max-h-[420px] select-none"
                  >
                    {/* Cornice esterna armadio */}
                    <rect
                      x={40}
                      y={12}
                      width={140}
                      height={targetItem.height}
                      fill="#09090b"
                      stroke="#52525b"
                      strokeWidth={2}
                    />

                    {/* Quote libere nette tra gli scomparti */}
                    {clearanceSegments.map((seg) => {
                      const topY = 12 + (targetItem.height - seg.toCm);
                      const segH = seg.toCm - seg.fromCm;
                      const midY = topY + segH / 2;
                      return (
                        <g key={seg.id}>
                          <line
                            x1={24}
                            y1={topY + 2}
                            x2={24}
                            y2={topY + segH - 2}
                            stroke="#71717a"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                          />
                          <text
                            x={20}
                            y={midY + 3}
                            textAnchor="end"
                            fill="#a1a1aa"
                            fontSize={9}
                          >
                            {seg.netHeightCm} cm
                          </text>
                        </g>
                      );
                    })}

                    {/* Accessori interni disegnati in scala */}
                    {accessories.map((acc) => {
                      const yTop =
                        12 + (targetItem.height - (acc.yCm + acc.heightCm));
                      const h = Math.max(4, acc.heightCm);

                      if (acc.type === 'internal_mirror') {
                        return (
                          <g key={acc.id}>
                            <rect
                              x={186}
                              y={yTop}
                              width={18}
                              height={h}
                              fill="#27272a"
                              stroke="#a1a1aa"
                              strokeWidth={1}
                            />
                          </g>
                        );
                      }

                      return (
                        <g key={acc.id}>
                          <rect
                            x={42}
                            y={yTop}
                            width={136}
                            height={h}
                            fill="#27272a"
                            stroke="#e4e4e7"
                            strokeWidth={1}
                          />
                          {/* Indicazione grafica vestiti appesi sotto il tubo */}
                          {acc.type === 'hanger_rod' && acc.hasClothes && (
                            <rect
                              x={52}
                              y={yTop + h}
                              width={116}
                              height={Math.min(85, acc.yCm - 10)}
                              fill="#18181b"
                              stroke="#52525b"
                              strokeDasharray="3 2"
                              strokeWidth={1}
                            />
                          )}
                          <text
                            x={110}
                            y={yTop + Math.min(h - 2, 11)}
                            textAnchor="middle"
                            fill="#f4f4f5"
                            fontSize={8}
                          >
                            {acc.yCm} cm
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <span className="text-xs font-normal text-zinc-400">
                    Quote a sinistra: altezze libere nette tra gli scomparti
                  </span>
                </div>

                {/* Riepilogo luci nette verticali */}
                <div className="md:col-span-6 flex flex-col gap-4">
                  <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-zinc-100">
                      Altezze libere nette calcolate
                    </span>
                    <div className="flex flex-col gap-2">
                      {clearanceSegments.map((seg) => (
                        <div
                          key={seg.id}
                          className="rounded-md border border-zinc-800 bg-zinc-950 p-2 flex items-center justify-between text-xs"
                        >
                          <span className="text-zinc-300 font-normal">
                            Da {seg.fromCm} a {seg.toCm} cm
                          </span>
                          <Badge variant="active">
                            Luce netta: {seg.netHeightCm} cm
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controlli individuali di ogni accessorio installato */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-zinc-200" strokeWidth={1.5} />
                  <h4 className="text-sm font-medium text-zinc-100">
                    Regolazione altezza al centimetro e opzioni scomparti
                  </h4>
                </div>

                {accessories.length === 0 ? (
                  <div className="rounded-md border border-zinc-800 bg-zinc-900 p-6 text-xs text-zinc-400 text-center">
                    Nessun accessorio interno presente. Aggiungi ripiani, tubi
                    appendiabiti o cassettiere dal listino a destra.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {accessories.map((acc: WardrobeAccessoryInstance) => {
                      const maxAllowedY = Math.max(
                        0,
                        targetItem.height - acc.heightCm - 2
                      );
                      const supportsClothes =
                        acc.type === 'hanger_rod' ||
                        acc.type === 'shelf' ||
                        acc.type === 'divider_2' ||
                        acc.type === 'divider_3';
                      const supportsOpen =
                        acc.type === 'drawer_2c' ||
                        acc.type === 'drawer_3c' ||
                        acc.type === 'pullout_basket' ||
                        acc.type === 'pullout_shelf' ||
                        acc.type === 'trouser_rack' ||
                        acc.type === 'tie_rack';

                      return (
                        <div
                          key={acc.id}
                          className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-zinc-100">
                                {acc.name}
                              </span>
                              <span className="text-xs font-normal text-zinc-400">
                                Ingombro verticale: {acc.heightCm} cm · Da{' '}
                                {acc.yCm} a {acc.yCm + acc.heightCm} cm
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">{acc.price} €</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeWardrobeAccessory(targetItem.id, acc.id)
                                }
                                title="Rimuovi accessorio"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-xs font-normal text-zinc-400 w-28 shrink-0">
                              Altezza base (cm)
                            </span>
                            <Slider
                              min={0}
                              max={maxAllowedY}
                              step={1}
                              value={[acc.yCm]}
                              onValueChange={([val]) =>
                                updateWardrobeAccessory(targetItem.id, acc.id, {
                                  yCm: val,
                                })
                              }
                            />
                            <Input
                              type="number"
                              value={acc.yCm}
                              onChange={(e) =>
                                updateWardrobeAccessory(targetItem.id, acc.id, {
                                  yCm: Math.max(
                                    0,
                                    Math.min(
                                      maxAllowedY,
                                      Number(e.target.value) || 0
                                    )
                                  ),
                                })
                              }
                              className="w-20"
                            />
                          </div>

                          {(supportsClothes || supportsOpen) && (
                            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-zinc-800">
                              {supportsClothes && (
                                <div className="flex items-center gap-2">
                                  <Shirt
                                    className="h-4 w-4 text-zinc-400"
                                    strokeWidth={1.5}
                                  />
                                  <span className="text-xs font-normal text-zinc-300">
                                    Mostra vestiti / scatole
                                  </span>
                                  <Switch
                                    checked={Boolean(acc.hasClothes)}
                                    onCheckedChange={(checked) =>
                                      updateWardrobeAccessory(
                                        targetItem.id,
                                        acc.id,
                                        { hasClothes: checked }
                                      )
                                    }
                                  />
                                </div>
                              )}

                              {supportsOpen && (
                                <div className="flex items-center gap-2">
                                  <DoorOpen
                                    className="h-4 w-4 text-zinc-400"
                                    strokeWidth={1.5}
                                  />
                                  <span className="text-xs font-normal text-zinc-300">
                                    Apri cassetto / cestello
                                  </span>
                                  <Switch
                                    checked={Boolean(acc.isOpen)}
                                    onCheckedChange={(checked) =>
                                      updateWardrobeAccessory(
                                        targetItem.id,
                                        acc.id,
                                        { isOpen: checked }
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Colonna Destra: Catalogo Accessori Interni Mondo Convenienza */}
            <div className="lg:col-span-5 p-6 overflow-y-auto flex flex-col gap-6">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal text-zinc-400">
                    Totale attrezzatura interna + struttura
                  </span>
                  <span className="text-base font-medium text-zinc-100">
                    {(targetItem.price ?? 0) + accessoriesTotalCost} € (struttura{' '}
                    {targetItem.price ?? 0} € + interni {accessoriesTotalCost} €)
                  </span>
                </div>
                <Layers className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-100">
                  Catalogo accessori interni Mondo Convenienza
                </h3>
                <p className="text-xs font-normal text-zinc-400">
                  Listino ufficiale attrezzatura interna per armadi battenti
                  (altezza 247 cm, modulo 90 cm / 45 cm).
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {WARDROBE_ACCESSORY_CATALOG.map((cat) => (
                  <div
                    key={cat.code}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-zinc-100">
                          {cat.name}
                        </span>
                        <span className="text-xs font-normal text-zinc-400">
                          {cat.description}
                        </span>
                        <span className="text-xs font-normal text-zinc-400">
                          Ingombro: {cat.defaultHeightCm} cm · {cat.compatibleWidths}
                        </span>
                      </div>
                      <Badge variant="active" className="shrink-0">
                        {cat.price} €
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => handleAddCatalogAccessory(cat)}
                      className="h-8 px-4 w-full"
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.5} />
                      <span>Aggiungi nell’armadio</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
