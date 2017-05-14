/* globals Float32Array require module */
const Renderer = require('./Renderer.js');
const WorldMap = require('./WorldMap.js');
const cellTypes = require('./CellTypes.js');
const glMatrix = require('gl-matrix');
const unproject = require('camera-unproject');

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

const {
  vec3,
  mat4
} = glMatrix;

window.onload = init;

const canvasWidth = 1024;
const canvasHeight = 700;

let GRID_WIDTH = 50;
let GRID_HEIGHT = 50;

const CELL_SIZE = canvasHeight/GRID_HEIGHT;

let lastTime = null;
let turnTimer = 0;

let mouseLoc = [0, 0];

let mouseDownTracker = false;

let sidebar;
let worldMap;

let renderer;
let glCanvas;

let turnSpeed = 0.7;

const keys = [];

function init() {

  glCanvas = document.getElementById('glCanvas');
  glCanvas.width = canvasWidth;
  glCanvas.height = canvasHeight;
  renderer = new Renderer(glCanvas);

  worldMap = new WorldMap(GRID_WIDTH, GRID_HEIGHT);

  registerEventListeners();

  requestAnimationFrame(render);

}

function registerEventListeners() {


  window.onkeyup = (e) => { keys[e.keyCode] = false; };
  window.onkeydown = (e) => {
    keys[e.keyCode] = true;
    switch (e.keyCode) {
    case 49: // 0
      worldMap.selectedCellType = CIV;
      break;
    case 50: // 1
      worldMap.selectedCellType = TREE;
      break;
    case 51: // 2
      worldMap.selectedCellType = GRASS;
      break;
    case 52: // 3
      worldMap.selectedCellType = ROCK;
      break;
    case 53: // 4
      worldMap.selectedCellType = WATER;
      break;
    case 54: // 5
      worldMap.selectedCellType = DIRT;
      break;
    case 55: // 6
      worldMap.selectedCellType = WALL;
      break;
    case 81: // Q
      worldMap.highlightSize = Math.max(0, worldMap.highlightSize - 1);
      break;
    case 69: // E
      worldMap.highlightSize = Math.min(25, worldMap.highlightSize + 1);
      break;
    }
  };

  glCanvas.addEventListener('mousemove', (event) => {
    const rect = glCanvas.getBoundingClientRect();
    mouseLoc[0] = event.clientX - rect.left;
    mouseLoc[1] = event.clientY - rect.top;
    if (mouseDownTracker) {
      paint();
    }
  }, false);

  glCanvas.addEventListener("mousedown", () => {
    mouseDownTracker = true;
    paint();
  });
  glCanvas.addEventListener("mouseup", () => {
    mouseDownTracker = false;
  });
}

function render(time) {
  window.requestAnimationFrame(render);

  var dt = lastTime === null ? 0 : (time - lastTime) / 1000;
  lastTime = time;

  tick(dt);

  draw();
}

let cameraDist = 0;

function tick(dt) {
  turnTimer += dt;
  if (turnTimer >= turnSpeed) {
    turnTimer -= turnSpeed;
    worldMap.turn();
  }

  if (keys[90]) { // Z
    turnSpeed += turnSpeed * 1.5 * dt;
  } else if (keys[67]) { // C
    turnSpeed -= turnSpeed * 1.5 * dt;
  }

  turnSpeed = Math.min(1, Math.max(0.05, turnSpeed));

  renderer.gl.clearColor(0., 0.9 * (1.0 - turnSpeed), 0.9 * (1.0 - turnSpeed), 1.);

  const halfW = worldMap.width/2;
  const halfH = worldMap.height/2;

  const { camera } = renderer;

  if (keys[65]) { // Q
    cameraDist += dt * 1.0;
  } else if (keys[68]) { // E
    cameraDist -= dt * 1.0;
  }

  if (keys[83]) { // R
    camera.position[2] -= dt * 40.;
  } else if (keys[87]) { // F
    camera.position[2] += dt * 40.;
    camera.position[2] = Math.min(0, camera.position[2]);
  }

  camera.position[0] = halfW + Math.cos(cameraDist) * halfW * 1.8;
  camera.position[1] = halfH + Math.sin(cameraDist) * halfH * 1.8;
  // camera.position.x = 1; //Math.cos(lastTime);
  // camera.position.y = Math.sin(lastTime);
  camera.lookAt([halfW, halfH, 5]);
  camera.up = [0, 0, -1];

  renderer.updateCamera();

  const { rayOrigin, rayDir } = renderer.mouseRay(mouseLoc);


  // Find mouse hover
  // plane at Z = 0
  const planeZ = 0;
  const heightDiff = - rayOrigin[2] + planeZ;

  // const camDir = vec3.fromValues(
  //   camera.direction[0],
  //   camera.direction[1],
  //   camera.direction[2]
  // );
  // vec3.normalize(camDir, camDir);


  const t = heightDiff / rayDir[2];

  //console.log(t);

  const hoverGridX = Math.floor(rayOrigin[0] + t * rayDir[0] +.5);
  const hoverGridY = Math.floor(rayOrigin[1] + t * rayDir[1] +.5);

  worldMap.highlightLoc = {
    x: hoverGridX,
    y: hoverGridY
  };

  debugModelMat[12] = hoverGridX;
  debugModelMat[13] = hoverGridY;
  debugModelMat[14] = planeZ - 2;

  //console.log(worldMap.highlightLoc);

}

function paint() {
  worldMap.paintHighlight(TREE);
}

function draw() {
  renderer.renderPrep();
  worldMap.iterate((cell) => {
    cell.render(renderer);
  });
  drawDebug();
}

const debugModelMat = mat4.create();
const debugFinalMat = mat4.create();

function drawDebug() {

  mat4.multiply(debugFinalMat, renderer.projViewMat, debugModelMat);
  renderer.matrixUniform.setUniformMatrix4fv(debugFinalMat);
  renderer.colorUniform.setUniform4fv(worldMap.highlightColor());
  renderer.gl.drawElements(renderer.gl.TRIANGLES, 30, renderer.gl.UNSIGNED_BYTE, 0);
}
