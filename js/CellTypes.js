/* global module Float32Array */
const ids = {
  GRASS: 1 << 0, // 1
  CIV: 1 << 1, // 2
  DIRT: 1 << 2, // 4
  TREE: 1 << 3, // 8
  ROCK: 1 << 4, // 16
  GROWTH: 1 << 5, // 32
  WATER: 1 << 6, // 64
  FAUNA: 1 << 7, // 128
  WALL: 1 << 8, // 256
};

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
} = ids;


const colors = {};
colors[GRASS] = new Float32Array([76/255, 116/255, 38/255, 1]);
colors[CIV] = new Float32Array([170/255, 170/255, 17/255, 1]);
colors[DIRT] = new Float32Array([129/255, 118/255, 42/255, 1]);
colors[TREE] = new Float32Array([33/255, 67/255, 0/255, 1]);
colors[ROCK] = new Float32Array([88/255, 103/255, 118/255, 1]);
colors[GROWTH] = new Float32Array([42/255, 81/255, 5/255, 1]);
colors[WATER] = new Float32Array([0/255, 102/255, 102/255, 1]);
colors[FAUNA] = new Float32Array([94/255, 75/255, 0/255, 1]);
colors[WALL] = new Float32Array([0, 0, 0, 1]);

const heights = {};
heights[GRASS] = 0.;
heights[CIV] = 0.9;
heights[DIRT] = -0.2;
heights[TREE] = 2.5;
heights[ROCK] = 0.5;
heights[GROWTH] = 1.5;
heights[WATER] = 0.0;
heights[FAUNA] = 0.8;
heights[WALL] = 3.0;

module.exports.ids = ids;
module.exports.colors = colors;
module.exports.heights = heights;
