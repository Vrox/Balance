/* global module */
class ShaderAttribute {
  constructor(gl, program, name, options) {
    this.gl = gl;
    this.program = program;
    this.name = name;
    this.location = gl.getAttribLocation(program, name);

    gl.enableVertexAttribArray(this.position);

    const {
      size = 1,
      dataType = gl.FLOAT,
      normalize = false,
      stride = 0,
      offset = 0
    } = options;

    gl.vertexAttribPointer(
      this.location,
      size,
      dataType,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(this.location);
  }
}

module.exports = ShaderAttribute;
