import React from 'react';
import { Html, Line } from '@react-three/drei';
import { ArrowLeftRight, MoveVertical, Ruler } from 'lucide-react';
import { FurnitureItem, MeasurementLine, MeasurementPoint, RoomConfig } from '../../types/room';
import { getItemBoundingBox, getWallDistances } from '../../utils/geometry';

interface MeasurementsOverlayProps {
  selectedItem: FurnitureItem | null;
  allItems: FurnitureItem[];
  room: RoomConfig;
  showAutoMeasurements: boolean;
  customMeasurements: MeasurementLine[];
  pendingMeasureStart: MeasurementPoint | null;
}

export const MeasurementsOverlay3D: React.FC<MeasurementsOverlayProps> = ({
  selectedItem,
  allItems,
  room,
  showAutoMeasurements,
  customMeasurements,
  pendingMeasureStart,
}) => {
  const yFloor = 0.04;

  return (
    <group>
      {/* 1. Quote dinamiche verso i 4 muri per il mobile selezionato */}
      {showAutoMeasurements &&
        selectedItem &&
        (() => {
          const box = getItemBoundingBox(selectedItem);
          const dists = getWallDistances(selectedItem, room);
          const cx = box.centerX / 100;
          const cz = box.centerZ / 100;
          const minX = box.minX / 100;
          const maxX = box.maxX / 100;
          const minZ = box.minZ / 100;
          const maxZ = box.maxZ / 100;
          const roomW = room.southWidth / 100;
          const roomD = room.depth / 100;

          return (
            <group>
              {/* Distanza da muro ovest */}
              {dists.west > 2 && (
                <group>
                  <Line
                    points={[
                      [0, yFloor, cz],
                      [minX, yFloor, cz],
                    ]}
                    color="#a1a1aa"
                    lineWidth={1.8}
                    dashed
                    dashScale={15}
                  />
                  <Html position={[minX / 2, yFloor + 0.06, cz]} center zIndexRange={[5, 0]}>
                    <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                      <span>Ovest: {dists.west} cm</span>
                    </div>
                  </Html>
                </group>
              )}

              {/* Distanza da muro est */}
              {dists.east > 2 && (
                <group>
                  <Line
                    points={[
                      [maxX, yFloor, cz],
                      [roomW, yFloor, cz],
                    ]}
                    color="#a1a1aa"
                    lineWidth={1.8}
                    dashed
                    dashScale={15}
                  />
                  <Html
                    position={[(maxX + roomW) / 2, yFloor + 0.06, cz]}
                    center
                    zIndexRange={[5, 0]}
                  >
                    <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                      <span>Est: {dists.east} cm</span>
                    </div>
                  </Html>
                </group>
              )}

              {/* Distanza da muro nord */}
              {dists.north > 2 && (
                <group>
                  <Line
                    points={[
                      [cx, yFloor, 0],
                      [cx, yFloor, minZ],
                    ]}
                    color="#a1a1aa"
                    lineWidth={1.8}
                    dashed
                    dashScale={15}
                  />
                  <Html position={[cx, yFloor + 0.06, minZ / 2]} center zIndexRange={[5, 0]}>
                    <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
                      <MoveVertical className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                      <span>Nord: {dists.north} cm</span>
                    </div>
                  </Html>
                </group>
              )}

              {/* Distanza da muro sud */}
              {dists.south > 2 && (
                <group>
                  <Line
                    points={[
                      [cx, yFloor, maxZ],
                      [cx, yFloor, roomD],
                    ]}
                    color="#a1a1aa"
                    lineWidth={1.8}
                    dashed
                    dashScale={15}
                  />
                  <Html
                    position={[cx, yFloor + 0.06, (maxZ + roomD) / 2]}
                    center
                    zIndexRange={[5, 0]}
                  >
                    <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
                      <MoveVertical className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                      <span>Sud: {dists.south} cm</span>
                    </div>
                  </Html>
                </group>
              )}
            </group>
          );
        })()}

      {/* 2. Quota automatica passaggio centrale (letto - scrivania) se entrambi presenti */}
      {showAutoMeasurements &&
        (() => {
          const bed = allItems.find((i) => i.modelType === 'big_town_bed');
          const desk = allItems.find((i) => i.modelType === 'desk_setup');
          if (!bed || !desk) return null;
          const bedBox = getItemBoundingBox(bed);
          const deskBox = getItemBoundingBox(desk);
          const gapCm = Math.round(bedBox.minX - deskBox.maxX);
          if (gapCm <= 0) return null;
          const x1 = deskBox.maxX / 100;
          const x2 = bedBox.minX / 100;
          const zMid = ((bedBox.centerZ + deskBox.centerZ) / 2) / 100;

          return (
            <group>
              <Line
                points={[
                  [x1, yFloor + 0.01, zMid],
                  [x2, yFloor + 0.01, zMid],
                ]}
                color="#f4f4f5"
                lineWidth={2}
              />
              <Html position={[(x1 + x2) / 2, yFloor + 0.08, zMid]} center zIndexRange={[5, 0]}>
                <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                  <span>Passaggio scrivania - letto: {gapCm} cm</span>
                </div>
              </Html>
            </group>
          );
        })()}

      {/* 3. Linee del metro punto-punto personalizzato */}
      {customMeasurements.map((m) => {
        const p1: [number, number, number] = [
          m.start.x / 100,
          Math.max(0.05, m.start.y / 100),
          m.start.z / 100,
        ];
        const p2: [number, number, number] = [
          m.end.x / 100,
          Math.max(0.05, m.end.y / 100),
          m.end.z / 100,
        ];
        const mid: [number, number, number] = [
          (p1[0] + p2[0]) / 2,
          (p1[1] + p2[1]) / 2 + 0.1,
          (p1[2] + p2[2]) / 2,
        ];

        return (
          <group key={m.id}>
            <Line points={[p1, p2]} color="#f4f4f5" lineWidth={2.5} />
            <mesh position={p1}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#f4f4f5" />
            </mesh>
            <mesh position={p2}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#f4f4f5" />
            </mesh>
            <Html position={mid} center zIndexRange={[5, 0]}>
              <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
                <Ruler className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>{m.distanceCm} cm</span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Punto iniziale in attesa del secondo click */}
      {pendingMeasureStart && (
        <group
          position={[
            pendingMeasureStart.x / 100,
            Math.max(0.05, pendingMeasureStart.y / 100),
            pendingMeasureStart.z / 100,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color="#f4f4f5" />
          </mesh>
          <Html position={[0, 0.16, 0]} center distanceFactor={6}>
            <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 whitespace-nowrap pointer-events-none">
              <Ruler className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              <span>
                Primo punto ({pendingMeasureStart.x}, {pendingMeasureStart.z} cm) — clicca secondo punto
              </span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};
