import { vec3 } from 'gl-matrix';
import { createWebGL2Context } from './utils/GLUtils';
import { WebGLRenderer } from './engine/WebGLRenderer';
import { Shader } from './engine/Shader';
import { Camera } from './engine/Camera';
import { Transform } from './engine/Transform';
import { Mesh } from './geometry/Mesh';
import { Cube } from './geometry/Cube';
import { DirectionalLight } from './lighting/DirectionalLight';
import { phongVertexShader, phongFragmentShader } from './shaders/phong';

console.log('WebGL2 Game Engine - Starting...');

// Get canvas
const canvas = document.getElementById('canvas');

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

// Resize canvas to fill window
const typedCanvas = canvas; // Type narrowed to HTMLCanvasElement

function resizeCanvas(): void {
  typedCanvas.width = window.innerWidth;
  typedCanvas.height = window.innerHeight;
}

resizeCanvas();

console.log('Canvas initialized:', typedCanvas.width, 'x', typedCanvas.height);

// Create WebGL2 context
const gl = createWebGL2Context(typedCanvas);
console.log('WebGL2 context created');

// Create renderer
const renderer = new WebGLRenderer(gl, typedCanvas);
console.log('Renderer initialized');

// Create camera
const camera = new Camera(75, typedCanvas.width / typedCanvas.height, 0.1, 100);
camera.setPosition(0, 0, 5);
camera.setTarget(0, 0, 0);
console.log('Camera initialized');

// Update camera on resize
window.addEventListener('resize', () => {
  resizeCanvas();
  camera.setAspect(typedCanvas.width / typedCanvas.height);
});

// Create Blinn-Phong shader
const shader = new Shader(gl, phongVertexShader, phongFragmentShader);
console.log('Phong shaders compiled and linked');

// Create directional light
const lightDirection = vec3.fromValues(0, -1, -1);
const lightColor = vec3.fromValues(1, 1, 1); // White light
const light = new DirectionalLight(lightDirection, lightColor, 1.0);
console.log('Directional light created');

// Create cube mesh
const cubeGeometry = Cube.create(gl, 1.0);
const cubeTransform = new Transform();
cubeTransform.setPosition(0, 0, 0);
const cubeMesh = new Mesh(cubeGeometry, cubeTransform);
console.log('Cube mesh created');

// Animation
let time = 0;

// Render loop
function render(): void {
  time += 0.01;

  // Rotate cube on X and Y axes for better 3D effect
  cubeTransform.setRotation(time * 30, time * 50, 0);

  // Clear screen
  renderer.clear();

  // Use shader
  shader.use();

  // Set MVP matrices
  shader.setMat4('u_model', cubeMesh.getModelMatrix());
  shader.setMat4('u_view', camera.getViewMatrix());
  shader.setMat4('u_projection', camera.getProjectionMatrix());
  
  // Set normal matrix
  // gl-matrix mat3 is compatible with Float32Array
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setMat3('u_normalMatrix', cubeTransform.getNormalMatrix() as Float32Array);

  // Set lighting uniforms
  const lightData = light.getUniformData();
  // gl-matrix vec3 is compatible with Float32Array
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_lightDirection', lightData.direction as Float32Array);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_lightColor', lightData.color as Float32Array);
  shader.setFloat('u_ambientStrength', 0.2);

  // Render cube
  cubeMesh.render(gl);

  // Request next frame
  requestAnimationFrame(render);
}

// Start rendering
console.log('Starting render loop...');
render();
