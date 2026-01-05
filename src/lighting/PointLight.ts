import { vec3 } from 'gl-matrix';
import { Light } from './Light';

/**
 * Uniform data for point light
 */
export interface PointLightUniforms {
  position: vec3;
  color: vec3;
  constant: number;
  linear: number;
  quadratic: number;
  [key: string]: unknown;
}

/**
 * Point light with position-based attenuation
 * Light intensity decreases with distance from the source
 */
export class PointLight extends Light {
  position: vec3;
  constant: number; // Constant attenuation factor
  linear: number; // Linear attenuation factor
  quadratic: number; // Quadratic attenuation factor

  constructor(
    position: vec3,
    color: vec3,
    intensity: number,
    constant: number = 1.0,
    linear: number = 0.09,
    quadratic: number = 0.032
  ) {
    super(color, intensity);
    this.position = vec3.clone(position);
    this.constant = constant;
    this.linear = linear;
    this.quadratic = quadratic;
  }

  /**
   * Set light position
   */
  setPosition(x: number, y: number, z: number): void {
    vec3.set(this.position, x, y, z);
  }

  /**
   * Get uniform data for shader
   */
  getUniformData(): PointLightUniforms {
    return {
      position: this.position,
      color: vec3.scale(vec3.create(), this.color, this.intensity),
      constant: this.constant,
      linear: this.linear,
      quadratic: this.quadratic,
    };
  }
}
