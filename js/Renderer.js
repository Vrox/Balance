/* global require module Float32Array */
const WebGLUtils = require('./WebGLUtils.js');
const ShaderAttribute = require('./ShaderAttribute.js');
const ShaderUniform = require('./ShaderUniform.js');
const vertShader = require('../shaders/vert.glsl');
const fragShader = require('../shaders/frag.glsl');
const createCamera = require('perspective-camera');
const glMatrix = require('gl-matrix');

const {
  mat4
} = glMatrix;

class Renderer {
  constructor(glCanvas) {
    this.glCanvas = glCanvas;
    this.gl = glCanvas.getContext('webgl');
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.triangles = new Float32Array([
      -1, -1, 0,
      +1, -1, 0,
      -1,  1, 0,
      -1,  1, 0,
      +1, -1, 0,
      +1,  1, 0
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

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

    this.gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    this.camera = createCamera({ far: 9999 });
    this.projViewMat = mat4.create();
    this.finalMat = mat4.create();

  }

  renderPrep() {
    const  { camera, projViewMat, gl } = this;
    camera.update();
    mat4.multiply(projViewMat, camera.projection, camera.view);

    gl.clear( gl.COLOR_BUFFER_BIT );
  }
}

module.exports = Renderer;
