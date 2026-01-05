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
