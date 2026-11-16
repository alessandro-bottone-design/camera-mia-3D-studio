import React, { useEffect, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { FurnitureItem, WardrobeAccessoryInstance } from '../../types/room';

interface FurnitureModelProps {
  item: FurnitureItem;
  isSelected: boolean;
  xrayMode: boolean;
  showClearanceArcs: boolean;
  onSelect: (id: string, e: ThreeEvent<MouseEvent>) => void;
  onDragStart: (id: string, e: ThreeEvent<PointerEvent>) => void;
}

/**
 * Singolo accessorio interno armadio animato con GSAP
 */
const WardrobeAccessoryItem3D: React.FC<{
  acc: WardrobeAccessoryInstance;
  innerW: number;
  innerD: number;
  bottomY: number;
  parentIsOpen: boolean;
}> = ({ acc, innerW, innerD, bottomY, parentIsOpen }) => {
  const pulloutGroupRef = useRef<THREE.Group>(null);
  const topDrawerRef = useRef<THREE.Group>(null);

  const yCenter = bottomY + (acc.yCm + acc.heightCm / 2) / 100;
  const hM = Math.max(0.02, acc.heightCm / 100);
  const isExtended = parentIsOpen || Boolean(acc.isOpen);

  useEffect(() => {
    if (pulloutGroupRef.current) {
      const targetZ =
        acc.type === 'pullout_shelf'
          ? isExtended
            ? 0.22 * 0.6
            : 0
          : acc.type === 'pullout_basket' ||
              acc.type === 'trouser_rack' ||
              acc.type === 'tie_rack'
            ? isExtended
              ? 0.22 * 0.7
              : 0
            : 0;

      gsap.to(pulloutGroupRef.current.position, {
        z: targetZ,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  }, [acc.type, isExtended]);

  useEffect(() => {
    if (topDrawerRef.current) {
      gsap.to(topDrawerRef.current.position, {
        z: innerD / 2 + (isExtended ? 0.2 : 0),
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  }, [innerD, isExtended]);

  if (acc.type === 'shelf' || acc.type === 'pullout_shelf') {
    return (
      <group ref={pulloutGroupRef} position={[0, yCenter, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[innerW, 0.025, innerD]} />
          <meshStandardMaterial color="#d6d3cd" roughness={0.6} />
        </mesh>
        {acc.hasClothes && (
          <group position={[0, 0.09, 0]}>
            <mesh position={[-innerW * 0.24, 0, 0]} castShadow>
              <boxGeometry args={[innerW * 0.38, 0.15, innerD * 0.75]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
            </mesh>
            <mesh position={[innerW * 0.22, -0.01, 0]} castShadow>
              <boxGeometry args={[innerW * 0.36, 0.13, innerD * 0.7]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  if (acc.type === 'hanger_rod') {
    return (
      <group position={[0, yCenter, 0]}>
        {/* Asta metallica */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, innerW, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Sagome vestiti appesi */}
        {acc.hasClothes && (
          <group position={[0, -0.38, 0]}>
            {[-0.28, -0.14, 0, 0.14, 0.28].map((offsetRatio, idx) => (
              <mesh key={idx} position={[innerW * offsetRatio, 0, 0]} castShadow>
                <boxGeometry args={[0.07, 0.68, innerD * 0.72]} />
                <meshStandardMaterial
                  color={['#334155', '#64748b', '#0f766e', '#1e293b', '#94a3b8'][idx % 5]}
                  roughness={0.85}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  }

  if (acc.type === 'drawer_2c' || acc.type === 'drawer_3c') {
    const count = acc.type === 'drawer_2c' ? 2 : 3;
    const singleH = (hM - 0.02) / count;
    return (
      <group position={[0, yCenter, 0]}>
        {/* Struttura cassettiera */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[innerW, hM, innerD]} />
          <meshStandardMaterial color="#b8b5ad" roughness={0.65} />
        </mesh>
        {Array.from({ length: count }).map((_, idx) => {
          const dy = -hM / 2 + singleH * (idx + 0.5) + 0.005;
          const isAnimatedDrawer = idx === count - 1;
          return (
            <group
              key={idx}
              ref={isAnimatedDrawer ? topDrawerRef : undefined}
              position={[0, dy, innerD / 2]}
            >
              <mesh castShadow>
                <boxGeometry args={[innerW - 0.02, singleH - 0.012, 0.025]} />
                <meshStandardMaterial color="#9ca3af" roughness={0.5} />
              </mesh>
              {/* Maniglia a gola */}
              <mesh position={[0, singleH * 0.25, 0.015]}>
                <boxGeometry args={[0.18, 0.015, 0.01]} />
                <meshStandardMaterial color="#3f3f46" metalness={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  if (acc.type === 'pullout_basket' || acc.type === 'trouser_rack' || acc.type === 'tie_rack') {
    return (
      <group ref={pulloutGroupRef} position={[0, yCenter, 0]}>
        <mesh castShadow>
          <boxGeometry args={[innerW - 0.02, hM * 0.85, innerD * 0.9]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.5}
            roughness={0.3}
            wireframe={acc.type === 'pullout_basket'}
          />
        </mesh>
      </group>
    );
  }

  if (acc.type === 'divider_2' || acc.type === 'divider_3') {
    const shelves = acc.type === 'divider_2' ? 2 : 3;
    return (
      <group position={[0, yCenter, 0]}>
        {/* Cappello superiore dell'inserto */}
        <mesh position={[0, hM / 2 - 0.012, 0]} castShadow>
          <boxGeometry args={[innerW, 0.025, innerD]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.6} />
        </mesh>
        {/* Tramezzo verticale centrale */}
        <mesh castShadow>
          <boxGeometry args={[0.025, hM, innerD]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.6} />
        </mesh>
        {/* Ripiani interni alveare */}
        {Array.from({ length: shelves - 1 }).map((_, idx) => {
          const sy = -hM / 2 + (hM / shelves) * (idx + 1);
          return (
            <mesh key={idx} position={[0, sy, 0]} castShadow>
              <boxGeometry args={[innerW, 0.022, innerD]} />
              <meshStandardMaterial color="#d1d5db" roughness={0.6} />
            </mesh>
          );
        })}
      </group>
    );
  }

  return null;
};

/**
 * Renderizza gli accessori interni di un armadio (Elena o custom)
 */
const WardrobeInterior3D: React.FC<{
  widthM: number;
  depthM: number;
  heightM: number;
  accessories: WardrobeAccessoryInstance[];
  parentIsOpen: boolean;
}> = ({ widthM, depthM, heightM, accessories, parentIsOpen }) => {
  const innerW = widthM - 0.04;
  const innerD = depthM - 0.05;
  const bottomY = -heightM / 2;

  return (
    <group>
      {accessories.map((acc) => (
        <WardrobeAccessoryItem3D
          key={acc.id}
          acc={acc}
          innerW={innerW}
          innerD={innerD}
          bottomY={bottomY}
          parentIsOpen={parentIsOpen}
        />
      ))}
    </group>
  );
};

/**
 * Anta battente armadio animata con GSAP
 */
const AnimatedWardrobeDoor3D: React.FC<{
  pivotX: number;
  pivotZ: number;
  doorW: number;
  h: number;
  isLeftHinge: boolean;
  isOpen: boolean;
  color: string;
  secondaryColor?: string;
  xrayMode: boolean;
  doorOpacity: number;
  showInternalMirror: boolean;
}> = ({
  pivotX,
  pivotZ,
  doorW,
  h,
  isLeftHinge,
  isOpen,
  color,
  secondaryColor,
  xrayMode,
  doorOpacity,
  showInternalMirror,
}) => {
  const hingeRef = useRef<THREE.Group>(null);
  const doorOffsetFromPivot = isLeftHinge ? doorW / 2 : -doorW / 2;
  const targetAngle = isOpen ? (isLeftHinge ? -Math.PI * 0.52 : Math.PI * 0.52) : 0;

  useEffect(() => {
    if (hingeRef.current) {
      gsap.to(hingeRef.current.rotation, {
        y: targetAngle,
        duration: 0.55,
        ease: 'power2.inOut',
      });
    }
  }, [targetAngle]);

  return (
    <group ref={hingeRef} position={[pivotX, 0, pivotZ]}>
      {/* Pannello anta effetto cemento */}
      <mesh position={[doorOffsetFromPivot, 0, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[doorW - 0.006, h - 0.01, 0.02]} />
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          transparent={xrayMode}
          opacity={doorOpacity}
        />
      </mesh>
      {/* Maniglia verticale antracite Elena */}
      <mesh
        position={[
          doorOffsetFromPivot + (isLeftHinge ? doorW * 0.38 : -doorW * 0.38),
          -h * 0.12,
          0.028,
        ]}
        castShadow
      >
        <boxGeometry args={[0.018, h * 0.45, 0.02]} />
        <meshStandardMaterial
          color={secondaryColor ?? '#27272a'}
          metalness={0.6}
          roughness={0.3}
          transparent={xrayMode}
          opacity={doorOpacity}
        />
      </mesh>
      {/* Specchiera interna sull'anta */}
      {showInternalMirror && (
        <mesh position={[doorOffsetFromPivot, 0, -0.002]}>
          <boxGeometry args={[doorW * 0.72, Math.min(1.83, h * 0.75), 0.005]} />
          <meshStandardMaterial color="#e0f2fe" metalness={0.92} roughness={0.05} />
        </mesh>
      )}
    </group>
  );
};

export const FurnitureModel3D: React.FC<FurnitureModelProps> = ({
  item,
  isSelected,
  xrayMode,
  showClearanceArcs,
  onSelect,
  onDragStart,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bedLiftRef = useRef<THREE.Group>(null);
  const deskDrawerRefs = useRef<(THREE.Mesh | null)[]>([]);
  const greenBridgeDrawerRefs = useRef<(THREE.Mesh | null)[]>([]);
  const nightstandDrawerRef = useRef<THREE.Mesh>(null);

  const w = item.width / 100;
  const d = item.depth / 100;
  const h = item.height / 100;

  const posX = item.x / 100;
  const posY = item.y / 100 + h / 2;
  const posZ = item.z / 100;
  const rotY = (item.rotation * Math.PI) / 180;

  const isOpen = item.isOpen;
  const doorOpacity = xrayMode ? 0.22 : 1;

  // GSAP: Sollevamento a compasso rete + materasso letto contenitore Big Town
  useEffect(() => {
    if (item.modelType === 'big_town_bed' && bedLiftRef.current) {
      gsap.to(bedLiftRef.current.rotation, {
        x: isOpen ? -0.58 : 0,
        duration: 0.65,
        ease: 'power2.inOut',
      });
    }
  }, [item.modelType, isOpen]);

  // GSAP: Scorrimento cassetti scrivania
  useEffect(() => {
    if (item.modelType === 'desk_setup') {
      deskDrawerRefs.current.forEach((mesh, dIdx) => {
        if (!mesh) return;
        const targetZ = (d - 0.04) / 2 + (isOpen && dIdx < 2 ? 0.22 : 0.008);
        gsap.to(mesh.position, {
          z: targetZ,
          duration: 0.45,
          delay: dIdx * 0.05,
          ease: 'power2.out',
        });
      });
    }
  }, [item.modelType, isOpen, d]);

  // GSAP: Scorrimento cassetti armadio a ponte attuale
  useEffect(() => {
    if (item.modelType === 'current_green_bridge') {
      greenBridgeDrawerRefs.current.forEach((mesh, idx) => {
        if (!mesh) return;
        const targetZ = d / 2 + (isOpen && idx === 2 ? 0.22 : 0.01);
        gsap.to(mesh.position, {
          z: targetZ,
          duration: 0.45,
          ease: 'power2.out',
        });
      });
    }
  }, [item.modelType, isOpen, d]);

  // GSAP: Scorrimento cassetto comodino
  useEffect(() => {
    if (item.modelType === 'current_nightstand' && nightstandDrawerRef.current) {
      const targetZ = isOpen ? d / 2 + 0.12 : 0;
      gsap.to(nightstandDrawerRef.current.position, {
        z: targetZ,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  }, [item.modelType, isOpen, d]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onDragStart(item.id, e);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(item.id, e);
  };

  // --- 1. Libreria angolare Ikea Billy (L-shape nell'angolo nord-ovest) ---
  if (item.modelType === 'billy_corner') {
    const armNorthM = item.width / 100; // Lungo parete nord (X)
    const armWestM = (item.secondaryWidth ?? 215) / 100; // Lungo parete ovest (Z)
    const depthM = item.depth / 100; // 0.28 m
    const shelves = item.shelfHeightsCm ?? [36, 72, 108, 144, 180, 202];

    const cornerOriginX = (item.x - item.width / 2) / 100;
    const cornerOriginZ = (item.z - (item.secondaryWidth ?? 215) / 2) / 100;

    return (
      <group
        ref={groupRef}
        position={[cornerOriginX, h / 2, cornerOriginZ]}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {/* Braccio lungo parete nord (scorre lungo +X) */}
        <group position={[armNorthM / 2, 0, depthM / 2]}>
          <mesh position={[0, 0, -depthM / 2 + 0.01]} castShadow receiveShadow>
            <boxGeometry args={[armNorthM, h, 0.02]} />
            <meshStandardMaterial color={item.color} roughness={0.65} />
          </mesh>
          {[0, 0.4, 1.2, 2.0, armNorthM - 0.02]
            .filter((pos) => pos <= armNorthM)
            .map((xPos, idx) => (
              <mesh
                key={idx}
                position={[-armNorthM / 2 + xPos + 0.01, 0, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.022, h, depthM]} />
                <meshStandardMaterial color={item.color} roughness={0.6} />
              </mesh>
            ))}
          <mesh position={[0, -h / 2 + 0.02, 0]} castShadow>
            <boxGeometry args={[armNorthM, 0.04, depthM]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, h / 2 - 0.015, 0]} castShadow>
            <boxGeometry args={[armNorthM, 0.03, depthM]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          {shelves.map((shCm, idx) => {
            const sy = -h / 2 + shCm / 100;
            if (sy >= h / 2 - 0.05) return null;
            return (
              <group key={idx} position={[0, sy, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[armNorthM - 0.02, 0.022, depthM - 0.01]} />
                  <meshStandardMaterial color={item.color} roughness={0.55} />
                </mesh>
                {idx < 4 && (
                  <mesh position={[0.15 * (idx % 2 === 0 ? 1 : -1), 0.09, 0]} castShadow>
                    <boxGeometry args={[armNorthM * 0.45, 0.16, depthM * 0.72]} />
                    <meshStandardMaterial
                      color={['#cbd5e1', '#93c5fd', '#fca5a5', '#fde047'][idx % 4]}
                      roughness={0.7}
                    />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>

        {/* Braccio lungo parete ovest (scorre lungo +Z) */}
        <group position={[depthM / 2, 0, armWestM / 2]}>
          <mesh position={[-depthM / 2 + 0.01, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.02, h, armWestM]} />
            <meshStandardMaterial color={item.color} roughness={0.65} />
          </mesh>
          {[0.4, 1.2, armWestM - 0.02]
            .filter((pos) => pos <= armWestM)
            .map((zPos, idx) => (
              <mesh
                key={idx}
                position={[0, 0, -armWestM / 2 + zPos]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[depthM, h, 0.022]} />
                <meshStandardMaterial color={item.color} roughness={0.6} />
              </mesh>
            ))}
          <mesh position={[0, -h / 2 + 0.02, 0]} castShadow>
            <boxGeometry args={[depthM, 0.04, armWestM]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, h / 2 - 0.015, 0]} castShadow>
            <boxGeometry args={[depthM, 0.03, armWestM]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          {shelves.map((shCm, idx) => {
            const sy = -h / 2 + shCm / 100;
            if (sy >= h / 2 - 0.05) return null;
            return (
              <group key={idx} position={[0, sy, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[depthM - 0.01, 0.022, armWestM - 0.02]} />
                  <meshStandardMaterial color={item.color} roughness={0.55} />
                </mesh>
                {idx < 4 && (
                  <mesh position={[0, 0.09, 0.1]} castShadow>
                    <boxGeometry args={[depthM * 0.72, 0.16, armWestM * 0.4]} />
                    <meshStandardMaterial
                      color={['#e2e8f0', '#fdba74', '#86efac', '#c4b5fd'][idx % 4]}
                      roughness={0.7}
                    />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>

        {/* Badge monocromatico tecnico di selezione */}
        {isSelected && (
          <Html position={[armNorthM * 0.45, h / 2 + 0.12, depthM]} center zIndexRange={[10, 0]}>
            <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none">
              {item.name} ({item.width}×{item.secondaryWidth ?? 215}×{item.height} cm)
            </div>
          </Html>
        )}
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={[posX, posY, posZ]}
      rotation={[0, rotY, 0]}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      {/* --- 2. Armadio componibile Elena (1, 2, 3+ ante) --- */}
      {item.modelType === 'elena_wardrobe' && (
        <group>
          {/* Fianchi, top, base, schienale */}
          <mesh position={[-w / 2 + 0.012, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.024, h, d]} />
            <meshStandardMaterial color="#3f4145" roughness={0.6} />
          </mesh>
          <mesh position={[w / 2 - 0.012, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.024, h, d]} />
            <meshStandardMaterial color="#3f4145" roughness={0.6} />
          </mesh>
          <mesh position={[0, h / 2 - 0.012, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.024, d]} />
            <meshStandardMaterial color="#3f4145" roughness={0.6} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.015, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.03, d]} />
            <meshStandardMaterial color="#3f4145" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, -d / 2 + 0.01]} castShadow receiveShadow>
            <boxGeometry args={[w - 0.02, h - 0.02, 0.02]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.7} />
          </mesh>

          {/* Scompartimenti interni configurabili */}
          <WardrobeInterior3D
            widthM={w}
            depthM={d}
            heightM={h}
            accessories={item.accessories ?? []}
            parentIsOpen={isOpen}
          />

          {/* Ante battenti incernierate animate con GSAP */}
          {(() => {
            const doors = item.doorCount ?? (item.width <= 60 ? 1 : item.width <= 110 ? 2 : 3);
            const doorW = (w - 0.01) / doors;
            const hasInternalMirror = Boolean(
              item.accessories?.some((a) => a.type === 'internal_mirror')
            );

            return Array.from({ length: doors }).map((_, idx) => {
              const isLeftHinge = idx % 2 === 0;
              const pivotX = -w / 2 + idx * doorW + (isLeftHinge ? 0.005 : doorW - 0.005);

              return (
                <AnimatedWardrobeDoor3D
                  key={idx}
                  pivotX={pivotX}
                  pivotZ={d / 2 - 0.01}
                  doorW={doorW}
                  h={h}
                  isLeftHinge={isLeftHinge}
                  isOpen={isOpen}
                  color={item.color}
                  secondaryColor={item.secondaryColor}
                  xrayMode={xrayMode}
                  doorOpacity={doorOpacity}
                  showInternalMirror={hasInternalMirror && idx === doors - 1}
                />
              );
            });
          })()}

          {/* Area di apertura a pavimento */}
          {showClearanceArcs && (
            <mesh
              position={[0, -h / 2 + 0.004, d / 2 + 0.23]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[w, 0.46]} />
              <meshBasicMaterial
                color={isOpen ? '#f4f4f5' : '#a1a1aa'}
                transparent
                opacity={isOpen ? 0.22 : 0.12}
              />
            </mesh>
          )}
        </group>
      )}

      {/* --- 3. Armadio a ponte Elena 6 ante (320×55×247) --- */}
      {item.modelType === 'elena_bridge' && (
        <group>
          <mesh position={[-w / 2 + 0.24, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.48, h, d]} />
            <meshStandardMaterial
              color={item.color}
              roughness={0.55}
              transparent={xrayMode}
              opacity={doorOpacity}
            />
          </mesh>
          <mesh position={[w / 2 - 0.24, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.48, h, d]} />
            <meshStandardMaterial
              color={item.color}
              roughness={0.55}
              transparent={xrayMode}
              opacity={doorOpacity}
            />
          </mesh>
          <mesh position={[0, h / 2 - 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[w - 0.96, 0.96, d]} />
            <meshStandardMaterial
              color={item.color}
              roughness={0.55}
              transparent={xrayMode}
              opacity={doorOpacity}
            />
          </mesh>
        </group>
      )}

      {/* --- 4. Letto 1.5 piazze contenitore Big Town (131×205×110) --- */}
      {item.modelType === 'big_town_bed' && (
        <group>
          {/* Testiera alta trapuntata (110 cm) sul retro (-Z) */}
          <RoundedBox
            args={[w, h, 0.12]}
            radius={0.03}
            position={[0, 0, -d / 2 + 0.06]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.85} />
          </RoundedBox>

          {/* Giroletto contenitore perimetrale (H 34 cm) */}
          <group position={[0, -h / 2 + 0.18, 0.05]}>
            <mesh position={[-w / 2 + 0.03, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.06, 0.34, d - 0.1]} />
              <meshStandardMaterial color={item.color} roughness={0.85} />
            </mesh>
            <mesh position={[w / 2 - 0.03, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.06, 0.34, d - 0.1]} />
              <meshStandardMaterial color={item.color} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0, (d - 0.1) / 2 - 0.03]} castShadow receiveShadow>
              <boxGeometry args={[w, 0.34, 0.06]} />
              <meshStandardMaterial color={item.color} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.15, 0]} receiveShadow>
              <boxGeometry args={[w - 0.08, 0.03, d - 0.16]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
            </mesh>
            <mesh position={[-0.25, -0.04, -0.2]} castShadow>
              <boxGeometry args={[0.48, 0.18, 0.65]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
            </mesh>
            <mesh position={[0.25, -0.04, 0.25]} castShadow>
              <boxGeometry args={[0.46, 0.18, 0.65]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} />
            </mesh>
          </group>

          {/* Rete + materasso + piumone + cuscini animati a compasso con GSAP */}
          <group ref={bedLiftRef} position={[0, -h / 2 + 0.34, -d / 2 + 0.16]}>
            <RoundedBox
              args={[w - 0.1, 0.22, d - 0.18]}
              radius={0.04}
              position={[0, 0.08, (d - 0.18) / 2]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#f8fafc" roughness={0.75} />
            </RoundedBox>
            <RoundedBox
              args={[w - 0.08, 0.08, (d - 0.18) * 0.72]}
              radius={0.03}
              position={[0, 0.18, (d - 0.18) * 0.62]}
              castShadow
            >
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </RoundedBox>
            <RoundedBox
              args={[w * 0.38, 0.11, 0.36]}
              radius={0.04}
              position={[-w * 0.22, 0.23, 0.24]}
              rotation={[0.2, 0, 0]}
              castShadow
            >
              <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
            </RoundedBox>
            <RoundedBox
              args={[w * 0.38, 0.11, 0.36]}
              radius={0.04}
              position={[w * 0.22, 0.23, 0.24]}
              rotation={[0.2, 0, 0]}
              castShadow
            >
              <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
            </RoundedBox>
          </group>
        </group>
      )}

      {/* --- 5. Scaffale Ikea Kallax 2×4 --- */}
      {item.modelType === 'kallax_2x4' && (
        <group>
          <mesh position={[0, h / 2 - 0.019, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.038, d]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.019, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.038, d]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          <mesh position={[-w / 2 + 0.019, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.038, h - 0.076, d]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
          <mesh position={[w / 2 - 0.019, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.038, h - 0.076, d]} />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>

          {(() => {
            const isHorizontal = w >= h;
            const cols = isHorizontal ? 4 : 2;
            const rows = isHorizontal ? 2 : 4;
            const innerW = w - 0.076;
            const innerH = h - 0.076;
            const cellW = innerW / cols;
            const cellH = innerH / rows;

            return (
              <group>
                {Array.from({ length: cols - 1 }).map((_, cIdx) => (
                  <mesh
                    key={`vc-${cIdx}`}
                    position={[-innerW / 2 + cellW * (cIdx + 1), 0, 0]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[0.016, innerH, d - 0.01]} />
                    <meshStandardMaterial color={item.color} roughness={0.6} />
                  </mesh>
                ))}
                {Array.from({ length: rows - 1 }).map((_, rIdx) => (
                  <mesh
                    key={`hr-${rIdx}`}
                    position={[0, -innerH / 2 + cellH * (rIdx + 1), 0]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[innerW, 0.016, d - 0.01]} />
                    <meshStandardMaterial color={item.color} roughness={0.6} />
                  </mesh>
                ))}

                {Array.from({ length: 8 }).map((_, idx) => {
                  const col = idx % cols;
                  const row = Math.floor(idx / cols);
                  const cx = -innerW / 2 + cellW * (col + 0.5);
                  const cy = innerH / 2 - cellH * (row + 0.5);
                  const cellCfg = item.kallaxCells?.find((c) => c.index === idx);
                  const content = cellCfg?.contentType ?? (idx < 4 ? 'manga' : 'box_dark');
                  const cellOpen = isOpen || cellCfg?.isOpen;

                  if (content === 'empty') return null;

                  if (content === 'manga') {
                    return (
                      <group key={idx} position={[cx, cy - cellH * 0.15, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[cellW * 0.78, cellH * 0.56, d * 0.6]} />
                          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
                        </mesh>
                      </group>
                    );
                  }

                  if (content === 'funko') {
                    return (
                      <group key={idx} position={[cx, cy - cellH * 0.12, 0.04]}>
                        <mesh position={[-0.07, 0, 0]} castShadow>
                          <boxGeometry args={[0.11, 0.16, 0.09]} />
                          <meshStandardMaterial color="#38bdf8" roughness={0.5} />
                        </mesh>
                        <mesh position={[0.07, 0, 0]} castShadow>
                          <boxGeometry args={[0.11, 0.16, 0.09]} />
                          <meshStandardMaterial color="#f43f5e" roughness={0.5} />
                        </mesh>
                      </group>
                    );
                  }

                  if (content === 'box_dark' || content === 'box_white') {
                    return (
                      <mesh key={idx} position={[cx, cy, cellOpen ? 0.14 : 0]} castShadow>
                        <boxGeometry args={[cellW - 0.03, cellH - 0.03, d - 0.03]} />
                        <meshStandardMaterial
                          color={content === 'box_dark' ? '#334155' : '#f1f5f9'}
                          roughness={0.85}
                        />
                      </mesh>
                    );
                  }

                  if (content === 'two_drawers') {
                    return (
                      <group key={idx} position={[cx, cy, cellOpen ? 0.14 : 0]}>
                        <mesh position={[0, cellH * 0.23, 0]} castShadow>
                          <boxGeometry args={[cellW - 0.025, cellH * 0.44, d - 0.03]} />
                          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
                        </mesh>
                        <mesh position={[0, -cellH * 0.23, 0]} castShadow>
                          <boxGeometry args={[cellW - 0.025, cellH * 0.44, d - 0.03]} />
                          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
                        </mesh>
                      </group>
                    );
                  }

                  if (content === 'door') {
                    return (
                      <group
                        key={idx}
                        position={[cx - cellW / 2 + 0.01, cy, d / 2 - 0.01]}
                        rotation={[0, cellOpen ? -Math.PI * 0.5 : 0, 0]}
                      >
                        <mesh position={[cellW / 2 - 0.01, 0, 0]} castShadow>
                          <boxGeometry args={[cellW - 0.02, cellH - 0.02, 0.018]} />
                          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
                        </mesh>
                      </group>
                    );
                  }

                  return null;
                })}
              </group>
            );
          })()}
        </group>
      )}

      {/* --- 6. Poltrona singola girevole Melania (79×71×98 cm) --- */}
      {item.modelType === 'melania_armchair' && (
        <group>
          <mesh position={[0, -h / 2 + 0.02, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[w * 0.34, w * 0.36, 0.03, 32]} />
            <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.24, 16]} />
            <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.3} />
          </mesh>
          <RoundedBox
            args={[w * 0.78, 0.16, d * 0.78]}
            radius={0.06}
            position={[0, -h / 2 + 0.36, 0.03]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.9} />
          </RoundedBox>
          <RoundedBox
            args={[0.12, 0.28, d * 0.72]}
            radius={0.05}
            position={[-w * 0.4, -h / 2 + 0.48, 0.02]}
            rotation={[0, 0, 0.12]}
            castShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.9} />
          </RoundedBox>
          <RoundedBox
            args={[0.12, 0.28, d * 0.72]}
            radius={0.05}
            position={[w * 0.4, -h / 2 + 0.48, 0.02]}
            rotation={[0, 0, -0.12]}
            castShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.9} />
          </RoundedBox>
          <RoundedBox
            args={[w * 0.86, h * 0.66, 0.15]}
            radius={0.06}
            position={[0, h * 0.12, -d * 0.32]}
            rotation={[-0.14, 0, 0]}
            castShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.9} />
          </RoundedBox>
        </group>
      )}

      {/* --- 7. Scrivania studio + cassettiera nera + monitor --- */}
      {item.modelType === 'desk_setup' && (
        <group>
          <RoundedBox
            args={[w, 0.035, d]}
            radius={0.008}
            position={[0, h / 2 - 0.018, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.55} />
          </RoundedBox>
          {/* Cassettiera 5 cassetti nera a sinistra con apertura fluida GSAP */}
          <group position={[-w / 2 + 0.19, -0.02, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.36, h - 0.04, d - 0.04]} />
              <meshStandardMaterial color={item.secondaryColor ?? '#18181b'} roughness={0.5} />
            </mesh>
            {[0, 1, 2, 3, 4].map((dIdx) => (
              <mesh
                key={dIdx}
                ref={(el) => {
                  deskDrawerRefs.current[dIdx] = el;
                }}
                position={[0, (h - 0.12) / 2 - dIdx * 0.13, (d - 0.04) / 2 + 0.008]}
                castShadow
              >
                <boxGeometry args={[0.34, 0.115, 0.02]} />
                <meshStandardMaterial color="#27272a" roughness={0.4} />
              </mesh>
            ))}
          </group>
          <mesh position={[w / 2 - 0.05, -0.02, -d / 2 + 0.06]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, h - 0.04, 16]} />
            <meshStandardMaterial color="#18181b" metalness={0.6} />
          </mesh>
          <mesh position={[w / 2 - 0.05, -0.02, d / 2 - 0.06]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, h - 0.04, 16]} />
            <meshStandardMaterial color="#18181b" metalness={0.6} />
          </mesh>
          <group position={[0.05, h / 2, -d * 0.22]}>
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[0.56, 0.08, 0.22]} />
              <meshStandardMaterial color="#18181b" />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.62, 0.36, 0.025]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.3, 0.014]}>
              <planeGeometry args={[0.59, 0.33]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-0.44, 0.08, 0.08]} rotation={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[0.32, 0.2, 0.015]} />
              <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.4} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- 8. Sedia da studio girevole --- */}
      {item.modelType === 'office_chair' && (
        <group>
          <mesh position={[0, -h / 2 + 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.04, 5]} />
            <meshStandardMaterial color="#18181b" metalness={0.5} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.36, 12]} />
            <meshStandardMaterial color="#18181b" metalness={0.7} />
          </mesh>
          <RoundedBox
            args={[0.5, 0.08, 0.48]}
            radius={0.03}
            position={[0, -h / 2 + 0.45, 0]}
            castShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.8} />
          </RoundedBox>
          <RoundedBox
            args={[0.48, 0.62, 0.07]}
            radius={0.03}
            position={[0, 0.16, -0.21]}
            castShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.8} />
          </RoundedBox>
        </group>
      )}

      {/* --- 9. Armadio a ponte verde/giallo + 2° letto (camera attuale) --- */}
      {item.modelType === 'current_green_bridge' && (
        <group>
          <group position={[-w / 2 + 0.45, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.9, h, d]} />
              <meshStandardMaterial
                color={item.color}
                roughness={0.5}
                transparent={xrayMode}
                opacity={doorOpacity}
              />
            </mesh>
            {/* 4 cassetti verdi/gialli animati con GSAP */}
            {[0, 1, 2, 3].map((idx) => (
              <mesh
                key={idx}
                ref={(el) => {
                  greenBridgeDrawerRefs.current[idx] = el;
                }}
                position={[0, -h / 2 + 0.12 + idx * 0.18, d / 2 + 0.01]}
                castShadow
              >
                <boxGeometry args={[0.88, 0.16, 0.02]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? '#b5d354' : '#e9c846'}
                  roughness={0.5}
                />
              </mesh>
            ))}
          </group>

          <group position={[-w / 2 + 1.125, 0, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.45, h - 0.9, d]} />
              <meshStandardMaterial
                color={item.color}
                roughness={0.5}
                transparent={xrayMode}
                opacity={doorOpacity}
              />
            </mesh>
            <mesh position={[0, -h / 2 + 0.36, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.45, 0.72, d]} />
              <meshStandardMaterial color="#e9c846" roughness={0.5} />
            </mesh>
          </group>

          <group position={[0.22, h / 2 - 0.52, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.05, 1.04, d]} />
              <meshStandardMaterial
                color={item.color}
                roughness={0.5}
                transparent={xrayMode}
                opacity={doorOpacity}
              />
            </mesh>
          </group>

          <group position={[0.22, -h / 2 + 0.28, 0.12]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.28, 0.88]} />
              <meshStandardMaterial color="#e9c846" roughness={0.6} />
            </mesh>
            <RoundedBox
              args={[1.96, 0.16, 0.84]}
              radius={0.03}
              position={[0, 0.2, 0]}
              castShadow
            >
              <meshStandardMaterial color="#2a9d8f" roughness={0.85} />
            </RoundedBox>
          </group>

          <mesh position={[w / 2 - 0.225, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, h, d]} />
            <meshStandardMaterial
              color={item.color}
              roughness={0.5}
              transparent={xrayMode}
              opacity={doorOpacity}
            />
          </mesh>
        </group>
      )}

      {/* --- 10. Letto singolo turchese (camera attuale) --- */}
      {item.modelType === 'current_single_bed' && (
        <group>
          <RoundedBox
            args={[w, h, 0.06]}
            radius={0.03}
            position={[0, 0, -d / 2 + 0.03]}
            castShadow
          >
            <meshStandardMaterial color={item.secondaryColor ?? '#b5d354'} roughness={0.6} />
          </RoundedBox>
          <RoundedBox
            args={[w, 0.32, d - 0.06]}
            radius={0.04}
            position={[0, -h / 2 + 0.28, 0.03]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={item.color} roughness={0.85} />
          </RoundedBox>
          <RoundedBox
            args={[w * 0.72, 0.12, 0.38]}
            radius={0.04}
            position={[0, -h / 2 + 0.46, -d / 2 + 0.28]}
            castShadow
          >
            <meshStandardMaterial color="#0d9488" roughness={0.8} />
          </RoundedBox>
        </group>
      )}

      {/* --- 11. Comodino bianco 2 cassetti + lampada --- */}
      {item.modelType === 'current_nightstand' && (
        <group>
          <RoundedBox args={[w, h, d]} radius={0.01} castShadow receiveShadow>
            <meshStandardMaterial color={item.color} roughness={0.5} />
          </RoundedBox>
          {/* Cassetto animato con GSAP */}
          <mesh ref={nightstandDrawerRef} position={[0, h * 0.18, 0]} castShadow>
            <boxGeometry args={[w - 0.04, h * 0.36, 0.26]} />
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </mesh>
          {/* Lampada da lettura bianca sopra */}
          <mesh position={[0, h / 2 + 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.08, 0.44, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* --- 12. Pensile verde a ribalta + collezione (camera attuale) --- */}
      {item.modelType === 'current_wall_cabinet' && (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={item.color} roughness={0.5} />
          </mesh>
          {[-0.45, -0.25, -0.05, 0.15, 0.35, 0.55].map((ox, idx) => (
            <mesh key={idx} position={[ox, h / 2 + 0.14, 0]} castShadow>
              <boxGeometry args={[0.16, 0.26, 0.12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {/* --- 13. Divano letto Parma / specchio / appendiabiti / custom --- */}
      {(item.modelType === 'parma_sofabed' ||
        item.modelType === 'current_mirror' ||
        item.modelType === 'current_coat_rack' ||
        item.modelType === 'custom_box') && (
        <group>
          <RoundedBox args={[w, h, d]} radius={0.02} castShadow receiveShadow>
            <meshStandardMaterial
              color={item.color}
              metalness={item.modelType === 'current_mirror' ? 0.9 : 0.1}
              roughness={item.modelType === 'current_mirror' ? 0.08 : 0.7}
              transparent={xrayMode && item.category === 'wardrobe'}
              opacity={xrayMode && item.category === 'wardrobe' ? 0.3 : 1}
            />
          </RoundedBox>
          {item.modelType === 'parma_sofabed' && isOpen && (
            <RoundedBox
              args={[w - 0.25, 0.28, 1.15]}
              radius={0.03}
              position={[0, -h / 2 + 0.22, d / 2 + 0.55]}
              castShadow
            >
              <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
            </RoundedBox>
          )}
        </group>
      )}

      {/* Contorno e badge monocromatico tecnico quando selezionato */}
      {isSelected && (
        <group>
          <mesh position={[0, -h / 2 + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(w, d) * 0.52, Math.max(w, d) * 0.56, 36]} />
            <meshBasicMaterial color="#f4f4f5" side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, h / 2 + 0.12, 0]} center zIndexRange={[10, 0]}>
            <div className="bg-zinc-950/95 text-zinc-100 border border-zinc-700 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none">
              {item.name} ({item.width}×{item.depth}×{item.height} cm)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};
