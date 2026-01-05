// Blinn-Phong shaders with ambient and diffuse lighting
export const phongVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;
layout(location = 2) in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat3 u_normalMatrix;

out vec3 v_fragPos;
out vec3 v_normal;
out vec3 v_color;

void main() {
  // Transform position to world space
  v_fragPos = vec3(u_model * vec4(a_position, 1.0));
  
  // Transform normal to world space
  v_normal = u_normalMatrix * a_normal;
  
  // Pass color to fragment shader
  v_color = a_color;
  
  // Final position
  gl_Position = u_projection * u_view * vec4(v_fragPos, 1.0);
}
`;

export const phongFragmentShader = `#version 300 es
precision highp float;

in vec3 v_fragPos;
in vec3 v_normal;
in vec3 v_color;

uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform float u_ambientStrength;

out vec4 fragColor;

void main() {
  // Ambient lighting
  vec3 ambient = u_ambientStrength * u_lightColor;
  
  // Diffuse lighting
  vec3 norm = normalize(v_normal);
  vec3 lightDir = normalize(-u_lightDirection); // Negate because we want direction TO light
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * u_lightColor;
  
  // Combine lighting with object color
  vec3 result = (ambient + diffuse) * v_color;
  fragColor = vec4(result, 1.0);
}
`;
