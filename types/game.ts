export type TerrainType = 'default' | 'grass' | 'water' | 'trees' | 'cave' | 'nest';
export type Phase = 'day' | 'night';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type EntityType = 'predator' | 'prey';

export interface Predator {
  hungryTurns: number;
}

export interface Prey {
  daysOnGrass: number;
  id: string;
  hasMoved?: boolean;
}

export interface CellHighlight {
  type: 'start' | 'potential';
  entityType: EntityType;
}

export interface Cell {
  terrain: TerrainType;
  predator: Predator | null;
  prey: Prey | null;
  highlight?: CellHighlight;
}

export interface GameState extends Database {
  activePrey: string | null;
} 