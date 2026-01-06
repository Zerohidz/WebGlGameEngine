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
    // Helper to generate random colors for faces
    const randomColor = () => [Math.random(), Math.random(), Math.random()];

    // Generate vertices
    // Each face has 4 vertices with: position (3), color (3), normal (3), uv (2)
    // Total 11 floats per vertex
    const vertices = new Float32Array([
      // Front face (z = size/2)
      -s, -s,  s, ...randomColor(),  0,  0,  1,  0, 0,
       s, -s,  s, ...randomColor(),  0,  0,  1,  1, 0,
       s,  s,  s, ...randomColor(),  0,  0,  1,  1, 1,
      -s,  s,  s, ...randomColor(),  0,  0,  1,  0, 1,

      // Back face (z = -size/2)
       s, -s, -s, ...randomColor(),  0,  0, -1,  0, 0,
      -s, -s, -s, ...randomColor(),  0,  0, -1,  1, 0,
      -s,  s, -s, ...randomColor(),  0,  0, -1,  1, 1,
       s,  s, -s, ...randomColor(),  0,  0, -1,  0, 1,

      // Top face (y = size/2)
      -s,  s,  s, ...randomColor(),  0,  1,  0,  0, 0,
       s,  s,  s, ...randomColor(),  0,  1,  0,  1, 0,
       s,  s, -s, ...randomColor(),  0,  1,  0,  1, 1,
      -s,  s, -s, ...randomColor(),  0,  1,  0,  0, 1,

      // Bottom face (y = -size/2)
      -s, -s, -s, ...randomColor(),  0, -1,  0,  0, 0,
       s, -s, -s, ...randomColor(),  0, -1,  0,  1, 0,
       s, -s,  s, ...randomColor(),  0, -1,  0,  1, 1,
      -s, -s,  s, ...randomColor(),  0, -1,  0,  0, 1,

      // Right face (x = size/2)
       s, -s,  s, ...randomColor(),  1,  0,  0,  0, 0,
       s, -s, -s, ...randomColor(),  1,  0,  0,  1, 0,
       s,  s, -s, ...randomColor(),  1,  0,  0,  1, 1,
       s,  s,  s, ...randomColor(),  1,  0,  0,  0, 1,

      // Left face (x = -size/2)
      -s, -s, -s, ...randomColor(), -1,  0,  0,  0, 0,
      -s, -s,  s, ...randomColor(), -1,  0,  0,  1, 0,
      -s,  s,  s, ...randomColor(), -1,  0,  0,  1, 1,
      -s,  s, -s, ...randomColor(), -1,  0,  0,  0, 1,
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
