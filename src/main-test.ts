import { Scene } from './engine/Scene';
import { Camera } from './engine/Camera';
import { FirstPersonController } from './controllers/FirstPersonController';
import { OBJLoader } from './loaders/OBJLoader';
import { TextureLoader } from './loaders/TextureLoader';
import { Mesh } from './geometry/Mesh';
import { Transform } from './engine/Transform';
import { Sphere } from './geometry/Sphere';
import { Cube } from './geometry/Cube';
import { DirectionalLight } from './lighting/DirectionalLight';
import { Shader } from './engine/Shader';
import { phongVertexShader, phongFragmentShader } from './shaders/phong';

// Get canvas
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const typedCanvas = canvas;

// Initialize WebGL
const gl = canvas.getContext('webgl2');
if (!gl) {
  throw new Error('WebGL2 not supported');
}

// Configure WebGL
gl.viewport(0, 0, canvas.width, canvas.height);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

// Create Shader
const shader = new Shader(gl, phongVertexShader, phongFragmentShader);

// Create Scene
const scene = new Scene();

// Create camera
const camera = new Camera(75, typedCanvas.width / typedCanvas.height, 0.1, 100);
camera.setPosition(0, 3, 10);
camera.setTarget(0, 0, 0);

// Handle resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  camera.aspect = window.innerWidth / window.innerHeight;
  // Camera update is automatic in getProjectionMatrix
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// Lighting - Phong shader expects uniforms, Scene doesn't manage lights automatically yet
// We'll pass these via shader.setUniforms in the render loop or modify Scene.render to accept lights?
// For now, let's manually set light uniforms.
const dirLight = new DirectionalLight(
  [1, 1, 1] as unknown as Float32Array, // Direction (using type assertion for now or vec3)
  [1, 1, 1] as unknown as Float32Array, // Color
  0.8 // Intensity
);

// Add some spheres to show scene graph is working
const sphereGeometry = Sphere.create(gl, 1, 32, 16);

// Left Sphere (No Texture)
const sphere1Transform = new Transform();
sphere1Transform.setPosition(-3, 0, 0);
const sphere1 = new Mesh(sphereGeometry, sphere1Transform);
scene.addObject('sphere1', sphere1, sphere1Transform);

// Right Sphere (Textured)
const sphere2Transform = new Transform();
sphere2Transform.setPosition(3, 0, 0);
const sphere2 = new Mesh(sphereGeometry, sphere2Transform);
scene.addObject('sphere2', sphere2, sphere2Transform);

// Cube (Textured)
const cubeGeometry = Cube.create(gl, 1);
const cubeTransform = new Transform();
cubeTransform.setPosition(0, 2, 0);
const cube = new Mesh(cubeGeometry, cubeTransform);
scene.addObject('cube', cube, cubeTransform);

// Load Hat Model + Texture
let hatModel: Mesh | null = null;
let hatTransform: Transform | null = null;

// Async Load Function
async function loadContent() {
  try {
    console.log('Starting content loading...');

    // Load Texture
    console.log('Loading texture...');
    const texture = await TextureLoader.load(gl!, '/models/texture.png');
    console.log('Texture loaded successfully');

    // Apply texture to sphere2 and cube
    // Mesh class doesn't have setTexture method yet based on errors? 
    // Wait, Scene.ts imports Mesh but I don't see Mesh definition in imports of logic.
    // Mesh is likely a class I should import or define interface usage.
    // In Scene.ts: import { Mesh } from './Mesh';
    // Let's assume Mesh has a texture property or similar.
    // If NOT, I need to check Mesh.ts. Use 'any' cast for now or check Mesh.ts.
    // Assuming I will add texture support to Mesh class or it's dynamic.
    // Actually, I didn't update Mesh.ts yet! I completely missed that.
    // I need to update Mesh.ts to hold texture.
    
    // For now, let's attach texture property dynamically to verify
    (sphere2 as any).texture = texture;
    (cube as any).texture = texture;

    // Load Hat Model
    console.log('Loading hat model...');
    const hatGeometry = await OBJLoader.load(gl!, '/models/model.obj');
    console.log('Hat model loaded. Indices:', hatGeometry.getIndexCount());

    hatTransform = new Transform();
    hatTransform.setPosition(0, -1, 0);
    hatTransform.setScale(0.15, 0.15, 0.15);
    
    hatModel = new Mesh(hatGeometry, hatTransform);
    (hatModel as any).texture = texture;
    
    scene.addObject('hatModel', hatModel, hatTransform);
    console.log('Hat model added to scene');

  } catch (err) {
    console.error('Error loading content:', err);
  }
}

