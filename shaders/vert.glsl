uniform mat4 u_mat;
attribute vec4 a_position;
varying float v_depth;

void main() {
  v_depth = a_position.z;
  gl_Position = u_mat * a_position;
}
