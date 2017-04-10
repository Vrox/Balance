"use strict";

window.onload = init;

const canvasWidth = 900;
const canvasHeight = 900;


// Cell types
const GRASS = 1 << 0;
const CIV = 1 << 1;
const DIRT = 1 << 2;
const TREE = 1 << 3;
const ROCK = 1 << 4;
const GROWTH = 1 << 5;
const WATER = 1 << 6;

const BUILDABLE = GRASS | DIRT;
const WATER_FLOWS = GRASS | DIRT;
const PLANT = GRASS | TREE | GROWTH;
const FOREST = TREE | GROWTH;

function cellColor(cellType) {
  switch (cellType) {
  case GRASS:
    return '#4C7426';
  case CIV:
    return '#441111';
  case DIRT:
    return '#81762A';
  case TREE:
    return '#214300';
  case ROCK:
    return '#586776';
  case GROWTH:
    return '#2A5105';
  case WATER:
    return '#006666';
  default:
    console.log(cellType);
    return '#FF0000';
  }
}

var palette = {
  primary: ['#4C7426', '#8CA376', '#688949', '#2A5105', '#214300'],
  secondary: ['#1F3B54', '#586776', '#384E63', '#08223A', '#021A30'],
  tertiary: ['#81762A', '#B6B084','#989051', '#5A5006', '#4B4100'],
};

let canvas;
let ctx;

let lastTime = null;

let GRID_WIDTH = 100;
let GRID_HEIGHT = 100;

let grid;

let turnTimer = 0;
let TIMER_LENGTH = 0.1;

let paused = false;

