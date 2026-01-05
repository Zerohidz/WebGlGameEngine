import { ReadonlyMat4 } from 'gl-matrix';
import { compileShader, linkProgram } from '../utils/GLUtils';

/**
 * Shader class for managing GLSL shaders and programs
 */
export class Shader {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private uniformLocations: Map<string, WebGLUniformLocation | null> =
    new Map();
  private attributeLocations: Map<string, number> = new Map();

  constructor(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    this.gl = gl;

    // Compile shaders
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    // Link program
    this.program = linkProgram(gl, vertexShader, fragmentShader);

    // Clean up shaders (they're now part of the program)
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  /**
   * Use this shader program
   */
  use(): void {
    this.gl.useProgram(this.program);
  }

  /**
   * Get uniform location (cached)
   */
  getUniformLocation(name: string): WebGLUniformLocation | null {
    if (!this.uniformLocations.has(name)) {
      const location = this.gl.getUniformLocation(this.program, name);
      this.uniformLocations.set(name, location);
    }
    return this.uniformLocations.get(name) ?? null;
  }

  /**
   * Get attribute location (cached)
   */
  getAttributeLocation(name: string): number {
    if (!this.attributeLocations.has(name)) {
      const location = this.gl.getAttribLocation(this.program, name);
      this.attributeLocations.set(name, location);
    }
    return this.attributeLocations.get(name) ?? -1;
  }

  /**
   * Set uniform float
   */
  setFloat(name: string, value: number): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniform1f(location, value);
    }
  }

  /**
   * Set uniform vec3 from vec3
   */
  setVec3Array(name: string, value: Float32Array): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniform3fv(location, value);
    }
  }

  /**
   * Set uniform vec4
   */
  setVec4(name: string, x: number, y: number, z: number, w: number): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniform4f(location, x, y, z, w);
    }
  }

  /**
   * Set uniform mat3
   */
  setMat3(name: string, matrix: Float32Array): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniformMatrix3fv(location, false, matrix);
    }
  }

  /**
   * Set uniform mat4
   */
  setMat4(name: string, matrix: ReadonlyMat4): void {
    const location = this.getUniformLocation(name);
    if (location) {
      this.gl.uniformMatrix4fv(location, false, matrix);
    }
  }

  /**
   * Delete this shader program
   */
  delete(): void {
    this.gl.deleteProgram(this.program);
  }

  /**
   * Get the WebGL program
   */
  getProgram(): WebGLProgram {
    return this.program;
  }
}
