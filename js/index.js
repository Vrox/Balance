"use strict";

window.onload = init;

const canvasWidth = 1300;
const canvasHeight = 900;

let GRID_WIDTH = 50;
let GRID_HEIGHT = 50;

const CELL_SIZE = canvasHeight/GRID_HEIGHT;
const SIDEBAR_X = canvasHeight;
const SIDEBAR_WIDTH = canvasWidth - SIDEBAR_X;
const SIDEBAR_MARGIN = Math.floor(SIDEBAR_WIDTH * 0.05);
const SIDEBAR_INNER_WIDTH = SIDEBAR_WIDTH - SIDEBAR_MARGIN * 2;
const SIDEBAR_EFFECTIVE_WIDTH = SIDEBAR_INNER_WIDTH - SIDEBAR_MARGIN * 2;

const BUTTON_X = SIDEBAR_X + SIDEBAR_MARGIN * 2;

const TIME_BUTTON_COUNT = 4;
const TIME_BUTTON_SIZE = (SIDEBAR_EFFECTIVE_WIDTH - (TIME_BUTTON_COUNT - 1) * SIDEBAR_MARGIN) / TIME_BUTTON_COUNT;
const TIME_BUTTON_Y = SIDEBAR_MARGIN * 2;

const CELL_BUTTON_SIZE = (SIDEBAR_EFFECTIVE_WIDTH - 2 * SIDEBAR_MARGIN) / 3;
const CELL_BUTTON_ROW1_Y = TIME_BUTTON_Y + TIME_BUTTON_SIZE + SIDEBAR_MARGIN;
const CELL_BUTTON_ROW2_Y = CELL_BUTTON_ROW1_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN;

const BRUSH_BUTTON_Y = CELL_BUTTON_ROW2_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN;

const BUTTON_COLOR = '#444444';
const BUTTON_HOVER_COLOR = '#555555';
const BUTTON_SELECTED_COLOR = '#666600';

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

let canvas;
let ctx;

let lastTime = null;

let grid;

let turnTimer = 0;

let speedSelected = 0;
const speeds = [1.0, 0.7, 0.3, 0.1];

let cellSelected = 0;
const cells = [ROCK, DIRT, GRASS, CIV, TREE, WATER];

let brushSelected = 0;

let paused = false;

let mouseLoc = {x: 0, y:0};

function init() {
  canvas = document.querySelector('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext('2d');

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseLoc.x = event.clientX - rect.left;
    mouseLoc.y = event.clientY - rect.top;
    console.log(mouseLoc)
  }, false);

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
  if (turnTimer >= speeds[speedSelected]) {
    turnTimer -= speeds[speedSelected];
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
  drawSidebar();
  drawGrid();
}

function drawSidebar() {
  ctx.save();
  ctx.fillStyle = '#333333';
  ctx.fillRect(SIDEBAR_X + SIDEBAR_MARGIN, SIDEBAR_MARGIN, SIDEBAR_INNER_WIDTH, canvasHeight - SIDEBAR_MARGIN * 2);

  drawButton(BUTTON_X, TIME_BUTTON_Y, TIME_BUTTON_SIZE, speedSelected === 0);
  drawButton(BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN, TIME_BUTTON_Y, TIME_BUTTON_SIZE, speedSelected === 1);
  drawButton(BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, TIME_BUTTON_Y, TIME_BUTTON_SIZE, speedSelected === 2);
  drawButton(BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3, TIME_BUTTON_Y, TIME_BUTTON_SIZE, speedSelected === 3);
  drawCellButton(BUTTON_X, CELL_BUTTON_ROW1_Y, 0);
  drawCellButton(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW1_Y, 1);
  drawCellButton(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW1_Y, 2);
  drawCellButton(BUTTON_X, CELL_BUTTON_ROW2_Y, 3);
  drawCellButton(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW2_Y, 4);
  drawCellButton(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW2_Y, 5);
  drawButton(BUTTON_X, BRUSH_BUTTON_Y, CELL_BUTTON_SIZE, brushSelected === 0);
  drawButton(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, BRUSH_BUTTON_Y, CELL_BUTTON_SIZE, brushSelected === 1);
  drawButton(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, BRUSH_BUTTON_Y, CELL_BUTTON_SIZE, brushSelected === 2);
  ctx.restore();
}

function drawButton(x, y, size, selected) {
  ctx.fillStyle = selected ? BUTTON_SELECTED_COLOR :
  (mouseLoc.x > x && mouseLoc.x < x + size && mouseLoc.y > y && mouseLoc.y < y + size) ?
    BUTTON_HOVER_COLOR : BUTTON_COLOR;
  ctx.fillRect(x, y, size, size);
}

const CELL_ICON_MARGIN = Math.floor(CELL_BUTTON_SIZE * 0.15);
const CELL_ICON_SIZE = CELL_BUTTON_SIZE - CELL_ICON_MARGIN * 2;

function drawCellButton(x, y, index) {
  drawButton(x, y, CELL_BUTTON_SIZE, cellSelected === index);
  ctx.fillStyle = cellColor(cells[index]);
  ctx.fillRect(x + CELL_ICON_MARGIN, y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
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
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
