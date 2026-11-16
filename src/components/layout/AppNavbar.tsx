import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Box,
  Columns2,
  Camera,
  BookOpen,
  Layers,
} from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Panoramica', icon: LayoutGrid, end: true },
  { to: '/studio', label: 'Studio 3D e 2D', icon: Box, end: false },
  { to: '/armadi', label: 'Scompartimenti armadi', icon: Columns2, end: false },
  { to: '/rilievo', label: 'Rilievo e foto', icon: Camera, end: false },
  { to: '/docs', label: 'Documentazione', icon: BookOpen, end: false },
];

export const AppNavbar: React.FC = () => {
  const activeMode = useRoomStore((s) => s.activeMode);
  const setActiveMode = useRoomStore((s) => s.setActiveMode);
  const currentItems = useRoomStore((s) => s.currentItems);
  const newItems = useRoomStore((s) => s.newItems);
  const savedScenarios = useRoomStore((s) => s.savedScenarios);
  const room = useRoomStore((s) => s.room);

  const activeItems = React.useMemo(() => {
    if (activeMode === 'current') return currentItems;
    if (activeMode === 'new') return newItems;
    const found = savedScenarios.find((sc) => sc.id === activeMode);
    return found ? found.items : newItems;
  }, [activeMode, currentItems, newItems, savedScenarios]);

  return (
    <header className="h-16 px-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-6 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-100">
            <Layers className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-100 leading-tight">
              CameraMia
            </span>
            <span className="text-xs font-normal text-zinc-400 leading-tight">
              {room.southWidth} × {room.depth} cm · h {room.ceilingHeight} cm
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'h-10 px-4 rounded-md text-xs font-medium inline-flex items-center gap-2 transition-colors border',
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-200'
                    : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-100 hover:bg-zinc-900'
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
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
        </div>

        <Badge variant="default" className="h-8 px-4 text-xs font-normal">
          <span>{activeItems.length} mobili attivi</span>
        </Badge>
      </div>
    </header>
  );
};
