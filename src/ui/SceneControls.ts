import GUI from 'lil-gui';

import { Scene } from '../engine/Scene';
import { Camera } from '../engine/Camera';
import { Light } from '../lighting/Light';
import { WebGLRenderer } from '../engine/WebGLRenderer';

/**
 * Control parameters interface
 */
export interface ControlParams {
  lighting: {
    ambientStrength: number;
    direction: { x: number; y: number; z: number };
    color: string; // hex color
    intensity: number;
    specularStrength: number;
    shininess: number;
    pointLight: {
      position: { x: number; y: number; z: number };
      color: string;
      intensity: number;
      constant: number;
      linear: number;
      quadratic: number;
    };
  };
  camera: {
    fov: number;
    distance: number;
    projectionMode: string; // 'Perspective' | 'Orthographic'
    orthoSize: number;
  };
  gameCamera: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  };
  animation: {
    speed: number;
    autoRotate: boolean;
    rotationSpeedX: number;
    rotationSpeedY: number;
  };
  geometry: {
    type: string; // 'Cube' | 'Sphere' | 'Cylinder' | 'Prism (Triangle)' | 'Prism (Hexagon)'
  };
  controls: {
    cameraMode: string; // 'None' | 'FPS' | 'Orbit'
    movementSpeed: number;
    mouseSensitivity: number;
    orbitSensitivity: number;
  };
  objects: {
    list: Array<{ id: string; name: string; type: string }>;
    selectedId: string | null;
    geometryTypeToAdd: string; // Geometry type for next added object
    transform: {
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      scale: { x: number; y: number; z: number };
    };
    // Action flags (set by button clicks, cleared by main.ts)
    addObjectRequested: boolean;
    removeObjectRequested: boolean;
    clearSceneRequested: boolean;
  };
}

/**
 * Scene controls using lil-gui
 * Provides UI for adjusting lighting, camera, and animation parameters
 */
export class SceneControls {
  gui: GUI;
  params: ControlParams;
  private changeCallback?: () => void;
  private onLoadOBJ?: (name: string, content: string) => void;

  constructor(params: ControlParams, _scene: Scene, _camera: Camera, _light: Light, _renderer: WebGLRenderer, onLoadOBJ?: (name: string, content: string) => void) {
    this.params = params;
    this.onLoadOBJ = onLoadOBJ;

    
    this.gui = new GUI({ title: 'Engine Controls' });

    this.setupLightingControls();
    this.setupCameraControls();
    this.setupGameCameraControls();
    this.setupAnimationControls();
    this.setupGeometryControls();
    this.setupControlsControls();
    this.setupObjectManagementControls();
  }

  /**
   * Setup specular controls (part of lighting)
   */
  private setupSpecularControls(lightingFolder: GUI): void {
    lightingFolder
      .add(this.params.lighting, 'specularStrength', 0.0, 1.0, 0.01)
      .name('Specular Strength')
      .onChange(() => this.triggerChange());

    lightingFolder
      .add(this.params.lighting, 'shininess', 2, 256, 1)
      .name('Shininess')
      .onChange(() => this.triggerChange());
  }

  /**
   * Setup point light controls (part of lighting)
   */
  private setupPointLightControls(lightingFolder: GUI): void {
    const pointLightFolder = lightingFolder.addFolder('Point Light');

    const positionFolder = pointLightFolder.addFolder('Position');
    positionFolder
      .add(this.params.lighting.pointLight.position, 'x', -10, 10, 0.5)
      .name('X')
      .onChange(() => this.triggerChange());
    positionFolder
      .add(this.params.lighting.pointLight.position, 'y', -10, 10, 0.5)
      .name('Y')
      .onChange(() => this.triggerChange());
    positionFolder
      .add(this.params.lighting.pointLight.position, 'z', -10, 10, 0.5)
      .name('Z')
      .onChange(() => this.triggerChange());

    pointLightFolder
      .addColor(this.params.lighting.pointLight, 'color')
      .name('Color')
      .onChange(() => this.triggerChange());

    pointLightFolder
      .add(this.params.lighting.pointLight, 'intensity', 0.0, 3.0, 0.1)
      .name('Intensity')
      .onChange(() => this.triggerChange());

    const attenuationFolder = pointLightFolder.addFolder('Attenuation');
    attenuationFolder
      .add(this.params.lighting.pointLight, 'constant', 0.0, 2.0, 0.01)
      .name('Constant')
      .onChange(() => this.triggerChange());
    attenuationFolder
      .add(this.params.lighting.pointLight, 'linear', 0.0, 1.0, 0.01)
      .name('Linear')
      .onChange(() => this.triggerChange());
    attenuationFolder
      .add(this.params.lighting.pointLight, 'quadratic', 0.0, 1.0, 0.001)
      .name('Quadratic')
      .onChange(() => this.triggerChange());

    pointLightFolder.open();
  }

