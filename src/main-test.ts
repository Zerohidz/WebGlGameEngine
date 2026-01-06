import { vec3 } from 'gl-matrix';
import { createWebGL2Context } from './utils/GLUtils';
import { WebGLRenderer } from './engine/WebGLRenderer';
import { Shader } from './engine/Shader';
import { Camera } from './engine/Camera';
import { Transform } from './engine/Transform';
import { Mesh } from './geometry/Mesh';
import { Sphere } from './geometry/Sphere';
import { Scene } from './engine/Scene';
import { DirectionalLight } from './lighting/DirectionalLight';
import { PointLight } from './lighting/PointLight';
import { OBJLoader } from './loaders/OBJLoader';
import { FirstPersonController } from './controllers/FirstPersonController';
import { phongVertexShader, phongFragmentShader } from './shaders/phong';

console.log('WebGL2 Game Engine - Test Mode for Commits 10, 11, 13');

// Get canvas
const canvas = document.getElementById('canvas');

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

const typedCanvas = canvas;

function resizeCanvas(): void {
  typedCanvas.width = window.innerWidth;
  typedCanvas.height = window.innerHeight;
}

resizeCanvas();

// Create WebGL2 context
const gl = createWebGL2Context(typedCanvas);

// Create renderer
const renderer = new WebGLRenderer(gl, typedCanvas);

// Create camera
const camera = new Camera(75, typedCanvas.width / typedCanvas.height, 0.1, 100);
camera.setPosition(0, 2, 8);
camera.setTarget(0, 0, 0);

window.addEventListener('resize', () => {
  resizeCanvas();
  camera.setAspect(typedCanvas.width / typedCanvas.height);
});

// Create shader
const shader = new Shader(gl, phongVertexShader, phongFragmentShader);

// Create lights
const light = new DirectionalLight(
  vec3.fromValues(0, -1, -1),
  vec3.fromValues(1, 1, 1),
  1.0
);

const pointLight = new PointLight(
  vec3.fromValues(3, 2, 3),
  vec3.fromValues(1, 0.8, 0.6),
  1.5
);

// === TEST COMMIT 11: Scene Graph ===
console.log('Testing Commit 11: Scene Graph');
const scene = new Scene();

// Add multiple spheres at different positions
const sphere1Geo = Sphere.create(gl, 0.8, 32, 16);
const sphere1Transform = new Transform();
sphere1Transform.setPosition(-2, 0, 0);
const sphere1 = new Mesh(sphere1Geo, sphere1Transform);
scene.addObject('sphere1', sphere1, sphere1Transform);

const sphere2Geo = Sphere.create(gl, 0.8, 32, 16);
const sphere2Transform = new Transform();
sphere2Transform.setPosition(2, 0, 0);
const sphere2 = new Mesh(sphere2Geo, sphere2Transform);
scene.addObject('sphere2', sphere2, sphere2Transform);

const sphere3Geo = Sphere.create(gl, 0.8, 32, 16);
const sphere3Transform = new Transform();
sphere3Transform.setPosition(0, 0, -2);
const sphere3 = new Mesh(sphere3Geo, sphere3Transform);
scene.addObject('sphere3', sphere3, sphere3Transform);

console.log('Scene has', scene.getAllObjects().length, 'objects');

// === TEST COMMIT 10: OBJ Loader ===
console.log('Testing Commit 10: OBJ Loader');
let objMesh: Mesh | null = null;

OBJLoader.load(gl, '/models/cube.obj')
  .then(geometry => {
    console.log('OBJ loaded successfully:', geometry.getIndexCount(), 'indices');
    const objTransform = new Transform();
    objTransform.setPosition(0, -2, 0);
    objTransform.setScale(1.5, 1.5, 1.5);
    objMesh = new Mesh(geometry, objTransform);
    scene.addObject('objCube', objMesh, objTransform);
    console.log('OBJ added to scene. Total objects:', scene.getAllObjects().length);
  })
  .catch(error => {
    console.error('Failed to load OBJ:', error);
  });

// === TEST COMMIT 13: First Person Controller ===
console.log('Testing Commit 13: First Person Controller');
const fpsController = new FirstPersonController(camera, typedCanvas);
console.log('FPS Controller created. Click canvas and use WASD + mouse to move');

// Display instructions
const instructions = document.createElement('div');
instructions.style.position = 'absolute';
instructions.style.top = '10px';
instructions.style.left = '10px';
instructions.style.color = 'white';
instructions.style.fontFamily = 'monospace';
instructions.style.background = 'rgba(0,0,0,0.7)';
instructions.style.padding = '10px';
instructions.style.borderRadius = '5px';
instructions.innerHTML = `
<strong>Test Mode: Commits 10, 11, 13</strong><br>
<br>
<strong>Scene Graph (Commit 11):</strong><br>
- 3 spheres in scene<br>
- 1 OBJ cube (loaded async)<br>
<br>
<strong>OBJ Loader (Commit 10):</strong><br>
- Loading cube.obj from /models/<br>
- Check console for status<br>
<br>
<strong>FPS Controller (Commit 13):</strong><br>
- Click canvas to lock pointer<br>
- WASD: Move horizontally<br>
- Space: Move up<br>
- Shift: Move down<br>
- Mouse: Look around<br>
`;
document.body.appendChild(instructions);

// Render loop
let lastTime = performance.now();

function render(): void {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  // Update FPS controller
  fpsController.update(deltaTime);

  // Rotate spheres
  const time = currentTime / 1000;
  sphere1Transform.setRotation(time * 30, time * 40, 0);
  sphere2Transform.setRotation(0, time * 50, time * 30);
  sphere3Transform.setRotation(time * 40, 0, time * 50);

  // Rotate OBJ if loaded
  if (objMesh) {
    const objTransform = scene.getObject('objCube')?.transform;
    if (objTransform) {
      objTransform.setRotation(time * 20, time * 30, 0);
    }
  }

  // Clear screen
  renderer.clear();

  // Use shader
  shader.use();

  // Set lighting uniforms
  const lightData = light.getUniformData();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_lightDirection', lightData.direction as Float32Array);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_lightColor', lightData.color as Float32Array);
  shader.setFloat('u_ambientStrength', 0.3);

  // Set specular uniforms
  shader.setFloat('u_specularStrength', 0.5);
  shader.setFloat('u_shininess', 32);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_viewPos', camera.position as Float32Array);

  // Set point light uniforms
  const pointLightData = pointLight.getUniformData();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_pointLightPos', pointLightData.position as Float32Array);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_pointLightColor', pointLightData.color as Float32Array);
  shader.setFloat('u_pointLightConstant', pointLightData.constant);
  shader.setFloat('u_pointLightLinear', pointLightData.linear);
  shader.setFloat('u_pointLightQuadratic', pointLightData.quadratic);

  // Render scene using Scene Graph (Commit 11)
  scene.render(gl, shader, camera);

  requestAnimationFrame(render);
}

console.log('Starting test render loop...');
render();
