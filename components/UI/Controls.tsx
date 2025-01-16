import { useEffect } from 'react';
import { Direction, EntityType, Phase } from '../../types/game';

interface ControlsProps {
  onMove: (entity: EntityType, direction: Direction) => void;
  onEndPhase: () => void;
  phase: Phase;
  hasUnmovedPrey: boolean;
  hasActivePrey: boolean;
  hasPendingMove: boolean;
  unmovedPreyCount: number;
  canEndPhase: boolean;
}

export default function Controls({
  onMove,
  onEndPhase,
  phase,
  hasUnmovedPrey,
  hasActivePrey,
  hasPendingMove,
  unmovedPreyCount,
  canEndPhase,
}: ControlsProps) {
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      const key = event.key;
      let direction: Direction | null = null;

      switch (key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'Enter':
          if (phase === 'day' && !hasActivePrey) {
            console.log('end day phase');
            onEndPhase();
          } else if (phase === 'night') {
            console.log('end night phase');
            onEndPhase();
          } else if (phase === 'day' && hasActivePrey) {
            console.log('has active prey');
          }
          break;
        default:
          return;
      }

      if (direction) {
        const entity: EntityType = phase === 'day' ? 'prey' : 'predator';
        onMove(entity, direction);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onMove, phase]);

  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <p>Use arrow keys to move {phase === 'day' ? 'prey' : 'predator'}</p>
      {phase === 'day' && (
        <>
          {hasActivePrey && (
            <p>Press Enter to {hasPendingMove ? 'confirm move' : 'end turn'}</p>
          )}
        </>
      )}
      {phase === 'night' && (
        <p>
          Press Enter to {hasPendingMove ? 'confirm move' : 'end night phase'}
        </p>
      )}
      {!hasPendingMove && (
        <button
          onClick={onEndPhase}
          disabled={!canEndPhase}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: canEndPhase ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canEndPhase ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.3s ease'
          }}
        >
          End {phase === 'day' ? 'Day' : 'Night'} Phase
        </button>
      )}
    </div>
  );
}
