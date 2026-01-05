import { createWebGL2Context } from './utils/GLUtils';
import { WebGLRenderer } from './engine/WebGLRenderer';
import { Shader } from './engine/Shader';
import { basicVertexShader, basicFragmentShader } from './shaders/basic';

console.log('WebGL2 Game Engine - Starting...');

// Get canvas
const canvas = document.getElementById('canvas');

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

// Resize canvas to fill window
function resizeCanvas(): void {
  if (canvas instanceof HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

console.log('Canvas initialized:', canvas.width, 'x', canvas.height);

// Create WebGL2 context
const gl = createWebGL2Context(canvas);
console.log('WebGL2 context created');

// Create renderer
const renderer = new WebGLRenderer(gl, canvas);
console.log('Renderer initialized');

// Create shader
const shader = new Shader(gl, basicVertexShader, basicFragmentShader);
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
  3, // size (3 components per vertex)
  gl.FLOAT, // type
  false, // normalize
  6 * Float32Array.BYTES_PER_ELEMENT, // stride (6 floats: 3 pos + 3 color)
  0 // offset
);

// Color attribute (3 floats)
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(
  colorLocation,
  3, // size
  gl.FLOAT, // type
  false, // normalize
  6 * Float32Array.BYTES_PER_ELEMENT, // stride
  3 * Float32Array.BYTES_PER_ELEMENT // offset (after position)
);

console.log('Triangle geometry created');

// Render loop
function render(): void {
  // Clear screen
  renderer.clear();

  // Use shader
  shader.use();

  // Bind VAO and draw
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Request next frame
  requestAnimationFrame(render);
}

// Start rendering
console.log('Starting render loop...');
render();
