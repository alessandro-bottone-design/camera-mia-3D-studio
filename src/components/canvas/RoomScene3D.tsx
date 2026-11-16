import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Grid, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BedDouble,
  Compass,
  DoorOpen,
  Eye,
  Layers,
  Monitor,
  Ruler,
} from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { FurnitureModel3D } from './FurnitureModels3D';
import { MeasurementsOverlay3D } from './MeasurementsOverlay3D';

/**
 * Genera una texture procedurale graniglia/marmo rosa-grigio fedele al pavimento reale
 */
function useTerrazzoTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#b99f96';
      ctx.fillRect(0, 0, 512, 512);
      const colors = ['#8c6d62', '#d8c8c0', '#6e5a53', '#e5dcd6', '#9e847b', '#574843'];
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = colors[i % colors.length];
        const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * 512;
        const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * 512;
        const w = 6 + (i % 18);
        const h = 5 + ((i * 3) % 15);
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, (i % 6) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(70, 55, 50, 0.25)';
      ctx.lineWidth = 2;
      for (let g = 0; g <= 512; g += 128) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, g);
        ctx.lineTo(512, g);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4.5, 4.2);
    return tex;
  }, []);
}

/**
 * Controllore telecamera animato con GSAP
 */
const AnimatedCameraRig: React.FC<{
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  draggingId: string | null;
}> = ({ targetPosition, targetLookAt, draggingId }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration: 0.75,
      ease: 'power2.inOut',
    });

    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: targetLookAt[0],
        y: targetLookAt[1],
        z: targetLookAt[2],
        duration: 0.75,
        ease: 'power2.inOut',
        onUpdate: () => {
          controlsRef.current?.update();
        },
      });
    }
  }, [
    camera,
    targetPosition[0],
    targetPosition[1],
    targetPosition[2],
    targetLookAt[0],
    targetLookAt[1],
    targetLookAt[2],
  ]);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!draggingId}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={0.5}
      maxDistance={12}
      enableDamping
      dampingFactor={0.08}
    />
  );
};

/**
 * Gestisce la visibilità intelligente dei 4 muri in base alla posizione della telecamera
 */
