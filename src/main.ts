import { createWebGL2Context } from './utils/GLUtils';
import { WebGLRenderer } from './engine/WebGLRenderer';
import { Shader } from './engine/Shader';
import { Camera } from './engine/Camera';
import { Transform } from './engine/Transform';
import { mvpVertexShader, mvpFragmentShader } from './shaders/mvp';

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
camera.setPosition(0, 0, 3);
camera.setTarget(0, 0, 0);
console.log('Camera initialized');

// Update camera on resize
window.addEventListener('resize', () => {
  resizeCanvas();
  camera.setAspect(typedCanvas.width / typedCanvas.height);
});

// Create shader with MVP matrices
const shader = new Shader(gl, mvpVertexShader, mvpFragmentShader);
console.log('Shaders compiled and linked');

// Create a simple triangle
const vertices = new Float32Array([
  // Position (x, y, z)    Color (r, g, b)
  0.0, 0.5, 0.0, 1.0, 0.0, 0.0, // Top vertex - Red
  -0.5, -0.5, 0.0, 0.0, 1.0, 0.0, // Bottom left - Green
  0.5, -0.5, 0.0, 0.0, 0.0, 1.0, // Bottom right - Blue
]);

// Create Vertex Array Object (VAO)
const vao = gl.createVertexArray();
if (!vao) {
  throw new Error('Failed to create VAO');
}
gl.bindVertexArray(vao);

// Create buffer
const buffer = gl.createBuffer();
if (!buffer) {
  throw new Error('Failed to create buffer');
}
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Setup attributes
const positionLocation = shader.getAttributeLocation('a_position');
const colorLocation = shader.getAttributeLocation('a_color');

// Position attribute (3 floats)
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(
  positionLocation,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  0
);

// Color attribute (3 floats)
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(
  colorLocation,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT
);

console.log('Triangle geometry created');

// Create transform for the triangle
const transform = new Transform();
transform.setPosition(0, 0, 0);

// Animation
let time = 0;

// Render loop
function render(): void {
  time += 0.01;
  
  // Rotate triangle
  transform.setRotation(0, time * 50, 0);
  
  // Clear screen
  renderer.clear();

  // Use shader
  shader.use();
  
  // Set MVP matrices
  shader.setMat4('u_model', transform.getModelMatrix());
  shader.setMat4('u_view', camera.getViewMatrix());
  shader.setMat4('u_projection', camera.getProjectionMatrix());

  // Bind VAO and draw
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Request next frame
  requestAnimationFrame(render);
}

// Start rendering
console.log('Starting render loop...');
render();
