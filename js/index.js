"use strict";

window.onload = init;

const canvasWidth = 1300;
const canvasHeight = 900;

let GRID_WIDTH = 100;
let GRID_HEIGHT = 100;

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

const CELL_ICON_MARGIN = Math.floor(CELL_BUTTON_SIZE * 0.15);
const CELL_ICON_SIZE = CELL_BUTTON_SIZE - CELL_ICON_MARGIN * 2;

const TIME_ICON_MARGIN = Math.floor(TIME_BUTTON_SIZE * 0.15);
const TIME_ICON_SIZE = TIME_BUTTON_SIZE - TIME_ICON_MARGIN * 2;

const BRUSH_BUTTON_Y = CELL_BUTTON_ROW2_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN * 2;

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

const brushes = [0, 5, 10];

class SidebarButton {
  constructor(x, y, size, drawIcon, onSelect, isSelected) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.drawIcon = drawIcon;
    this.onSelect = onSelect;
    this.isSelected = isSelected;
  }

  draw() {
    ctx.fillStyle = this.isSelected() ? BUTTON_SELECTED_COLOR :
    (mouseLoc.x > this.x && mouseLoc.x < this.x + this.size && mouseLoc.y > this.y && mouseLoc.y < this.y + this.size) ?
      BUTTON_HOVER_COLOR : BUTTON_COLOR;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    this.drawIcon();
  }

  checkPress(mouseX, mouseY) {
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      this.onSelect();
    }
  }
}

function drawCellIcon(x, y, index) {
  ctx.fillStyle = cellColor(cells[index]);
  ctx.fillRect(x + CELL_ICON_MARGIN, y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
}


const sidebarButtons = [
  new SidebarButton(
    BUTTON_X,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { ctx.drawImage(timer0img, BUTTON_X + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 0; },
    () => { return speedSelected === 0; }
  ),
  new SidebarButton(
    BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { ctx.drawImage(timer1img, BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 1; },
    () => { return speedSelected === 1; }
  ),
  new SidebarButton(
    BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { ctx.drawImage(timer2img, BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2 + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 2; },
    () => { return speedSelected === 2; }
  ),
  new SidebarButton(
    BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { ctx.drawImage(timer3img, BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3 + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 3; },
    () => { return speedSelected === 3; }
  ),
  new SidebarButton(
    BUTTON_X,
    CELL_BUTTON_ROW1_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X, CELL_BUTTON_ROW1_Y, 0); },
    () => { cellSelected = 0; },
    () => { return cellSelected === 0; }
  ),
  new SidebarButton(
    BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN,
    CELL_BUTTON_ROW1_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW1_Y, 1); },
    () => { cellSelected = 1; },
    () => { return cellSelected === 1; }
  ),
  new SidebarButton(
    BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,
    CELL_BUTTON_ROW1_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,  CELL_BUTTON_ROW1_Y, 2); },
    () => { cellSelected = 2; },
    () => { return cellSelected === 2; }
  ),
  new SidebarButton(
    BUTTON_X,
    CELL_BUTTON_ROW2_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X, CELL_BUTTON_ROW2_Y, 3); },
    () => { cellSelected = 3; },
    () => { return cellSelected === 3; }
  ),
  new SidebarButton(
    BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN,
    CELL_BUTTON_ROW2_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW2_Y, 4); },
    () => { cellSelected = 4; },
    () => { return cellSelected === 4; }
  ),
  new SidebarButton(
    BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,
    CELL_BUTTON_ROW2_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW2_Y, 5); },
    () => { cellSelected = 5; },
    () => { return cellSelected === 5; }
  ),
  new SidebarButton(
    BUTTON_X,
    CELL_BUTTON_ROW2_Y,
    CELL_BUTTON_SIZE,
    () => { drawCellIcon(BUTTON_X, CELL_BUTTON_ROW2_Y, 3); },
    () => { cellSelected = 3; },
    () => { return cellSelected === 3; }
  ),
  new SidebarButton(
    BUTTON_X,
    BRUSH_BUTTON_Y,
    CELL_BUTTON_SIZE,
    () => { ctx.drawImage(brush0img, BUTTON_X + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE); },
    () => { brushSelected = 0; },
    () => { return brushSelected === 0; }
  ),
  new SidebarButton(
    BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN,
    BRUSH_BUTTON_Y,
    CELL_BUTTON_SIZE,
    () => { ctx.drawImage(brush1img, BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE); },
    () => { brushSelected = 1; },
    () => { return brushSelected === 1; }
  ),
  new SidebarButton(
    BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,
    BRUSH_BUTTON_Y,
    CELL_BUTTON_SIZE,
    () => { ctx.drawImage(brush2img, BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2 + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE); },
    () => { brushSelected = 2; },
    () => { return brushSelected === 2; }
  ),
];