  /**
   * Setup lighting controls folder
   */
  private setupLightingControls(): void {
    const lightingFolder = this.gui.addFolder('Lighting');
    
    lightingFolder
      .add(this.params.lighting, 'ambientStrength', 0.0, 1.0, 0.01)
      .name('Ambient Strength')
      .onChange(() => this.triggerChange());

    const directionFolder = lightingFolder.addFolder('Light Direction');
    directionFolder
      .add(this.params.lighting.direction, 'x', -1.0, 1.0, 0.1)
      .name('X')
      .onChange(() => this.triggerChange());
    directionFolder
      .add(this.params.lighting.direction, 'y', -1.0, 1.0, 0.1)
      .name('Y')
      .onChange(() => this.triggerChange());
    directionFolder
      .add(this.params.lighting.direction, 'z', -1.0, 1.0, 0.1)
      .name('Z')
      .onChange(() => this.triggerChange());

    lightingFolder
      .addColor(this.params.lighting, 'color')
      .name('Color')
      .onChange(() => this.triggerChange());

    lightingFolder
      .add(this.params.lighting, 'intensity', 0.0, 3.0, 0.1)
      .name('Intensity')
      .onChange(() => this.triggerChange());

    // Add specular controls
    this.setupSpecularControls(lightingFolder);

    // Add point light controls
    this.setupPointLightControls(lightingFolder);

    lightingFolder.open();
  }

  /**
   * Setup camera controls folder
   */
  private setupCameraControls(): void {
    const cameraFolder = this.gui.addFolder('Camera');

    // Projection mode dropdown
    cameraFolder
      .add(this.params.camera, 'projectionMode', ['Perspective', 'Orthographic'])
      .name('Projection Mode')
      .onChange(() => this.triggerChange());

    // FOV control (only for perspective)
    const fovControl = cameraFolder
      .add(this.params.camera, 'fov', 30, 120, 1)
      .name('FOV (degrees)')
      .onChange(() => this.triggerChange());

    // Ortho size control (only for orthographic)
    const orthoControl = cameraFolder
      .add(this.params.camera, 'orthoSize', 1, 20, 0.5)
      .name('Ortho Size')
      .onChange(() => this.triggerChange());

    // Distance control (for both modes)
    cameraFolder
      .add(this.params.camera, 'distance', 2, 20, 0.5)
      .name('Distance')
      .onChange(() => this.triggerChange());

    // Update visibility based on projection mode
    const updateControlVisibility = (): void => {
      const isPerspective = this.params.camera.projectionMode === 'Perspective';
      if (isPerspective) {
        fovControl.show();
        orthoControl.hide();
      } else {
        fovControl.hide();
        orthoControl.show();
      }
    };

    // Initial visibility
    updateControlVisibility();

    // Update on mode change
    cameraFolder
      .controllers
      .find(c => c.property === 'projectionMode')
      ?.onChange(() => {
        updateControlVisibility();
        this.triggerChange();
      });

    cameraFolder.open();
  }

  /**
   * Setup game camera controls folder
   */
  private setupGameCameraControls(): void {
    const gameCameraFolder = this.gui.addFolder('Game Camera');

    const positionFolder = gameCameraFolder.addFolder('Position');
    positionFolder
      .add(this.params.gameCamera.position, 'x', -20, 20, 0.5)
      .name('X')
      .onChange(() => this.triggerChange());
    positionFolder
      .add(this.params.gameCamera.position, 'y', -20, 20, 0.5)
      .name('Y')
      .onChange(() => this.triggerChange());
    positionFolder
      .add(this.params.gameCamera.position, 'z', -20, 20, 0.5)
      .name('Z')
      .onChange(() => this.triggerChange());

    const targetFolder = gameCameraFolder.addFolder('Target');
    targetFolder
      .add(this.params.gameCamera.target, 'x', -10, 10, 0.5)
      .name('X')
      .onChange(() => this.triggerChange());
    targetFolder
      .add(this.params.gameCamera.target, 'y', -10, 10, 0.5)
      .name('Y')
      .onChange(() => this.triggerChange());
    targetFolder
      .add(this.params.gameCamera.target, 'z', -10, 10, 0.5)
      .name('Z')
      .onChange(() => this.triggerChange());

    gameCameraFolder
      .add(this.params.gameCamera, 'fov', 30, 120, 1)
      .name('FOV (degrees)')
      .onChange(() => this.triggerChange());

    gameCameraFolder.close();
  }

