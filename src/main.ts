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
import { FirstPersonController } from './controllers/FirstPersonController';
import { Scene } from './engine/Scene';

console.log('WebGL2 Game Engine - Starting...');

// Get canvas
const canvas = document.getElementById('canvas');

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

// Resize canvas to fill window
const typedCanvas = canvas; // Type narrowed to HTMLCanvasElement


// Initial resize (without camera updates)
typedCanvas.width = window.innerWidth;
typedCanvas.height = window.innerHeight;

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
// Create scene
const scene = new Scene();

// Main object
const meshTransform = new Transform();
meshTransform.setPosition(0, 0, 0);
let mesh = new Mesh(currentGeometry, meshTransform);
scene.addObject('main', mesh, meshTransform);

// Satellite object (Hierarchy Test)
const satelliteTransform = new Transform();
satelliteTransform.setPosition(2, 0, 0); // 2 units away from main
satelliteTransform.setScale(0.3, 0.3, 0.3); // Smaller
satelliteTransform.setParent(meshTransform); // Child of main object

const satelliteMesh = new Mesh(sphereGeometry, satelliteTransform);
scene.addObject('satellite', satelliteMesh, satelliteTransform);

console.log('Scene graph initialized with Main Object and Satellite');

// View Modes
type ViewMode = 'engine' | 'game' | 'split';
let currentViewMode: ViewMode = 'engine';

// Get UI elements
const tabEngine = document.getElementById('tab-engine');
const tabGame = document.getElementById('tab-game');
const tabSplit = document.getElementById('tab-split');

// Load and apply texture
import { TextureLoader } from './loaders/TextureLoader';
TextureLoader.load(gl, '/models/texture.png').then(texture => {
  mesh.setTexture(texture);
  satelliteMesh.setTexture(texture); // Use same texture for satellite
  console.log('Texture applied to meshes');
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
  controls: {
    fpsMode: false,
    movementSpeed: 5.0,
    mouseSensitivity: 0.002,
  },
});

// FPS Controller (initially null)
let fpsController: FirstPersonController | null = null;

// Canvas click handler for pointer lock (only active when FPS mode is enabled AND in correct view)
const canvasClickHandler = (event: MouseEvent): void => {
  // Only lock pointer if:
  // 1. In Engine View (full) OR
  // 2. In Split View AND clicked on the LEFT half (Engine side)
  if (currentViewMode === 'engine') {
    void typedCanvas.requestPointerLock();
  } else if (currentViewMode === 'split') {
    // Check if click is on the left half
    const canvasRect = typedCanvas.getBoundingClientRect();
    const clickX = event.clientX - canvasRect.left;
    const halfWidth = canvasRect.width / 2;
    if (clickX < halfWidth) {
      void typedCanvas.requestPointerLock();
    }
  }
  // Do nothing in Game View or if clicked on right side of Split View
};

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
    }
  }

  // Update mesh geometry if changed
  if (mesh.geometry !== currentGeometry) {
      const oldTexture = mesh.texture;
      // Re-create mesh with new geometry but KEEP old transform
      mesh = new Mesh(currentGeometry, meshTransform);
      mesh.setTexture(oldTexture);
      // Update scene object references
      scene.removeObject('main');
      scene.addObject('main', mesh, meshTransform);
      
      // Re-attach satellite if needed (transform ref is same so parent link implies)
      // satelliteTransform.setParent(meshTransform); // Already set
  }

  // Handle FPS mode
  if (controls.params.controls.fpsMode) {
    // Enable FPS mode
    if (!fpsController) {
      fpsController = new FirstPersonController(camera, typedCanvas);
      // Add canvas click listener for pointer lock
      typedCanvas.addEventListener('click', canvasClickHandler);
      console.log('FPS Controller enabled');
    }
    // Update controller settings
    fpsController.setMovementSpeed(controls.params.controls.movementSpeed);
    fpsController.setMouseSensitivity(controls.params.controls.mouseSensitivity);
    // Disable auto-rotation
    controls.params.animation.autoRotate = false;
  } else {
    // Disable FPS mode
    if (fpsController) {
      fpsController = null;
      // Remove canvas click listener
      typedCanvas.removeEventListener('click', canvasClickHandler);
      // Exit pointer lock if active
      if (document.pointerLockElement === typedCanvas) {
        document.exitPointerLock();
      }
      // Reset camera to default position
      camera.setPosition(0, 0, controls.params.camera.distance);
      camera.setTarget(0, 0, 0);
      console.log('FPS Controller disabled');
    }
  }
});

console.log('UI controls created');

// Create Game Camera (Fixed View) - MUST be after main camera
const gameCamera = new Camera(60, typedCanvas.width / typedCanvas.height, 0.1, 100);
gameCamera.setPosition(10, 10, 10);
gameCamera.setTarget(0, 0, 0);
console.log('Game Camera initialized');


function resizeCanvas(): void {
  typedCanvas.width = window.innerWidth;
  typedCanvas.height = window.innerHeight;
  
  // Only update cameras if they exist (after initialization)
  if (camera && gameCamera && renderer) {
    renderer.setViewport(0, 0, typedCanvas.width, typedCanvas.height);
    
    // Only update aspect ratios if NOT in split view
    // Split view sets its own aspect ratios per viewport in render loop
    if (currentViewMode !== 'split') {
      const fullAspect = typedCanvas.width / typedCanvas.height;
      camera.setAspect(fullAspect);
      gameCamera.setAspect(fullAspect);
    }
  }
}

// Now we can safely add resize listener that uses cameras
window.addEventListener('resize', () => {
  resizeCanvas();
});


