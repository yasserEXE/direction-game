const WIDTH = 8;
const HEIGHT = 8;

function getNeighbors(x, y) {
  return [
    { x, y: y - 1, dir: 0 }, // Up
    { x: x + 1, y, dir: 1 }, // Right
    { x, y: y + 1, dir: 2 }, // Down
    { x: x - 1, y, dir: 3 }, // Left
  ].filter(n => n.x >= 0 && n.x < WIDTH && n.y >= 0 && n.y < HEIGHT);
}

// Check how many path blocks are adjacent to (x, y)
function countAdjacentPaths(x, y, currentPaths) {
  let count = 0;
  const neighbors = getNeighbors(x, y);
  for (const n of neighbors) {
    if (currentPaths.some(p => p.x === n.x && p.y === n.y)) {
      count++;
    }
  }
  return count;
}

function generateMainPath() {
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    
    // Start at bottom middle
    const startX = Math.floor(WIDTH / 2) - 1;
    const startY = HEIGHT - 1;
    let path = [{ x: startX, y: startY }];
    
    let currentX = startX;
    let currentY = startY;
    
    let stuck = false;
    
    while (currentY > 0) {
      // Get valid neighbors
      // A neighbor is valid if it is not visited AND it only touches 1 path block (the one we are coming from)
      // This prevents the path from touching itself
      let validNeighbors = getNeighbors(currentX, currentY).filter(n => {
        return countAdjacentPaths(n.x, n.y, path) === 1;
      });
      
      // Bias towards moving UP (dir = 0)
      if (validNeighbors.length > 0) {
        // Simple weighting: add 'UP' neighbors multiple times to array to increase probability
        let weighted = [];
        for (let n of validNeighbors) {
          weighted.push(n);
          if (n.dir === 0) {
             weighted.push(n);
             weighted.push(n);
          }
        }
        
        const next = weighted[Math.floor(Math.random() * weighted.length)];
        path.push({ x: next.x, y: next.y });
        currentX = next.x;
        currentY = next.y;
      } else {
        stuck = true;
        break;
      }
    }
    
    if (!stuck) {
      return path;
    }
  }
  
  // Fallback if somehow stuck 100 times (extremely rare on 8x8)
  return [
    {x:3, y:7}, {x:3, y:6}, {x:3, y:5}, {x:3, y:4},
    {x:3, y:3}, {x:3, y:2}, {x:3, y:1}, {x:3, y:0}
  ];
}

function addDeadEnds(mainPath) {
  let allPaths = [...mainPath];
  const numDeadEnds = 3 + Math.floor(Math.random() * 3); // 3 to 5 dead ends
  
  for (let i = 0; i < numDeadEnds; i++) {
    // Pick a random spot on the main path (not the start or finish)
    const index = 1 + Math.floor(Math.random() * (mainPath.length - 2));
    const startNode = mainPath[index];
    
    let currentX = startNode.x;
    let currentY = startNode.y;
    
    // Branch length 1 to 3
    const branchLength = 1 + Math.floor(Math.random() * 3);
    
    for (let step = 0; step < branchLength; step++) {
      let validNeighbors = getNeighbors(currentX, currentY).filter(n => {
        return countAdjacentPaths(n.x, n.y, allPaths) === 1;
      });
      
      if (validNeighbors.length > 0) {
        const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
        allPaths.push({ x: next.x, y: next.y });
        currentX = next.x;
        currentY = next.y;
      } else {
        break;
      }
    }
  }
  
  return allPaths;
}

function generateHints(mainPath) {
  const hints = {};
  
  for (let i = 1; i < mainPath.length - 1; i++) {
    const prev = mainPath[i - 1];
    const curr = mainPath[i];
    const next = mainPath[i + 1];
    
    // Determine the direction we entered 'curr' from 'prev'
    // 0=Up, 1=Right, 2=Down, 3=Left
    let entryDir;
    if (curr.y < prev.y) entryDir = 0; // we moved Up to get here
    else if (curr.x > prev.x) entryDir = 1; // we moved Right
    else if (curr.y > prev.y) entryDir = 2; // we moved Down
    else if (curr.x < prev.x) entryDir = 3; // we moved Left
    
    // Determine the direction we need to exit 'curr' to get to 'next'
    let exitDir;
    if (next.y < curr.y) exitDir = 0;
    else if (next.x > curr.x) exitDir = 1;
    else if (next.y > curr.y) exitDir = 2;
    else if (next.x < curr.x) exitDir = 3;
    
    // Calculate the turn
    // (exitDir - entryDir) mod 4: 0 = forward, 1 = right, 2 = reverse, 3 (-1) = left
    let diff = (exitDir - entryDir + 4) % 4;
    
    if (diff === 0) {
      // forward (removed)
    } else if (diff === 1) {
      // right turn
      hints[`${curr.x},${curr.y}`] = 'right';
    } else if (diff === 3) {
      // left turn
      hints[`${curr.x},${curr.y}`] = 'left';
    }
    // Note: diff === 2 should not happen in our path generation (it never reverses on itself)
  }
  
  return hints;
}

export function generateRandomLevel() {
  const mainPath = generateMainPath();
  const allPaths = addDeadEnds(mainPath);
  const hints = generateHints(mainPath);
  
  // Start is the first element of mainPath
  const start = mainPath[0];
  // Determine starting facing direction based on the first move
  const firstMove = mainPath[1];
  let facing = 0; // Up default
  if (firstMove.y < start.y) facing = 0;
  if (firstMove.x > start.x) facing = 1;
  if (firstMove.y > start.y) facing = 2;
  if (firstMove.x < start.x) facing = 3;
  
  const startObj = { x: start.x, y: start.y, facing };
  
  // Finish is the last element of mainPath
  const finishNode = mainPath[mainPath.length - 1];
  const finish = { x: finishNode.x, y: finishNode.y };
  
  // Place Stars (2 to 4 stars)
  const stars = [];
  const numStars = 3;
  
  // Candidate spots for stars (any path except start and finish)
  const candidates = allPaths.filter(p => 
    !(p.x === start.x && p.y === start.y) && 
    !(p.x === finish.x && p.y === finish.y) &&
    !hints[`${p.x},${p.y}`]
  );
  
  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  
  for (let i = 0; i < Math.min(numStars, candidates.length); i++) {
    stars.push(candidates[i]);
  }
  
  return {
    width: WIDTH,
    height: HEIGHT,
    start: startObj,
    finish,
    path: allPaths,
    stars,
    hints
  };
}
