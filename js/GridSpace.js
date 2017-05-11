/* global require module */
const glMatrix = require('gl-matrix');

const {
  mat4
} = glMatrix;

const cellTypes = require('./CellTypes.js');

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

const BUILDABLE = GRASS | DIRT;
const WATER_FLOWS = GRASS | DIRT;
const PLANT = GRASS | TREE | GROWTH;
const FOREST = TREE | GROWTH;
const FAUNA_ROAMS = GRASS | TREE | GROWTH | WATER;
const EATS = CIV | FAUNA;
const BAREN = ROCK | WALL;

class GridSpace {

  constructor(x, y, worldMap) {
    this.x = x;
    this.y = y;
    this.worldMap = worldMap;
    this.modelMatrix = mat4.create();
    this.modelMatrix[12] = x;
    this.modelMatrix[13] = y;
    this.cellType = GRASS;
  }

  // This isn't done in the constructor because all adjacent gridspaces must already
  // be instantiated
  link() {
    const {x, y} = this;
    const {width, height, grid} = this.worldMap;
    this.westNode = grid[x === 0 ? width - 1 : x - 1][y];
    this.eastNode = grid[x === width - 1 ? 0 : x + 1][y];
    this.northNode = grid[x][y === 0 ? height - 1 : y - 1];
    this.southNode = grid[x][y === height - 1 ? 0 : y + 1];
    this.northwestNode = grid[x === 0 ? width - 1 : x - 1][y === 0 ? height - 1 : y - 1];
    this.northeastNode = grid[x === width - 1 ? 0 : x + 1][y === 0 ? height - 1 : y - 1];
    this.southwestNode = grid[x === 0 ? width - 1 : x - 1][y === height - 1 ? 0 : y + 1];
    this.southeastNode = grid[x === width - 1 ? 0 : x + 1][y === height - 1 ? 0 : y + 1];
  }

  set cellType(type) {
    this._cellType = type;
    this.modelMatrix[14] = cellTypes.heights[type];
  }
  get cellType() {
    return this._cellType;
  }

  resolve() {
    const {cellType, x, y} = this;
    const {
      northNode,
      northeastNode,
      eastNode,
      southeastNode,
      southNode,
      southwestNode,
      westNode,
      northwestNode
    } = this;

    if (cellType & WATER_FLOWS) {
      if (((x !== 0 && y !== 0) && northwestNode.cellType === WATER) ||
      (x !==0 && !(northNode.cellType & WATER_FLOWS) && westNode.cellType === WATER) ||
      (y !== 0 && !(westNode.cellType & WATER_FLOWS) && northNode.cellType === WATER)) {
        return WATER;
      }
    }

    if (cellType & BUILDABLE) {
      if ((this.allNeighborCount(TREE | GRASS | FAUNA) >= 3 || this.hasNeighbor(TREE)) && this.oneAxis(CIV)) {
        return CIV;
      }
    }

    if (cellType & FAUNA_ROAMS) {
      if (!this.hasNeighbor(CIV) && this.allNeighborCount(BAREN) <= 2 && this.hasDiagnalNeighbor(FAUNA) && !this.hasDirectNeighbor(FAUNA)) {
        return FAUNA;
      }
    }

    if (cellType === DIRT) {
      if (this.allNeighborCount(CIV) >= 4) {
        return ROCK;
      }
      if (this.hasNeighbor(WATER) || this.allNeighborCount(PLANT) > this.allNeighborCount(CIV) + 2) {
        return GRASS;
      }
    }

    if (cellType === GRASS) {
      if (this.allNeighborCount(TREE) >= 3 && !this.hasNeighbor(CIV)) {
        return GROWTH;
      }
      if (this.allNeighborCount(PLANT) < this.allNeighborCount(EATS | BAREN) + 1) {
        return DIRT;
      }
    }

    if (cellType === ROCK) {
      if (!this.hasNeighbor(CIV) && this.allNeighborCount(TREE | FAUNA) >= 2 || this.allNeighborCount( PLANT | FAUNA) >= 4) {
        return DIRT;
      }
      if (this.allNeighborCount(WATER) >= 4) {
        return DIRT;
      }
    }

    if (cellType === CIV) {
      if (this.isAllDirectNeighbors(CIV) ||
        this.allNeighborCount(CIV) > this.allNeighborCount(GRASS)) {
        return ROCK;
      }
      if (!this.hasDirectNeighbor(CIV)) {
        return DIRT;
      }
    }

    if (cellType === TREE) {
      if (this.hasDirectNeighbor(CIV)) {
        return DIRT;
      }
    }

    if (cellType === GROWTH) {
      if (this.allNeighborCount(GROWTH) === 2 && this.hasNeighbor(WATER)) {
        return FAUNA;
      }
      return TREE;
    }

    if (cellType === FAUNA) {
      if (this.allNeighborCount(CIV) >= 2) {
        return CIV;
      }
      if (this.hasNeighbor(CIV)) {
        return DIRT;
      }
      if (this.allNeighborCount(EATS) > this.allNeighborCount(PLANT)) {
        return GRASS;
      }
    }

    if (cellType === WATER) {
      if (this.hasNeighbor(CIV)) {
        return GRASS;
      }
      if (this.hasDirectNeighbor(FOREST) && this.allNeighborCount(WATER) >= 3) {
        return GROWTH;
      }
      if (this.allNeighborCount(TREE) > 4 && !this.hasNeighbor(WATER)) {
        return GRASS;
      }
    }

    return cellType;
  }


