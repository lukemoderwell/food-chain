import { Prey as PreyType } from '../types/game';

interface PreyProps {
  preyData: PreyType;
  isActive: boolean;
}

export default function Prey({ preyData, isActive }: PreyProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '5px',
      left: '5px',
      right: '5px',
      bottom: '5px',
      borderRadius: '50%',
      border: '2px solid rgba(0, 100, 0, 0.8)',
      backgroundColor: 'rgba(0, 255, 0, 0.3)',
      opacity: preyData.hasMoved ? 0.5 : 1,
      outline: isActive ? '2px solid yellow' : 'none',
      boxShadow: isActive ? '0 0 10px yellow' : 'none',
      transition: 'all 0.2s ease-in-out',
      zIndex: 2
    }} />
  );
} 