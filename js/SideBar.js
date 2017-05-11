/* global require module */
const GridSpace = require('./GridSpace.js');
const CellTypes = require('./CellTypes.js');

const cells = [
  CellTypes.TREE,
  CellTypes.GRASS,
  CellTypes.CIV,
  CellTypes.DIRT,
  CellTypes.WATER,
  CellTypes.WALL
];

let speedSelected = 1;
const speeds = [1.0, 0.5, 0.2, 0.1];

let brush0img;
let brush1img;
let brush2img;

let timer0img;
let timer1img;
let timer2img;
let timer3img;

class SideBar {
  constructor() {
    brush0img = document.getElementById('brush0');
    brush1img = document.getElementById('brush1');
    brush2img = document.getElementById('brush2');

    timer0img = document.getElementById('timer0');
    timer1img = document.getElementById('timer1');
    timer2img = document.getElementById('timer2');
    timer3img = document.getElementById('timer3');
  }

  mouseUp(mouseX, mouseY) {

  }

  get brushSize() {
    return 1; // TODO
  }

  get speed() {
    return 1; // TODO
  }
}

module.exports = SideBar;

// const SIDEBAR_X = canvasHeight;
// const SIDEBAR_WIDTH = canvasWidth - SIDEBAR_X;
// const SIDEBAR_MARGIN = Math.floor(SIDEBAR_WIDTH * 0.05);
// const SIDEBAR_INNER_WIDTH = SIDEBAR_WIDTH - SIDEBAR_MARGIN * 2;
// const SIDEBAR_EFFECTIVE_WIDTH = SIDEBAR_INNER_WIDTH - SIDEBAR_MARGIN * 2;
//
// const BUTTON_X = SIDEBAR_X + SIDEBAR_MARGIN * 2;

// const TIME_BUTTON_COUNT = 4;
// const TIME_BUTTON_SIZE = (SIDEBAR_EFFECTIVE_WIDTH - (TIME_BUTTON_COUNT - 1) * SIDEBAR_MARGIN) / TIME_BUTTON_COUNT;
// const TIME_BUTTON_Y = SIDEBAR_MARGIN * 2;
//
// const CELL_BUTTON_SIZE = (SIDEBAR_EFFECTIVE_WIDTH - 2 * SIDEBAR_MARGIN) / 3;
// const CELL_BUTTON_ROW1_Y = TIME_BUTTON_Y + TIME_BUTTON_SIZE + SIDEBAR_MARGIN;
// const CELL_BUTTON_ROW2_Y = CELL_BUTTON_ROW1_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN;
//
// const CELL_ICON_MARGIN = Math.floor(CELL_BUTTON_SIZE * 0.15);
// const CELL_ICON_SIZE = CELL_BUTTON_SIZE - CELL_ICON_MARGIN * 2;
//
// const TIME_ICON_MARGIN = Math.floor(TIME_BUTTON_SIZE * 0.15);
// const TIME_ICON_SIZE = TIME_BUTTON_SIZE - TIME_ICON_MARGIN * 2;
//
// const BRUSH_BUTTON_Y = CELL_BUTTON_ROW2_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN * 2;
//
//
// const brushes = [0, 5, 10];


/*

let cellSelected = 0;
const cells = [TREE, GRASS, CIV, DIRT, WATER, WALL];

let brushSelected = 1;



function drawCellIcon(x, y, index) {
  textureCtx.fillStyle = cellColor(cells[index]);
  textureCtx.fillRect(x + CELL_ICON_MARGIN, y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
}


const sidebarButtons = [
  new SidebarButton(
    BUTTON_X,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { textureCtx.drawImage(timer0img, BUTTON_X + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 0; },
    () => { return speedSelected === 0; }
  ),
  new SidebarButton(
    BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { textureCtx.drawImage(timer1img, BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 1; },
    () => { return speedSelected === 1; }
  ),
  new SidebarButton(
    BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { textureCtx.drawImage(timer2img, BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2 + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
    () => { speedSelected = 2; },
    () => { return speedSelected === 2; }
  ),
  new SidebarButton(
    BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3,
    TIME_BUTTON_Y,
    TIME_BUTTON_SIZE,
    () => { textureCtx.drawImage(timer3img, BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3 + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE); },
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
    () => { textureCtx.drawImage(brush0img, BUTTON_X + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE); },
    () => { brushSelected = 0; },
    () => { return brushSelected === 0; }
  ),
  new SidebarButton(
    BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN,
    BRUSH_BUTTON_Y,
    CELL_BUTTON_SIZE,
    () => { textureCtx.drawImage(brush1img, BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE); },
    () => { brushSelected = 1; },
    () => { return brushSelected === 1; }
  ),
  new SidebarButton(
    BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2,
    BRUSH_BUTTON_Y,
    CELL_BUTTON_SIZE,
    () => { textureCtx.drawImage(brush2img, BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2 + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE); },
    () => { brushSelected = 2; },
    () => { return brushSelected === 2; }
  ),
];
*/
