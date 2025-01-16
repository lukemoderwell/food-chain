import { Cell, Direction, EntityType, Phase } from '../types/game';

export function updateGameState(
  board: Cell[][],
  entityType: EntityType,
  direction: Direction,
  phase: Phase,
  activePreyId?: string | null
): Cell[][] | null {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let moved = false;

  if (entityType === 'predator') {
    // Handle predator movement (single step)
    for (let r = 0; r < newBoard.length; r++) {
      for (let c = 0; c < newBoard[r].length; c++) {
        const cell = newBoard[r][c];
        if (cell.predator) {
          const [newR, newC] = getNewPosition(r, c, direction, newBoard);
          if (newR !== null && newC !== null) {
            newBoard[r][c].predator = null;
            newBoard[newR][newC].predator = { ...cell.predator };
            moved = true;
          }
          break;
        }
      }
      if (moved) break;
    }
  } else {
    // Handle prey movement (single orthogonal step)
    for (let r = 0; r < newBoard.length; r++) {
      for (let c = 0; c < newBoard[r].length; c++) {
        const cell = newBoard[r][c];
        if (cell.prey && cell.prey.id === activePreyId) {
          const [newR, newC] = getNewPosition(r, c, direction, newBoard);
          if (newR !== null && newC !== null) {
            newBoard[r][c].prey = null;
            newBoard[newR][newC].prey = { ...cell.prey };
            moved = true;
          }
          break;
        }
      }
      if (moved) break;
    }
  }

  return moved ? newBoard : null;
}

// Single step movement for both predators and prey
function getNewPosition(
  r: number,
  c: number,
  direction: Direction,
  board: Cell[][]
): [number | null, number | null] {
  let newR = r;
  let newC = c;

  switch (direction) {
    case 'up':
      newR = r - 1;
      break;
    case 'down':
      newR = r + 1;
      break;
    case 'left':
      newC = c - 1;
      break;
    case 'right':
      newC = c + 1;
      break;
    default:
      return [null, null];
  }

  // Check if new position is valid
  if (
    newR < 0 || 
    newR >= board.length || 
    newC < 0 || 
    newC >= board[0].length
  ) {
    return [null, null];
  }

  const destinationCell = board[newR][newC];
  if (destinationCell.terrain === 'water') {
    return [null, null];
  }

  return [newR, newC];
}

// Add this helper function to check if a position is valid
function isValidPosition(r: number, c: number, board: Cell[][]): boolean {
  return (
    r >= 0 && 
    r < board.length && 
    c >= 0 && 
    c < board[0].length && 
    board[r][c].terrain !== 'water'
  );
}

// Add this function to get all valid moves in a direction
function getValidMovesInDirection(
  startR: number, 
  startC: number, 
  dr: number, 
  dc: number, 
  board: Cell[][],
  isQueen: boolean
): [number, number][] {
  const validMoves: [number, number][] = [];
  let r = startR + dr;
  let c = startC + dc;

  // For prey, only check one step
  if (!isQueen) {
    if (isValidPosition(r, c, board)) {
      validMoves.push([r, c]);
    }
    return validMoves;
  }

  // For predator (queen-like movement), keep going until blocked
  while (isValidPosition(r, c, board)) {
    validMoves.push([r, c]);
    r += dr;
    c += dc;
  }

  return validMoves;
}

// Update showPotentialMoves function in pages/game.tsx
function showPotentialMoves(entityType: EntityType, startRow: number, startCol: number) {
  setBoard(current => {
    const newBoard = current.map(row => row.map(cell => ({
      ...cell,
      highlight: undefined
    })));

    // Mark starting position
    newBoard[startRow][startCol].highlight = {
      type: 'start',
      entityType
    };

    const isQueen = entityType === 'predator';
    const directions: [number, number][] = isQueen
      ? [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ]
      : [
          [-1, 0],
          [0, -1], [0, 1],
          [1, 0]
        ];

    // Get all valid moves
    directions.forEach(([dr, dc]) => {
      const validMoves = getValidMovesInDirection(
        startRow,
        startCol,
        dr,
        dc,
        newBoard,
        isQueen
      );

      // Highlight valid moves
      validMoves.forEach(([r, c]) => {
        newBoard[r][c].highlight = {
          type: 'potential',
          entityType
        };
      });
    });

    return newBoard;
  });
} 