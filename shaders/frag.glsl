precision mediump float;

uniform vec4 u_color;
varying float v_depth;

void main() {
  float d = 1.0 - v_depth/10.;
  gl_FragColor = u_color * d * d;
}
