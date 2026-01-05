import { mat4, mat3, vec3 } from 'gl-matrix';

/**
 * Transform class for position, rotation, and scale
 */
export class Transform {
  position: vec3;
  rotation: vec3; // Euler angles in radians
  scale: vec3;

  constructor() {
    this.position = vec3.create();
    this.rotation = vec3.create();
    this.scale = vec3.fromValues(1, 1, 1);
  }

  /**
   * Get the model matrix for this transform
   */
  getModelMatrix(): mat4 {
    const modelMatrix = mat4.create();

    // Translate
    mat4.translate(modelMatrix, modelMatrix, this.position);

    // Rotate (XYZ order)
    mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);

    // Scale
    mat4.scale(modelMatrix, modelMatrix, this.scale);

    return modelMatrix;
  }

  /**
   * Get the normal matrix for this transform
   * Normal matrix = transpose(inverse(mat3(modelMatrix)))
   * This is needed for correct normal transformation with non-uniform scaling
   */
  getNormalMatrix(): mat3 {
    const modelMatrix = this.getModelMatrix();
    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelMatrix);
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