function init() {
  canvas = document.querySelector('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext('2d');

  //canvas.addEventListener("mousedown", onClick);
  // window.onkeyup = function() {
  //   paused = !paused;
  //   document.getElementById('coolBody').style.backgroundColor = paused ? palette.tertiary[4] : palette.secondary[4];
  // };

  grid = [GRID_WIDTH];
  for (var x = 0; x < GRID_WIDTH; x++) {
    grid[x] = [GRID_HEIGHT];
    for (var y = 0; y < GRID_HEIGHT; y++) {
      grid[x][y] = GRASS;
    }
  }

  grid[25][25] = CIV;
  grid[25][26] = CIV;

  grid[21][33] = CIV;
  grid[22][33] = CIV;

  grid[3][16] = CIV;

  grid[13][40] = TREE;
  grid[14][40] = TREE;
  grid[15][40] = TREE;
  grid[13][41] = TREE;
  grid[14][41] = TREE;
  grid[15][41] = TREE;
  grid[13][42] = TREE;
  grid[14][42] = TREE;
  grid[15][42] = TREE;

  grid[23][17] = TREE;
  grid[24][17] = TREE;
  grid[25][17] = TREE;
  grid[23][18] = TREE;
  grid[24][18] = TREE;
  grid[25][18] = TREE;
  grid[23][19] = TREE;
  grid[24][19] = TREE;
  grid[25][19] = TREE;

  //grid[0][0] = WATER;

  requestAnimationFrame(update);
}

function update(time) {

  var dt = lastTime === null ? 0 : (time - lastTime) / 1000;
  lastTime = time;

  tick(dt);
  render();
  requestAnimationFrame(update);

}

function tick(dt) {
  if (!paused) turnTimer += dt;
  if (turnTimer >= TIMER_LENGTH) {
    turnTimer -= TIMER_LENGTH;
    turn();
  }
}

function turn() {
  var gridCopy = [GRID_WIDTH];
  for (var x = 0; x < GRID_WIDTH; x++) {
    gridCopy[x] = [];
    for (var y = 0; y < GRID_HEIGHT; y++) {
      gridCopy[x][y] = resolveBlock(x, y);
    }
  }
  grid = gridCopy;
//  console.log("turn")
}

// function onClick(event) {
//   var rect = canvas.getBoundingClientRect();
//   var x = Math.floor((event.clientX - rect.left) / canvasWidth * GRID_WIDTH);
//   var y = Math.floor((event.clientY - rect.top) / canvasHeight * GRID_HEIGHT);
//   grid[x][y] = !grid[x][y];
// }

function resolveBlock(x, y) {

  if (grid[x][y] & WATER_FLOWS) {
    if (northwestNode(x, y) === WATER ||
    (!(northNode(x, y) & WATER_FLOWS) && westNode(x, y) === WATER) ||
    (!(westNode(x, y) & WATER_FLOWS) && northNode(x, y) === WATER)) {
      return WATER;
    }
  }

  if (grid[x][y] & BUILDABLE) {
  //  console.log("build");
    if (allNeighborCount(x, y, PLANT) >= 3 && oneAxis(x, y, CIV)) {
      return CIV;
    }
  }

  if (grid[x][y] === DIRT) {
    if (hasNeighbor(x, y, WATER), allNeighborCount(x, y, PLANT) > allNeighborCount(x, y, CIV)) {
      return GRASS;
    }
  }

  if (grid[x][y] === GRASS) {
    if (allNeighborCount(x, y, TREE) >= 3 && !hasNeighbor(x, y, CIV)) {
      return GROWTH;
    }
    if (allNeighborCount(x, y, PLANT) < allNeighborCount(x, y, CIV)) {
      return DIRT;
    }

    // if (allNeighborCount(x, y, PLANT) === 8) {
    //   return GROWTH;
    // }
  }

  if (grid[x][y] === ROCK) {
    if (hasDirectNeighbor(x, y, TREE)) {
      return DIRT;
    }
    if (allNeighborCount(x, y, WATER) >= 3) {
      return DIRT;
    }
  }

  if (grid[x][y] === CIV) {
    if (isAllDirectNeighbors(x, y, CIV) ||
    allNeighborCount(x, y, CIV) > allNeighborCount(x, y, GRASS)) {
      return ROCK;
    }
    if (!hasDirectNeighbor(x, y, CIV)) {
      return DIRT;
    }
  }

  if (grid[x][y] === TREE) {
    // if (hasDirectNeighbor(x, y, CIV)) {
    //   return CIV;
    // }
    if (hasDirectNeighbor(x, y, CIV)) {
      return DIRT;
    }
  }

  if (grid[x][y] === GROWTH) {
    return TREE;
  }

  if (grid[x][y] === WATER) {
    if (hasDirectNeighbor(x, y, CIV)) {
      return GRASS;
    }
    if (hasDirectNeighbor(x, y, FOREST) && allNeighborCount(x, y, WATER) >= 3) {
      return GROWTH;
    }
    if (allNeighborCount(x, y, TREE) > 4 && !hasNeighbor(x, y, WATER)) {
      return GRASS;
    }
  }

  return grid[x][y];
}

function hasDirectNeighbor(x, y, flag) {
  return westNode(x,y) & flag ||
    eastNode(x,y) & flag ||
    northNode(x,y) & flag ||
    southNode(x,y) & flag;
}

function hasNeighbor(x, y, flag) {
  return westNode(x,y) & flag ||
    eastNode(x,y) & flag ||
    northNode(x,y) & flag ||
    southNode(x,y) & flag ||
    northwestNode(x,y) & flag ||
    southwestNode(x,y) & flag ||
    northeastNode(x,y) & flag ||
    southeastNode(x,y) & flag;
}

function allNeighbors(x, y, flag) {
  return westNode(x,y) & flag &&
    eastNode(x,y) & flag &&
    northNode(x,y) & flag &&
    southNode(x,y) & flag &&
    northwestNode(x,y) & flag &&
    southwestNode(x,y) & flag &&
    northeastNode(x,y) & flag &&
    southeastNode(x,y) & flag;
}

function directNeighborCount(x, y, flag) {
  let count = 0;
  if (westNode(x,y) & flag) count++;
  if (eastNode(x,y) & flag) count++;
  if (northNode(x,y) & flag) count++;
  if (southNode(x,y) & flag) count++;
  return count;
}

function isAllDirectNeighbors(x, y, flag) {
  return westNode(x,y) & flag &&
    eastNode(x,y) & flag &&
    northNode(x,y) & flag &&
    southNode(x,y) & flag;
}

function allNeighborCount(x, y, flag) {
  let count = 0;
  if (westNode(x,y) & flag) count++;
  if (eastNode(x,y) & flag) count++;
  if (northNode(x,y) & flag) count++;
  if (southNode(x,y) & flag) count++;
  if (northwestNode(x,y) & flag) count++;
  if (southwestNode(x,y) & flag) count++;
  if (northeastNode(x,y) & flag) count++;
  if (southeastNode(x,y) & flag) count++;
  return count;
}

function oneAxis(x, y, flag) {
  return (westNode(x,y) & flag || eastNode(x,y) & flag) !==
    (northNode(x,y) & flag || southNode(x,y) & flag);
}

function westNode(x, y) {
  return grid[x === 0 ? GRID_WIDTH - 1 : x - 1][y];
}

function eastNode(x, y) {
  return grid[x === GRID_WIDTH - 1 ? 0 : x + 1][y];
}

function northNode(x, y) {
  return grid[x][y === 0 ? GRID_HEIGHT - 1 : y - 1];
}

function southNode(x, y) {
  return grid[x][y === GRID_HEIGHT - 1 ? 0 : y + 1];
}

function northwestNode(x, y) {
  return grid[x === 0 ? GRID_WIDTH - 1 : x - 1][y === 0 ? GRID_HEIGHT - 1 : y - 1];
}

function northeastNode(x, y) {
  return grid[x === GRID_WIDTH - 1 ? 0 : x + 1][y === 0 ? GRID_HEIGHT - 1 : y - 1];
}

function southwestNode(x, y) {
  return grid[x === 0 ? GRID_WIDTH - 1 : x - 1][y === GRID_HEIGHT - 1 ? 0 : y + 1];
}

function southeastNode(x, y) {
  return grid[x === GRID_WIDTH - 1 ? 0 : x + 1][y === GRID_HEIGHT - 1 ? 0 : y + 1];
}

function render() {
//  clear();

  drawGrid();
}

function drawGrid() {
  ctx.save();
  for (var x = 0; x < GRID_WIDTH; x++) {
    for (var y = 0; y < GRID_HEIGHT; y++) {
      ctx.fillStyle = cellColor(grid[x][y]);
      drawBlock(x, y);
    }
  }
  ctx.restore();
}

function drawBlock(x, y) {
  ctx.fillRect(x/GRID_WIDTH * canvasWidth, y/GRID_HEIGHT * canvasHeight, canvasWidth/GRID_WIDTH, canvasHeight/GRID_HEIGHT);
}

// function clear() {
//   ctx.save();
//   ctx.fillStyle = paused ? palette.secondary[3] :  palette.primary[2];
//   ctx.fillRect(0,0,canvasWidth,canvasHeight);
//   ctx.restore();
// }
