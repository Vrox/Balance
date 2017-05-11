/* globals Float32Array require module */
const Renderer = require('./Renderer.js');
const WorldMap = require('./WorldMap.js');
const Sidebar = require('./SideBar.js');
const glMatrix = require('gl-matrix');

const {
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

let mouseLoc = {x: 0, y:0};

let mouseDownTracker = false;

let sidebar;
let worldMap;

let renderer;

function init() {

  const glCanvas = document.getElementById('glCanvas');
  glCanvas.width = canvasWidth;
  glCanvas.height = canvasHeight;
  renderer = new Renderer(glCanvas);

  worldMap = new WorldMap(GRID_WIDTH, GRID_HEIGHT);
  sidebar = new Sidebar();

  registerEventListeners();

  requestAnimationFrame(render);

}

function registerEventListeners() {
  // glCanvas.addEventListener('mousemove', (event) => {
  //   const rect = glCanvas.getBoundingClientRect();
  //   mouseLoc.x = event.clientX - rect.left;
  //   mouseLoc.y = event.clientY - rect.top;
  //   if (mouseDownTracker) {
  //     paint();
  //   }
  // }, false);
  //
  // glCanvas.addEventListener("mousedown", () => {
  //   mouseDownTracker = true;
  //   paint();
  // });
  // glCanvas.addEventListener("mouseup", () => {
  //   sidebar.mouseUp(mouseLoc.x, mouseLoc.y);
  //   mouseDownTracker = false;
  // });
}

function paint() {
  worldMap.paint(
    Math.floor(mouseLoc.x / CELL_SIZE),
    Math.floor(mouseLoc.y / CELL_SIZE),
    sidebar.brushSize
  );
}

function render(time) {
  window.requestAnimationFrame(render);

  var dt = lastTime === null ? 0 : (time - lastTime) / 1000;
  lastTime = time;

  tick(dt);

  draw();
}

const combinedMat = mat4.create();

function tick(dt) {
  turnTimer += dt;
  if (turnTimer >= sidebar.speed) {
    turnTimer -= sidebar.speed;
    worldMap.turn();
  }

  const camera = renderer.camera;

  const halfW = worldMap.width/2;
  const halfH = worldMap.height/2;

//  console.log(camera.perspective);
  camera.position[2] = -35;
  camera.position[0] = halfW + Math.cos(lastTime/4000) * halfW * 1.8;
  camera.position[1] = halfH + Math.sin(lastTime/4000) * halfH * 1.8;
  // camera.position.x = 1; //Math.cos(lastTime);
  // camera.position.y = Math.sin(lastTime);
  camera.lookAt([halfW, halfH,0]);
  camera.up = [0, 0, -1];

}

function draw() {
  renderer.renderPrep();
  worldMap.iterate((cell) => {
    cell.render(renderer);
  });
}
