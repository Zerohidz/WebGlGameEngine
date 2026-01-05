import { mat4, vec3 } from 'gl-matrix';

/**
 * Perspective camera
 */
export class Camera {
  position: vec3;
  target: vec3;
  up: vec3;

  fov: number; // Field of view in degrees
  aspect: number; // Aspect ratio (width / height)
  near: number; // Near clipping plane
  far: number; // Far clipping plane

  private viewMatrix: mat4;
  private projectionMatrix: mat4;

  constructor(fov: number = 75, aspect: number = 1, near: number = 0.1, far: number = 1000) {
    this.position = vec3.fromValues(0, 0, 5);
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);

    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();

    this.updateMatrices();
  }

  /**
   * Update view and projection matrices
   */
  updateMatrices(): void {
    // View matrix (lookAt)
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);

    // Projection matrix (perspective)
    mat4.perspective(
      this.projectionMatrix,
      (this.fov * Math.PI) / 180, // Convert FOV to radians
      this.aspect,
      this.near,
      this.far
    );
  }

  /**
   * Get view matrix
   */
  getViewMatrix(): mat4 {
    return this.viewMatrix;
  }

  /**
   * Get projection matrix
   */
  getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }

  /**
   * Set camera position
   */
  setPosition(x: number, y: number, z: number): void {
    vec3.set(this.position, x, y, z);
    this.updateMatrices();
  }

  /**
   * Set camera target
   */
  setTarget(x: number, y: number, z: number): void {
    vec3.set(this.target, x, y, z);
    this.updateMatrices();
  }

  /**
   * Set aspect ratio and update projection matrix
   */
  setAspect(aspect: number): void {
    this.aspect = aspect;
    this.updateMatrices();
  }

  /**
   * Set field of view (in degrees) and update projection matrix
   */
  setFOV(fov: number): void {
    this.fov = fov;
    this.updateMatrices();
  }
}
