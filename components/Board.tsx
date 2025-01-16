import Terrain from './Terrain';
import Predator from './Predator';
import Prey from './Prey';
import { Cell } from '../types/game';

interface BoardProps {
  board: Cell[][];
  activePrey: string | null;
  onCellClick?: (row: number, col: number) => void;
  phase: Phase;
}

export default function Board({ board, activePrey, onCellClick, phase }: BoardProps) {
  // Return early if board is not initialized
  if (!board || board.length === 0 || !board[0]) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '300px',
        height: '300px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        Loading...
      </div>
    );
  }

  const getColumnLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
  };

  const numCols = board[0].length;
  const numRows = board.length;

  const handleCellClick = (row: number, col: number) => {
    if (onCellClick) {
      onCellClick(row, col);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '10px',
      backgroundColor: phase === 'night' ? '#2f3542' : '#f0f0f0',
      borderRadius: '8px',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Column labels (A, B, C, etc.) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `30px repeat(${numCols}, 50px)`,
        gap: '4px',
        marginBottom: '4px'
      }}>
        <div /> {/* Empty cell for top-left corner */}
        {Array.from({ length: numCols }, (_, colIndex) => (
          <div
            key={`col-${colIndex}`}
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: phase === 'night' ? '#a4b0be' : '#666'
            }}
          >
            {getColumnLabel(colIndex)}
          </div>
        ))}
      </div>

      {/* Main grid with row numbers */}
      <div style={{
        display: 'flex',
        gap: '4px'
      }}>
        {/* Row numbers (1, 2, 3, etc.) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          width: '30px'
        }}>
          {Array.from({ length: numRows }, (_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              style={{
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: phase === 'night' ? '#a4b0be' : '#666'
              }}
            >
              {rowIndex + 1}
            </div>
          ))}
        </div>

        {/* Game grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 50px)`,
          gap: '4px'
        }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              return (
                <div 
                  key={key} 
                  style={{ 
                    position: 'relative', 
                    width: '50px', 
                    height: '50px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: cell.highlight?.type === 'potential' ? 'pointer' : 'default'
                  }}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onCellClick(rowIndex, colIndex);
                  }}
                >
                  <Terrain 
                    type={cell.terrain} 
                    highlight={cell.highlight}
                  />
                  {cell.predator && <Predator predatorData={cell.predator} />}
                  {cell.prey && (
                    <Prey 
                      preyData={cell.prey}
                      isActive={cell.prey.id === activePrey}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 