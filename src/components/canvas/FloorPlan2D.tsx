import React, { useRef, useState } from 'react';
import { Compass, Maximize2, Ruler, ZoomIn, ZoomOut } from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import {
  getItemBoundingBox,
  getOpenClearanceBox,
  getWallDistances,
} from '../../utils/geometry';
import { FurnitureItem } from '../../types/room';

export const FloorPlan2D: React.FC = () => {
  const {
    room,
    selectedItemId,
    showAutoMeasurements,
    showClearanceArcs,
    isMeasuring,
    pendingMeasureStart,
    customMeasurements,
    getActiveItems,
    setSelectedItemId,
    moveItemTo,
    addMeasurementPoint,
  } = useRoomStore();

  const items = getActiveItems();
  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dz: number }>({ dx: 0, dz: 0 });
  const [zoom, setZoom] = useState<number>(1);

  const pad = 80;
  const wallT = 14;
  const baseViewW = room.southWidth + pad * 2;
  const baseViewH = room.depth + pad * 2;

  const zoomedW = baseViewW / zoom;
  const zoomedH = baseViewH / zoom;
  const viewMinX = (baseViewW - zoomedW) / 2;
  const viewMinY = (baseViewH - zoomedH) / 2;

  const clientToRoomCm = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, z: 0 };

    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return {
        x: Math.round(transformed.x - pad),
        z: Math.round(transformed.y - pad),
      };
    }

    const rect = svg.getBoundingClientRect();
    const scaleX = zoomedW / rect.width;
    const scaleY = zoomedH / rect.height;
    const svgX = viewMinX + (clientX - rect.left) * scaleX;
    const svgY = viewMinY + (clientY - rect.top) * scaleY;
    return {
      x: Math.round(svgX - pad),
      z: Math.round(svgY - pad),
    };
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId) return;
    const pt = clientToRoomCm(e.clientX, e.clientY);
    moveItemTo(draggingId, pt.x - dragOffset.dx, pt.z - dragOffset.dz);
  };

  const handleSvgPointerUp = () => {
    setDraggingId(null);
  };

  const handleBackgroundClick = (e: React.MouseEvent<SVGRectElement>) => {
    const pt = clientToRoomCm(e.clientX, e.clientY);
    if (isMeasuring) {
      addMeasurementPoint({ x: pt.x, y: 0, z: pt.z });
    } else {
      setSelectedItemId(null);
    }
  };

  const renderFrontIndicatorAndSwingArcs = (item: FurnitureItem) => {
    const box = getItemBoundingBox(item);
    const openBox = getOpenClearanceBox(item);
    const rot = ((item.rotation % 360) + 360) % 360;
    const isHingedWardrobe =
      item.modelType === 'elena_wardrobe' ||
      item.modelType === 'elena_bridge' ||
      item.modelType === 'current_green_bridge';

    let frontLine: { x1: number; y1: number; x2: number; y2: number; ax: number; ay: number } = {
      x1: box.minX + 6,
      y1: box.maxZ - 3,
      x2: box.maxX - 6,
      y2: box.maxZ - 3,
      ax: box.centerX,
      ay: box.maxZ + 4,
    };

    if (rot >= 45 && rot < 135) {
      // Fronte verso est (+X)
      frontLine = {
        x1: box.maxX - 3,
        y1: box.minZ + 6,
        x2: box.maxX - 3,
        y2: box.maxZ - 6,
        ax: box.maxX + 4,
        ay: box.centerZ,
      };
    } else if (rot >= 135 && rot < 225) {
      // Fronte verso nord (-Z)
      frontLine = {
        x1: box.minX + 6,
        y1: box.minZ + 3,
        x2: box.maxX - 6,
        y2: box.minZ + 3,
        ax: box.centerX,
        ay: box.minZ - 4,
      };
    } else if (rot >= 225 && rot < 315) {
      // Fronte verso ovest (-X)
      frontLine = {
        x1: box.minX + 3,
        y1: box.minZ + 6,
        x2: box.minX + 3,
        y2: box.maxZ - 6,
        ax: box.minX - 4,
        ay: box.centerZ,
      };
    }

    const showSwing = (showClearanceArcs || item.isOpen) && item.canOpen;
    const doors = item.doorCount ?? 2;

    return (
      <g pointerEvents="none">
        {/* Rettangolo tratteggiato d'ingombro apertura ante o cassetti */}
        {showSwing && (
          <rect
            x={openBox.minX}
            y={openBox.minZ}
            width={openBox.widthX}
            height={openBox.depthZ}
            fill={item.isOpen ? 'rgba(244, 244, 245, 0.12)' : 'rgba(161, 161, 170, 0.06)'}
            stroke={item.isOpen ? '#f4f4f5' : '#a1a1aa'}
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
        )}

        {/* Archi architettonici ante battenti quando orientato verso ovest o sud */}
        {showSwing &&
          isHingedWardrobe &&
          rot >= 225 &&
          rot < 315 &&
          Array.from({ length: doors }).map((_, dIdx) => {
            const doorSpan = box.depthZ / doors;
            const yStart = box.minZ + dIdx * doorSpan;
            const radius = Math.min(46, doorSpan);
            return (
              <path
                key={dIdx}
                d={`M ${box.minX} ${yStart} L ${box.minX - radius} ${yStart} A ${radius} ${radius} 0 0 0 ${box.minX} ${yStart + radius}`}
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
            );
          })}

        {/* Linea indicatrice del fronte di apertura */}
        <line
          x1={frontLine.x1}
          y1={frontLine.y1}
          x2={frontLine.x2}
          y2={frontLine.y2}
          stroke="#f4f4f5"
          strokeWidth="1.8"
          strokeOpacity="0.75"
        />
        {item.canOpen && (
          <circle
            cx={frontLine.ax}
            cy={frontLine.ay}
            r={2.2}
            fill={item.isOpen ? '#f4f4f5' : '#a1a1aa'}
          />
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none relative">
      {/* Intestazione pianta tecnica */}
      <div className="absolute top-4 left-4 z-10 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
        <Compass className="w-4 h-4 text-zinc-100" strokeWidth={1.5} />
        <span className="font-medium text-zinc-100">Pianta tecnica quotata (scala in cm)</span>
        <span className="text-zinc-400 font-normal">
          — Trascina i mobili col mouse • doppio click per aprire o chiudere
        </span>
      </div>

      {/* Controlli di zoom in alto a destra */}
      <div className="absolute top-4 right-4 z-10 bg-zinc-900 p-2 rounded-lg border border-zinc-800 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.7, Math.round((z - 0.15) * 100) / 100))}
          className="h-8 px-2 rounded bg-zinc-950 text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 text-xs font-medium"
          title="Riduci zoom"
        >
          <ZoomOut className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>-</span>
        </button>
        <span className="text-xs font-normal text-zinc-400 px-2">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.2, Math.round((z + 0.15) * 100) / 100))}
          className="h-8 px-2 rounded bg-zinc-950 text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 text-xs font-medium"
          title="Aumenta zoom"
        >
          <ZoomIn className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>+</span>
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="h-8 px-2 rounded bg-zinc-950 text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 text-xs font-medium"
        >
          <Maximize2 className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Adatta alla schermata</span>
        </button>
      </div>

      {/* Banner metro punto-punto */}
      {isMeasuring && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900 text-zinc-100 border border-zinc-800 font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2">
          <Ruler className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          <span>
            Metro punto-punto attivo:{' '}
            {pendingMeasureStart
              ? 'clicca il secondo punto sulla piantina per completare la misura'
              : 'clicca il primo punto sulla piantina per misurare'}
          </span>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`${viewMinX} ${viewMinY} ${zoomedW} ${zoomedH}`}
        className="w-full h-full max-w-[960px] max-h-[840px] bg-zinc-900 rounded-lg border border-zinc-800"
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
      >
        <defs>
          <pattern id="cadGrid20" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(161, 161, 170, 0.12)"
              strokeWidth="0.6"
            />
          </pattern>
          <pattern id="cadGrid100" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#cadGrid20)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(161, 161, 170, 0.28)"
              strokeWidth="1"
            />
          </pattern>
          <marker
            id="cadArrowStart"
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 10 1 L 2 5 L 10 9 z" fill="#f4f4f5" />
          </marker>
          <marker
            id="cadArrowEnd"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#f4f4f5" />
          </marker>
        </defs>

        <g transform={`translate(${pad}, ${pad})`}>
          {/* Pavimento + griglia metrica 20 cm / 100 cm */}
          <rect
            x={0}
            y={0}
            width={room.southWidth}
            height={room.depth}
            fill="#09090b"
            onClick={handleBackgroundClick}
          />
          <rect
            x={0}
            y={0}
            width={room.southWidth}
            height={room.depth}
            fill="url(#cadGrid100)"
            pointerEvents="none"
          />

          {/* Muri perimetrali */}
          <rect
            x={-wallT}
            y={-wallT}
            width={room.southWidth + wallT * 2}
            height={wallT}
            fill="#27272a"
            stroke="#a1a1aa"
            strokeWidth="1"
          />
          <rect
            x={-wallT}
            y={room.depth}
            width={room.southWidth + wallT * 2}
            height={wallT}
            fill="#27272a"
            stroke="#a1a1aa"
            strokeWidth="1"
          />
          <rect
            x={-wallT}
            y={0}
            width={wallT}
            height={room.depth}
            fill="#27272a"
            stroke="#a1a1aa"
            strokeWidth="1"
          />
          <rect
            x={room.southWidth}
            y={0}
            width={wallT}
            height={room.depth}
            fill="#27272a"
            stroke="#a1a1aa"
            strokeWidth="1"
          />

          {/* Simbolo architettonico porta d'ingresso su parete nord con arco a 90 gradi */}
          <g transform={`translate(${room.doorOffsetWest}, ${-wallT})`}>
            <rect x={0} y={0} width={room.doorWidth} height={wallT + 2} fill="#09090b" />
            <line
              x1={room.doorWidth}
              y1={wallT}
              x2={room.doorWidth}
              y2={wallT + room.doorWidth}
              stroke="#f4f4f5"
              strokeWidth="2"
            />
            <path
              d={`M ${room.doorWidth} ${wallT} L ${room.doorWidth} ${wallT + room.doorWidth} A ${
                room.doorWidth
              } ${room.doorWidth} 0 0 1 0 ${wallT}`}
              fill="rgba(244, 244, 245, 0.08)"
              stroke="#a1a1aa"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <text
              x={room.doorWidth / 2}
              y={-6}
              textAnchor="middle"
              fill="#f4f4f5"
              fontSize="10"
              fontWeight="500"
            >
              Porta ({room.doorWidth} cm)
            </text>
          </g>

          {/* Portafinestra su parete ovest */}
          <g transform={`translate(${-wallT}, ${room.windowOffsetNorth})`}>
            <rect
              x={0}
              y={0}
              width={wallT}
              height={room.windowWidth}
              fill="#18181b"
              stroke="#f4f4f5"
              strokeWidth="1.2"
            />
            <line
              x1={wallT / 2}
              y1={0}
              x2={wallT / 2}
              y2={room.windowWidth}
              stroke="#a1a1aa"
              strokeWidth="1"
            />
            <text
              x={-10}
              y={room.windowWidth / 2}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="10"
              fontWeight="400"
              transform={`rotate(-90, -10, ${room.windowWidth / 2})`}
            >
              Portafinestra ({room.windowWidth} cm)
            </text>
          </g>

          {/* Climatizzatore split su parete ovest */}
          <g transform={`translate(${0}, ${room.acOffsetNorth - 41})`}>
            <rect
              x={0}
              y={0}
              width={22}
              height={82}
              rx={2}
              fill="#18181b"
              stroke="#a1a1aa"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text
              x={11}
              y={41}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="8"
              fontWeight="400"
              transform="rotate(-90, 11, 41)"
            >
              Split ({room.acOffsetNorth} cm)
            </text>
          </g>

          {/* Termosifone nell'angolo sud-ovest */}
          <g transform={`translate(${room.radiatorOffsetWest}, ${room.depth - room.radiatorDepth})`}>
            <rect
              x={0}
              y={0}
              width={room.radiatorWidth}
              height={room.radiatorDepth}
              fill="#18181b"
              stroke="#f4f4f5"
              strokeWidth="1.2"
            />
            <text
              x={room.radiatorWidth / 2}
              y={-5}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="9"
              fontWeight="400"
            >
              Termosifone ({room.radiatorWidth}×{room.radiatorDepth} cm)
            </text>
          </g>

          {/* Quote perimetrali esterne dei 4 muri */}
          {/* 1. Parete nord */}
          <line
            x1={0}
            y1={-36}
            x2={room.northWidth}
            y2={-36}
            stroke="#a1a1aa"
            strokeWidth="1.2"
            markerStart="url(#cadArrowStart)"
            markerEnd="url(#cadArrowEnd)"
          />
          <text
            x={room.northWidth / 2}
            y={-46}
            textAnchor="middle"
            fill="#f4f4f5"
            fontSize="11"
            fontWeight="500"
          >
            Parete nord: {room.northWidth} cm
          </text>
          <text
            x={room.doorOffsetWest / 2}
            y={-20}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="10"
            fontWeight="400"
          >
            {room.doorOffsetWest} cm
          </text>
          <text
            x={
              room.doorOffsetWest +
              room.doorWidth +
              (room.southWidth - room.doorOffsetWest - room.doorWidth) / 2
            }
            y={-20}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="10"
            fontWeight="400"
          >
            {room.southWidth - room.doorOffsetWest - room.doorWidth} cm
          </text>

          {/* 2. Parete sud */}
          <line
            x1={0}
            y1={room.depth + 36}
            x2={room.southWidth}
            y2={room.depth + 36}
            stroke="#a1a1aa"
            strokeWidth="1.2"
            markerStart="url(#cadArrowStart)"
            markerEnd="url(#cadArrowEnd)"
          />
          <text
            x={room.southWidth / 2}
            y={room.depth + 54}
            textAnchor="middle"
            fill="#f4f4f5"
            fontSize="11"
            fontWeight="500"
          >
            Parete sud: {room.southWidth} cm
          </text>

          {/* 3. Parete ovest */}
          <line
            x1={-36}
            y1={0}
            x2={-36}
            y2={room.depth}
            stroke="#a1a1aa"
            strokeWidth="1.2"
            markerStart="url(#cadArrowStart)"
            markerEnd="url(#cadArrowEnd)"
          />
          <text
            x={-52}
            y={room.depth / 2}
            textAnchor="middle"
            fill="#f4f4f5"
            fontSize="11"
            fontWeight="500"
            transform={`rotate(-90, -52, ${room.depth / 2})`}
          >
            Parete ovest: {room.depth} cm
          </text>

          {/* 4. Parete est */}
          <line
            x1={room.southWidth + 36}
            y1={0}
            x2={room.southWidth + 36}
            y2={room.depth}
            stroke="#a1a1aa"
            strokeWidth="1.2"
            markerStart="url(#cadArrowStart)"
            markerEnd="url(#cadArrowEnd)"
          />
          <text
            x={room.southWidth + 52}
            y={room.depth / 2}
            textAnchor="middle"
            fill="#f4f4f5"
            fontSize="11"
            fontWeight="500"
            transform={`rotate(90, ${room.southWidth + 52}, ${room.depth / 2})`}
          >
            Parete est: {room.depth} cm
          </text>

          {/* Mobili in pianta 2D */}
          {items.map((item) => {
            const box = getItemBoundingBox(item);
            const isSelected = item.id === selectedItemId;

            if (item.modelType === 'billy_corner') {
              const armN = item.width;
              const armW = item.secondaryWidth ?? 215;
              const d = item.depth;
              const x0 = box.minX;
              const z0 = box.minZ;

              return (
                <g
                  key={item.id}
                  className="cursor-move"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (isMeasuring) {
                      const pt = clientToRoomCm(e.clientX, e.clientY);
                      addMeasurementPoint({ x: pt.x, y: 0, z: pt.z });
                      return;
                    }
                    setSelectedItemId(item.id);
                    const pt = clientToRoomCm(e.clientX, e.clientY);
                    setDragOffset({ dx: pt.x - item.x, dz: pt.z - item.z });
                    setDraggingId(item.id);
                  }}
                >
                  <path
                    d={`M ${x0} ${z0} L ${x0 + armN} ${z0} L ${x0 + armN} ${z0 + d} L ${
                      x0 + d
                    } ${z0 + d} L ${x0 + d} ${z0 + armW} L ${x0} ${z0 + armW} Z`}
                    fill="#18181b"
                    fillOpacity={0.92}
                    stroke={isSelected ? '#f4f4f5' : '#a1a1aa'}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                  />
                  <text
                    x={x0 + armN * 0.54}
                    y={z0 + d * 0.65}
                    textAnchor="middle"
                    fill="#f4f4f5"
                    fontSize="9.5"
                    fontWeight="500"
                    pointerEvents="none"
                  >
                    Billy angolare ({armN}×{armW}×{d} cm)
                  </text>
                </g>
              );
            }

            return (
              <g
                key={item.id}
                className="cursor-move"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (isMeasuring) {
                    const pt = clientToRoomCm(e.clientX, e.clientY);
                    addMeasurementPoint({ x: pt.x, y: 0, z: pt.z });
                    return;
                  }
                  setSelectedItemId(item.id);
                  const pt = clientToRoomCm(e.clientX, e.clientY);
                  setDragOffset({ dx: pt.x - item.x, dz: pt.z - item.z });
                  setDraggingId(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  useRoomStore.getState().toggleItemOpen(item.id);
                }}
              >
                {/* Ingombro apertura e indicatore fronte */}
                {renderFrontIndicatorAndSwingArcs(item)}

                {/* Sagoma mobile */}
                <rect
                  x={box.minX}
                  y={box.minZ}
                  width={box.widthX}
                  height={box.depthZ}
                  rx={3}
                  fill="#18181b"
                  fillOpacity={item.y > 140 ? 0.55 : 0.92}
                  stroke={isSelected ? '#f4f4f5' : '#a1a1aa'}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                />

                {/* Nome e dimensioni in cm */}
                <text
                  x={box.centerX}
                  y={box.centerZ - 3}
                  textAnchor="middle"
                  fill="#f4f4f5"
                  fontSize="9.5"
                  fontWeight="500"
                  pointerEvents="none"
                >
                  {item.name.length > 24 ? item.name.slice(0, 22) + '…' : item.name}
                </text>
                <text
                  x={box.centerX}
                  y={box.centerZ + 10}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="8.5"
                  fontWeight="400"
                  pointerEvents="none"
                >
                  {Math.round(box.widthX)} × {Math.round(box.depthZ)} cm (alt. {item.height})
                </text>
              </g>
            );
          })}

          {/* 4 frecce di quota dinamiche verso i muri nord, sud, ovest ed est */}
          {showAutoMeasurements &&
            selectedItem &&
            (() => {
              const box = getItemBoundingBox(selectedItem);
              const dists = getWallDistances(selectedItem, room);
              return (
                <g pointerEvents="none">
                  {/* Ovest */}
                  {dists.west > 1 && (
                    <g>
                      <line
                        x1={0}
                        y1={box.centerZ}
                        x2={box.minX}
                        y2={box.centerZ}
                        stroke="#f4f4f5"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        markerStart="url(#cadArrowStart)"
                        markerEnd="url(#cadArrowEnd)"
                      />
                      <rect
                        x={box.minX / 2 - 24}
                        y={box.centerZ - 18}
                        width={48}
                        height={14}
                        rx={2}
                        fill="#09090b"
                        stroke="#27272a"
                      />
                      <text
                        x={box.minX / 2}
                        y={box.centerZ - 8}
                        textAnchor="middle"
                        fill="#f4f4f5"
                        fontSize="9.5"
                        fontWeight="500"
                      >
                        {dists.west} cm
                      </text>
                    </g>
                  )}

                  {/* Est */}
                  {dists.east > 1 && (
                    <g>
                      <line
                        x1={box.maxX}
                        y1={box.centerZ}
                        x2={room.southWidth}
                        y2={box.centerZ}
                        stroke="#f4f4f5"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        markerStart="url(#cadArrowStart)"
                        markerEnd="url(#cadArrowEnd)"
                      />
                      <rect
                        x={(box.maxX + room.southWidth) / 2 - 24}
                        y={box.centerZ - 18}
                        width={48}
                        height={14}
                        rx={2}
                        fill="#09090b"
                        stroke="#27272a"
                      />
                      <text
                        x={(box.maxX + room.southWidth) / 2}
                        y={box.centerZ - 8}
                        textAnchor="middle"
                        fill="#f4f4f5"
                        fontSize="9.5"
                        fontWeight="500"
                      >
                        {dists.east} cm
                      </text>
                    </g>
                  )}

                  {/* Nord */}
                  {dists.north > 1 && (
                    <g>
                      <line
                        x1={box.centerX}
                        y1={0}
                        x2={box.centerX}
                        y2={box.minZ}
                        stroke="#f4f4f5"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        markerStart="url(#cadArrowStart)"
                        markerEnd="url(#cadArrowEnd)"
                      />
                      <rect
                        x={box.centerX + 6}
                        y={box.minZ / 2 - 8}
                        width={48}
                        height={14}
                        rx={2}
                        fill="#09090b"
                        stroke="#27272a"
                      />
                      <text
                        x={box.centerX + 30}
                        y={box.minZ / 2 + 2}
                        textAnchor="middle"
                        fill="#f4f4f5"
                        fontSize="9.5"
                        fontWeight="500"
                      >
                        {dists.north} cm
                      </text>
                    </g>
                  )}

                  {/* Sud */}
                  {dists.south > 1 && (
                    <g>
                      <line
                        x1={box.centerX}
                        y1={box.maxZ}
                        x2={box.centerX}
                        y2={room.depth}
                        stroke="#f4f4f5"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        markerStart="url(#cadArrowStart)"
                        markerEnd="url(#cadArrowEnd)"
                      />
                      <rect
                        x={box.centerX + 6}
                        y={(box.maxZ + room.depth) / 2 - 8}
                        width={48}
                        height={14}
                        rx={2}
                        fill="#09090b"
                        stroke="#27272a"
                      />
                      <text
                        x={box.centerX + 30}
                        y={(box.maxZ + room.depth) / 2 + 2}
                        textAnchor="middle"
                        fill="#f4f4f5"
                        fontSize="9.5"
                        fontWeight="500"
                      >
                        {dists.south} cm
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}

          {/* Linee metro punto-punto in 2D */}
          {customMeasurements.map((m) => {
            const midX = (m.start.x + m.end.x) / 2;
            const midZ = (m.start.z + m.end.z) / 2;
            return (
              <g key={m.id} pointerEvents="none">
                <line
                  x1={m.start.x}
                  y1={m.start.z}
                  x2={m.end.x}
                  y2={m.end.z}
                  stroke="#f4f4f5"
                  strokeWidth="2"
                />
                <circle cx={m.start.x} cy={m.start.z} r={3.5} fill="#f4f4f5" />
                <circle cx={m.end.x} cy={m.end.z} r={3.5} fill="#f4f4f5" />
                <rect
                  x={midX - 28}
                  y={midZ - 19}
                  width={56}
                  height={15}
                  rx={3}
                  fill="#09090b"
                  stroke="#27272a"
                />
                <text
                  x={midX}
                  y={midZ - 9}
                  textAnchor="middle"
                  fill="#f4f4f5"
                  fontSize="9.5"
                  fontWeight="500"
                >
                  {m.distanceCm} cm
                </text>
              </g>
            );
          })}

          {pendingMeasureStart && (
            <circle
              cx={pendingMeasureStart.x}
              cy={pendingMeasureStart.z}
              r={5}
              fill="#f4f4f5"
              stroke="#09090b"
              strokeWidth="1.5"
            />
          )}
        </g>
      </svg>
    </div>
  );
};
