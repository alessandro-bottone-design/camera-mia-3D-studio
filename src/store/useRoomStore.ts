import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CURRENT_ROOM_ITEMS,
  DEFAULT_ROOM_CONFIG,
  NEW_ROOM_ITEMS,
} from '../data/presets';
import {
  FurnitureItem,
  KallaxCellConfig,
  MeasurementLine,
  MeasurementPoint,
  RoomConfig,
  RoomMode,
  SavedScenario,
  ViewMode,
  WardrobeAccessoryInstance,
} from '../types/room';
import { getItemBoundingBox, setItemWallDistance, WallDistances } from '../utils/geometry';

interface RoomState {
  activeMode: RoomMode;
  viewMode: ViewMode;
  room: RoomConfig;
  currentItems: FurnitureItem[];
  newItems: FurnitureItem[];
  savedScenarios: SavedScenario[];
  selectedItemId: string | null;
  wardrobeModalItemId: string | null;
  activeSidebarTab: 'inspector' | 'catalog' | 'room' | 'measurements' | 'photos';

  // Opzioni di visualizzazione e strumenti
  xrayMode: boolean;
  showAutoMeasurements: boolean;
  showClearanceArcs: boolean;
  showWallCutaway: boolean;
  nightMode: boolean;
  clampToWalls: boolean;

  // Strumento Metro Punto-Punto
  isMeasuring: boolean;
  pendingMeasureStart: MeasurementPoint | null;
  customMeasurements: MeasurementLine[];

  // Azioni principali
  setActiveMode: (mode: RoomMode) => void;
  setViewMode: (view: ViewMode) => void;
  setActiveSidebarTab: (tab: RoomState['activeSidebarTab']) => void;
  setSelectedItemId: (id: string | null) => void;
  setWardrobeModalItemId: (id: string | null) => void;

  // Getter attivo
  getActiveItems: () => FurnitureItem[];

  // Modifica mobili
  updateItem: (id: string, patch: Partial<FurnitureItem>) => void;
  moveItemTo: (id: string, x: number, z: number) => void;
  setItemDistanceFromWall: (id: string, wall: keyof WallDistances, distCm: number) => void;
  rotateItem: (id: string, deltaDeg: number) => void;
  toggleItemOpen: (id: string) => void;
  setAllItemsOpen: (isOpen: boolean) => void;
  addItemFromTemplate: (template: Omit<FurnitureItem, 'id' | 'x' | 'z'>) => void;
  replaceItemWithTemplate: (targetId: string, template: Omit<FurnitureItem, 'id' | 'x' | 'z'>) => void;
  duplicateItem: (id: string) => void;
  deleteItem: (id: string) => void;

  // Scompartimenti Interni Armadio & Kallax
  addWardrobeAccessory: (itemId: string, acc: Omit<WardrobeAccessoryInstance, 'id'>) => void;
  updateWardrobeAccessory: (
    itemId: string,
    accId: string,
    patch: Partial<WardrobeAccessoryInstance>
  ) => void;
  removeWardrobeAccessory: (itemId: string, accId: string) => void;
  updateKallaxCell: (itemId: string, cellIndex: number, patch: Partial<KallaxCellConfig>) => void;

  // Stanza
  updateRoom: (patch: Partial<RoomConfig>) => void;
  resetCurrentModeToDefault: () => void;

  // Toggle opzioni
  setXrayMode: (v: boolean) => void;
  setShowAutoMeasurements: (v: boolean) => void;
  setShowClearanceArcs: (v: boolean) => void;
  setShowWallCutaway: (v: boolean) => void;
  setNightMode: (v: boolean) => void;
  setClampToWalls: (v: boolean) => void;

  // Metro Punto-Punto
  setIsMeasuring: (v: boolean) => void;
  addMeasurementPoint: (pt: { x: number; y: number; z: number; label?: string }) => void;
  removeMeasurementLine: (id: string) => void;
  clearMeasurements: () => void;

  // Scenari
  saveCurrentAsScenario: (name: string, description?: string) => void;
  deleteScenario: (id: string) => void;
}

