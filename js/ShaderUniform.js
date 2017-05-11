/* global module */
class ShaderUniform {
  constructor(gl, program, name) {
    this.gl = gl;
    this.program = program;
    this.name = name;
    this.location = gl.getUniformLocation(program, name);
  }

  // Floats
  setUniform1f(v0) {
    this.gl.uniform1f(this.location, v0);
  }
  setUniform2f(v0, v1) {
    this.gl.uniform2f(this.location, v0, v1);
  }
  setUniform3f(v0, v1, v2) {
    this.gl.uniform3f(this.location, v0, v1, v2);
  }
  setUniform4f(v0, v1, v2, v3) {
    this.gl.uniform4f(this.location, v0, v1, v2, v3);
  }

  // Float vectors
  setUniform1fv(v) {
    this.gl.uniform1fv(this.location, v);
  }
  setUniform2fv(v) {
    this.gl.uniform2fv(this.location, v);
  }
  setUniform3fv(v) {
    this.gl.uniform3fv(this.location, v);
  }
  setUniform4fv(v) {
    this.gl.uniform4fv(this.location, v);
  }

  // Integers
  setUniform1i(v0) {
    this.gl.uniform1i(this.location, v0);
  }
  setUniform2i(v0, v1) {
    this.gl.uniform2i(this.location, v0, v1);
  }
  setUniform3i(v0, v1, v2) {
    this.gl.uniform3i(this.location, v0, v1, v2);
  }
  setUniform4i(v0, v1, v2, v3) {
    this.gl.uniform4i(this.location, v0, v1, v2, v3);
  }

  // Integer vectors
  setUniform1iv(v) {
    this.gl.uniform1iv(this.location, v);
  }
  setUniform2iv(v) {
    this.gl.uniform2iv(this.location, v);
  }
  setUniform3iv(v) {
    this.gl.uniform3iv(this.location, v);
  }
  setUniform4iv(v) {
    this.gl.uniform4iv(this.location, v);
  }

  // Matricies
  setUniformMatrix2fv(v) {
    this.gl.uniformMatrix2fv(this.location, false, v);
  }
  setUniformMatrix3fv(v) {
    this.gl.uniformMatrix3fv(this.location, false, v);
  }
  setUniformMatrix4fv(v) {
    this.gl.uniformMatrix4fv(this.location, false, v);
  }
}

module.exports = ShaderUniform;
