"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    "use strict";

    window.onload = init;

    var canvasWidth = 1300;
    var canvasHeight = 900;

    var GRID_WIDTH = 100;
    var GRID_HEIGHT = 100;

    var CELL_SIZE = canvasHeight / GRID_HEIGHT;
    var SIDEBAR_X = canvasHeight;
    var SIDEBAR_WIDTH = canvasWidth - SIDEBAR_X;
    var SIDEBAR_MARGIN = Math.floor(SIDEBAR_WIDTH * 0.05);
    var SIDEBAR_INNER_WIDTH = SIDEBAR_WIDTH - SIDEBAR_MARGIN * 2;
    var SIDEBAR_EFFECTIVE_WIDTH = SIDEBAR_INNER_WIDTH - SIDEBAR_MARGIN * 2;

    var BUTTON_X = SIDEBAR_X + SIDEBAR_MARGIN * 2;

    var TIME_BUTTON_COUNT = 4;
    var TIME_BUTTON_SIZE = (SIDEBAR_EFFECTIVE_WIDTH - (TIME_BUTTON_COUNT - 1) * SIDEBAR_MARGIN) / TIME_BUTTON_COUNT;
    var TIME_BUTTON_Y = SIDEBAR_MARGIN * 2;

    var CELL_BUTTON_SIZE = (SIDEBAR_EFFECTIVE_WIDTH - 2 * SIDEBAR_MARGIN) / 3;
    var CELL_BUTTON_ROW1_Y = TIME_BUTTON_Y + TIME_BUTTON_SIZE + SIDEBAR_MARGIN;
    var CELL_BUTTON_ROW2_Y = CELL_BUTTON_ROW1_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN;

    var CELL_ICON_MARGIN = Math.floor(CELL_BUTTON_SIZE * 0.15);
    var CELL_ICON_SIZE = CELL_BUTTON_SIZE - CELL_ICON_MARGIN * 2;

    var TIME_ICON_MARGIN = Math.floor(TIME_BUTTON_SIZE * 0.15);
    var TIME_ICON_SIZE = TIME_BUTTON_SIZE - TIME_ICON_MARGIN * 2;

    var BRUSH_BUTTON_Y = CELL_BUTTON_ROW2_Y + CELL_BUTTON_SIZE + SIDEBAR_MARGIN * 2;

    var BUTTON_COLOR = '#444444';
    var BUTTON_HOVER_COLOR = '#555555';
    var BUTTON_SELECTED_COLOR = '#666600';

    // Cell types
    var GRASS = 1 << 0; // 1
    var CIV = 1 << 1; // 2
    var DIRT = 1 << 2; // 4
    var TREE = 1 << 3; // 8
    var ROCK = 1 << 4; // 16
    var GROWTH = 1 << 5; // 32
    var WATER = 1 << 6; // 64
    var FAUNA = 1 << 7; // 128
    var WALL = 1 << 8; // 256

    var BUILDABLE = GRASS | DIRT;
    var WATER_FLOWS = GRASS | DIRT;
    var PLANT = GRASS | TREE | GROWTH;
    var FOREST = TREE | GROWTH;
    var FAUNA_ROAMS = GRASS | TREE | GROWTH | WATER;
    var EATS = CIV | FAUNA;
    var BAREN = ROCK | WALL;

    var brushes = [0, 5, 10];

    var SidebarButton = function () {
      function SidebarButton(x, y, size, drawIcon, onSelect, isSelected) {
        _classCallCheck(this, SidebarButton);

        this.x = x;
        this.y = y;
        this.size = size;
        this.drawIcon = drawIcon;
        this.onSelect = onSelect;
        this.isSelected = isSelected;
      }

      _createClass(SidebarButton, [{
        key: "draw",
        value: function draw() {
          ctx.fillStyle = this.isSelected() ? BUTTON_SELECTED_COLOR : mouseLoc.x > this.x && mouseLoc.x < this.x + this.size && mouseLoc.y > this.y && mouseLoc.y < this.y + this.size ? BUTTON_HOVER_COLOR : BUTTON_COLOR;
          ctx.fillRect(this.x, this.y, this.size, this.size);
          this.drawIcon();
        }
      }, {
        key: "checkPress",
        value: function checkPress(mouseX, mouseY) {
          if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
            this.onSelect();
          }
        }
      }]);

      return SidebarButton;
    }();

    function drawCellIcon(x, y, index) {
      ctx.fillStyle = cellColor(cells[index]);
      ctx.fillRect(x + CELL_ICON_MARGIN, y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
    }

    var sidebarButtons = [new SidebarButton(BUTTON_X, TIME_BUTTON_Y, TIME_BUTTON_SIZE, function () {
      ctx.drawImage(timer0img, BUTTON_X + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE);
    }, function () {
      speedSelected = 0;
    }, function () {
      return speedSelected === 0;
    }), new SidebarButton(BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN, TIME_BUTTON_Y, TIME_BUTTON_SIZE, function () {
      ctx.drawImage(timer1img, BUTTON_X + TIME_BUTTON_SIZE + SIDEBAR_MARGIN + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE);
    }, function () {
      speedSelected = 1;
    }, function () {
      return speedSelected === 1;
    }), new SidebarButton(BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, TIME_BUTTON_Y, TIME_BUTTON_SIZE, function () {
      ctx.drawImage(timer2img, BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 2 + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE);
    }, function () {
      speedSelected = 2;
    }, function () {
      return speedSelected === 2;
    }), new SidebarButton(BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3, TIME_BUTTON_Y, TIME_BUTTON_SIZE, function () {
      ctx.drawImage(timer3img, BUTTON_X + (TIME_BUTTON_SIZE + SIDEBAR_MARGIN) * 3 + TIME_ICON_MARGIN, TIME_BUTTON_Y + TIME_ICON_MARGIN, TIME_ICON_SIZE, TIME_ICON_SIZE);
    }, function () {
      speedSelected = 3;
    }, function () {
      return speedSelected === 3;
    }), new SidebarButton(BUTTON_X, CELL_BUTTON_ROW1_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X, CELL_BUTTON_ROW1_Y, 0);
    }, function () {
      cellSelected = 0;
    }, function () {
      return cellSelected === 0;
    }), new SidebarButton(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW1_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW1_Y, 1);
    }, function () {
      cellSelected = 1;
    }, function () {
      return cellSelected === 1;
    }), new SidebarButton(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW1_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW1_Y, 2);
    }, function () {
      cellSelected = 2;
    }, function () {
      return cellSelected === 2;
    }), new SidebarButton(BUTTON_X, CELL_BUTTON_ROW2_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X, CELL_BUTTON_ROW2_Y, 3);
    }, function () {
      cellSelected = 3;
    }, function () {
      return cellSelected === 3;
    }), new SidebarButton(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW2_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, CELL_BUTTON_ROW2_Y, 4);
    }, function () {
      cellSelected = 4;
    }, function () {
      return cellSelected === 4;
    }), new SidebarButton(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW2_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, CELL_BUTTON_ROW2_Y, 5);
    }, function () {
      cellSelected = 5;
    }, function () {
      return cellSelected === 5;
    }), new SidebarButton(BUTTON_X, CELL_BUTTON_ROW2_Y, CELL_BUTTON_SIZE, function () {
      drawCellIcon(BUTTON_X, CELL_BUTTON_ROW2_Y, 3);
    }, function () {
      cellSelected = 3;
    }, function () {
      return cellSelected === 3;
    }), new SidebarButton(BUTTON_X, BRUSH_BUTTON_Y, CELL_BUTTON_SIZE, function () {
      ctx.drawImage(brush0img, BUTTON_X + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
    }, function () {
      brushSelected = 0;
    }, function () {
      return brushSelected === 0;
    }), new SidebarButton(BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN, BRUSH_BUTTON_Y, CELL_BUTTON_SIZE, function () {
      ctx.drawImage(brush1img, BUTTON_X + CELL_BUTTON_SIZE + SIDEBAR_MARGIN + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
    }, function () {
      brushSelected = 1;
    }, function () {
      return brushSelected === 1;
    }), new SidebarButton(BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2, BRUSH_BUTTON_Y, CELL_BUTTON_SIZE, function () {
      ctx.drawImage(brush2img, BUTTON_X + (CELL_BUTTON_SIZE + SIDEBAR_MARGIN) * 2 + CELL_ICON_MARGIN, BRUSH_BUTTON_Y + CELL_ICON_MARGIN, CELL_ICON_SIZE, CELL_ICON_SIZE);
    }, function () {
      brushSelected = 2;
    }, function () {
      return brushSelected === 2;
    })];

    function cellColor(cellType) {
      switch (cellType) {
        case GRASS:
          return '#4C7426';
        case CIV:
          return '#AAAA11';
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
        case FAUNA:
          return '#5e4b00';
        case WALL:
          return '#000000';
        default:
          console.log(cellType);
          return '#FF0000';
      }
    }

    var canvas = void 0;
    var ctx = void 0;

    var lastTime = null;

    var grid = void 0;

    var turnTimer = 0;

    var speedSelected = 1;
    var speeds = [1.0, 0.5, 0.2, 0.1];

    var cellSelected = 0;
    var cells = [TREE, GRASS, CIV, DIRT, WATER, WALL];

    var brushSelected = 1;

    var paused = false;

    var mouseLoc = { x: 0, y: 0 };

    var mouseDownTracker = false;

    function paint() {
      var gridX = Math.floor(mouseLoc.x / CELL_SIZE);
      var gridY = Math.floor(mouseLoc.y / CELL_SIZE);

      var brushSize = brushes[brushSelected];

      for (var bx = gridX - brushSize, bxMax = gridX + brushSize; bx <= bxMax; bx++) {
        for (var by = gridY - brushSize, byMax = gridY + brushSize; by <= byMax; by++) {
          var dx = Math.abs(gridX - bx);
          var dy = Math.abs(gridY - by);
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

    var brush0img = void 0;
    var brush1img = void 0;
    var brush2img = void 0;

    var timer0img = void 0;
    var timer1img = void 0;
    var timer2img = void 0;
    var timer3img = void 0;

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

      canvas.addEventListener('mousemove', function (event) {
        var rect = canvas.getBoundingClientRect();
        mouseLoc.x = event.clientX - rect.left;
        mouseLoc.y = event.clientY - rect.top;
        if (mouseDownTracker) {
          paint();
        }
      }, false);

      canvas.addEventListener("mousedown", function () {
        mouseDownTracker = true;
        paint();
      });
      canvas.addEventListener("mouseup", function () {
        for (var i = 0; i < sidebarButtons.length; i++) {
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
        if (x !== 0 && y !== 0 && northwestNode(x, y) === WATER || x !== 0 && !(northNode(x, y) & WATER_FLOWS) && westNode(x, y) === WATER || y !== 0 && !(westNode(x, y) & WATER_FLOWS) && northNode(x, y) === WATER) {
          return WATER;
        }
      }

      if (grid[x][y] & BUILDABLE) {
        if ((allNeighborCount(x, y, TREE | GRASS | FAUNA) >= 3 || hasNeighbor(x, y, TREE)) && oneAxis(x, y, CIV)) {
          return CIV;
        }
      }

      if (grid[x][y] & FAUNA_ROAMS) {
        if (!hasNeighbor(x, y, CIV) && allNeighborCount(x, y, BAREN) <= 2 && hasDiagnalNeighbor(x, y, FAUNA) && !hasDirectNeighbor(x, y, FAUNA)) {
          return FAUNA;
        }
      }

      if (grid[x][y] === DIRT) {
        if (allNeighborCount(x, y, CIV) >= 4) {
          return ROCK;
        }
        if (hasNeighbor(x, y, WATER) || allNeighborCount(x, y, PLANT) > allNeighborCount(x, y, CIV) + 2) {
          return GRASS;
        }
      }

      if (grid[x][y] === GRASS) {
        if (allNeighborCount(x, y, TREE) >= 3 && !hasNeighbor(x, y, CIV)) {
          return GROWTH;
        }
        if (allNeighborCount(x, y, PLANT) < allNeighborCount(x, y, EATS | BAREN) + 1) {
          return DIRT;
        }
      }

      if (grid[x][y] === ROCK) {
        if (!hasNeighbor(x, y, CIV) && allNeighborCount(x, y, TREE | FAUNA) >= 2 || allNeighborCount(x, y, PLANT | FAUNA) >= 4) {
          return DIRT;
        }
        if (allNeighborCount(x, y, WATER) >= 4) {
          return DIRT;
        }
      }

      if (grid[x][y] === CIV) {
        if (isAllDirectNeighbors(x, y, CIV) || allNeighborCount(x, y, CIV) > allNeighborCount(x, y, GRASS)) {
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
        if (allNeighborCount(x, y, GROWTH) === 2 && hasNeighbor(x, y, WATER)) {
          return FAUNA;
        }
        return TREE;
      }

      if (grid[x][y] === FAUNA) {
        if (allNeighborCount(x, y, CIV) >= 2) {
          return CIV;
        }
        if (hasNeighbor(x, y, CIV)) {
          return DIRT;
        }
        if (allNeighborCount(x, y, EATS) > allNeighborCount(x, y, PLANT)) {
          return GRASS;
        }
      }

      if (grid[x][y] === WATER) {
        if (hasNeighbor(x, y, CIV)) {
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
      return westNode(x, y) & flag || eastNode(x, y) & flag || northNode(x, y) & flag || southNode(x, y) & flag;
    }

    function hasDiagnalNeighbor(x, y, flag) {
      return northwestNode(x, y) & flag || northeastNode(x, y) & flag || southwestNode(x, y) & flag || southeastNode(x, y) & flag;
    }

    function hasNeighbor(x, y, flag) {
      return westNode(x, y) & flag || eastNode(x, y) & flag || northNode(x, y) & flag || southNode(x, y) & flag || northwestNode(x, y) & flag || southwestNode(x, y) & flag || northeastNode(x, y) & flag || southeastNode(x, y) & flag;
    }

    function allNeighbors(x, y, flag) {
      return westNode(x, y) & flag && eastNode(x, y) & flag && northNode(x, y) & flag && southNode(x, y) & flag && northwestNode(x, y) & flag && southwestNode(x, y) & flag && northeastNode(x, y) & flag && southeastNode(x, y) & flag;
    }

    function directNeighborCount(x, y, flag) {
      var count = 0;
      if (westNode(x, y) & flag) count++;
      if (eastNode(x, y) & flag) count++;
      if (northNode(x, y) & flag) count++;
      if (southNode(x, y) & flag) count++;
      return count;
    }

    function isAllDirectNeighbors(x, y, flag) {
      return westNode(x, y) & flag && eastNode(x, y) & flag && northNode(x, y) & flag && southNode(x, y) & flag;
    }

    function allNeighborCount(x, y, flag) {
      var count = 0;
      if (westNode(x, y) & flag) count++;
      if (eastNode(x, y) & flag) count++;
      if (northNode(x, y) & flag) count++;
      if (southNode(x, y) & flag) count++;
      if (northwestNode(x, y) & flag) count++;
      if (southwestNode(x, y) & flag) count++;
      if (northeastNode(x, y) & flag) count++;
      if (southeastNode(x, y) & flag) count++;
      return count;
    }

    function oneAxis(x, y, flag) {
      return (westNode(x, y) & flag || eastNode(x, y) & flag) !== (northNode(x, y) & flag || southNode(x, y) & flag);
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

      for (var i = 0; i < sidebarButtons.length; i++) {
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
  }, {}] }, {}, [1]);