import { vec3 } from 'gl-matrix';
import { createWebGL2Context } from './utils/GLUtils';
import { WebGLRenderer } from './engine/WebGLRenderer';
import { Shader } from './engine/Shader';
import { Camera, ProjectionMode } from './engine/Camera';
import { Transform } from './engine/Transform';
import { Mesh } from './geometry/Mesh';
import { Cube } from './geometry/Cube';
import { Sphere } from './geometry/Sphere';
import { Cylinder } from './geometry/Cylinder';
import { Prism } from './geometry/Prism';
import { DirectionalLight } from './lighting/DirectionalLight';
import { PointLight } from './lighting/PointLight';
import { phongVertexShader, phongFragmentShader } from './shaders/phong';
import { SceneControls } from './ui/SceneControls';

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

// Create point light
const pointLightPosition = vec3.fromValues(2, 1, 2);
const pointLightColor = vec3.fromValues(1, 1, 1); // White light
const pointLight = new PointLight(pointLightPosition, pointLightColor, 1.0);
console.log('Point light created');

// Create all geometries
const cubeGeometry = Cube.create(gl, 1.0);
const sphereGeometry = Sphere.create(gl, 1.0, 32, 16);
const cylinderGeometry = Cylinder.create(gl, 0.5, 2.0, 32);
const prismTriangleGeometry = Prism.create(gl, 0.7, 2.0, 3);
const prismHexagonGeometry = Prism.create(gl, 0.7, 2.0, 6);
let currentGeometry = cubeGeometry;
const meshTransform = new Transform();
meshTransform.setPosition(0, 0, 0);
let mesh = new Mesh(currentGeometry, meshTransform);
console.log('Geometries created (Cube, Sphere, Cylinder, Prism x2)');

// Load and apply texture
import { TextureLoader } from './loaders/TextureLoader';
TextureLoader.load(gl, '/models/texture.png').then(texture => {
  mesh.setTexture(texture);
  console.log('Texture applied to mesh');
});

// Create UI controls
const controls = new SceneControls({
  lighting: {
    ambientStrength: 0.2,
    direction: { x: 0, y: -1, z: -1 },
    color: '#ffffff',
    intensity: 1.0,
    specularStrength: 0.5,
    shininess: 32,
    pointLight: {
      position: { x: 2, y: 1, z: 2 },
      color: '#ffffff',
      intensity: 1.0,
      constant: 1.0,
      linear: 0.09,
      quadratic: 0.032,
    },
  },
  camera: {
    fov: 75,
    distance: 5,
    projectionMode: 'Perspective',
    orthoSize: 5,
  },
  animation: {
    speed: 1.0,
    autoRotate: true,
    rotationSpeedX: 30,
    rotationSpeedY: 50,
  },
  geometry: {
    type: 'Cube',
  },
});

