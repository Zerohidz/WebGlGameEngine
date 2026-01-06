import { Camera } from '../engine/Camera';

/**
 * First Person Controller
 * WASD movement + Mouse look camera controller
 */
export class FirstPersonController {
  private camera: Camera;
  private canvas: HTMLCanvasElement;

  // Movement state
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private moveUp = false;
  private moveDown = false;

  // Camera rotation
  private yaw = 0; // Horizontal rotation (radians)
  private pitch = 0; // Vertical rotation (radians)

  // Mouse state
  private isPointerLocked = false;

  // Settings
  private movementSpeed = 5.0; // units per second
  private mouseSensitivity = 0.002; // radians per pixel

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    this.setupEventListeners();
  }

  /**
   * Setup keyboard and mouse event listeners
   */
  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    // NOTE: Canvas click for pointer lock is handled externally (in main.ts)
    // to ensure it only activates when FPS mode is enabled

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  /**
   * Handle keydown events
   */
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        this.moveUp = true;
        break;
      case 'ShiftLeft':
        this.moveDown = true;
        break;
    }
  }

  /**
   * Handle keyup events
   */
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
      case 'Space':
        this.moveUp = false;
        break;
      case 'ShiftLeft':
        this.moveDown = false;
        break;
    }
  }

  /**
   * Handle mouse movement
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isPointerLocked) return;

    const movementX = event.movementX ?? 0;
    const movementY = event.movementY ?? 0;

    this.yaw -= movementX * this.mouseSensitivity;
    this.pitch -= movementY * this.mouseSensitivity;

    // Clamp pitch to prevent gimbal lock
    const maxPitch = Math.PI / 2 - 0.01;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  /**
   * Update camera position and rotation based on input
   */
  update(deltaTime: number): void {
    // Calculate forward and right vectors from yaw/pitch
    const forward = [
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch),
    ];

    const right = [
      Math.cos(this.yaw),
      0,
      Math.sin(this.yaw),
    ];

    const up = [0, 1, 0];

    // Calculate movement direction
    let moveDirX = 0;
    let moveDirY = 0;
    let moveDirZ = 0;

    if (this.moveForward) {
      moveDirX += forward[0] ?? 0;
      moveDirY += forward[1] ?? 0;
      moveDirZ += forward[2] ?? 0;
    }
    if (this.moveBackward) {
      moveDirX -= forward[0] ?? 0;
      moveDirY -= forward[1] ?? 0;
      moveDirZ -= forward[2] ?? 0;
    }
    if (this.moveRight) {
      moveDirX += right[0] ?? 0;
      moveDirY += right[1] ?? 0;
      moveDirZ += right[2] ?? 0;
    }
    if (this.moveLeft) {
      moveDirX -= right[0] ?? 0;
      moveDirY -= right[1] ?? 0;
      moveDirZ -= right[2] ?? 0;
    }
    if (this.moveUp) {
      moveDirX += up[0] ?? 0;
      moveDirY += up[1] ?? 0;
      moveDirZ += up[2] ?? 0;
    }
    if (this.moveDown) {
      moveDirX -= up[0] ?? 0;
      moveDirY -= up[1] ?? 0;
      moveDirZ -= up[2] ?? 0;
    }

    // Normalize movement direction
    const length = Math.sqrt(
      moveDirX * moveDirX +
      moveDirY * moveDirY +
      moveDirZ * moveDirZ
    );

    if (length > 0) {
      const velocity = this.movementSpeed * deltaTime;
      moveDirX = (moveDirX / length) * velocity;
      moveDirY = (moveDirY / length) * velocity;
      moveDirZ = (moveDirZ / length) * velocity;

      // Update camera position
      this.camera.position[0] += moveDirX;
      this.camera.position[1] += moveDirY;
      this.camera.position[2] += moveDirZ;
    }

    // Update camera target (look direction)
    const targetDistance = 10; // Arbitrary distance for look-at point
    this.camera.setTarget(
      this.camera.position[0] + (forward[0] ?? 0) * targetDistance,
      this.camera.position[1] + (forward[1] ?? 0) * targetDistance,
      this.camera.position[2] + (forward[2] ?? 0) * targetDistance
    );
  }

  /**
   * Set movement speed
   */
  setMovementSpeed(speed: number): void {
    this.movementSpeed = speed;
  }

  /**
   * Set mouse sensitivity
   */
  setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = sensitivity;
  }

  /**
   * Get whether pointer is locked
   */
  isLocked(): boolean {
    return this.isPointerLocked;
  }
}
