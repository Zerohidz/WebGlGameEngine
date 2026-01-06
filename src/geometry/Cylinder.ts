import { Geometry } from './Geometry';

/**
 * Procedural cylinder geometry
 * Generated with circular caps (top/bottom) and side walls
 */
export namespace Cylinder {
  /**
   * Create a cylinder geometry
   * @param gl WebGL context
   * @param radius Cylinder radius
   * @param height Cylinder height
   * @param segments Number of radial segments (higher = smoother)
   * @returns Geometry object
   */
  export function create(
    gl: WebGL2RenderingContext,
    radius = 0.5,
    height = 2.0,
    segments = 32
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    const halfHeight = height / 2;

    // Color scheme: top = yellow, bottom = cyan, sides = gradient
    const topColor: [number, number, number] = [1, 1, 0]; // Yellow
    const bottomColor: [number, number, number] = [0, 1, 1]; // Cyan

    // === TOP CAP ===
    // Generate perimeter vertices for both top and bottom caps

    // Generate perimeter vertices for both top and bottom caps
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Top cap perimeter vertex: pos(3), color(3), normal(3), uv(2)
      vertices.push(
        x, halfHeight, z,
        topColor[0], topColor[1], topColor[2],
        0, 1, 0, // Normal pointing up
        (x / radius) * 0.5 + 0.5, (z / radius) * 0.5 + 0.5 // Planar mapping
      );

      // Bottom cap perimeter vertex: pos(3), color(3), normal(3), uv(2)
      vertices.push(
        x, -halfHeight, z,
        bottomColor[0], bottomColor[1], bottomColor[2],
        0, -1, 0, // Normal pointing down
        (x / radius) * 0.5 + 0.5, (z / radius) * 0.5 + 0.5 // Planar mapping
      );
    }

    // Add center vertices for caps after all perimeter vertices
    const topCenterIndex = vertices.length / 11; // Index after all perimeter vertices
    // Top center vertex: pos(3), color(3), normal(3), uv(2)
    vertices.push(
      0, halfHeight, 0,
      topColor[0], topColor[1], topColor[2],
      0, 1, 0,
      0.5, 0.5 // Center of UV map
    );

    const bottomCenterIndex = topCenterIndex + 1; // Index after top center
    // Bottom center vertex: pos(3), color(3), normal(3), uv(2)
    vertices.push(
      0, -halfHeight, 0,
      bottomColor[0], bottomColor[1], bottomColor[2],
      0, -1, 0,
      0.5, 0.5 // Center of UV map
    );

    // === CAP INDICES ===
    // Top cap triangles: center -> Top(i) -> Top(i+1)
    // Top(i) index is 2*i
    // Top(i+1) index is 2*(i+1)
    for (let i = 0; i < segments; i++) {
       indices.push(
         topCenterIndex,
         2 * i,
         2 * (i + 1)
       );
    }

    // Bottom cap triangles: center -> Bottom(i+1) -> Bottom(i) (reversed)
    // Bottom(i) index is 2*i + 1
    // Bottom(i+1) index is 2*(i+1) + 1
    for (let i = 0; i < segments; i++) {
      indices.push(
        bottomCenterIndex,
        2 * (i + 1) + 1,
        2 * i + 1
      );
    }

    // === SIDE WALLS ===
    // The side walls will have their own set of vertices to allow for different normals and UVs
    // from the caps, even if positions are identical.
    const sideStartIndex = vertices.length / 11; // Starting index for side vertices

    // Generate two rings of vertices (top and bottom) for the sides
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Normal for cylinder side (radial outward)
      const nx = Math.cos(angle);
      const nz = Math.sin(angle);

      // Color gradient for sides
      // For simplicity, let's use a fixed color for now, or re-implement the gradient
      // The original gradient was based on 't' which was i/segments, but applied to top/bottom colors.
      // Let's use a simple blend for now, or keep the original gradient logic if desired.
      // Original logic: const r = topColor[0] * (1 - t) + bottomColor[0] * t;
      // This implies a vertical gradient. The snippet implies a single color per face or segment.
      // Let's use the original vertical gradient logic for each vertex.

      // Top vertex for side wall
      // pos(3), color(3), normal(3), uv(2)
      vertices.push(
        x, halfHeight, z,
        topColor[0], topColor[1], topColor[2], // Using topColor for top ring
        nx, 0, nz,
        i / segments, 1 // U: wraps around, V: top of cylinder
      );

      // Bottom vertex for side wall
      // pos(3), color(3), normal(3), uv(2)
      vertices.push(
        x, -halfHeight, z,
        bottomColor[0], bottomColor[1], bottomColor[2], // Using bottomColor for bottom ring
        nx, 0, nz,
        i / segments, 0 // U: wraps around, V: bottom of cylinder
      );
    }

    // Side wall quads (two triangles per segment)
    for (let i = 0; i < segments; i++) {
      const topLeft = sideStartIndex + i * 2;
      const bottomLeft = topLeft + 1;
      const topRight = sideStartIndex + (i + 1) * 2;
      const bottomRight = topRight + 1;

      // First triangle (TL, BL, TR)
      indices.push(topLeft, bottomLeft, topRight);
      // Second triangle (TR, BL, BR)
      indices.push(topRight, bottomLeft, bottomRight);
    }

    return new Geometry(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
  }
}
