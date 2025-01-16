import { Cell } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

export function generateBoard(rows: number, cols: number): Cell[][] {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      terrain: 'default',
      predator: null,
      prey: null,
    }))
  );

  board[0][0].terrain = 'cave';
  board[0][0].predator = { hungryTurns: 0 };

  const nestRow = rows - 1;
  const nestCol = cols - 1;
  board[nestRow][nestCol].terrain = 'nest';
  
  board[nestRow][nestCol].prey = { 
    daysOnGrass: 0,
    id: uuidv4(),
    hasMoved: false
  };

  const isAdjacentToImportantCell = (r: number, c: number): boolean => {
    if (r <= 1 && c <= 1) return true;
    
    if (r >= rows - 2 && c >= cols - 2) return true;
    
    return false;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 && c === 0) || (r === nestRow && c === nestCol)) {
        continue;
      }

      if (isAdjacentToImportantCell(r, c)) {
        continue;
      }

      const terrainRoll = Math.random();
      if (terrainRoll < 0.2) {
        board[r][c].terrain = 'water';
      } else if (terrainRoll < 0.4) {
        board[r][c].terrain = 'grass';
      }
    }
  }

  return board;
} 