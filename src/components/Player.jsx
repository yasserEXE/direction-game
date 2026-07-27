import React from 'react';
import { motion } from 'framer-motion';

export default function Player({ position, rotation, tileSize }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: tileSize,
        height: tileSize,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}
      animate={{
        x: position.x * tileSize,
        y: position.y * tileSize,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.img 
        src="/charchter-directions final final.svg"
        alt="Player Character"
        style={{ width: '105%', height: '105%', zIndex: 5, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.2))' }}
        animate={{ rotate: rotation }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