function cellColor(cellType) {
  switch (cellType) {
  case GRASS:
    return '#4C7426';
  case CIV:
    return '#AAAAAA';
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

let speedSelected = 1;
const speeds = [1.0, 0.5, 0.2, 0.1];

let cellSelected = 0;
const cells = [ROCK, DIRT, GRASS, CIV, TREE, WATER];

let brushSelected = 1;

let paused = false;

let mouseLoc = {x: 0, y:0};

let mouseDownTracker = false;

function paint() {
  const gridX = Math.floor(mouseLoc.x / CELL_SIZE);
  const gridY = Math.floor(mouseLoc.y / CELL_SIZE);

  const brushSize = brushes[brushSelected];

  for(let bx = gridX - brushSize, bxMax = gridX + brushSize; bx <= bxMax; bx++) {
    for(let by = gridY - brushSize, byMax = gridY + brushSize; by <= byMax; by++) {
      const dx = Math.abs(gridX - bx);
      const dy = Math.abs(gridY - by);
      if (dx * dx + dy * dy <= brushSize * brushSize) {
        paintCell(bx, by);
      }
    }
  }
}

function paintCell(gridX, gridY) {
  if (gridX < 0 || gridY < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) return;
  grid[gridX][gridY] = cells[cellSelected];
}

let brush0img;
let brush1img;
let brush2img;

let timer0img;
let timer1img;
let timer2img;
let timer3img;

function init() {

  brush0img = document.getElementById('brush0');
  brush1img = document.getElementById('brush1');
  brush2img = document.getElementById('brush2');

  timer0img = document.getElementById('timer0');
  timer1img = document.getElementById('timer1');
  timer2img = document.getElementById('timer2');
  timer3img = document.getElementById('timer3');


  canvas = document.querySelector('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext('2d');

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseLoc.x = event.clientX - rect.left;
    mouseLoc.y = event.clientY - rect.top;
    if (mouseDownTracker) {
      paint();
    }
  }, false);

  canvas.addEventListener("mousedown", () => {
    mouseDownTracker = true;
    paint();
  });
  canvas.addEventListener("mouseup", () => {
    for (let i = 0; i < sidebarButtons.length; i++) {
      sidebarButtons[i].checkPress(mouseLoc.x, mouseLoc.y);
    }
    mouseDownTracker = false;
  });

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

  grid[73][40] = TREE;
  grid[74][40] = TREE;
  grid[75][40] = TREE;
  grid[73][41] = TREE;
  grid[74][41] = TREE;
  grid[75][41] = TREE;
  grid[73][42] = TREE;
  grid[74][42] = TREE;
  grid[75][42] = TREE;

  grid[23][17] = TREE;
  grid[24][17] = TREE;
  grid[25][17] = TREE;
  grid[23][18] = TREE;
  grid[24][18] = TREE;
  grid[25][18] = TREE;
  grid[23][19] = TREE;
  grid[24][19] = TREE;
  grid[25][19] = TREE;

//  grid[0][0] = WATER;

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
}

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
  drawSidebar();
  drawGrid();
}

function drawSidebar() {
  ctx.save();
  ctx.fillStyle = '#333333';
  ctx.fillRect(SIDEBAR_X + SIDEBAR_MARGIN, SIDEBAR_MARGIN, SIDEBAR_INNER_WIDTH, canvasHeight - SIDEBAR_MARGIN * 2);

  for(let i = 0; i < sidebarButtons.length; i++) {
    sidebarButtons[i].draw();
  }

  ctx.restore();
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