const SmartRoomArchitecture: React.FC<{
  onSurfaceClick: (e: ThreeEvent<MouseEvent>) => void;
}> = ({ onSurfaceClick }) => {
  const { room, updateRoom, showWallCutaway, viewMode, nightMode } = useRoomStore();
  const { camera } = useThree();
  const terrazzoTex = useTerrazzoTexture();
  const doorHingeRef = useRef<THREE.Group>(null);

  const [wallVisibility, setWallVisibility] = useState({
    north: true,
    south: true,
    west: true,
    east: true,
  });

  const roomW = room.southWidth / 100;
  const roomD = room.depth / 100;
  const ceilH = room.ceilingHeight / 100;
  const wallThick = 0.12;

  useEffect(() => {
    if (doorHingeRef.current) {
      gsap.to(doorHingeRef.current.rotation, {
        y: room.doorIsOpen ? -Math.PI * 0.48 : 0,
        duration: 0.55,
        ease: 'power2.inOut',
      });
    }
  }, [room.doorIsOpen]);

  useFrame(() => {
    if (!showWallCutaway || viewMode === 'first-person') {
      if (
        !wallVisibility.north ||
        !wallVisibility.south ||
        !wallVisibility.west ||
        !wallVisibility.east
      ) {
        setWallVisibility({ north: true, south: true, west: true, east: true });
      }
      return;
    }

    const next = {
      north: camera.position.z > -0.3,
      south: camera.position.z < roomD + 0.3,
      west: camera.position.x > -0.3,
      east: camera.position.x < roomW + 0.3,
    };
    if (
      next.north !== wallVisibility.north ||
      next.south !== wallVisibility.south ||
      next.west !== wallVisibility.west ||
      next.east !== wallVisibility.east
    ) {
      setWallVisibility(next);
    }
  });

  const getWallHeight = (visible: boolean) => (visible ? ceilH : 0.22);

  return (
    <group>
      {/* Pavimento in graniglia rosa-grigio */}
      <mesh
        position={[roomW / 2, -0.02, roomD / 2]}
        receiveShadow
        onClick={onSurfaceClick}
      >
        <boxGeometry args={[roomW + wallThick * 2, 0.04, roomD + wallThick * 2]} />
        <meshStandardMaterial map={terrazzoTex} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Griglia metrica leggera (1 quadratino = 20 cm, linea principale = 100 cm) */}
      <Grid
        position={[roomW / 2, 0.002, roomD / 2]}
        args={[roomW, roomD]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor="#3f3f46"
        sectionSize={1.0}
        sectionThickness={1.0}
        sectionColor="#71717a"
        fadeDistance={15}
        infiniteGrid={false}
      />

      {/* 1. Parete nord (Z = 0, con porta d'ingresso) */}
      {(() => {
        const h = getWallHeight(wallVisibility.north);
        const doorX = (room.doorOffsetWest + room.doorWidth / 2) / 100;
        const doorW = room.doorWidth / 100;
        const doorH = Math.min(h, room.doorHeight / 100);

        return (
          <group position={[0, 0, -wallThick / 2]}>
            <mesh
              position={[roomW / 2, h / 2, 0]}
              receiveShadow
              castShadow
              onClick={onSurfaceClick}
            >
              <boxGeometry args={[roomW + wallThick * 2, h, wallThick]} />
              <meshStandardMaterial color={room.wallColorNorth} roughness={0.85} />
            </mesh>

            {/* Porta d'ingresso cliccabile per aprire/chiudere con GSAP */}
            <group
              position={[doorX - doorW / 2, 0, wallThick / 2 + 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                updateRoom({ doorIsOpen: !room.doorIsOpen });
              }}
            >
              <mesh position={[doorW / 2, doorH / 2, 0]}>
                <boxGeometry args={[doorW + 0.1, doorH + 0.05, 0.03]} />
                <meshStandardMaterial color="#d4d4d0" roughness={0.6} />
              </mesh>
              <group ref={doorHingeRef} position={[doorW, 0, 0.015]}>
                <mesh position={[-doorW / 2, doorH / 2, 0]} castShadow>
                  <boxGeometry args={[doorW - 0.02, doorH - 0.02, 0.04]} />
                  <meshStandardMaterial color="#dcdad5" roughness={0.55} />
                </mesh>
                <mesh position={[-doorW + 0.08, 1.0, 0.03]}>
                  <boxGeometry args={[0.12, 0.025, 0.04]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
                </mesh>
              </group>
            </group>
          </group>
        );
      })()}

      {/* 2. Parete sud (Z = roomD, con termosifone nell'angolo sud-ovest) */}
      {(() => {
        const h = getWallHeight(wallVisibility.south);
        const radW = room.radiatorWidth / 100;
        const radH = room.radiatorHeight / 100;
        const radD = room.radiatorDepth / 100;
        const radX = (room.radiatorOffsetWest + room.radiatorWidth / 2) / 100;

        return (
          <group position={[0, 0, roomD + wallThick / 2]}>
            <mesh
              position={[roomW / 2, h / 2, 0]}
              receiveShadow
              castShadow
              onClick={onSurfaceClick}
            >
              <boxGeometry args={[roomW + wallThick * 2, h, wallThick]} />
              <meshStandardMaterial color={room.wallColorMain} roughness={0.85} />
            </mesh>

            <group position={[radX, radH / 2 + 0.08, -wallThick / 2 - radD / 2]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[radW, radH, radD]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} />
              </mesh>
            </group>
          </group>
        );
      })()}

      {/* 3. Parete ovest (X = 0, con climatizzatore split e portafinestra) */}
      {(() => {
        const h = getWallHeight(wallVisibility.west);
        const winZ = (room.windowOffsetNorth + room.windowWidth / 2) / 100;
        const winW = room.windowWidth / 100;
        const winH = Math.min(h - 0.05, room.windowHeight / 100);
        const acZ = room.acOffsetNorth / 100;
        const acY = room.acHeightFromFloor / 100;

        return (
          <group position={[-wallThick / 2, 0, 0]}>
            <mesh
              position={[0, h / 2, roomD / 2]}
              receiveShadow
              castShadow
              onClick={onSurfaceClick}
            >
              <boxGeometry args={[wallThick, h, roomD]} />
              <meshStandardMaterial color={room.wallColorMain} roughness={0.85} />
            </mesh>

            {room.hasWestStep && (
              <mesh
                position={[
                  wallThick / 2 + room.westStepOffset / 200,
                  h / 2,
                  roomD - 0.18,
                ]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[room.westStepOffset / 100, h, 0.36]} />
                <meshStandardMaterial color={room.wallColorMain} roughness={0.85} />
              </mesh>
            )}

            {wallVisibility.west && (
              <group position={[wallThick / 2 + 0.11, acY, acZ]}>
                <mesh castShadow>
                  <boxGeometry args={[0.22, 0.28, 0.82]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.3} />
                </mesh>
              </group>
            )}

            {winH > 0.3 && (
              <group position={[wallThick / 2 + 0.02, winH / 2, winZ]}>
                <mesh>
                  <boxGeometry args={[0.02, winH, winW]} />
                  <meshStandardMaterial
                    color={nightMode ? '#1e293b' : '#e0f2fe'}
                    emissive={nightMode ? '#0f172a' : '#bae6fd'}
                    emissiveIntensity={nightMode ? 0.1 : 0.45}
                  />
                </mesh>
                <mesh position={[0.04, 0, 0]}>
                  <boxGeometry args={[0.03, winH + 0.08, winW + 0.18]} />
                  <meshStandardMaterial
                    color="#e0f2f1"
                    transparent
                    opacity={0.65}
                    roughness={0.9}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })()}

      {/* 4. Parete est (X = roomW, parete armadi e letto) */}
      {(() => {
        const h = getWallHeight(wallVisibility.east);
        return (
          <group position={[roomW + wallThick / 2, 0, 0]}>
            <mesh
              position={[0, h / 2, roomD / 2]}
              receiveShadow
              castShadow
              onClick={onSurfaceClick}
            >
              <boxGeometry args={[wallThick, h, roomD]} />
              <meshStandardMaterial color={room.wallColorMain} roughness={0.85} />
            </mesh>
          </group>
        );
      })()}

      {/* 5. Lampadario a 3 cubi neri sospesi al centro del soffitto */}
      <group position={[roomW / 2, ceilH - 0.45, roomD / 2]}>
        {[-0.22, 0, 0.22].map((ox, idx) => (
          <group key={idx} position={[ox, (idx % 2) * 0.12, (idx - 1) * 0.1]}>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.44, 8]} />
              <meshBasicMaterial color="#18181b" />
            </mesh>
            <mesh rotation={[0.6, 0.6, 0.4]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#18181b" wireframe />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Etichette cardinali tecniche sentence-case con icone lucide-react */}
      <Html position={[roomW / 2, 0.05, -0.28]} center zIndexRange={[5, 0]}>
        <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-800 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 pointer-events-none whitespace-nowrap">
          <ArrowUp className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Parete nord — porta ({room.northWidth} cm)</span>
        </div>
      </Html>
      <Html position={[roomW / 2, 0.05, roomD + 0.28]} center zIndexRange={[5, 0]}>
        <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-800 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 pointer-events-none whitespace-nowrap">
          <ArrowDown className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Parete sud ({room.southWidth} cm)</span>
        </div>
      </Html>
      <Html position={[-0.32, 0.05, roomD / 2]} center zIndexRange={[5, 0]}>
        <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-800 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 pointer-events-none whitespace-nowrap">
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Parete ovest — finestra ({room.depth} cm)</span>
        </div>
      </Html>
      <Html position={[roomW + 0.32, 0.05, roomD / 2]} center zIndexRange={[5, 0]}>
        <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-800 px-2 py-1 rounded text-xs font-normal flex items-center gap-2 pointer-events-none whitespace-nowrap">
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Parete est — armadi e letto ({room.depth} cm)</span>
        </div>
      </Html>
    </group>
  );
};

export const RoomScene3D: React.FC = () => {
  const {
    room,
    viewMode,
    selectedItemId,
    xrayMode,
    showAutoMeasurements,
    showClearanceArcs,
    nightMode,
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

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<
    'iso' | 'door' | 'desk' | 'bed' | 'top' | 'eye'
  >('iso');

  const roomW = room.southWidth / 100;
  const roomD = room.depth / 100;

  const getCameraPosition = (): [number, number, number] => {
    if (viewMode === 'first-person' || cameraPreset === 'eye') {
      return [roomW * 0.52, 1.7, 0.65];
    }
    switch (cameraPreset) {
      case 'door':
        return [roomW * 0.5, 2.3, -1.6];
      case 'desk':
        return [3.6, 2.2, 3.2];
      case 'bed':
        return [0.8, 2.2, 2.1];
      case 'top':
        return [roomW / 2, 6.2, roomD / 2 + 0.01];
      case 'iso':
      default:
        return [-1.6, 4.1, 5.8];
    }
  };

  const getCameraTarget = (): [number, number, number] => {
    if (viewMode === 'first-person' || cameraPreset === 'eye') {
      return [roomW * 0.55, 1.35, roomD * 0.65];
    }
    switch (cameraPreset) {
      case 'desk':
        return [1.1, 1.0, 1.2];
      case 'bed':
        return [roomW - 0.6, 1.0, 2.1];
      default:
        return [roomW / 2, 0.8, roomD / 2];
    }
  };

  const handleSurfaceClick = (e: ThreeEvent<MouseEvent>) => {
    if (isMeasuring) {
      e.stopPropagation();
      addMeasurementPoint({
        x: e.point.x * 100,
        y: e.point.y * 100,
        z: e.point.z * 100,
      });
    } else {
      setSelectedItemId(null);
    }
  };

  const cameraButtons = [
    { id: 'iso', label: 'Panoramica', Icon: Compass },
    { id: 'door', label: 'Dalla porta', Icon: DoorOpen },
    { id: 'desk', label: 'Zona studio', Icon: Monitor },
    { id: 'bed', label: 'Zona letto e armadi', Icon: BedDouble },
    { id: 'top', label: 'Dall’alto', Icon: Layers },
    { id: 'eye', label: 'Altezza occhi (170 cm)', Icon: Eye },
  ] as const;

  return (
    <div className="relative w-full h-full bg-zinc-950 select-none">
      {/* Barra rapida telecamere in basso a sinistra */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
        <span className="text-xs font-medium text-zinc-400 px-2">Inquadratura:</span>
        {cameraButtons.map(({ id, label, Icon }) => {
          const isActive = cameraPreset === id;
          return (
            <button
              key={id}
              onClick={() => setCameraPreset(id)}
              className={`h-8 px-2 py-2 rounded text-xs font-medium flex items-center gap-2 transition ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 border border-zinc-100'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Banner istruzioni quando il metro punto-punto è attivo */}
      {isMeasuring && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900 text-zinc-100 border border-zinc-800 font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2">
          <Ruler className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          <span>
            Modalità metro attiva:{' '}
            {pendingMeasureStart
              ? 'clicca il secondo punto nella stanza per misurare la distanza'
              : 'clicca un punto qualsiasi su pavimento, muri o mobili per iniziare'}
          </span>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera
          makeDefault
          position={[-1.6, 4.1, 5.8]}
          fov={viewMode === 'first-person' || cameraPreset === 'eye' ? 62 : 46}
        />

        <AnimatedCameraRig
          targetPosition={getCameraPosition()}
          targetLookAt={getCameraTarget()}
          draggingId={draggingId}
        />

        {/* Illuminazione giorno / sera */}
        <ambientLight intensity={nightMode ? 0.35 : 0.72} />
        <directionalLight
          position={[-3, 6, 4]}
          intensity={nightMode ? 0.3 : 1.15}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight
          position={[roomW / 2, room.ceilingHeight / 100 - 0.4, roomD / 2]}
          intensity={nightMode ? 1.8 : 0.75}
          color="#fef08a"
          distance={8}
        />

        {/* Piano invisibile per il trascinamento fluido dei mobili col mouse */}
        {draggingId && (
          <mesh
            position={[roomW / 2, 0.01, roomD / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={(e) => {
              e.stopPropagation();
              moveItemTo(draggingId, e.point.x * 100, e.point.z * 100);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setDraggingId(null);
            }}
          >
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {/* Architettura della stanza */}
        <SmartRoomArchitecture onSurfaceClick={handleSurfaceClick} />

        {/* Tutti i mobili della stanza */}
        {items.map((item) => (
          <FurnitureModel3D
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            xrayMode={xrayMode}
            showClearanceArcs={showClearanceArcs}
            onSelect={(id, e) => {
              if (isMeasuring) {
                addMeasurementPoint({
                  x: e.point.x * 100,
                  y: e.point.y * 100,
                  z: e.point.z * 100,
                });
              } else {
                setSelectedItemId(id);
              }
            }}
            onDragStart={(id) => {
              if (!isMeasuring) {
                setSelectedItemId(id);
                setDraggingId(id);
              }
            }}
          />
        ))}

        {/* Quote dinamiche automatiche e metro punto-punto */}
        <MeasurementsOverlay3D
          selectedItem={selectedItem}
          allItems={items}
          room={room}
          showAutoMeasurements={showAutoMeasurements}
          customMeasurements={customMeasurements}
          pendingMeasureStart={pendingMeasureStart}
        />

        <ContactShadows
          position={[roomW / 2, 0.005, roomD / 2]}
          opacity={0.35}
          scale={10}
          blur={2}
          far={4}
        />
      </Canvas>
    </div>
  );
};
