/* global require module Float32Array Uint8Array */
const WebGLUtils = require('./WebGLUtils.js');
const ShaderAttribute = require('./ShaderAttribute.js');
const ShaderUniform = require('./ShaderUniform.js');
const vertShader = require('../shaders/vert.glsl');
const fragShader = require('../shaders/frag.glsl');
const createCamera = require('perspective-camera');
const glMatrix = require('gl-matrix');
const rayPick = require('camera-picking-ray');

const {
  mat4
} = glMatrix;

class Renderer {
  constructor(glCanvas) {
    this.glCanvas = glCanvas;
    this.gl = glCanvas.getContext('webgl');
    const gl = this.gl;
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    //gl.cullFace(gl.FRONT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // this.triangles = new Float32Array([
    //   // top face
    //   -.5, -.5, 0,
    //   +.5, -.5, 0,
    //   -.5,  .5, 0,
    //   -.5,  .5, 0,
    //   +.5, -.5, 0,
    //   +.5,  .5, 0
    // ]);

    const verts = new Float32Array([
      -.5, -.5, 0,
       .5, -.5, 0,
      -.5,  .5, 0,
       .5,  .5, 0,
      -.5, -.5, 10,
       .5, -.5, 10,
      -.5,  .5, 10,
       .5,  .5, 10
    ]);

    const indicies = new Uint8Array([
      1, 0, 2,
      3, 1, 2,
      4, 0, 1,
      4, 1, 5,
      5, 1, 3,
      5, 3, 7,
      6, 3, 2,
      6, 7, 3,
      0, 4, 2,
      4, 6, 2
    ]);

    const vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

//    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    this.vertexShader = WebGLUtils.createShader(
      gl, gl.VERTEX_SHADER, vertShader()
    );

    this.fragmentShader = WebGLUtils.createShader(
      gl, gl.FRAGMENT_SHADER, fragShader()
    );

    // create shader program
    this.program = WebGLUtils.createProgram(gl, this.vertexShader, this.fragmentShader);
    gl.useProgram( this.program );

    this.positionAttribute = new ShaderAttribute(
      gl, this.program, 'a_position', { size: 3 }
    );

    this.matrixUniform = new ShaderUniform(
      gl, this.program, 'u_mat'
    );

    this.colorUniform = new ShaderUniform(
      gl, this.program, 'u_color'
    );
    this.colorUniform.setUniform4fv(new Float32Array([1., 1., 0., 0.]));

    this.gl.clearColor( 0.0, 0.4, 0.4, 1.0 );

    this.viewport = [0, 0, gl.canvas.width, gl.canvas.height];

    this.camera = createCamera({ far: 9999, viewport: this.viewport });
    this.camera.position[2] = -35;
    this.projViewMat = mat4.create();
    this.finalMat = mat4.create();
    this.invProjViewMat = mat4.create();

  }

  updateCamera() {
    this.camera.update();
    mat4.multiply(this.projViewMat, this.camera.projection, this.camera.view);
    mat4.invert(this.invProjViewMat, this.projViewMat);
  }

  mouseRay(mouseLoc) {
    const rayOrigin = [0,0,0];
    const rayDir = [0,0,0];

    rayPick(rayOrigin, rayDir, mouseLoc, this.viewport, this.invProjViewMat);

    return { rayOrigin, rayDir };
  }

  renderPrep() {
    const  { gl } = this;
    gl.clear( gl.COLOR_BUFFER_BIT );
  }
}

module.exports = Renderer;
