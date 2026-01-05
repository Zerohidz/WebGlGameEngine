import type { mat4 } from 'gl-matrix';
import { Geometry } from './Geometry';
import { Transform } from '../engine/Transform';

/**
 * Mesh combines geometry with transform
 * Represents a renderable object in the scene
 */
export class Mesh {
  geometry: Geometry;
  transform: Transform;

  constructor(geometry: Geometry, transform: Transform) {
    this.geometry = geometry;
    this.transform = transform;
  }

  /**
   * Get the model matrix from the transform
   */
  getModelMatrix(): mat4 {
    return this.transform.getModelMatrix();
  }

  /**
   * Render the mesh
   */
  render(gl: WebGL2RenderingContext): void {
    gl.bindVertexArray(this.geometry.getVAO());
    gl.drawElements(
      gl.TRIANGLES,
      this.geometry.getIndexCount(),
      gl.UNSIGNED_SHORT,
      0
    );
  }
}
