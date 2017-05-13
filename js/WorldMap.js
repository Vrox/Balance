/* globals require module Float32Array */
const GridSpace = require('./GridSpace.js');
const cellTypes = require('./CellTypes.js');
const perlin = require('perlin-noise');

const {
  GRASS,
  CIV,
  DIRT,
  TREE,
  ROCK,
  GROWTH,
  WATER,
  FAUNA,
  WALL
} = cellTypes.ids;

class WorldMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    const noise = perlin.generatePerlinNoise(width, height);

    const grid = [this.width];
    for (var x = 0; x < this.width; x++) {
      grid[x] = [this.height];
      for (var y = 0; y < this.height; y++) {
        grid[x][y] = new GridSpace(x, y, this, noise[y * width + x]);
      }
    }
    this.grid = grid;

    this.highlightLoc;
    this.highlightSize = 3;
    this.selectedCellType = CIV;

    this.iterate(cell => cell.link());

    grid[25][25].cellType = CIV;
    grid[25][26].cellType = CIV;

    grid[21][33].cellType = CIV;
    grid[22][33].cellType = CIV;

    grid[3][16].cellType = TREE;
    grid[4][16].cellType = TREE;
    grid[5][15].cellType = TREE;
    
    grid[23][17].cellType = TREE;
    grid[24][17].cellType = TREE;
    grid[25][17].cellType = TREE;
    grid[23][18].cellType = TREE;
    grid[24][18].cellType = TREE;
    grid[25][18].cellType = TREE;
    grid[23][19].cellType = TREE;
    grid[24][19].cellType = TREE;
    grid[25][19].cellType = TREE;
  }

  iterate(f) {
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        f(this.grid[x][y]);
      }
    }
  }

  turn() {
    const { width, height} = this;
    const gridCopy = [width];
    for (var x = 0; x < width; x++) {
      gridCopy[x] = [];
      for (var y = 0; y < height; y++) {
        gridCopy[x][y] = this.grid[x][y].resolve();
      }
    }
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        this.grid[x][y].cellType = gridCopy[x][y];
      }
    }
  }

  cellColor(gridX, gridY) {
    const color = this.grid[gridX][gridY].naturalColor();
    if (this.inHighlight(gridX, gridY)) {
      return [
        color[0] * 0.8,
        color[1] * 0.8,
        color[2] * 0.8,
        1
      ];
    }
    return (color);
  }

  hightlightInBounds() {
    const { x, y } = this.highlightLoc;
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  highlightColor() {
    if (!this.hightlightInBounds()) {
      return new Float32Array([
        0,0,0,1
      ]);
    }
    const color = cellTypes.colors[this.selectedCellType];
    return new Float32Array([
      color[0] * 1.2,
      color[1] * 1.2,
      color[2] * 1.2,
      1
    ]);
  }

  inHighlight(gridX, gridY) {
    if (this.highlightLoc === null) return false;
    const dx = Math.abs(this.highlightLoc.x - gridX);
    const dy = Math.abs(this.highlightLoc.y - gridY);
    return (dx * dx + dy * dy <= this.highlightSize * this.highlightSize);
  }

  paintHighlight() {
    this.paint(
      this.highlightLoc.x,
      this.highlightLoc.y,
      this.highlightSize,
      this.selectedCellType
    );
  }

  paint(gridX, gridY, brushSize, cellType) {
    for(let bx = gridX - brushSize, bxMax = gridX + brushSize; bx <= bxMax; bx++) {
      for(let by = gridY - brushSize, byMax = gridY + brushSize; by <= byMax; by++) {
        const dx = Math.abs(gridX - bx);
        const dy = Math.abs(gridY - by);
        if (dx * dx + dy * dy <= brushSize * brushSize) {
          this.paintCell(bx, by, cellType);
        }
      }
    }
  }

  paintCell(gridX, gridY, cellType) {
    if (gridX < 0 || gridY < 0 || gridX >= this.width || gridY >= this.height) return;
    this.grid[gridX][gridY].cellType = cellType;
  }



}

module.exports = WorldMap;
