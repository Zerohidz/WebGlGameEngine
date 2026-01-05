import { Geometry } from './Geometry';

/**
 * Procedural cube geometry
 * 24 vertices (4 per face for unique normals/colors)
 * 36 indices (6 faces × 2 triangles × 3 vertices)
 */
export namespace Cube {
  /**
   * Create a cube geometry
   * @param gl WebGL context
   * @param size Cube size (half-extents)
   * @returns Geometry object
   */
  export function create(gl: WebGL2RenderingContext, size = 1.0): Geometry {
    const s = size;

    // Define 6 face colors for visual debugging
    const colors = {
      front: [1, 0, 0], // Red
      back: [0, 1, 0], // Green
      left: [0, 0, 1], // Blue
      right: [1, 1, 0], // Yellow
      top: [1, 0, 1], // Magenta
      bottom: [0, 1, 1], // Cyan
    };

    // Interleaved vertex data: [pos(3), color(3), normal(3)] × 24 vertices
    const vertices = new Float32Array([
      // Front face (Z+) - Red
      -s, -s, s, ...colors.front, 0, 0, 1, // 0
      s, -s, s, ...colors.front, 0, 0, 1, // 1
      s, s, s, ...colors.front, 0, 0, 1, // 2
      -s, s, s, ...colors.front, 0, 0, 1, // 3

      // Back face (Z-) - Green
      s, -s, -s, ...colors.back, 0, 0, -1, // 4
      -s, -s, -s, ...colors.back, 0, 0, -1, // 5
      -s, s, -s, ...colors.back, 0, 0, -1, // 6
      s, s, -s, ...colors.back, 0, 0, -1, // 7

      // Left face (X-) - Blue
      -s, -s, -s, ...colors.left, -1, 0, 0, // 8
      -s, -s, s, ...colors.left, -1, 0, 0, // 9
      -s, s, s, ...colors.left, -1, 0, 0, // 10
      -s, s, -s, ...colors.left, -1, 0, 0, // 11

      // Right face (X+) - Yellow
      s, -s, s, ...colors.right, 1, 0, 0, // 12
      s, -s, -s, ...colors.right, 1, 0, 0, // 13
      s, s, -s, ...colors.right, 1, 0, 0, // 14
      s, s, s, ...colors.right, 1, 0, 0, // 15

      // Top face (Y+) - Magenta
      -s, s, s, ...colors.top, 0, 1, 0, // 16
      s, s, s, ...colors.top, 0, 1, 0, // 17
      s, s, -s, ...colors.top, 0, 1, 0, // 18
      -s, s, -s, ...colors.top, 0, 1, 0, // 19

      // Bottom face (Y-) - Cyan
      -s, -s, -s, ...colors.bottom, 0, -1, 0, // 20
      s, -s, -s, ...colors.bottom, 0, -1, 0, // 21
      s, -s, s, ...colors.bottom, 0, -1, 0, // 22
      -s, -s, s, ...colors.bottom, 0, -1, 0, // 23
    ]);

    // Indices: 6 faces × 2 triangles × 3 vertices = 36 indices
    // Counter-clockwise winding order (front-facing)
    const indices = new Uint16Array([
      // Front
      0, 1, 2, 0, 2, 3,
      // Back
      4, 5, 6, 4, 6, 7,
      // Left
      8, 9, 10, 8, 10, 11,
      // Right
      12, 13, 14, 12, 14, 15,
      // Top
      16, 17, 18, 16, 18, 19,
      // Bottom
      20, 21, 22, 20, 22, 23,
    ]);

    return new Geometry(gl, vertices, indices);
  }
}
