import { vec3 } from 'gl-matrix';
import { Light } from './Light';

/**
 * Uniform data for directional light
 */
export interface DirectionalLightUniforms {
  direction: vec3;
  color: vec3;
  [key: string]: unknown;
}

/**
 * Directional light (sun-like)
 * Light rays are parallel, no attenuation
 */
export class DirectionalLight extends Light {
  direction: vec3;

  constructor(direction: vec3, color: vec3, intensity: number) {
    super(color, intensity);
    this.direction = vec3.create();
    vec3.normalize(this.direction, direction);
  }

  /**
   * Set light direction
   */
  setDirection(x: number, y: number, z: number): void {
    vec3.set(this.direction, x, y, z);
    vec3.normalize(this.direction, this.direction);
  }

  /**
   * Get uniform data for shader
   */
  getUniformData(): DirectionalLightUniforms {
    return {
      direction: this.direction,
      color: vec3.scale(vec3.create(), this.color, this.intensity),
    };
  }
}
