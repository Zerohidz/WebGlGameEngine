import { mat4, mat3, vec3 } from 'gl-matrix';

/**
 * Transform class for position, rotation, and scale
 * Supports hierarchical relationships (parent-child)
 */
export class Transform {
  // Local transform properties
  position: vec3;
  rotation: vec3; // Euler angles in radians
  scale: vec3;

  // Hierarchy
  parent: Transform | null = null;
  children: Transform[] = [];

  // Matrices
  private localMatrix: mat4;
  private worldMatrix: mat4;


  constructor() {
    this.position = vec3.create();
    this.rotation = vec3.create();
    this.scale = vec3.fromValues(1, 1, 1);
    
    this.localMatrix = mat4.create();
    this.worldMatrix = mat4.create();
  }

  /**
   * Set parent transform
   */
  setParent(parent: Transform | null): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    
    this.parent = parent;
    
    
    if (this.parent) {
      this.parent.children.push(this);
    }
  }

  /**
   * Add child transform
   */
  addChild(child: Transform): void {
    child.setParent(this);
  }

  /**
   * Remove child transform
   */
  removeChild(child: Transform): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  /**
   * Update local matrix from properties
   */
  updateLocalMatrix(): void {
    mat4.identity(this.localMatrix);

    // Translate
    mat4.translate(this.localMatrix, this.localMatrix, this.position);

    // Rotate (XYZ order)
    mat4.rotateX(this.localMatrix, this.localMatrix, this.rotation[0]);
    mat4.rotateY(this.localMatrix, this.localMatrix, this.rotation[1]);
    mat4.rotateZ(this.localMatrix, this.localMatrix, this.rotation[2]);

    // Scale
    mat4.scale(this.localMatrix, this.localMatrix, this.scale);
  }

  /**
   * Get the world matrix (recursive update if needed)
   */
  getWorldMatrix(): mat4 {
    this.updateLocalMatrix();

    if (this.parent) {
      // World = ParentWorld * Local
      mat4.multiply(this.worldMatrix, this.parent.getWorldMatrix(), this.localMatrix);
    } else {
      // No parent, World = Local
      mat4.copy(this.worldMatrix, this.localMatrix);
    }

    return this.worldMatrix;
  }

  /**
   * Get model matrix (alias for local matrix, legacy support)
   */
  getModelMatrix(): mat4 {
    this.updateLocalMatrix();
    return this.localMatrix;
  }

  /**
   * Get the normal matrix based on world transformations
   * Normal matrix = transpose(inverse(mat3(worldMatrix)))
   */
  getNormalMatrix(): mat3 {
    const worldMatrix = this.getWorldMatrix();
    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, worldMatrix);
    return normalMatrix;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    vec3.set(this.position, x, y, z);
  }

  /**
   * Set rotation (in degrees, converted to radians internally)
   */
  setRotation(x: number, y: number, z: number): void {
    vec3.set(
      this.rotation,
      (x * Math.PI) / 180,
      (y * Math.PI) / 180,
      (z * Math.PI) / 180
    );
  }

  /**
   * Set scale
   */
  setScale(x: number, y: number, z: number): void {
    vec3.set(this.scale, x, y, z);
  }
}
