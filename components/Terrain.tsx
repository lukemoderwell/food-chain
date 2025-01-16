import { TerrainType, CellHighlight } from '../types/game';

interface TerrainProps {
  type: TerrainType;
  highlight?: CellHighlight;
}

export default function Terrain({ type, highlight }: TerrainProps) {
  const getStyle = (terrainType: TerrainType): React.CSSProperties => {
    const baseStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    } as const;

    let backgroundColor = 'rgb(245, 245, 220)'; // default

    switch (terrainType) {
      case 'grass':
        backgroundColor = 'rgb(144, 238, 144)';
        break;
      case 'water':
        backgroundColor = 'rgb(173, 216, 230)';
        break;
      case 'cave':
        backgroundColor = 'rgb(169, 169, 169)';
        break;
      case 'nest':
        backgroundColor = 'rgb(211, 211, 211)';
        break;
    }

    // Add highlight overlay
    if (highlight) {
      const isStart = highlight.type === 'start';
      const isPrey = highlight.entityType === 'prey';
      
      const overlayColor = isPrey
        ? isStart 
          ? 'rgba(0, 100, 0, 0.4)'  // dark green for prey start
          : 'rgba(0, 255, 0, 0.15)'  // very light green for prey potential
        : isStart
          ? 'rgba(100, 0, 0, 0.4)'  // dark red for predator start
          : 'rgba(255, 0, 0, 0.15)';  // very light red for predator potential

      return {
        ...baseStyle,
        backgroundColor,
        boxShadow: `inset 0 0 0 1000px ${overlayColor}`,
      };
    }

    return {
      ...baseStyle,
      backgroundColor,
    };
  };

  return (
    <div style={getStyle(type)} />
  );
} 