const cloneItems = (items: FurnitureItem[]): FurnitureItem[] =>
  JSON.parse(JSON.stringify(items));

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      activeMode: 'new',
      viewMode: '3d',
      room: { ...DEFAULT_ROOM_CONFIG },
      currentItems: cloneItems(CURRENT_ROOM_ITEMS),
      newItems: cloneItems(NEW_ROOM_ITEMS),
      savedScenarios: [],
      selectedItemId: 'new-big-town-bed',
      wardrobeModalItemId: null,
      activeSidebarTab: 'inspector',

      xrayMode: false,
      showAutoMeasurements: true,
      showClearanceArcs: true,
      showWallCutaway: true,
      nightMode: false,
      clampToWalls: true,

      isMeasuring: false,
      pendingMeasureStart: null,
      customMeasurements: [
        {
          id: 'default-passaggio-letto-scrivania',
          start: { id: 'p1', x: 202, y: 5, z: 192 },
          end: { id: 'p2', x: 263, y: 5, z: 192 },
          distanceCm: 61,
          label: 'Passaggio Scrivania ↔ Letto',
        },
      ],

      setActiveMode: (mode) => {
        const state = get();
        let nextSelected: string | null = null;
        if (mode === 'current') {
          nextSelected = state.currentItems[0]?.id ?? null;
        } else if (mode === 'new') {
          nextSelected = state.newItems[0]?.id ?? null;
        } else {
          const sc = state.savedScenarios.find((s) => s.id === mode);
          nextSelected = sc?.items[0]?.id ?? null;
        }
        set({ activeMode: mode, selectedItemId: nextSelected });
      },

      setViewMode: (viewMode) => set({ viewMode }),
      setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),
      setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
      setWardrobeModalItemId: (wardrobeModalItemId) => set({ wardrobeModalItemId }),

      getActiveItems: () => {
        const state = get();
        if (state.activeMode === 'current') return state.currentItems;
        if (state.activeMode === 'new') return state.newItems;
        const found = state.savedScenarios.find((s) => s.id === state.activeMode);
        return found ? found.items : state.newItems;
      },

      updateItem: (id, patch) => {
        set((state) => {
          const updateList = (list: FurnitureItem[]) =>
            list.map((it) => (it.id === id ? { ...it, ...patch } : it));

          if (state.activeMode === 'current') {
            return { currentItems: updateList(state.currentItems) };
          }
          if (state.activeMode === 'new') {
            return { newItems: updateList(state.newItems) };
          }
          return {
            savedScenarios: state.savedScenarios.map((sc) =>
              sc.id === state.activeMode ? { ...sc, items: updateList(sc.items) } : sc
            ),
          };
        });
      },

      moveItemTo: (id, rawX, rawZ) => {
        const state = get();
        const items = state.getActiveItems();
        const target = items.find((i) => i.id === id);
        if (!target) return;

        let x = Math.round(rawX);
        let z = Math.round(rawZ);

        if (state.clampToWalls) {
          const tempItem = { ...target, x, z };
          const box = getItemBoundingBox(tempItem);
          const halfW = box.widthX / 2;
          const halfD = box.depthZ / 2;
          x = Math.max(halfW, Math.min(state.room.southWidth - halfW, x));
          z = Math.max(halfD, Math.min(state.room.depth - halfD, z));

          // Snap magnetico a 4 cm dai muri
          if (x - halfW <= 4) x = halfW;
          if (state.room.southWidth - (x + halfW) <= 4) x = state.room.southWidth - halfW;
          if (z - halfD <= 4) z = halfD;
          if (state.room.depth - (z + halfD) <= 4) z = state.room.depth - halfD;
        }

        state.updateItem(id, { x: Math.round(x), z: Math.round(z) });
      },

      setItemDistanceFromWall: (id, wall, distCm) => {
        const state = get();
        const items = state.getActiveItems();
        const target = items.find((i) => i.id === id);
        if (!target) return;
        const pos = setItemWallDistance(target, state.room, wall, distCm);
        state.updateItem(id, pos);
      },

      rotateItem: (id, deltaDeg) => {
        const state = get();
        const items = state.getActiveItems();
        const target = items.find((i) => i.id === id);
        if (!target) return;
        const nextRot = (((target.rotation + deltaDeg) % 360) + 360) % 360;
        state.updateItem(id, { rotation: nextRot });
        // Ricentra dentro i muri se necessario
        setTimeout(() => {
          const updated = get().getActiveItems().find((i) => i.id === id);
          if (updated) {
            get().moveItemTo(id, updated.x, updated.z);
          }
        }, 0);
      },

      toggleItemOpen: (id) => {
        const state = get();
        const items = state.getActiveItems();
        const target = items.find((i) => i.id === id);
        if (!target || !target.canOpen) return;
        const nextOpen = !target.isOpen;
        state.updateItem(id, { isOpen: nextOpen, openRatio: nextOpen ? 1 : 0 });
      },

      setAllItemsOpen: (isOpen) => {
        set((state) => {
          const toggleAll = (list: FurnitureItem[]) =>
            list.map((it) =>
              it.canOpen
                ? {
                    ...it,
                    isOpen,
                    openRatio: isOpen ? 1 : 0,
                    accessories: it.accessories?.map((acc) => ({
                      ...acc,
                      isOpen,
                    })),
                  }
                : it
            );

          if (state.activeMode === 'current') {
            return {
              currentItems: toggleAll(state.currentItems),
              room: { ...state.room, doorIsOpen: isOpen },
            };
          }
          if (state.activeMode === 'new') {
            return {
              newItems: toggleAll(state.newItems),
              room: { ...state.room, doorIsOpen: isOpen },
            };
          }
          return {
            savedScenarios: state.savedScenarios.map((sc) =>
              sc.id === state.activeMode ? { ...sc, items: toggleAll(sc.items) } : sc
            ),
            room: { ...state.room, doorIsOpen: isOpen },
          };
        });
      },

      addItemFromTemplate: (template) => {
        const state = get();
        const newId = `item-${Date.now()}`;
        const newItem: FurnitureItem = {
          ...JSON.parse(JSON.stringify(template)),
          id: newId,
          x: Math.round(state.room.southWidth / 2),
          z: Math.round(state.room.depth / 2),
        };

        set((s) => {
          if (s.activeMode === 'current') {
            return {
              currentItems: [...s.currentItems, newItem],
              selectedItemId: newId,
              activeSidebarTab: 'inspector',
            };
          }
          if (s.activeMode === 'new') {
            return {
              newItems: [...s.newItems, newItem],
              selectedItemId: newId,
              activeSidebarTab: 'inspector',
            };
          }
          return {
            savedScenarios: s.savedScenarios.map((sc) =>
              sc.id === s.activeMode ? { ...sc, items: [...sc.items, newItem] } : sc
            ),
            selectedItemId: newId,
            activeSidebarTab: 'inspector',
          };
        });
      },

      replaceItemWithTemplate: (targetId, template) => {
        const state = get();
        const existing = state.getActiveItems().find((i) => i.id === targetId);
        if (!existing) return;

        const replacement: FurnitureItem = {
          ...JSON.parse(JSON.stringify(template)),
          id: existing.id,
          x: existing.x,
          z: existing.z,
          rotation: existing.rotation,
        };

        state.updateItem(targetId, replacement);
        setTimeout(() => {
          get().moveItemTo(targetId, replacement.x, replacement.z);
        }, 0);
      },

      duplicateItem: (id) => {
        const state = get();
        const existing = state.getActiveItems().find((i) => i.id === id);
        if (!existing) return;
        const copyId = `${existing.id}-copy-${Date.now().toString().slice(-4)}`;
        const copy: FurnitureItem = {
          ...JSON.parse(JSON.stringify(existing)),
          id: copyId,
          name: `${existing.name} (Copia)`,
          x: Math.min(state.room.southWidth - 50, existing.x + 30),
          z: Math.min(state.room.depth - 50, existing.z + 30),
        };

        set((s) => {
          if (s.activeMode === 'current') {
            return { currentItems: [...s.currentItems, copy], selectedItemId: copyId };
          }
          if (s.activeMode === 'new') {
            return { newItems: [...s.newItems, copy], selectedItemId: copyId };
          }
          return {
            savedScenarios: s.savedScenarios.map((sc) =>
              sc.id === s.activeMode ? { ...sc, items: [...sc.items, copy] } : sc
            ),
            selectedItemId: copyId,
          };
        });
      },

      deleteItem: (id) => {
        set((state) => {
          const filterList = (list: FurnitureItem[]) => list.filter((i) => i.id !== id);
          const nextSelected = state.selectedItemId === id ? null : state.selectedItemId;

          if (state.activeMode === 'current') {
            return { currentItems: filterList(state.currentItems), selectedItemId: nextSelected };
          }
          if (state.activeMode === 'new') {
            return { newItems: filterList(state.newItems), selectedItemId: nextSelected };
          }
          return {
            savedScenarios: state.savedScenarios.map((sc) =>
              sc.id === state.activeMode ? { ...sc, items: filterList(sc.items) } : sc
            ),
            selectedItemId: nextSelected,
          };
        });
      },

      addWardrobeAccessory: (itemId, acc) => {
        const state = get();
        const target = state.getActiveItems().find((i) => i.id === itemId);
        if (!target) return;
        const newAcc: WardrobeAccessoryInstance = {
          ...acc,
          id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        };
        const nextAccessories = [...(target.accessories ?? []), newAcc].sort(
          (a, b) => b.yCm - a.yCm
        );
        state.updateItem(itemId, { accessories: nextAccessories });
      },

      updateWardrobeAccessory: (itemId, accId, patch) => {
        const state = get();
        const target = state.getActiveItems().find((i) => i.id === itemId);
        if (!target || !target.accessories) return;
        const nextAccessories = target.accessories
          .map((a) => (a.id === accId ? { ...a, ...patch } : a))
          .sort((a, b) => b.yCm - a.yCm);
        state.updateItem(itemId, { accessories: nextAccessories });
      },

      removeWardrobeAccessory: (itemId, accId) => {
        const state = get();
        const target = state.getActiveItems().find((i) => i.id === itemId);
        if (!target || !target.accessories) return;
        state.updateItem(itemId, {
          accessories: target.accessories.filter((a) => a.id !== accId),
        });
      },

      updateKallaxCell: (itemId, cellIndex, patch) => {
        const state = get();
        const target = state.getActiveItems().find((i) => i.id === itemId);
        if (!target) return;
        const existingCells: KallaxCellConfig[] =
          target.kallaxCells ??
          Array.from({ length: 8 }, (_, idx) => ({ index: idx, contentType: 'empty' }));
        const nextCells = existingCells.map((c) =>
          c.index === cellIndex ? { ...c, ...patch } : c
        );
        state.updateItem(itemId, { kallaxCells: nextCells });
      },

      updateRoom: (patch) =>
        set((state) => ({
          room: { ...state.room, ...patch },
        })),

      resetCurrentModeToDefault: () =>
        set((state) => {
          if (state.activeMode === 'current') {
            return {
              currentItems: cloneItems(CURRENT_ROOM_ITEMS),
              room: { ...DEFAULT_ROOM_CONFIG },
            };
          }
          return {
            newItems: cloneItems(NEW_ROOM_ITEMS),
            room: { ...DEFAULT_ROOM_CONFIG },
          };
        }),

      setXrayMode: (xrayMode) => set({ xrayMode }),
      setShowAutoMeasurements: (showAutoMeasurements) => set({ showAutoMeasurements }),
      setShowClearanceArcs: (showClearanceArcs) => set({ showClearanceArcs }),
      setShowWallCutaway: (showWallCutaway) => set({ showWallCutaway }),
      setNightMode: (nightMode) => set({ nightMode }),
      setClampToWalls: (clampToWalls) => set({ clampToWalls }),

      setIsMeasuring: (isMeasuring) =>
        set({ isMeasuring, pendingMeasureStart: null }),

      addMeasurementPoint: (pt) => {
        const state = get();
        const newPoint: MeasurementPoint = {
          id: `pt-${Date.now()}`,
          x: Math.round(pt.x),
          y: Math.round(pt.y),
          z: Math.round(pt.z),
          label: pt.label,
        };

        if (!state.pendingMeasureStart) {
          set({ pendingMeasureStart: newPoint });
        } else {
          const start = state.pendingMeasureStart;
          const dx = newPoint.x - start.x;
          const dy = newPoint.y - start.y;
          const dz = newPoint.z - start.z;
          const dist = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 10) / 10;
          const newLine: MeasurementLine = {
            id: `line-${Date.now()}`,
            start,
            end: newPoint,
            distanceCm: dist,
            label: `Misura #${state.customMeasurements.length + 1}`,
          };
          set({
            customMeasurements: [...state.customMeasurements, newLine],
            pendingMeasureStart: null,
          });
        }
      },

      removeMeasurementLine: (id) =>
        set((state) => ({
          customMeasurements: state.customMeasurements.filter((m) => m.id !== id),
        })),

      clearMeasurements: () => set({ customMeasurements: [], pendingMeasureStart: null }),

      saveCurrentAsScenario: (name, description = '') => {
        const state = get();
        const items = cloneItems(state.getActiveItems());
        const newSc: SavedScenario = {
          id: `scenario-${Date.now()}`,
          name,
          description,
          createdAt: new Date().toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          items,
        };
        set((s) => ({
          savedScenarios: [...s.savedScenarios, newSc],
          activeMode: newSc.id,
        }));
      },

      deleteScenario: (id) =>
        set((state) => ({
          savedScenarios: state.savedScenarios.filter((s) => s.id !== id),
          activeMode: state.activeMode === id ? 'new' : state.activeMode,
        })),
    }),
    {
      name: 'cameramia-3d-storage-v1',
    }
  )
);
