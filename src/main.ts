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
import { OrbitController } from './controllers/OrbitController';
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
import { OBJLoader } from './loaders/OBJLoader';

// Object counter for unique naming
let objectCounter = 2; // Start at 2 (main=0, satellite=1)

// Track previous selected object to detect selection changes
let previousSelectedId: string | null = null;

// Create Game Camera (Fixed View) - MUST be before controls (referenced in onChange)
const gameCamera = new Camera(60, typedCanvas.width / typedCanvas.height, 0.1, 100);
gameCamera.setPosition(10, 10, 10);
gameCamera.setTarget(0, 0, 0);
console.log('Game Camera initialized');


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
  gameCamera: {
    position: { x: 10, y: 10, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    fov: 60,
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
    cameraMode: 'FPS', // 'None' | 'FPS' | 'Orbit'
    movementSpeed: 5.0,
    mouseSensitivity: 0.002,
    orbitSensitivity: 0.005,
  },
  objects: {
    list: [
      { id: 'main', name: 'Main Cube', type: 'Cube' },
      { id: 'satellite', name: 'Satellite', type: 'Sphere' },
    ],
    selectedId: null,
    geometryTypeToAdd: 'Cube', // Default geometry type
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    addObjectRequested: false,
    removeObjectRequested: false,
  },
});

// Update object list dropdown after initialization
controls.updateObjectList();

// Load hat model (after controls initialization)
let hatMesh: Mesh | null = null;
void OBJLoader.load(gl, '/models/model.obj').then((hatGeometry) => {
  const hatTransform = new Transform();
  hatTransform.setPosition(3, 0, 0);
  hatTransform.setScale(0.1, 0.1, 0.1);
  hatMesh = new Mesh(hatGeometry, hatTransform);
  
  void TextureLoader.load(gl, '/models/texture.png').then((hatTexture) => {
    if (hatMesh) {
      hatMesh.setTexture(hatTexture);
      scene.addObject('hat', hatMesh, hatTransform);
      controls.params.objects.list.push({ id: 'hat', name: 'Hat Model', type: 'OBJ' });
      controls.updateObjectList();
      console.log('Hat model loaded and added to scene');
    }
  }).catch((err: unknown) => console.error('Failed to load hat texture:', err));
}).catch((err: unknown) => console.error('Failed to load hat model:', err));

// Also load texture for existing meshes
void TextureLoader.load(gl, '/models/texture.png').then((texture) => {
  mesh.setTexture(texture);
  satelliteMesh.setTexture(texture);
  console.log('Texture applied to meshes');
});

// FPS Controller (initially null)
let fpsController: FirstPersonController | null = null;

// Orbit Controller for Game View (always active for gameCamera)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let orbitController: OrbitController | null = null;

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


function switchCameraMode(cameraMode: string) {
  switch (cameraMode) {
    case 'FPS':
      // Enable FPS mode
      if (!fpsController) {
        fpsController = new FirstPersonController(camera, typedCanvas);
        typedCanvas.addEventListener('click', canvasClickHandler);
        console.log('FPS Controller enabled');
      }
      fpsController.setMovementSpeed(controls.params.controls.movementSpeed);
      fpsController.setMouseSensitivity(controls.params.controls.mouseSensitivity);

      // Disable orbit if active
      if (orbitController) {
        orbitController.destroy();
        orbitController = null;
      }
      break;

    case 'Orbit':
      // Enable Orbit mode
      if (!orbitController) {
        orbitController = new OrbitController(camera, typedCanvas);
        console.log('Orbit Controller enabled');
      }
      orbitController.setSensitivity(controls.params.controls.orbitSensitivity);
      orbitController.setDistance(controls.params.camera.distance);

      // Disable FPS if active
      if (fpsController) {
        fpsController = null;
        typedCanvas.removeEventListener('click', canvasClickHandler);
        if (document.pointerLockElement === typedCanvas) {
          document.exitPointerLock();
        }
      }
      break;

    case 'None':
    default:
      // Disable both controllers
      if (fpsController) {
        fpsController = null;
        typedCanvas.removeEventListener('click', canvasClickHandler);
        if (document.pointerLockElement === typedCanvas) {
          document.exitPointerLock();
        }
        camera.setPosition(0, 0, controls.params.camera.distance);
        camera.setTarget(0, 0, 0);
        console.log('FPS Controller disabled');
      }
      if (orbitController) {
        orbitController.destroy();
        orbitController = null;
        console.log('Orbit Controller disabled');
      }
      break;
  }
}