// Tab Switching Logic
function setViewMode(mode: ViewMode): void {
  currentViewMode = mode;
  
  // Update UI classes
  tabEngine?.classList.toggle('active', mode === 'engine');
  tabGame?.classList.toggle('active', mode === 'game');
  tabSplit?.classList.toggle('active', mode === 'split');

  // Handle FPS Controller state
  if (mode === 'engine') {
    // If returning to engine view, we might want to re-enable capabilities but NOT auto-lock
    // The user still needs to click to lock.
  } else {
    // Force exit FPS mode if switching away
    if (fpsController) {
      document.exitPointerLock();
      controls.params.controls.fpsMode = false;
      // We need to manually trigger the "disable" logic which is currently inside controls.onChange logic
      // Ideally we should refactor that, but for now let's just forcefully null it and remove listeners if we could access them.
      // Better approach: simulate the control change or just rely on the render loop check.
      // But we must stop the controller from updating.
    }
  }

  // Update aspect ratios immediately when switching modes
  if (mode === 'split') {
    // Set split view aspect ratios immediately
    const halfWidth = typedCanvas.width / 2;
    const height = typedCanvas.height;
    const splitAspect = halfWidth / height;
    camera.setAspect(splitAspect);
    gameCamera.setAspect(splitAspect);
  } else {
    // Set full screen aspect
    const fullAspect = typedCanvas.width / typedCanvas.height;
    camera.setAspect(fullAspect);
    gameCamera.setAspect(fullAspect);
  }

  // Update camera aspects
  resizeCanvas(); // re-trigger aspect calc
}

tabEngine?.addEventListener('click', () => setViewMode('engine'));
tabGame?.addEventListener('click', () => setViewMode('game'));
tabSplit?.addEventListener('click', () => setViewMode('split'));

// Animation
let time = 0;
let lastFrameTime = performance.now();

// Render loop
function render(): void {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;
  
  // Update FPS controller if active AND in Engine or Split View
  if ((currentViewMode === 'engine' || currentViewMode === 'split') && fpsController) {
    fpsController.update(deltaTime);
  } else if (controls.params.animation.autoRotate) {
    // Only auto-rotate if FPS mode is off
    time += 0.01 * controls.params.animation.speed;
    meshTransform.setRotation(
      time * controls.params.animation.rotationSpeedX,
      time * controls.params.animation.rotationSpeedY,
      0
    );
    
  // Satellite local rotation (spinning on its own axis)
    satelliteTransform.setRotation(0, time * 100, 0);
  }

  // Common Uniforms function
  const setUniforms = (cam: Camera): void => {
    // NOTE: Viewport should already be set by the caller!
    // Don't override it here or split view will break
    shader.use();

    // Lighting
    const lightData = light.getUniformData();
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    shader.setVec3Array('u_lightDirection', lightData.direction as Float32Array);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    shader.setVec3Array('u_lightColor', lightData.color as Float32Array);
    shader.setFloat('u_ambientStrength', controls.params.lighting.ambientStrength);

    shader.setFloat('u_specularStrength', controls.params.lighting.specularStrength);
    shader.setFloat('u_shininess', controls.params.lighting.shininess);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    shader.setVec3Array('u_viewPos', cam.position as Float32Array);

    const pointLightData = pointLight.getUniformData();
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    shader.setVec3Array('u_pointLightPos', pointLightData.position as Float32Array);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    shader.setVec3Array('u_pointLightColor', pointLightData.color as Float32Array);
    shader.setFloat('u_pointLightConstant', pointLightData.constant);
    shader.setFloat('u_pointLightLinear', pointLightData.linear);
    shader.setFloat('u_pointLightQuadratic', pointLightData.quadratic);
  };

  // RENDER LOGIC
  renderer.setScissorTest(false); // Default disable

  if (currentViewMode === 'engine') {
    // --- ENGINE VIEW (Full) ---
    renderer.setViewport(0, 0, typedCanvas.width, typedCanvas.height);
    renderer.setClearColor(0, 0, 0, 1); // Black background
    renderer.clear();
    setUniforms(camera);
    scene.render(gl, shader, camera);

  } else if (currentViewMode === 'game') {
    // --- GAME VIEW (Full) ---
    renderer.setViewport(0, 0, typedCanvas.width, typedCanvas.height);
    renderer.setClearColor(0.1, 0.1, 0.2, 1); // Slight blue tint for game view
    renderer.clear();
    setUniforms(gameCamera);
    scene.render(gl, shader, gameCamera);

  } else if (currentViewMode === 'split') {
    // --- SPLIT VIEW ---
    const halfWidth = typedCanvas.width / 2;
    const height = typedCanvas.height;

    // enable scissor test
    renderer.setScissorTest(true);

    // 1. LEFT SIDE (Engine View)
    const splitAspect = halfWidth / height;
    renderer.setViewport(0, 0, halfWidth, height);
    renderer.setScissor(0, 0, halfWidth, height);
    renderer.setClearColor(0, 0, 0, 1);
    renderer.clear();
    
    // Set aspect for this specific viewport
    camera.setAspect(splitAspect);
    setUniforms(camera);
    scene.render(gl, shader, camera);

    // 2. RIGHT SIDE (Game View)
    renderer.setViewport(halfWidth, 0, halfWidth, height);
    renderer.setScissor(halfWidth, 0, halfWidth, height);
    renderer.setClearColor(0.1, 0.1, 0.2, 1);
    renderer.clear();

    // Set aspect for this specific viewport
    gameCamera.setAspect(splitAspect);
    setUniforms(gameCamera); 
    scene.render(gl, shader, gameCamera);

    // Restore scissors
    renderer.setScissorTest(false);
  }

  // Request next frame
  requestAnimationFrame(render);
}

// Start rendering
console.log('Starting render loop...');
render();
