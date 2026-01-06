import type { Mesh } from '../geometry/Mesh';
import type { Transform } from './Transform';
import type { Shader } from './Shader';
import type { Camera } from './Camera';

/**
 * Scene object entry
 */
interface SceneObject {
  name: string;
  mesh: Mesh;
  transform: Transform;
}

/**
 * Scene graph for managing multiple objects
 */
export class Scene {
  private objects: SceneObject[];

  constructor() {
    this.objects = [];
  }

  /**
   * Add an object to the scene
   */
  addObject(name: string, mesh: Mesh, transform: Transform): void {
    this.objects.push({ name, mesh, transform });
  }

  /**
   * Remove an object from the scene by name
   */
  removeObject(name: string): void {
    const index = this.objects.findIndex(obj => obj.name === name);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }

  /**
   * Get an object by name
   */
  getObject(name: string): SceneObject | undefined {
    return this.objects.find(obj => obj.name === name);
  }

  /**
   * Get all objects in the scene
   */
  getAllObjects(): SceneObject[] {
    return this.objects;
  }

  /**
   * Clear all objects from the scene
   */
  clear(): void {
    this.objects = [];
  }

  /**
   * Render all objects in the scene
   */
  render(gl: WebGL2RenderingContext, shader: Shader, camera: Camera): void {
    this.objects.forEach(obj => {
      // Set MVP matrices for this object
      shader.setMat4('u_model', obj.mesh.getModelMatrix());
      shader.setMat4('u_view', camera.getViewMatrix());
      shader.setMat4('u_projection', camera.getProjectionMatrix());
      
      // Set normal matrix
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      shader.setMat3('u_normalMatrix', obj.transform.getNormalMatrix() as Float32Array);

      // Bind texture if available
      if (obj.mesh.texture) {
        shader.setInt('u_useTexture', 1);
        shader.setInt('u_texture', 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, obj.mesh.texture);
      } else {
        shader.setInt('u_useTexture', 0);
      }

      // Render the mesh
      obj.mesh.render(gl);
    });
  }
}
