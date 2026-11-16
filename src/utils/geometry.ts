import { FurnitureItem, RoomConfig } from '../types/room';

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  widthX: number;
  depthZ: number;
  centerX: number;
  centerZ: number;
}

export interface WallDistances {
  north: number; // Distanza dal muro Nord (Z = 0)
  south: number; // Distanza dal muro Sud (Z = room.depth)
  west: number;  // Distanza dal muro Ovest (X = 0)
  east: number;  // Distanza dal muro Est (X = room.southWidth)
}

export interface ClearanceWarning {
  id: string;
  itemId: string;
  itemName: string;
  severity: 'error' | 'warning';
  message: string;
}

/**
 * Calcola il bounding box 2D (sul piano pavimento X-Z) di un mobile tenendo conto della rotazione
 */
export function getItemBoundingBox(item: FurnitureItem): BoundingBox2D {
  // Per la libreria angolare Billy, l'ingombro principale sul muro Nord è width (es. 215 o 135)
  // e sul muro Ovest è secondaryWidth (es. 215 o 135)
  if (item.modelType === 'billy_corner') {
    const armX = item.width; // Lungo parete Nord
    const armZ = item.secondaryWidth ?? 215; // Lungo parete Ovest
    // Consideriamo x, z come l'angolo esterno Nord-Ovest + metà ingombro
    const minX = item.x - armX / 2;
    const maxX = item.x + armX / 2;
    const minZ = item.z - armZ / 2;
    const maxZ = item.z + armZ / 2;
    return {
      minX,
      maxX,
      minZ,
      maxZ,
      widthX: armX,
      depthZ: armZ,
      centerX: item.x,
      centerZ: item.z,
    };
  }

  const rad = ((item.rotation % 360) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const effectiveWidthX = item.width * cos + item.depth * sin;
  const effectiveDepthZ = item.width * sin + item.depth * cos;

  const minX = item.x - effectiveWidthX / 2;
  const maxX = item.x + effectiveWidthX / 2;
  const minZ = item.z - effectiveDepthZ / 2;
  const maxZ = item.z + effectiveDepthZ / 2;

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    widthX: effectiveWidthX,
    depthZ: effectiveDepthZ,
    centerX: item.x,
    centerZ: item.z,
  };
}

/**
 * Calcola l'ingombro extra quando il mobile è APERTO (ante battenti, cassetti, divano letto)
 */
export function getOpenClearanceBox(item: FurnitureItem): BoundingBox2D {
  const base = getItemBoundingBox(item);
  if (!item.canOpen) return base;

  let extraFrontCm = 0;
  if (item.modelType === 'elena_wardrobe' || item.modelType === 'elena_bridge' || item.modelType === 'current_green_bridge') {
    // Anta battente da ~45-47 cm
    extraFrontCm = 46;
  } else if (item.modelType === 'parma_sofabed') {
    extraFrontCm = 115; // Apertura letto
  } else if (item.modelType === 'desk_setup' || item.modelType === 'current_nightstand') {
    extraFrontCm = 38; // Apertura cassetti
  } else if (item.modelType === 'kallax_2x4') {
    extraFrontCm = 30;
  } else if (item.modelType === 'big_town_bed') {
    extraFrontCm = 15; // Sollevamento rete contenitore
  }

  if (extraFrontCm === 0) return base;

  const rot = ((item.rotation % 360) + 360) % 360;
  let { minX, maxX, minZ, maxZ } = base;

  if (rot >= 315 || rot < 45) {
    // Fronte verso Sud (+Z)
    maxZ += extraFrontCm;
  } else if (rot >= 45 && rot < 135) {
    // Fronte verso Est (+X)
    maxX += extraFrontCm;
  } else if (rot >= 135 && rot < 225) {
    // Fronte verso Nord (-Z)
    minZ -= extraFrontCm;
  } else {
    // Fronte verso Ovest (-X)
    minX -= extraFrontCm;
  }

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    widthX: maxX - minX,
    depthZ: maxZ - minZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
  };
}

/**
 * Calcola le 4 distanze dai muri in cm per un mobile
 */
export function getWallDistances(item: FurnitureItem, room: RoomConfig): WallDistances {
  const box = getItemBoundingBox(item);
  return {
    north: Math.round(box.minZ),
    south: Math.round(room.depth - box.maxZ),
    west: Math.round(box.minX),
    east: Math.round(room.southWidth - box.maxX),
  };
}

/**
 * Imposta la posizione di un mobile a partire dalla distanza desiderata da un muro specifico
 */