// Initialize camera mode (enable FPS by default)
switchCameraMode(controls.params.controls.cameraMode);

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
  
  // Only reset camera position if NOT using FPS or Orbit controller
  // Those controllers manage camera position themselves
  if (controls.params.controls.cameraMode === 'None') {
    camera.setPosition(0, 0, controls.params.camera.distance);
  }
  
  // Update projection mode
  const newMode = controls.params.camera.projectionMode === 'Perspective' 
    ? ProjectionMode.PERSPECTIVE 
    : ProjectionMode.ORTHOGRAPHIC;
  camera.setProjectionMode(newMode);
  camera.setOrthoSize(controls.params.camera.orthoSize);

  // Update game camera
  gameCamera.setPosition(
    controls.params.gameCamera.position.x,
    controls.params.gameCamera.position.y,
    controls.params.gameCamera.position.z
  );
  gameCamera.setTarget(
    controls.params.gameCamera.target.x,
    controls.params.gameCamera.target.y,
    controls.params.gameCamera.target.z
  );
  gameCamera.setFOV(controls.params.gameCamera.fov);


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

  switchCameraMode(controls.params.controls.cameraMode);

  // Check action flags set by button clicks
  if (controls.params.objects.addObjectRequested) {
    controls.params.objects.addObjectRequested = false; // Clear flag
  
    // Use geometryTypeToAdd from dropdown instead of global geometry.type
    const geometryType = controls.params.objects.geometryTypeToAdd;
    let newGeometry = cubeGeometry;
    let geometryName = 'Cube';
    
    switch (geometryType) {
      case 'Sphere':
        newGeometry = sphereGeometry;
        geometryName = 'Sphere';
        break;
      case 'Cylinder':
        newGeometry = cylinderGeometry;
        geometryName = 'Cylinder';
        break;
      case 'Prism (Triangle)':
        newGeometry = prismTriangleGeometry;
        geometryName = 'Triangle';
        break;
      case 'Prism (Hexagon)':
        newGeometry = prismHexagonGeometry;
        geometryName = 'Hexagon';
        break;
      default:
        newGeometry = cubeGeometry;
        geometryName = 'Cube';
    }
    
    // Create new object
    const objectId = `object_${objectCounter}`;
    const objectName = `${geometryName} ${objectCounter}`;
    const newTransform = new Transform();
    newTransform.setPosition(objectCounter * 2, 0, 0); // Offset each new object
    const newMesh = new Mesh(newGeometry, newTransform);
    
    // Add to scene
    scene.addObject(objectId, newMesh, newTransform);
    
    // Add to controls list
    controls.params.objects.list.push({ id: objectId, name: objectName, type: geometryName });
    controls.updateObjectList();
    
    objectCounter++;
    console.log(`Added object: ${objectName}`);
  }
  
  // Check remove action flag
  if (controls.params.objects.removeObjectRequested) {
    controls.params.objects.removeObjectRequested = false; // Clear flag
  
    if (controls.params.objects.selectedId) {
      const selectedId = controls.params.objects.selectedId;
      
      // Remove from scene
      scene.removeObject(selectedId);
      
      // Remove from controls list
      const index = controls.params.objects.list.findIndex(obj => obj.id === selectedId);
      if (index !== -1) {
        controls.params.objects.list.splice(index, 1);
      }
      
      // Clear selection
      controls.params.objects.selectedId = null;
      controls.updateObjectList();
      
      console.log(`Removed object: ${selectedId}`);
    }
  }
  
  // Handle object selection change
  const currentSelectedId = controls.params.objects.selectedId;
  
  // Check if selection actually changed
  if (currentSelectedId !== previousSelectedId) {
    previousSelectedId = currentSelectedId;
    
    // Update transform UI to match newly selected object
    if (currentSelectedId) {
      const selectedObj = scene.getObject(currentSelectedId);
      if (selectedObj) {
        const pos = selectedObj.transform.position;
        const rot = selectedObj.transform.rotation;
        const scl = selectedObj.transform.scale;
        
        // Sync UI with object's current values
        controls.params.objects.transform.position.x = pos[0];
        controls.params.objects.transform.position.y = pos[1];
        controls.params.objects.transform.position.z = pos[2];
        
        controls.params.objects.transform.rotation.x = rot[0];
        controls.params.objects.transform.rotation.y = rot[1];
        controls.params.objects.transform.rotation.z = rot[2];
        
        controls.params.objects.transform.scale.x = scl[0];
        controls.params.objects.transform.scale.y = scl[1];
        controls.params.objects.transform.scale.z = scl[2];
      }
    }
  } else if (currentSelectedId) {
    // Selection didn't change - check if sliders were modified by user
    const selectedObj = scene.getObject(currentSelectedId);
    if (selectedObj) {
      const pos = selectedObj.transform.position;
      const rot = selectedObj.transform.rotation;
      const scl = selectedObj.transform.scale;
      
      const uiPos = controls.params.objects.transform.position;
      const uiRot = controls.params.objects.transform.rotation;
      const uiScl = controls.params.objects.transform.scale;
      
      // Check if UI sliders differ from object's current values (user moved sliders)
      const posChanged = Math.abs(uiPos.x - pos[0]) > 0.001 ||
                         Math.abs(uiPos.y - pos[1]) > 0.001 ||
                         Math.abs(uiPos.z - pos[2]) > 0.001;
      
      const rotChanged = Math.abs(uiRot.x - rot[0]) > 0.001 ||
                         Math.abs(uiRot.y - rot[1]) > 0.001 ||
                         Math.abs(uiRot.z - rot[2]) > 0.001;
      
      const sclChanged = Math.abs(uiScl.x - scl[0]) > 0.001 ||
                         Math.abs(uiScl.y - scl[1]) > 0.001 ||
                         Math.abs(uiScl.z - scl[2]) > 0.001;
      
      // Only apply if user actually changed sliders
      if (posChanged) {
        selectedObj.transform.setPosition(uiPos.x, uiPos.y, uiPos.z);
      }
      
      if (rotChanged) {
        selectedObj.transform.setRotation(uiRot.x, uiRot.y, uiRot.z);
      }
      
      if (sclChanged) {
        selectedObj.transform.setScale(uiScl.x, uiScl.y, uiScl.z);
      }
    }
  }
});


console.log('UI controls created');


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

  // Handle camera controller state when switching away from Engine view
  if (mode !== 'engine') {
    // Exit pointer lock and reset camera mode
    document.exitPointerLock();
    if (controls.params.controls.cameraMode !== 'None') {
      controls.params.controls.cameraMode = 'None';
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
  }
  
  // Auto-rotate if enabled (independent of camera mode)
  if (controls.params.animation.autoRotate) {
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