// Update scene when controls change
controls.onChange(() => {
  // Update light direction
  light.setDirection(
    controls.params.lighting.direction.x,
    controls.params.lighting.direction.y,
    controls.params.lighting.direction.z
  );

  // Update light color from hex
  const hex = controls.params.lighting.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  vec3.set(light.color, r, g, b);
  light.intensity = controls.params.lighting.intensity;

  // Update point light
  pointLight.setPosition(
    controls.params.lighting.pointLight.position.x,
    controls.params.lighting.pointLight.position.y,
    controls.params.lighting.pointLight.position.z
  );
  const pointHex = controls.params.lighting.pointLight.color.replace('#', '');
  const pointR = parseInt(pointHex.substring(0, 2), 16) / 255;
  const pointG = parseInt(pointHex.substring(2, 4), 16) / 255;
  const pointB = parseInt(pointHex.substring(4, 6), 16) / 255;
  vec3.set(pointLight.color, pointR, pointG, pointB);
  pointLight.intensity = controls.params.lighting.pointLight.intensity;
  pointLight.constant = controls.params.lighting.pointLight.constant;
  pointLight.linear = controls.params.lighting.pointLight.linear;
  pointLight.quadratic = controls.params.lighting.pointLight.quadratic;

  // Update camera
  camera.setFOV(controls.params.camera.fov);
  camera.setPosition(0, 0, controls.params.camera.distance);
  
  // Update projection mode
  const newMode = controls.params.camera.projectionMode === 'Perspective' 
    ? ProjectionMode.PERSPECTIVE 
    : ProjectionMode.ORTHOGRAPHIC;
  camera.setProjectionMode(newMode);
  camera.setOrthoSize(controls.params.camera.orthoSize);

  // Update geometry if type changed
  if (controls.params.geometry.type === 'Cube') {
    if (currentGeometry !== cubeGeometry) {
      currentGeometry = cubeGeometry;
      const oldTexture = mesh.texture;
      mesh = new Mesh(currentGeometry, meshTransform);
      mesh.setTexture(oldTexture);
    }
  } else if (controls.params.geometry.type === 'Sphere') {
    if (currentGeometry !== sphereGeometry) {
      currentGeometry = sphereGeometry;
      const oldTexture = mesh.texture;
      mesh = new Mesh(currentGeometry, meshTransform);
      mesh.setTexture(oldTexture);
    }
  } else if (controls.params.geometry.type === 'Cylinder') {
    if (currentGeometry !== cylinderGeometry) {
      currentGeometry = cylinderGeometry;
      const oldTexture = mesh.texture;
      mesh = new Mesh(currentGeometry, meshTransform);
      mesh.setTexture(oldTexture);
    }
  } else if (controls.params.geometry.type === 'Prism (Triangle)') {
    if (currentGeometry !== prismTriangleGeometry) {
      currentGeometry = prismTriangleGeometry;
      const oldTexture = mesh.texture;
      mesh = new Mesh(currentGeometry, meshTransform);
      mesh.setTexture(oldTexture);
    }
  } else if (controls.params.geometry.type === 'Prism (Hexagon)') {
    if (currentGeometry !== prismHexagonGeometry) {
      currentGeometry = prismHexagonGeometry;
      const oldTexture = mesh.texture;
      mesh = new Mesh(currentGeometry, meshTransform);
      mesh.setTexture(oldTexture);
    }
  }
});

console.log('UI controls created');

// Animation
let time = 0;

// Render loop
function render(): void {
  const deltaTime = 0.01 * controls.params.animation.speed;
  
  if (controls.params.animation.autoRotate) {
    time += deltaTime;
    // Rotate mesh on X and Y axes
    meshTransform.setRotation(
      time * controls.params.animation.rotationSpeedX,
      time * controls.params.animation.rotationSpeedY,
      0
    );
  }

  // Clear screen
  renderer.clear();

  // Use shader
  shader.use();

  // Set MVP matrices
  shader.setMat4('u_model', mesh.getModelMatrix());
  shader.setMat4('u_view', camera.getViewMatrix());
  shader.setMat4('u_projection', camera.getProjectionMatrix());
  
  // Set normal matrix
  // gl-matrix mat3 is compatible with Float32Array
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setMat3('u_normalMatrix', meshTransform.getNormalMatrix() as Float32Array);

  // Bind texture if available
  if (mesh.texture) {
    shader.setInt('u_useTexture', 1);
    shader.setInt('u_texture', 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mesh.texture);
  } else {
    shader.setInt('u_useTexture', 0);
  }

  // Set lighting uniforms
  const lightData = light.getUniformData();
  // gl-matrix vec3 is compatible with Float32Array
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_lightDirection', lightData.direction as Float32Array);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  shader.setVec3Array('u_lightColor', lightData.color as Float32Array);
  shader.setFloat('u_ambientStrength', controls.params.lighting.ambientStrength);

  // Set specular uniforms
  shader.setFloat('u_specularStrength', controls.params.lighting.specularStrength);
  shader.setFloat('u_shininess', controls.params.lighting.shininess);
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

  // Render mesh
  mesh.render(gl);

  // Request next frame
  requestAnimationFrame(render);
}

// Start rendering
console.log('Starting render loop...');
render();
