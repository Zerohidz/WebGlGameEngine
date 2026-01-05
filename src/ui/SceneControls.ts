import GUI from 'lil-gui';

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
  };
  animation: {
    speed: number;
    autoRotate: boolean;
    rotationSpeedX: number;
    rotationSpeedY: number;
  };
  geometry: {
    type: string; // 'Cube' or 'Sphere'
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

  constructor(params: ControlParams) {
    this.params = params;
    this.gui = new GUI({ title: 'Scene Controls' });

    this.setupLightingControls();
    this.setupCameraControls();
    this.setupAnimationControls();
    this.setupGeometryControls();
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

    cameraFolder
      .add(this.params.camera, 'fov', 30, 120, 1)
      .name('FOV (degrees)')
      .onChange(() => this.triggerChange());

    cameraFolder
      .add(this.params.camera, 'distance', 2, 20, 0.5)
      .name('Distance')
      .onChange(() => this.triggerChange());

    cameraFolder.open();
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
      .add(this.params.geometry, 'type', ['Cube', 'Sphere'])
      .name('Type')
      .onChange(() => this.triggerChange());

    geometryFolder.open();
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
