import React from 'react';
import { ArrowUp, CornerUpLeft, CornerUpRight } from 'lucide-react';

export default function Controls({ onMove, onTurnLeft, onTurnRight }) {
  return (
    <div className="controls-area">
      <div className="control-btn-wrapper btn-up-wrapper">
        <button className="game-button btn-forward" onClick={onMove}>
          <ArrowUp size={45} strokeWidth={4} />
        </button>
      </div>
      <div className="control-btn-wrapper btn-left-wrapper">
        <button className="game-button btn-left" onClick={onTurnLeft}>
          <CornerUpLeft size={40} strokeWidth={4} />
        </button>
        <span className="control-label">Left</span>
      </div>
      <div className="control-btn-wrapper btn-right-wrapper">
        <button className="game-button btn-right" onClick={onTurnRight}>
          <CornerUpRight size={40} strokeWidth={4} />
        </button>
        <span className="control-label">Right</span>
      </div>
    </div>
  );
}
