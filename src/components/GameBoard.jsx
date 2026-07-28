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

  // getPathBorders removed as we now use drop-shadow on the path container

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
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
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
          {/* Render the grid cells inside a wrapper with drop-shadow for the path outline */}
          <div style={{
            position: 'absolute',
            inset: 0,
            filter: 'drop-shadow(10px 0 0 #3c7a10) drop-shadow(-10px 0 0 #3c7a10) drop-shadow(0 10px 0 #3c7a10) drop-shadow(0 -10px 0 #3c7a10)'
          }}>
            {renderCells()}
          </div>

          {/* Render the Player */}
          <Player position={position} rotation={playerRotation} tileSize={tileSize} />
        </motion.div>
      </motion.div>
    </div>
  );
}
