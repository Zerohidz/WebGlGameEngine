// Basic vertex shader for simple colored geometry
export const basicVertexShader = `#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_color;

out vec3 v_color;

void main() {
  v_color = a_color;
  gl_Position = vec4(a_position, 1.0);
}
`;

export const basicFragmentShader = `#version 300 es
precision highp float;

in vec3 v_color;

out vec4 fragColor;

void main() {
  fragColor = vec4(v_color, 1.0);
}
`;
