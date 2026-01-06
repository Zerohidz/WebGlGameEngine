import { Camera } from '../engine/Camera';
import { vec3 } from 'gl-matrix';

/**
 * Orbit Camera Controller
 * Rotate camera around a target point using mouse drag
 */
export class OrbitController {
  private camera: Camera;
  private canvas: HTMLCanvasElement;
  private target: vec3;
  private distance: number;
  private azimuth: number; // Horizontal angle (radians)
  private elevation: number; // Vertical angle (radians)
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private sensitivity: number = 0.005;

  constructor(camera: Camera, canvas: HTMLCanvasElement, target: vec3 = vec3.fromValues(0, 0, 0)) {
    this.camera = camera;
    this.canvas = canvas;
    this.target = vec3.clone(target);
    
    // Calculate initial distance from camera's current position
    const camPos = camera.position;
    const dx = camPos[0] - this.target[0];
    const dy = camPos[1] - this.target[1];
    const dz = camPos[2] - this.target[2];
    this.distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Calculate initial angles from camera position
    const xz = Math.sqrt(dx * dx + dz * dz);
    this.azimuth = Math.atan2(dx, dz);
    this.elevation = Math.atan2(dy, xz);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mouseleave', this.onMouseUp);
  }

  private onMouseDown = (event: MouseEvent): void => {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.azimuth -= deltaX * this.sensitivity;
    this.elevation += deltaY * this.sensitivity;

    // Clamp elevation to avoid gimbal lock
    const maxElevation = Math.PI / 2 - 0.1;
    this.elevation = Math.max(-maxElevation, Math.min(maxElevation, this.elevation));

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    this.updateCameraPosition();
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
  };

  private updateCameraPosition(): void {
    // Spherical to Cartesian coordinates
    const x = this.target[0] + this.distance * Math.cos(this.elevation) * Math.sin(this.azimuth);
    const y = this.target[1] + this.distance * Math.sin(this.elevation);
    const z = this.target[2] + this.distance * Math.cos(this.elevation) * Math.cos(this.azimuth);

    this.camera.setPosition(x, y, z);
    this.camera.setTarget(this.target[0], this.target[1], this.target[2]);
  }

  public setDistance(distance: number): void {
    this.distance = distance;
    // Don't call updateCameraPosition here - it will be called on next mouse move
    // This prevents desync when UI changes distance while user is not dragging
  }

  public setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseUp);
  }
}
