import { useState, useEffect, useCallback } from 'react';
import Board from '../components/Board';
import StatusBar from '../components/UI/StatusBar';
import Controls from '../components/UI/Controls';
import { generateBoard } from '../utils/generateBoard';
import { updateGameState } from '../utils/gameLogic';
import { Cell, Phase, Direction, EntityType } from '../types/game';

export default function Game() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [phase, setPhase] = useState<Phase>('day');
  const [daysPassed, setDaysPassed] = useState(0);
  const [activePrey, setActivePrey] = useState<string | null>(null);
  const [hasPredatorMoved, setHasPredatorMoved] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    entity: EntityType;
    direction: Direction;
  } | null>(null);

  useEffect(() => {
    const initialBoard = generateBoard(5, 5);
    setBoard(initialBoard);
    logGameState('Initial board state', initialBoard);

    // Find and select the prey if there's only one
    let preyCount = 0;
    let preyRow = 0;
    let preyCol = 0;
    let preyId = '';

    initialBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.prey) {
          preyCount++;
          preyRow = r;
          preyCol = c;
          preyId = cell.prey.id;
        }
      });
    });

    if (preyCount === 1) {
      setActivePrey(preyId);
      showPotentialMoves('prey', preyRow, preyCol);
    }
  }, []);

  const findUnmovedPrey = useCallback(() => {
    const preyList: { id: string; row: number; col: number }[] = [];
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.prey?.id && !cell.prey.hasMoved) {
        //   console.log(`Found unmoved prey at ${r},${c}:`, cell.prey);
          preyList.push({ id: cell.prey.id, row: r, col: c });
        }
      });
    });
    return preyList;
  }, [board]);

  function handleEndPhase(): void {
    if (phase === 'day') {
      // Check if all prey have moved before allowing day phase to end
      const unmovedPrey = findUnmovedPrey();
      if (unmovedPrey.length > 0) {
        console.log('Cannot end day phase: some prey have not moved.');
        return;
      }

      // All prey have moved - transition to night phase
      setPhase('night');
      setHasPredatorMoved(false);  // Reset predator movement flag
      
      // Clear highlights and show predator's moves
      setBoard(current => {
        const newBoard = current.map(row =>
          row.map(cell => ({
            ...cell,
            highlight: undefined
          }))
        );

        // Find predator and show its moves
        const predatorPos = findEntityPosition('predator');
        if (predatorPos) {
          const [predatorRow, predatorCol] = predatorPos;
          showPotentialMoves('predator', predatorRow, predatorCol);
        }

        return newBoard;
      });
    } else {
      // Night phase - check if predator has moved
      if (!hasPredatorMoved) {
        console.log('Cannot end night phase: predator has not moved.');
        return;
      }

      // Predator has moved - handle reproduction and transition to day
      setPhase('day');
      setDaysPassed(prev => prev + 1);

      setBoard(currentBoard => {
        // Step 1: Handle reproduction if any prey are on grass
        const afterReproduction = handlePreyReproduction(currentBoard);

        // Step 2: Reset all prey movement flags and clear highlights
        const newBoard = afterReproduction.map(row =>
          row.map(cell => ({
            ...cell,
            highlight: undefined,
            prey: cell.prey
              ? {
                  ...cell.prey,
                  hasMoved: false  // Reset movement flag for new day
                }
              : null
          }))
        );

        // Step 3: Select the first prey and show its moves
        const unmovedPrey = getUnmovedPreyFromBoard(newBoard);
        if (unmovedPrey.length > 0) {
          const firstPrey = unmovedPrey[0];
          setActivePrey(firstPrey.id);
          showPotentialMoves('prey', firstPrey.row, firstPrey.col);
        }

        return newBoard;
      });
    }
  }

  function handleMove(entity: EntityType, direction: Direction): void {
    if (entity === 'prey' && phase === 'night') return;
    if (entity === 'predator' && phase === 'day') return;
    if (entity === 'prey' && !activePrey) return;

    // Store the pending move instead of executing it immediately
    setPendingMove({ entity, direction });
  }

  function confirmMove(): void {
    if (!pendingMove) return;
    const { entity, direction } = pendingMove;

    const updatedBoard = updateGameState(board, entity, direction, phase, activePrey);
    if (!updatedBoard) return;

    logGameState(`After ${entity} move`, updatedBoard);

    if (entity === 'prey') {
      // Update board and mark prey as moved
      setBoard(updatedBoard.map(row =>
        row.map(cell => ({
          ...cell,
          highlight: undefined,
          prey: cell.prey?.id === activePrey
            ? { ...cell.prey, hasMoved: true }
            : cell.prey
        }))
      ));

      // Find next unmoved prey
      const unmovedPrey = getUnmovedPreyFromBoard(updatedBoard);
      if (unmovedPrey.length > 0) {
        // Select next prey
        const nextPrey = unmovedPrey[0];
        setActivePrey(nextPrey.id);
        showPotentialMoves('prey', nextPrey.row, nextPrey.col);
        console.log(`Selected next prey: ${nextPrey.id}, ${unmovedPrey.length} prey remaining`);
      } else {
        // All prey have moved - transition to night phase
        setActivePrey(null);
        console.log('All prey have moved, transitioning to night phase');
        handleEndPhase();
      }
    } else {
      // Predator move
      setBoard(updatedBoard);
      setHasPredatorMoved(true);
    }

    setPendingMove(null);
  }

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Enter') {
        event.preventDefault();
        if (pendingMove) {
          // Confirm the pending move
          confirmMove();
        } else {
          // Attempt to end the phase
          handleEndPhase();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, findUnmovedPrey, pendingMove, activePrey, hasPredatorMoved]);

  const handlePredatorHunting = (currentBoard: Cell[][]): Cell[][] => {
    const newBoard = currentBoard.map((row) =>
      row.map((cell) => ({ ...cell }))
    );

    for (let r = 0; r < newBoard.length; r++) {
      for (let c = 0; c < newBoard[r].length; c++) {
        const cell = newBoard[r][c];
        if (cell.predator && cell.prey) {
          cell.prey = null;
          cell.predator.hungryTurns = 0;
        }
      }
    }

    return newBoard;
  };

  const calculateRatio = (): string => {
    let preyCount = 0;
    let predatorCount = 0;

    for (const row of board) {
      for (const cell of row) {
        if (cell.prey) preyCount++;
        if (cell.predator) predatorCount++;
      }
    }

    if (predatorCount === 0) return 'No predators';
    return `${preyCount}:${predatorCount}`;
  };

  // Add this function to show potential moves
  function showPotentialMoves(
    entityType: EntityType,
    startRow: number,
    startCol: number
  ) {
    setBoard((current) => {
      const newBoard = current.map((row) =>
        row.map((cell) => ({
          ...cell,
          highlight: undefined,
        }))
      );

      // Mark starting position
      newBoard[startRow][startCol].highlight = {
        type: 'start',
        entityType,
      };

      // For prey, show orthogonal adjacent cells
      if (entityType === 'prey') {
        // Define the four orthogonal directions (rook-like movement)
        const directions = [
          [-1, 0], // Up
          [1, 0], // Down
          [0, -1], // Left
          [0, 1], // Right
        ];

        // For each direction, keep going until hitting a wall or water
        directions.forEach(([dr, dc]) => {
          let r = startRow + dr;
          let c = startCol + dc;

          while (
            r >= 0 &&
            r < newBoard.length &&
            c >= 0 &&
            c < newBoard[0].length &&
            newBoard[r][c].terrain !== 'water'
          ) {
            // Check if path to this cell is clear
            let isPathClear = true;
            let checkR = startRow;
            let checkC = startCol;

            // Check each cell along the path
            while (checkR !== r || checkC !== c) {
              checkR += dr;
              checkC += dc;
              if (newBoard[checkR][checkC].terrain === 'water') {
                isPathClear = false;
                break;
              }
            }

            if (isPathClear) {
              newBoard[r][c].highlight = {
                type: 'potential',
                entityType,
              };
            }

            r += dr;
            c += dc;
          }
        });
      }
      // For predator, show all cells reachable in straight lines
      else {
        // Define all 8 directions a predator can move
        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1], // Up-left, Up, Up-right
          [0, -1],
          [0, 1], // Left, Right
          [1, -1],
          [1, 0],
          [1, 1], // Down-left, Down, Down-right
        ];

        // For each direction, keep going until hitting a wall or water
        directions.forEach(([dr, dc]) => {
          let r = startRow + dr;
          let c = startCol + dc;

          while (
            r >= 0 &&
            r < newBoard.length &&
            c >= 0 &&
            c < newBoard[0].length &&
            newBoard[r][c].terrain !== 'water' &&
            newBoard[r][c].terrain !== 'nest' // Prevent predator from entering nest
          ) {
            // Check if path to this cell is clear
            let isPathClear = true;
            let checkR = startRow;
            let checkC = startCol;

            // Check each cell along the path
            while (checkR !== r || checkC !== c) {
              checkR += dr;
              checkC += dc;
              if (
                newBoard[checkR][checkC].terrain === 'water' ||
                newBoard[checkR][checkC].terrain === 'nest'
              ) {
                isPathClear = false;
                break;
              }
            }

            if (isPathClear) {
              newBoard[r][c].highlight = {
                type: 'potential',
                entityType,
              };
            }

            r += dr;
            c += dc;
          }
        });
      }

      return newBoard;
    });
  }

  // Add this function to handle cell clicks
  function handleCellClick(row: number, col: number) {
    // Only handle clicks on highlighted cells
    if (board[row][col].highlight?.type !== 'potential') return;

    const entity: EntityType = phase === 'day' ? 'prey' : 'predator';
    const currentPos = findEntityPosition(entity);
    if (!currentPos) return;

    const [currentRow, currentCol] = currentPos;

    // Additional check for predator trying to enter nest
    if (entity === 'predator' && board[row][col].terrain === 'nest') {
      return;
    }

    // Create a new board state with the entity moved to the clicked position
    const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));

    if (entity === 'prey') {
      // Move prey to new position
      const movedPrey = {
        ...newBoard[currentRow][currentCol].prey!,
        hasMoved: true,
      };
      newBoard[currentRow][currentCol].prey = null;
      newBoard[row][col].prey = movedPrey;
      
      // Clear highlights
      newBoard.forEach((r) => r.forEach((cell) => (cell.highlight = undefined)));
      
      // Find next unmoved prey
      const unmovedPrey = getUnmovedPreyFromBoard(newBoard);
      if (unmovedPrey.length > 0) {
        // Select next prey and show its moves
        const nextPrey = unmovedPrey[0];
        setActivePrey(nextPrey.id);
        
        // Update board with the new prey's potential moves
        newBoard[nextPrey.row][nextPrey.col].highlight = {
          type: 'start',
          entityType: 'prey'
        };
        
        // Show potential moves for the next prey
        showPotentialMoves('prey', nextPrey.row, nextPrey.col);
        console.log(`Selected next prey: ${nextPrey.id}, ${unmovedPrey.length} prey remaining`);
      } else {
        // All prey have moved
        setActivePrey(null);
        console.log('All prey have moved, transitioning to night phase');
        handleEndPhase();
      }
    } else {
      // Move predator to new position
      const movedPredator = { ...newBoard[currentRow][currentCol].predator! };
      newBoard[currentRow][currentCol].predator = null;
      newBoard[row][col].predator = movedPredator;
      // Clear highlights for predator move
      newBoard.forEach((r) => r.forEach((cell) => (cell.highlight = undefined)));
      setHasPredatorMoved(true);
    }

    setBoard(newBoard);
  }

  // Add helper function to find current entity position
  function findEntityPosition(entity: EntityType): [number, number] | null {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (entity === 'prey' && board[r][c].prey?.id === activePrey) {
          return [r, c];
        }
        if (entity === 'predator' && board[r][c].predator) {
          return [r, c];
        }
      }
    }
    return null;
  }

  // Add this helper function to get unmoved prey from a given board
  function getUnmovedPreyFromBoard(
    someBoard: Cell[][]
  ): { id: string; row: number; col: number }[] {
    const preyList: { id: string; row: number; col: number }[] = [];
    someBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.prey?.id && !cell.prey.hasMoved) {
          preyList.push({ id: cell.prey.id, row: r, col: c });
        }
      });
    });
    return preyList;
  }

  // Optimize the render method to avoid multiple findUnmovedPrey() calls
  const unmovedPreyCount = findUnmovedPrey().length;
  const hasUnmovedPrey = unmovedPreyCount > 0;

  // Add function to check if phase can be ended
  const canEndPhase = (): boolean => {
    if (phase === 'day') {
      return findUnmovedPrey().length === 0;
    } else {
      return hasPredatorMoved;
    }
  };

  // Add helper function to log game state
  function logGameState(message: string, currentBoard: Cell[][]) {
    console.group(`Game State: ${message}`);
    
    // Log all prey
    console.group('Prey:');
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.prey) {
          console.log(`Prey at (${r},${c}):`, {
            id: cell.prey.id,
            hasMoved: cell.prey.hasMoved,
            daysOnGrass: cell.prey.daysOnGrass,
            terrain: cell.terrain
          });
        }
      });
    });
    console.groupEnd();
    
    // Log predator
    console.group('Predator:');
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.predator) {
          console.log(`Predator at (${r},${c}):`, {
            hungryTurns: cell.predator.hungryTurns,
            terrain: cell.terrain
          });
        }
      });
    });
    console.groupEnd();
    
    console.groupEnd();
  }

  // Add logging to key functions
  function handlePreyReproduction(currentBoard: Cell[][]): Cell[][] {
    const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell })));
    
    // Count prey on grass cells
    let preyOnGrassCount = 0;
    for (const row of newBoard) {
      for (const cell of row) {
        if (cell.prey && cell.terrain === 'grass') {
          preyOnGrassCount++;
        }
      }
    }

    // If there are prey on grass, attempt reproduction
    if (preyOnGrassCount > 0) {
      // Find the nest
      for (let r = 0; r < newBoard.length; r++) {
        for (let c = 0; c < newBoard[r].length; c++) {
          if (newBoard[r][c].terrain === 'nest' && !newBoard[r][c].prey) {
            // Spawn new prey at empty nest
            const newPreyId = crypto.randomUUID();
            newBoard[r][c].prey = {
              id: newPreyId,
              hasMoved: false,
              daysOnGrass: 0
            };
            console.log(`New prey spawned at nest:`, {
              id: newPreyId,
              position: [r, c],
              preyOnGrass: preyOnGrassCount
            });
            logGameState('After reproduction', newBoard);
            break;
          }
        }
      }
    }

    return newBoard;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: phase === 'night' ? '#1e272e' : '#fff',
        transition: 'background-color 0.3s ease',
      }}
    >
      <h1 style={{ color: phase === 'night' ? '#fff' : '#000' }}>Food Chain</h1>
      <StatusBar
        phase={phase}
        daysPassed={daysPassed}
        targetRatio="5:1"
        currentRatio={calculateRatio()}
        score={0}
        highScore={0}
      />
      <Board
        board={board}
        activePrey={activePrey}
        onCellClick={handleCellClick}
        phase={phase}
      />
      <Controls
        onMove={handleMove}
        onEndPhase={handleEndPhase}
        phase={phase}
        hasUnmovedPrey={hasUnmovedPrey}
        hasActivePrey={activePrey !== null}
        hasPendingMove={pendingMove !== null}
        unmovedPreyCount={unmovedPreyCount}
        canEndPhase={canEndPhase()}
      />
    </div>
  );
}
