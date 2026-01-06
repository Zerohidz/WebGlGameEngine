/**
 * Scene graph for managing multiple objects
 */
export class Scene {
  private objects: Array<{ name: string; mesh: any; transform: any }>;

  constructor() {
    this.objects = [];
  }

  /**
   * Add an object to the scene
   */
  addObject(name: string, mesh: any, transform: any): void {
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
  getObject(name: string): { name: string; mesh: any; transform: any } | undefined {
    return this.objects.find(obj => obj.name === name);
  }

  /**
   * Get all objects in the scene
   */
  getAllObjects(): Array<{ name: string; mesh: any; transform: any }> {
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
  render(gl: WebGL2RenderingContext, shader: any, camera: any): void {
    this.objects.forEach(obj => {
      // Set MVP matrices for this object
      shader.setMat4('u_model', obj.mesh.getModelMatrix());
      shader.setMat4('u_view', camera.getViewMatrix());
      shader.setMat4('u_projection', camera.getProjectionMatrix());
      
      // Set normal matrix
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      shader.setMat3('u_normalMatrix', obj.transform.getNormalMatrix() as Float32Array);

      // Render the mesh
      obj.mesh.render(gl);
    });
  }
}
