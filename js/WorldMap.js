/* globals require module */
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

    this.iterate(cell => cell.link());

    grid[25][25].cellType = CIV;
    grid[25][26].cellType = CIV;

    grid[21][33].cellType = CIV;
    grid[22][33].cellType = CIV;

    grid[3][16].cellType = TREE;
    grid[4][16].cellType = TREE;
    grid[5][15].cellType = TREE;

    grid[30][27].cellType = WATER;
    grid[31][27].cellType = WATER;
    grid[30][28].cellType = WATER;
    grid[31][28].cellType = WATER;

    // grid[73][40].cellType = TREE;
    // grid[74][40].cellType = TREE;
    // grid[75][40].cellType = TREE;
    // grid[73][41].cellType = TREE;
    // grid[74][41].cellType = TREE;
    // grid[75][41].cellType = TREE;
    // grid[73][42].cellType = TREE;
    // grid[74][42].cellType = TREE;
    // grid[75][42].cellType = TREE;

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
    this.grid[gridX][gridY] = cellType;
  }
}

module.exports = WorldMap;
