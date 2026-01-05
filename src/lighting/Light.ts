import type { vec3 } from 'gl-matrix';

/**
 * Base class for all light types
 */
export abstract class Light {
  color: vec3;
  intensity: number;

  constructor(color: vec3, intensity: number) {
    this.color = color;
    this.intensity = intensity;
  }

  /**
   * Get uniform data for shader
   */
  abstract getUniformData(): { direction?: unknown; color?: unknown; [key: string]: unknown };
}
