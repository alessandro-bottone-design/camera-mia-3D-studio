import React, { useState } from 'react';
import {
  Box,
  Grid,
  Columns2,
  Eye,
  DoorOpen,
  DoorClosed,
  ScanLine,
  Ruler,
  Compass,
  Crosshair,
  Trash2,
  Moon,
  Sun,
  RotateCcw,
  BookmarkPlus,
  Check,
  X,
} from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { ViewMode } from '../../types/room';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../utils/cn';

const VIEW_MODES: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: '3d', label: 'Vista 3D', icon: Box },
  { id: '2d', label: 'Piantina 2D', icon: Grid },
  { id: 'split', label: 'Vista divisa', icon: Columns2 },
  { id: 'first-person', label: 'Altezza occhi 170 cm', icon: Eye },
];

export const StudioToolbar: React.FC = () => {
  const activeMode = useRoomStore((s) => s.activeMode);
  const setActiveMode = useRoomStore((s) => s.setActiveMode);
  const viewMode = useRoomStore((s) => s.viewMode);
  const setViewMode = useRoomStore((s) => s.setViewMode);
  const savedScenarios = useRoomStore((s) => s.savedScenarios);
  const saveCurrentAsScenario = useRoomStore((s) => s.saveCurrentAsScenario);
  const deleteScenario = useRoomStore((s) => s.deleteScenario);

  const currentItems = useRoomStore((s) => s.currentItems);
  const newItems = useRoomStore((s) => s.newItems);
  const setAllItemsOpen = useRoomStore((s) => s.setAllItemsOpen);

  const xrayMode = useRoomStore((s) => s.xrayMode);
  const setXrayMode = useRoomStore((s) => s.setXrayMode);
  const showAutoMeasurements = useRoomStore((s) => s.showAutoMeasurements);
  const setShowAutoMeasurements = useRoomStore((s) => s.setShowAutoMeasurements);
  const showClearanceArcs = useRoomStore((s) => s.showClearanceArcs);
  const setShowClearanceArcs = useRoomStore((s) => s.setShowClearanceArcs);
  const isMeasuring = useRoomStore((s) => s.isMeasuring);
  const setIsMeasuring = useRoomStore((s) => s.setIsMeasuring);
  const customMeasurements = useRoomStore((s) => s.customMeasurements);
  const clearMeasurements = useRoomStore((s) => s.clearMeasurements);
  const nightMode = useRoomStore((s) => s.nightMode);
  const setNightMode = useRoomStore((s) => s.setNightMode);
  const resetCurrentModeToDefault = useRoomStore((s) => s.resetCurrentModeToDefault);

  const [isSavingScenario, setIsSavingScenario] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const activeItems = React.useMemo(() => {
    if (activeMode === 'current') return currentItems;
    if (activeMode === 'new') return newItems;
    const found = savedScenarios.find((s) => s.id === activeMode);
    return found ? found.items : newItems;
  }, [activeMode, currentItems, newItems, savedScenarios]);

  const anyItemOpen = React.useMemo(
    () => activeItems.some((item) => item.canOpen && item.isOpen),
    [activeItems]
  );

  const handleSaveScenario = () => {
    const trimmed = scenarioName.trim();
    const finalName = trimmed || `Scenario ${savedScenarios.length + 1}`;
    saveCurrentAsScenario(finalName, 'Configurazione personalizzata');
    setScenarioName('');
    setIsSavingScenario(false);
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex flex-wrap items-center justify-between gap-4 shrink-0">
      {/* Sezione sinistra: Modalità stanza e scenari */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-2">
          <button
            type="button"
            onClick={() => setActiveMode('current')}
            className={cn(
              'h-8 px-4 rounded-md text-xs font-medium transition-colors',
              activeMode === 'current'
                ? 'bg-zinc-100 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            Camera attuale
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('new')}
            className={cn(
              'h-8 px-4 rounded-md text-xs font-medium transition-colors',
              activeMode === 'new'
                ? 'bg-zinc-100 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            Camera nuova
          </button>

          {savedScenarios.map((sc) => (
            <div key={sc.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMode(sc.id)}
                className={cn(
                  'h-8 px-4 rounded-md text-xs font-medium transition-colors',
                  activeMode === sc.id
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                {sc.name}
              </button>
              {activeMode === sc.id && (
                <button
                  type="button"
                  onClick={() => deleteScenario(sc.id)}
                  title="Elimina scenario"
                  className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>

        {isSavingScenario ? (
          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-2">
            <Input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Nome scenario..."
              className="h-8 w-40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveScenario();
                if (e.key === 'Escape') setIsSavingScenario(false);
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="default"
              onClick={handleSaveScenario}
              title="Conferma salvataggio"
            >
              <Check className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setIsSavingScenario(false)}
              title="Annulla"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSavingScenario(true)}
            className="h-8 px-4"
          >
            <BookmarkPlus className="h-4 w-4" strokeWidth={1.5} />
            <span>Salva scenario</span>
          </Button>
        )}
      </div>

      {/* Sezione centrale: Selettore vista */}
      <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-2">
        {VIEW_MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setViewMode(id)}
            className={cn(
              'h-8 px-4 rounded-md text-xs font-medium inline-flex items-center gap-2 transition-colors',
              viewMode === id
                ? 'bg-zinc-100 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Sezione destra: Azioni rapide e strumenti */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={anyItemOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAllItemsOpen(!anyItemOpen)}
          className="h-8 px-4"
        >
          {anyItemOpen ? (
            <>
              <DoorClosed className="h-4 w-4" strokeWidth={1.5} />
              <span>Chiudi tutti i mobili</span>
            </>
          ) : (
            <>
              <DoorOpen className="h-4 w-4" strokeWidth={1.5} />
              <span>Apri tutti i mobili</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant={xrayMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setXrayMode(!xrayMode)}
          className="h-8 px-4"
        >
          <ScanLine className="h-4 w-4" strokeWidth={1.5} />
          <span>Raggi X armadi</span>
        </Button>

        <Button
          type="button"
          variant={showAutoMeasurements ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAutoMeasurements(!showAutoMeasurements)}
          className="h-8 px-4"
        >
          <Ruler className="h-4 w-4" strokeWidth={1.5} />
          <span>Quote automatiche</span>
        </Button>

        <Button
          type="button"
          variant={showClearanceArcs ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowClearanceArcs(!showClearanceArcs)}
          className="h-8 px-4"
        >
          <Compass className="h-4 w-4" strokeWidth={1.5} />
          <span>Archi ingombro</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isMeasuring ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsMeasuring(!isMeasuring)}
            className="h-8 px-4"
          >
            <Crosshair className="h-4 w-4" strokeWidth={1.5} />
            <span>Metro punto-punto</span>
          </Button>
          {customMeasurements.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearMeasurements}
              title="Azzera misure punto-punto"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant={nightMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setNightMode(!nightMode)}
          className="h-8 px-4"
        >
          {nightMode ? (
            <Moon className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          )}
          <span>Luce sera / giorno</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetCurrentModeToDefault}
          className="h-8 px-4"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
          <span>Ripristina preset</span>
        </Button>
      </div>
    </div>
  );
};
