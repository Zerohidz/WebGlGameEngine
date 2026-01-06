import { Geometry } from './Geometry';

/**
 * Procedural UV sphere geometry
 * Generated using latitude/longitude grid (similar to Earth's lat/lon)
 */
export namespace Sphere {
  /**
   * Create a UV sphere geometry
   * @param gl WebGL context
   * @param radius Sphere radius
   * @param segments Longitudinal divisions (around equator)
   * @param rings Latitudinal divisions (from pole to pole)
   * @returns Geometry object
   */
  export function create(
    gl: WebGL2RenderingContext,
    radius = 1.0,
    segments = 32,
    rings = 16
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    // Generate vertices
    for (let ring = 0; ring <= rings; ring++) {
      const theta = (ring * Math.PI) / rings; // Latitude angle (0 to π)
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let segment = 0; segment <= segments; segment++) {
        const phi = (segment * 2 * Math.PI) / segments; // Longitude angle (0 to 2π)
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        // Position (spherical to Cartesian)
        const x = radius * sinTheta * cosPhi;
        const y = radius * cosTheta;
        const z = radius * sinTheta * sinPhi;

        // Normal (same as normalized position for sphere centered at origin)
        const nx = sinTheta * cosPhi;
        const ny = cosTheta;
        const nz = sinTheta * sinPhi;

        // Color: Create a nice gradient based on position
        // Top (Y+) = magenta, bottom (Y-) = cyan, with gradient in between
        const colorT = (y / radius + 1.0) / 2.0; // Normalize to 0-1
        const r = colorT * 0.8 + 0.2; // 0.2 to 1.0
        const g = 0.5;
        const b = (1.0 - colorT) * 0.8 + 0.2; // 1.0 to 0.2

        // UV coordinates
        const u = 1 - (segment / segments);
        const v = 1 - (ring / rings);

        // Interleaved: [position(3), color(3), normal(3), uv(2)]
        vertices.push(x, y, z, r, g, b, nx, ny, nz, u, v);
      }
    }

    // Generate indices
    for (let ring = 0; ring < rings; ring++) {
      for (let segment = 0; segment < segments; segment++) {
        const first = ring * (segments + 1) + segment;
        const second = first + segments + 1;

        // Two triangles per quad (counter-clockwise winding)
        // Triangle 1
        indices.push(first, second, first + 1);
        // Triangle 2
        indices.push(second, second + 1, first + 1);
      }
    }

    return new Geometry(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
  }
}
