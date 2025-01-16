import { Phase } from '../../types/game';

interface StatusBarProps {
  phase: Phase;
  daysPassed: number;
  targetRatio: string;
  currentRatio: string;
  score: number;
  highScore: number;
}

export default function StatusBar({
  phase,
  daysPassed,
  targetRatio,
  currentRatio,
  score,
  highScore
}: StatusBarProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p>Phase: {phase}</p>
      <p>Days Passed: {daysPassed}</p>
      <p>Target Ratio: {targetRatio}</p>
      <p>Current Ratio: {currentRatio}</p>
      <p>Score: {score}</p>
      <p>High Score: {highScore}</p>
    </div>
  );
} 