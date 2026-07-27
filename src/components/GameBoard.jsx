import React from 'react';
import { motion } from 'framer-motion';
import { Star, CornerUpLeft, CornerUpRight } from 'lucide-react';
import Player from './Player';

export default function GameBoard({ level, playerState }) {
  const tileSize = 100; // Size of each grid block in pixels
  const { position, playerRotation, cameraRotation } = playerState;

  // Check if a cell is a path
  const isPath = (x, y) => level.path.some(p => p.x === x && p.y === y);
  
  // Check if a cell has a star
  const hasStar = (x, y) => level.stars.some(s => s.x === x && s.y === y);

  const getHint = (x, y) => {
    return level.hints[`${x},${y}`];
  };

  const getEntryRotation = (x, y) => {
    const idx = level.path.findIndex(p => p.x === x && p.y === y);
    if (idx <= 0) return 0; // Start cell
    const prev = level.path[idx - 1];
    if (prev.x < x) return 90; // Came from left, facing right
    if (prev.y < y) return 180; // Came from top, facing down
    if (prev.x > x) return 270; // Came from right, facing left
    return 0; // Came from bottom, facing up
  };

  const getPathBorders = (x, y) => {
    let shadows = [];
    const bColor = '#3c7a10';
    const bSize = 10;
    
    const hasTop = isPath(x, y - 1);
    const hasBottom = isPath(x, y + 1);
    const hasLeft = isPath(x - 1, y);
    const hasRight = isPath(x + 1, y);

    if (!hasTop) shadows.push(`0 -${bSize}px 0 0 ${bColor}`);
    if (!hasBottom) shadows.push(`0 ${bSize}px 0 0 ${bColor}`);
    if (!hasLeft) shadows.push(`-${bSize}px 0 0 0 ${bColor}`);
    if (!hasRight) shadows.push(`${bSize}px 0 0 0 ${bColor}`);

    if (!hasTop && !hasLeft) shadows.push(`-${bSize}px -${bSize}px 0 0 ${bColor}`);
    if (!hasTop && !hasRight) shadows.push(`${bSize}px -${bSize}px 0 0 ${bColor}`);
    if (!hasBottom && !hasLeft) shadows.push(`-${bSize}px ${bSize}px 0 0 ${bColor}`);
    if (!hasBottom && !hasRight) shadows.push(`${bSize}px ${bSize}px 0 0 ${bColor}`);

    // Inner shadow for texture depth
    shadows.push(`inset 0 0 20px rgba(0,0,0,0.15)`);

    return {
      boxShadow: shadows.join(', '),
      border: 'none',
      zIndex: 1
    };
  };

  const renderCells = () => {
    const cells = [];
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (!isPath(x, y)) continue;

        let cellClass = (x + y) % 2 === 0 ? "cell-path-even" : "cell-path-odd";
        if (x === level.start.x && y === level.start.y) cellClass = "cell-start";
        if (x === level.finish.x && y === level.finish.y) cellClass = "cell-finish";

        const hint = getHint(x, y);
        const rotation = getEntryRotation(x, y);

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`cell ${cellClass}`}
            style={{
              left: x * tileSize,
              top: y * tileSize,
              width: tileSize + 1,
              height: tileSize + 1,
              ...getPathBorders(x, y)
            }}
          >
            {hasStar(x, y) && (
              <Star className="star-icon" />
            )}
            {hint && (
              <div className="hint-circle" style={{
                backgroundColor: hint === 'left' ? '#0077b6' : hint === 'right' ? '#d90429' : '#ffb703'
              }}>
                <div style={{ transform: `rotate(${rotation}deg)`, display: 'flex' }}>
                  {hint === 'left' && <CornerUpLeft size={40} strokeWidth={4} color="white" />}
                  {hint === 'right' && <CornerUpRight size={40} strokeWidth={4} color="white" />}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="board-area">
      {/* Outer camera container - handles rotation around player */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
        }}
        animate={{ rotate: cameraRotation }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Inner container - handles translation to keep player at center */}
        <motion.div
          animate={{
            x: -(position.x + 0.5) * tileSize,
            y: -(position.y + 0.5) * tileSize,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            width: level.width * tileSize,
            height: level.height * tileSize,
          }}
        >
          {/* Render the grid cells */}
          {renderCells()}

          {/* Render the Player */}
          <Player position={position} rotation={playerRotation} tileSize={tileSize} />
        </motion.div>
      </motion.div>
    </div>
  );
}
