uniform mat4 u_mat;
attribute vec4 a_position;

void main() {
  gl_Position = u_mat * a_position;
}
