import { Predator as PredatorType } from '../types/game';

interface PredatorProps {
  predatorData: PredatorType;
}

export default function Predator({ predatorData }: PredatorProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '5px',
      left: '5px',
      right: '5px',
      bottom: '5px',
      borderRadius: '50%',
      border: '2px solid rgba(100, 0, 0, 0.8)',
      backgroundColor: 'rgba(255, 0, 0, 0.3)',
      transition: 'all 0.2s ease-in-out',
      zIndex: 1
    }} />
  );
} 