  /**
   * Setup animation controls folder
   */
  private setupAnimationControls(): void {
    const animationFolder = this.gui.addFolder('Animation');

    animationFolder
      .add(this.params.animation, 'autoRotate')
      .name('Auto Rotate')
      .onChange(() => this.triggerChange());

    animationFolder
      .add(this.params.animation, 'speed', 0.0, 3.0, 0.1)
      .name('Speed')
      .onChange(() => this.triggerChange());

    animationFolder
      .add(this.params.animation, 'rotationSpeedX', 0, 100, 5)
      .name('Rotation X')
      .onChange(() => this.triggerChange());

    animationFolder
      .add(this.params.animation, 'rotationSpeedY', 0, 100, 5)
      .name('Rotation Y')
      .onChange(() => this.triggerChange());

    animationFolder.open();
  }

  /**
   * Setup geometry controls folder
   */
  private setupGeometryControls(): void {
    const geometryFolder = this.gui.addFolder('Geometry');

    geometryFolder
      .add(this.params.geometry, 'type', [
        'Cube', 
        'Sphere', 
        'Cylinder', 
        'Prism (Triangle)', 
        'Prism (Hexagon)'
      ])
      .name('Type')
      .onChange(() => this.triggerChange());

    geometryFolder.open();
  }

  /**
   * Setup controls folder (Camera controller modes)
   */
  private setupControlsControls(): void {
    const controlsFolder = this.gui.addFolder('Controls');

    // Camera mode dropdown
    controlsFolder
      .add(this.params.controls, 'cameraMode', ['None', 'FPS', 'Orbit'])
      .name('Camera Mode')
      .onChange(() => this.triggerChange());

    // Movement speed (only visible in FPS mode)
    const speedControl = controlsFolder
      .add(this.params.controls, 'movementSpeed', 1, 20, 0.5)
      .name('Movement Speed')
      .onChange(() => this.triggerChange());

    // Mouse sensitivity for FPS (only visible in FPS mode)
    const fpsSensitivityControl = controlsFolder
      .add(this.params.controls, 'mouseSensitivity', 0.0005, 0.01, 0.0001)
      .name('FPS Sensitivity')
      .onChange(() => this.triggerChange());

    // Orbit sensitivity (only visible in Orbit mode)
    const orbitSensitivityControl = controlsFolder
      .add(this.params.controls, 'orbitSensitivity', 0.001, 0.02, 0.001)
      .name('Orbit Sensitivity')
      .onChange(() => this.triggerChange());

    // Update visibility based on camera mode
    const updateControlVisibility = (): void => {
      const mode = this.params.controls.cameraMode;
      if (mode === 'FPS') {
        speedControl.show();
        fpsSensitivityControl.show();
        orbitSensitivityControl.hide();
      } else if (mode === 'Orbit') {
        speedControl.hide();
        fpsSensitivityControl.hide();
        orbitSensitivityControl.show();
      } else {
        speedControl.hide();
        fpsSensitivityControl.hide();
        orbitSensitivityControl.hide();
      }
    };

    // Initial visibility
    updateControlVisibility();

    // Update on camera mode change
    controlsFolder
      .controllers
      .find(c => c.property === 'cameraMode')
      ?.onChange(() => {
        updateControlVisibility();
        this.triggerChange();
      });

    controlsFolder.open();
  }

