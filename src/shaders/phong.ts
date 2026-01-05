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

// Directional light uniforms
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform float u_ambientStrength;

// Specular uniforms
uniform float u_specularStrength;
uniform float u_shininess;
uniform vec3 u_viewPos;

// Point light uniforms
uniform vec3 u_pointLightPos;
uniform vec3 u_pointLightColor;
uniform float u_pointLightConstant;
uniform float u_pointLightLinear;
uniform float u_pointLightQuadratic;

out vec4 fragColor;

void main() {
  vec3 norm = normalize(v_normal);
  vec3 viewDir = normalize(u_viewPos - v_fragPos);
  
  // === Ambient lighting ===
  vec3 ambient = u_ambientStrength * u_lightColor;
  
  // === Directional light ===
  vec3 lightDir = normalize(-u_lightDirection);
  
  // Diffuse
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse_dir = diff * u_lightColor;
  
  // Specular (Blinn-Phong)
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(norm, halfwayDir), 0.0), u_shininess);
  vec3 specular_dir = u_specularStrength * spec * u_lightColor;
  
  // === Point light ===
  vec3 pointLightDir = normalize(u_pointLightPos - v_fragPos);
  float distance = length(u_pointLightPos - v_fragPos);
  
  // Attenuation
  float attenuation = 1.0 / (u_pointLightConstant + 
                              u_pointLightLinear * distance + 
                              u_pointLightQuadratic * distance * distance);
  
  // Diffuse
  float diff_point = max(dot(norm, pointLightDir), 0.0);
  vec3 diffuse_point = diff_point * u_pointLightColor * attenuation;
  
  // Specular (Blinn-Phong)
  vec3 halfwayDir_point = normalize(pointLightDir + viewDir);
  float spec_point = pow(max(dot(norm, halfwayDir_point), 0.0), u_shininess);
  vec3 specular_point = u_specularStrength * spec_point * u_pointLightColor * attenuation;
  
  // === Combine all lighting ===
  vec3 result = (ambient + diffuse_dir + specular_dir + diffuse_point + specular_point) * v_color;
  fragColor = vec4(result, 1.0);
}
`;

