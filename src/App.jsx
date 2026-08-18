import React, { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import { generateRandomLevel } from './mapGenerator';
import { Star, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const initialLevel = generateRandomLevel();

function App() {
  const [level, setLevel] = useState(initialLevel);
  const [playerPosition, setPlayerPosition] = useState({ x: initialLevel.start.x, y: initialLevel.start.y });
  const [playerDirection, setPlayerDirection] = useState(initialLevel.start.facing);
  
  const [playerRotation, setPlayerRotation] = useState(initialLevel.start.facing * 90); 
  const [cameraRotation, setCameraRotation] = useState(-initialLevel.start.facing * 90);
  
  const [starsCollected, setStarsCollected] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flyingStars, setFlyingStars] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('direction_game_music_muted') === 'true';
  });

  const audioRef = useRef(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}bgmusic_Ascending.mp3`);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    const playAudio = () => {
      if (!isMutedRef.current && audio.paused) {
        audio.play().catch(() => {
          // Autoplay policy prevented playback until user interaction
        });
      }
    };

    playAudio();

    const handleFirstInteraction = () => {
      if (!isMutedRef.current && audio.paused) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      audio.pause();
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.play().catch(() => {});
      setIsMuted(false);
      localStorage.setItem('direction_game_music_muted', 'false');
    } else {
      audio.pause();
      setIsMuted(true);
      localStorage.setItem('direction_game_music_muted', 'true');
    }
  };

  // Total stars in the level is fixed at 3
  const totalStars = 3;

  const isPath = (x, y) => level.path.some(p => p.x === x && p.y === y);

  const handleMove = () => {
    if (hasWon || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    // Deltas for Up, Right, Down, Left
    const dx = [0, 1, 0, -1][playerDirection];
    const dy = [-1, 0, 1, 0][playerDirection];
    
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (isPath(newX, newY)) {
      const moveAudio = new Audio('/moving-sound.wav');
      moveAudio.play().catch(err => console.log('Audio play error:', err));

      setPlayerPosition({ x: newX, y: newY });
      
      // Check star collection
      const starIndex = level.stars.findIndex(s => s.x === newX && s.y === newY);
      if (starIndex !== -1) {
        const audio = new Audio('/collecting-star.mp3');
        audio.play().catch(err => console.log('Audio play error:', err));

        const newId = Date.now();
        setFlyingStars(prev => [...prev, { id: newId }]);
        
        setTimeout(() => {
          setStarsCollected(prev => prev + 1);
          setFlyingStars(prev => prev.filter(s => s.id !== newId));
        }, 800);

        const newStars = [...level.stars];
        newStars.splice(starIndex, 1);
        setLevel({ ...level, stars: newStars });
      }

      // Check win condition
      if (newX === level.finish.x && newY === level.finish.y) {
        setTimeout(() => {
          const winAudio = new Audio('/winning sound.mp3');
          winAudio.play().catch(err => console.log('Audio play error:', err));
          setHasWon(true);
        }, 400); // Wait for animation to finish
      }
    }
  };

  const handleTurnLeft = () => {
    if (hasWon || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setPlayerDirection((prev) => (prev + 3) % 4);
    setPlayerRotation((prev) => prev - 90);
    setCameraRotation((prev) => prev + 90);
  };

  const handleTurnRight = () => {
    if (hasWon || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setPlayerDirection((prev) => (prev + 1) % 4);
    setPlayerRotation((prev) => prev + 90);
    setCameraRotation((prev) => prev - 90);
  };

  const restartGame = () => {
    const clickAudio = new Audio('/button click.mp3');
    clickAudio.play().catch(err => console.log('Audio play error:', err));

    const newLevel = generateRandomLevel();
    setLevel(newLevel);
    setPlayerPosition({ x: newLevel.start.x, y: newLevel.start.y });
    setPlayerDirection(newLevel.start.facing);
    setPlayerRotation(newLevel.start.facing * 90);
    setCameraRotation(-newLevel.start.facing * 90);
    setStarsCollected(0);
    setHasWon(false);
  };

  // Keyboard controls for easier testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') handleMove();
      if (e.key === 'ArrowLeft') handleTurnLeft();
      if (e.key === 'ArrowRight') handleTurnRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, playerDirection, hasWon, isAnimating, level]); // Depend on state that might change

  return (
    <div className="game-container">
      <GameBoard 
        level={level} 
        playerState={{
          position: playerPosition,
          playerRotation,
          cameraRotation
        }} 
      />
      
      <Controls 
        onMove={handleMove}
        onTurnLeft={handleTurnLeft}
        onTurnRight={handleTurnRight}
      />

      {/* Top Bar UI */}
      <div className="top-bar">
        <div className="top-bar-actions">
          <button className="exit-button" onClick={restartGame} title="Retry" aria-label="Retry">
            <RotateCcw size={32} strokeWidth={3.5} />
          </button>
          <button 
            className={`music-toggle-btn ${isMuted ? 'muted' : ''}`} 
            onClick={toggleMusic} 
            title={isMuted ? "تشغيل الموسيقى (Play Music)" : "كتم الموسيقى (Mute Music)"}
            aria-label={isMuted ? "Play Music" : "Mute Music"}
          >
            {isMuted ? <VolumeX size={32} strokeWidth={3} /> : <Volume2 size={32} strokeWidth={3} />}
          </button>
        </div>
        <div className="progress-bar">
          {Array.from({ length: totalStars }).map((_, i) => (
            <Star key={i} className={`progress-star ${i < starsCollected ? 'collected' : ''}`} />
          ))}
        </div>
      </div>

      {/* Flying Stars */}
      {flyingStars.map(star => (
        <Star key={star.id} className="flying-star" />
      ))}

      {hasWon && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1>You Did It!</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
              {Array.from({ length: totalStars }).map((_, i) => (
                <Star key={i} size={40} style={{ color: i < starsCollected ? '#ffbe0b' : '#ddd', fill: i < starsCollected ? '#ffbe0b' : '#eee' }} />
              ))}
            </div>
            <button className="modal-button" onClick={restartGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
