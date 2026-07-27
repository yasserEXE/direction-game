export const level1 = {
  width: 7,
  height: 7,
  start: { x: 3, y: 5, facing: 0 }, // starting in the middle bottom, facing up
  finish: { x: 5, y: 1 },
  path: [
    { x: 3, y: 5 }, // start
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 4 }, // left 2
    { x: 1, y: 3 },
    { x: 1, y: 2 }, // up 2
    { x: 2, y: 2 },
    { x: 3, y: 2 }, // right 2
    { x: 3, y: 3 }, // down 1
    { x: 4, y: 3 },
    { x: 5, y: 3 }, // right 2
    { x: 5, y: 2 },
    { x: 5, y: 1 }, // up 2, finish
  ],
  stars: [
    { x: 1, y: 3 },
    { x: 4, y: 3 },
  ],
  hints: {
    '3,4': 'left', // when at 3,4, turn left
    '1,4': 'right', // wait, if they turned left at 3,4 and walked to 1,4. They are facing LEFT. To go UP they need to turn RIGHT.
    '1,2': 'right', // they were facing UP. Need to go RIGHT.
    '3,2': 'right', // they were facing RIGHT. Need to go DOWN.
    '3,3': 'left',  // they were facing DOWN. Need to go RIGHT.
    '5,3': 'left',  // they were facing RIGHT. Need to go UP.
  }
};