loadContent();

// FPS Controller
const fpsController = new FirstPersonController(camera, typedCanvas);

// Instructions
const infoParams = {
  instructions: 'Click to start. WASD to move, Space/Shift to fly.',
  status: 'Loading models...',
};

const infoDiv = document.createElement('div');
Object.assign(infoDiv.style, {
  position: 'absolute',
  top: '10px',
  left: '10px',
  color: 'white',
  fontFamily: 'monospace',
  pointerEvents: 'none',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '10px',
});
document.body.appendChild(infoDiv);

function updateInfo() {
  const hatStatus = hatModel ? 'Loaded' : 'Loading...';
  infoDiv.innerHTML = `
    Instructions: ${infoParams.instructions}<br>
    Hat Model: ${hatStatus}<br>
    Objects: ${scene.getAllObjects().length}
  `;
}

// Rotation helpers
let cubeRotX = 0;
let cubeRotY = 0;
let hatRotY = 0;

// Game Loop
let lastTime = 0;
function animate(time: number) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  fpsController.update(deltaTime);

  // Update object rotations
  cubeRotX += 1.0 * deltaTime;
  cubeRotY += 1.0 * deltaTime;
  cubeTransform.setRotation(cubeRotX, cubeRotY, 0);

  sphere2Transform.setRotation(0, cubeRotY, 0);

  if (hatTransform) {
      hatRotY += 0.5 * deltaTime;
      hatTransform.setRotation(0, hatRotY, 0);
  }

  // Clear screen
  gl!.clearColor(0.1, 0.1, 0.1, 1);
  gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

  // Activate shader
  shader.use();

  // Update global uniforms (Camera & Lights)
  const viewMatrix = camera.getViewMatrix();
  const projectionMatrix = camera.getProjectionMatrix();
  
  shader.setMat4('u_view', viewMatrix);
  shader.setMat4('u_projection', projectionMatrix);
  
  // Set lights
  const lightData = dirLight.getUniformData();
  shader.setVec3('u_lightDirection', lightData.direction as Float32Array);
  shader.setVec3('u_lightColor', lightData.color as Float32Array);
  shader.setFloat('u_ambientStrength', 0.2);
  
  shader.setFloat('u_specularStrength', 0.5);
  shader.setFloat('u_shininess', 32.0);
  shader.setVec3('u_viewPos', camera.position as Float32Array);

  // Render Scene
  // We need to pass logic to bind texture if it exists
  // The current Scene.render only loops and calls mesh.draw().
  // mesh.draw() calls geometry.draw().
  // We need to bind texture BEFORE mesh.draw() or inside it.
  
  // Since Scene.render is simple, let's just iterate manually for this test
  // to support textures until we update Mesh/Scene classes properly.
  const objects = scene.getAllObjects();
  for (const obj of objects) {
      const mesh = obj.mesh;
      const transform = obj.transform;
      
      shader.setMat4('u_model', transform.getModelMatrix());
      shader.setMat3('u_normalMatrix', transform.getNormalMatrix() as Float32Array);
      
      // Check for texture
      const texture = (mesh as any).texture;
      if (texture) {
          shader.setInt('u_useTexture', 1);
          shader.setInt('u_texture', 0); // Texture unit 0
          gl!.activeTexture(gl!.TEXTURE0);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
      } else {
          shader.setInt('u_useTexture', 0);
      }
      
      // Use Mesh.render which calls geometry.draw internally via VAO binding + drawElements
      mesh.render(gl!);
  }
  
  updateInfo();

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