  /**
   * Setup object management controls folder
   */
  private setupObjectManagementControls(): void {
    const objectsFolder = this.gui.addFolder('Objects');

    // Object list dropdown (shows all scene objects)
    const objectListControl = objectsFolder
      .add(this.params.objects, 'selectedId', {})
      .name('Select Object')
      .onChange(() => this.triggerChange());

    // Geometry type to add dropdown
    objectsFolder
      .add(this.params.objects, 'geometryTypeToAdd', [
        'Cube',
        'Sphere',
        'Cylinder',
        'Prism (Triangle)',
        'Prism (Hexagon)'
      ])
      .name('🎨 Geometry Type')
      .onChange(() => this.triggerChange());

    // "Add Object" button
    objectsFolder
      .add({ 
        addObject: () => { 
          this.params.objects.addObjectRequested = true; 
          this.triggerChange(); 
        } 
      }, 'addObject')
      .name('➕ Add Object');

    // "Remove Selected" button
    objectsFolder
      .add({ 
        removeObject: () => { 
          this.params.objects.removeObjectRequested = true; 
          this.triggerChange(); 
        } 
      }, 'removeObject')
      .name('🗑️ Remove Selected');

    // Add new scene management buttons
    const sceneParams = {
        addCube: () => { this.params.objects.geometryTypeToAdd = 'Cube'; this.params.objects.addObjectRequested = true; this.triggerChange(); },
        addSphere: () => { this.params.objects.geometryTypeToAdd = 'Sphere'; this.params.objects.addObjectRequested = true; this.triggerChange(); },
        addCylinder: () => { this.params.objects.geometryTypeToAdd = 'Cylinder'; this.params.objects.addObjectRequested = true; this.triggerChange(); },
        addPrism: () => { this.params.objects.geometryTypeToAdd = 'Prism (Triangle)'; this.params.objects.addObjectRequested = true; this.triggerChange(); }, // Assuming 'Prism (Triangle)' for generic 'Prism'
        loadOBJ: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.obj';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = (e: Event) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result && this.onLoadOBJ) {
                            this.onLoadOBJ(file.name, event.target.result as string);
                        }
                    };
                    reader.readAsText(file);
                }
                document.body.removeChild(input);
            };

            input.click();
        },
        clearScene: () => {
            // Keep the first object if it's the specific loaded model, or just clear all
            // For now, let's just clear
            // logic to clear scene could be added to Scene class
            console.log("Clear scene not implemented fully");
            this.params.objects.clearSceneRequested = true; // Assuming a new param for clearing scene
            this.triggerChange();
        }
    };

    objectsFolder.add(sceneParams, 'addCube').name('➕ Add Cube');
    objectsFolder.add(sceneParams, 'addSphere').name('➕ Add Sphere');
    objectsFolder.add(sceneParams, 'addCylinder').name('➕ Add Cylinder');
    objectsFolder.add(sceneParams, 'addPrism').name('➕ Add Prism');
    objectsFolder.add(sceneParams, 'loadOBJ').name('📂 Load OBJ Model');
    objectsFolder.add(sceneParams, 'clearScene').name('🧹 Clear Scene');


    // Transform controls folder (only visible when object selected)
    const transformFolder = objectsFolder.addFolder('Transform');

    const positionFolder = transformFolder.addFolder('Position');
    positionFolder
      .add(this.params.objects.transform.position, 'x', -10, 10, 0.1)
      .name('X')
      .onChange(() => this.triggerChange());
    positionFolder
      .add(this.params.objects.transform.position, 'y', -10, 10, 0.1)
      .name('Y')
      .onChange(() => this.triggerChange());
    positionFolder
      .add(this.params.objects.transform.position, 'z', -10, 10, 0.1)
      .name('Z')
      .onChange(() => this.triggerChange());

    const rotationFolder = transformFolder.addFolder('Rotation');
    rotationFolder
      .add(this.params.objects.transform.rotation, 'x', 0, 360, 1)
      .name('X (degrees)')
      .onChange(() => this.triggerChange());
    rotationFolder
      .add(this.params.objects.transform.rotation, 'y', 0, 360, 1)
      .name('Y (degrees)')
      .onChange(() => this.triggerChange());
    rotationFolder
      .add(this.params.objects.transform.rotation, 'z', 0, 360, 1)
      .name('Z (degrees)')
      .onChange(() => this.triggerChange());

    const scaleFolder = transformFolder.addFolder('Scale');
    scaleFolder
      .add(this.params.objects.transform.scale, 'x', 0.1, 5, 0.1)
      .name('X')
      .onChange(() => this.triggerChange());
    scaleFolder
      .add(this.params.objects.transform.scale, 'y', 0.1, 5, 0.1)
      .name('Y')
      .onChange(() => this.triggerChange());
    scaleFolder
      .add(this.params.objects.transform.scale, 'z', 0.1, 5, 0.1)
      .name('Z')
      .onChange(() => this.triggerChange());

    // Update dropdown options when object list changes
    // Store reference to update dropdown later
    (this as unknown as { objectListControl: typeof objectListControl }).objectListControl = objectListControl;

    // Initially hide transform folder if no object selected
    if (!this.params.objects.selectedId) {
      transformFolder.close();
      transformFolder.hide();
    }

    objectsFolder.open();
  }

  /**
   * Update object list dropdown options
   * Call this when objects are added/removed
   */
  updateObjectList(): void {
    const objectListControl = (this as unknown as { objectListControl?: ReturnType<GUI['add']> }).objectListControl;
    if (!objectListControl) return;

    // Build options object from list
    const options: Record<string, string> = {};
    for (const obj of this.params.objects.list) {
      options[obj.name] = obj.id;
    }

    // Update dropdown options
    objectListControl.options(options);

    // Show/hide transform folder based on selection
    const transformFolder = this.gui.folders.find(f => f._title === 'Objects')?.folders.find(f => f._title === 'Transform');
    if (transformFolder) {
      if (this.params.objects.selectedId) {
        transformFolder.show();
      } else {
        transformFolder.hide();
      }
    }
  }

  /**
   * Register callback for when any control changes
   */
  onChange(callback: () => void): void {
    this.changeCallback = callback;
  }

  /**
   * Trigger the change callback
   */
  private triggerChange(): void {
    if (this.changeCallback) {
      this.changeCallback();
    }
  }

  /**
   * Cleanup and destroy the GUI
   */
  destroy(): void {
    this.gui.destroy();
  }
}
