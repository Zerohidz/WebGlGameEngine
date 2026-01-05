// Shader with MVP matrices and explicit attribute locations
export const mvpVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;
layout(location = 2) in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}
`;

export const mvpFragmentShader = `#version 300 es
precision highp float;

in vec3 v_color;

out vec4 fragColor;

void main() {
  fragColor = vec4(v_color, 1.0);
}
`;