export function setItemWallDistance(
  item: FurnitureItem,
  room: RoomConfig,
  wall: keyof WallDistances,
  distanceCm: number
): { x: number; z: number } {
  const box = getItemBoundingBox(item);
  let x = item.x;
  let z = item.z;

  if (wall === 'west') {
    x = distanceCm + box.widthX / 2;
  } else if (wall === 'east') {
    x = room.southWidth - distanceCm - box.widthX / 2;
  } else if (wall === 'north') {
    z = distanceCm + box.depthZ / 2;
  } else if (wall === 'south') {
    z = room.depth - distanceCm - box.depthZ / 2;
  }

  return { x: Math.round(x), z: Math.round(z) };
}

/**
 * Verifica se due bounding box 2D si sovrappongono (con tolleranza di 2 cm)
 */
export function boxesOverlap(a: BoundingBox2D, b: BoundingBox2D, tolerance = 2): boolean {
  return (
    a.minX + tolerance < b.maxX &&
    a.maxX - tolerance > b.minX &&
    a.minZ + tolerance < b.maxZ &&
    a.maxZ - tolerance > b.minZ
  );
}

/**
 * Calcola tutti gli avvisi di collisione, uscita dai muri o ingombro apertura ante
 */
export function analyzeRoomClearances(items: FurnitureItem[], room: RoomConfig): ClearanceWarning[] {
  const warnings: ClearanceWarning[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Ignora pensili sospesi alti o decorazioni a muro per le collisioni a pavimento
    if (item.y > 140) continue;

    const box = getItemBoundingBox(item);
    const dists = getWallDistances(item, room);

    // 1. Fuoriuscita dal perimetro stanza
    if (dists.west < -1 || dists.east < -1 || dists.north < -1 || dists.south < -1) {
      warnings.push({
        id: `out-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        severity: 'error',
        message: `${item.name} sporge oltre il perimetro dei muri!`,
      });
    }

    // 2. Superamento altezza soffitto
    if (item.y + item.height > room.ceilingHeight) {
      warnings.push({
        id: `ceil-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        severity: 'error',
        message: `${item.name} (${item.y + item.height} cm) supera l'altezza del soffitto (${room.ceilingHeight} cm).`,
      });
    }

    // 3. Collisione con altri mobili a terra
    for (let j = i + 1; j < items.length; j++) {
      const other = items[j];
      if (other.y > 140) continue;

      // Per la libreria angolare Billy e la scrivania davanti: la Billy è ad L (spessore 28 cm sui due lati),
      // quindi la scrivania dentro la L non collide se dista > 28 cm dai muri Nord e Ovest!
      if (
        (item.modelType === 'billy_corner' && other.modelType === 'desk_setup') ||
        (other.modelType === 'billy_corner' && item.modelType === 'desk_setup') ||
        (item.modelType === 'billy_corner' && other.modelType === 'office_chair') ||
        (other.modelType === 'billy_corner' && item.modelType === 'office_chair') ||
        (item.modelType === 'desk_setup' && other.modelType === 'office_chair') ||
        (other.modelType === 'desk_setup' && item.modelType === 'office_chair')
      ) {
        const deskOrChair = item.modelType === 'billy_corner' ? other : item;
        const deskBox = getItemBoundingBox(deskOrChair);
        if (
          (item.modelType === 'billy_corner' || other.modelType === 'billy_corner') &&
          (deskBox.minX < 28 || deskBox.minZ < 28)
        ) {
          warnings.push({
            id: `billy-hit-${deskOrChair.id}`,
            itemId: deskOrChair.id,
            itemName: deskOrChair.name,
            severity: 'warning',
            message: `${deskOrChair.name} si sovrappone ai ripiani profondi 28 cm della Libreria Billy.`,
          });
        }
        continue;
      }

      const otherBox = getItemBoundingBox(other);
      // Controllo sovrapposizione verticale Y
      const verticalOverlap =
        item.y < other.y + other.height - 2 && item.y + item.height > other.y + 2;

      if (verticalOverlap && boxesOverlap(box, otherBox, 2)) {
        warnings.push({
          id: `overlap-${item.id}-${other.id}`,
          itemId: item.id,
          itemName: item.name,
          severity: 'error',
          message: `Collisione: "${item.name}" si sovrappone a "${other.name}".`,
        });
      } else if (verticalOverlap && (item.isOpen || other.isOpen)) {
        const openA = item.isOpen ? getOpenClearanceBox(item) : box;
        const openB = other.isOpen ? getOpenClearanceBox(other) : otherBox;
        if (boxesOverlap(openA, openB, 1)) {
          warnings.push({
            id: `open-hit-${item.id}-${other.id}`,
            itemId: item.id,
            itemName: item.name,
            severity: 'warning',
            message: `Attenzione apertura: quando aperto, "${item.name}" o "${other.name}" tocca il mobile vicino.`,
          });
        }
      }
    }
  }

  return warnings;
}
