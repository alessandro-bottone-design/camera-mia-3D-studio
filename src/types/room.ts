export type RoomMode = 'current' | 'new' | string;

export type ViewMode = '3d' | '2d' | 'split' | 'first-person';

export type FurnitureCategory =
  | 'wardrobe'
  | 'bed'
  | 'bookcase'
  | 'desk'
  | 'seating'
  | 'storage'
  | 'decor';

export type FurnitureModelType =
  | 'billy_corner'
  | 'kallax_2x4'
  | 'elena_wardrobe'
  | 'elena_bridge'
  | 'big_town_bed'
  | 'melania_armchair'
  | 'parma_sofabed'
  | 'desk_setup'
  | 'office_chair'
  | 'current_green_bridge'
  | 'current_single_bed'
  | 'current_nightstand'
  | 'current_wall_cabinet'
  | 'current_mirror'
  | 'current_coat_rack'
  | 'custom_box';

export type WardrobeAccessoryType =
  | 'shelf'
  | 'hanger_rod'
  | 'drawer_2c'
  | 'drawer_3c'
  | 'pullout_basket'
  | 'divider_2'
  | 'divider_3'
  | 'trouser_rack'
  | 'tie_rack'
  | 'pullout_shelf'
  | 'internal_mirror';

export interface WardrobeAccessoryCatalogItem {
  type: WardrobeAccessoryType;
  name: string;
  code: string;
  price: number;
  defaultHeightCm: number; // Spessore/altezza occupata dall'elemento in cm
  description: string;
  compatibleWidths: string;
}

export interface WardrobeAccessoryInstance {
  id: string;
  type: WardrobeAccessoryType;
  name: string;
  yCm: number; // Altezza della base dell'accessorio dal fondo dell'armadio (0 .. height-10)
  heightCm: number; // Altezza occupata dall'accessorio stesso
  price: number;
  bayIndex?: number; // 0 = vano unico / sinistro, 1 = vano destro (se armadio > 2 ante)
  hasClothes?: boolean; // Mostra sagome grucce/vestiti o scatole
  isOpen?: boolean; // Per cassettiere interne / cestelli estraibili
}

export interface KallaxCellConfig {
  index: number; // 0..7
  contentType: 'empty' | 'manga' | 'box_dark' | 'box_white' | 'two_drawers' | 'door' | 'funko';
  isOpen?: boolean;
}

export interface FurnitureItem {
  id: string;
  name: string;
  brand?: string;
  code?: string;
  productUrl?: string;
  price?: number;
  category: FurnitureCategory;
  modelType: FurnitureModelType;
  // Dimensioni esterne del mobile in cm (quando rotation = 0)
  width: number;  // Larghezza frontale (cm)
  depth: number;  // Profondità fronte-retro (cm)
  height: number; // Altezza verticale (cm)
  // Per mobili ad L come la libreria angolare Billy:
  secondaryWidth?: number; // Lunghezza secondo braccio ad angolo (es. 135 cm o 215 cm)
  // Posizione centro del mobile in cm (Origine 0,0 in Nord-Ovest)
  x: number;
  y: number; // Altezza da terra in cm (0 = a pavimento)
  z: number;
  rotation: number; // Gradi (0 = fronte verso Sud, 90 = verso Est, 180 = verso Nord, 270 = verso Ovest)
  // Colori e finitura
  color: string;
  secondaryColor?: string;
  // Apertura / chiusura
  canOpen: boolean;
  isOpen: boolean;
  openRatio: number; // 0..1
  doorCount?: number;
  // Scompartimenti interni (per armadi e librerie)
  accessories?: WardrobeAccessoryInstance[];
  shelfCount?: number;
  shelfHeightsCm?: number[]; // Altezze ripiani per librerie
  kallaxCells?: KallaxCellConfig[];
  notes?: string;
}

export interface RoomConfig {
  southWidth: number;      // Larghezza parete Sud in cm (default 468)
  northWidth: number;      // Larghezza parete Nord in cm (default 468 o 498 con scalino)
  depth: number;           // Profondità parete Est/Ovest in cm (default 424)
  ceilingHeight: number;   // Altezza soffitto in cm (default 285)
  hasWestStep: boolean;    // Rientranza sul muro Ovest dopo westUpperLength
  westUpperLength: number; // Lunghezza tratto Nord-Ovest prima dello scalino (default 215 cm)
  westStepOffset: number;  // Profondità scalino in cm (default 30 cm)
  // Porta d'ingresso su parete Nord
  doorOffsetWest: number;  // Distanza porta dall'angolo Nord-Ovest (default 242 cm)
  doorWidth: number;       // Larghezza porta (default 90 cm reale o 120 cm da pianta)
  doorHeight: number;      // Altezza porta (default 210 cm)
  doorIsOpen: boolean;
  doorOpenAngle: number;   // 0..90 gradi
  // Portafinestra su parete Ovest
  windowOffsetNorth: number; // Distanza inizio portafinestra da Nord (default 215 cm)
  windowWidth: number;       // Larghezza portafinestra (default 145 cm)
  windowHeight: number;      // Altezza portafinestra (default 225 cm)
  windowIsOpen: boolean;
  // Termosifone su parete Sud (angolo Sud-Ovest)
  radiatorOffsetWest: number; // Distanza termosifone da angolo Sud-Ovest (default 25 cm / o 93 cm)
  radiatorWidth: number;      // Larghezza termosifone (default 68 cm)
  radiatorDepth: number;      // Sporgenza termosifone (default 12 cm)
  radiatorHeight: number;     // Altezza termosifone (default 85 cm)
  // Climatizzatore Split su parete Ovest
  acOffsetNorth: number;      // Distanza centro split da Nord (default 105 cm)
  acHeightFromFloor: number;  // Altezza base split da terra (default 235 cm)
  // Colori pareti
  wallColorMain: string;      // Verde acqua chiaro (#bce3d8)
  wallColorNorth: string;     // Bianco caldo (#f5f5f2)
}

export interface MeasurementPoint {
  id: string;
  x: number; // cm
  y: number; // cm
  z: number; // cm
  label?: string;
}

export interface MeasurementLine {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  distanceCm: number;
  label?: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  items: FurnitureItem[];
}