  hasDirectNeighbor(flag) {
    return this.westNode.cellType & flag ||
      this.eastNode.cellType & flag ||
      this.northNode.cellType & flag ||
      this.southNode.cellType & flag;
  }

  hasDiagnalNeighbor(flag) {
    return this.northwestNode.cellType & flag ||
      this.northeastNode.cellType & flag ||
      this.southwestNode.cellType & flag ||
      this.southeastNode.cellType & flag;
  }

  hasNeighbor(flag) {
    return this.westNode.cellType & flag ||
      this.eastNode.cellType & flag ||
      this.northNode.cellType & flag ||
      this.southNode.cellType & flag ||
      this.northwestNode.cellType & flag ||
      this.southwestNode.cellType & flag ||
      this.northeastNode.cellType & flag ||
      this.southeastNode.cellType & flag;
  }

  allNeighbors(x, y, flag) {
    return this.westNode.cellType & flag &&
      this.eastNode.cellType & flag &&
      this.northNode.cellType & flag &&
      this.southNode.cellType & flag &&
      this.northwestNode.cellType & flag &&
      this.southwestNode.cellType & flag &&
      this.northeastNode.cellType & flag &&
      this.southeastNode.cellType & flag;
  }

  directNeighborCount(x, y, flag) {
    let count = 0;
    if (this.westNode.cellType & flag) count++;
    if (this.eastNode.cellType & flag) count++;
    if (this.northNode.cellType & flag) count++;
    if (this.southNode.cellType & flag) count++;
    return count;
  }

  isAllDirectNeighbors(flag) {
    return this.westNode.cellType & flag &&
      this.eastNode.cellType & flag &&
      this.northNode.cellType & flag &&
      this.southNode.cellType & flag;
  }

  allNeighborCount(flag) {
    let count = 0;
    if (this.westNode.cellType & flag) count++;
    if (this.eastNode.cellType & flag) count++;
    if (this.northNode.cellType & flag) count++;
    if (this.southNode.cellType & flag) count++;
    if (this.northwestNode.cellType & flag) count++;
    if (this.southwestNode.cellType & flag) count++;
    if (this.northeastNode.cellType & flag) count++;
    if (this.southeastNode.cellType & flag) count++;
    return count;
  }

  oneAxis(flag) {
    return (this.westNode.cellType & flag || this.eastNode.cellType & flag) !==
      (this.northNode.cellType & flag || this.southNode.cellType & flag);
  }

  render(renderer) {
    mat4.multiply(renderer.finalMat, renderer.projViewMat, this.modelMatrix);
    renderer.matrixUniform.setUniformMatrix4fv(renderer.finalMat);
    renderer.colorUniform.setUniform4fv(cellTypes.colors[this.cellType]);
    renderer.gl.drawArrays( renderer.gl.TRIANGLES, 0, 6 );
  }

}

module.exports = GridSpace;
