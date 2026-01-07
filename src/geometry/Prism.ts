import { Geometry } from './Geometry';

/**
 * Procedural prism geometry
 * Generated with polygonal base (triangle or hexagon) and extruded height
 */
export namespace Prism {
  /**
   * Create a prism geometry
   * @param gl WebGL context
   * @param radius Circumradius of the polygon base
   * @param height Prism height
   * @param sides Number of sides (3 for triangle, 6 for hexagon)
   * @returns Geometry object
   */
  export function create(
    gl: WebGL2RenderingContext,
    radius = 0.5,
    height = 2.0,
    sides = 6
  ): Geometry {
    const vertices: number[] = [];
    const indices: number[] = [];

    const halfHeight = height / 2;

    // Color scheme based on sides
    const topColor: [number, number, number] = sides === 3 ? [1, 0.5, 0] : [0.5, 0, 1]; // Orange for triangle, purple for hexagon
    const bottomColor: [number, number, number] = sides === 3 ? [0, 0.5, 1] : [1, 0.5, 0]; // Blue for triangle, orange for hexagon

    // === CAPS (TOP AND BOTTOM) ===
    // Generate perimeter vertices for both top and bottom caps
    // Using interleaved strategy similar to fixed Cylinder: Top0, Bottom0, Top1, Bottom1...
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Top vertex
      // pos(3), color(3), normal(3), uv(2)
      vertices.push(
        x, halfHeight, z,
        topColor[0], topColor[1], topColor[2],
        0, 1, 0,
        (x / radius) * 0.5 + 0.5, (z / radius) * 0.5 + 0.5
      );
      // Bottom vertex
      vertices.push(
        x, -halfHeight, z,
        bottomColor[0], bottomColor[1], bottomColor[2],
        0, -1, 0,
        (x / radius) * 0.5 + 0.5, (z / radius) * 0.5 + 0.5
      );
    }

    // Add center vertices for caps
    // Top center
    const topCenterIndex = vertices.length / 11;
    vertices.push(
      0, halfHeight, 0,
      topColor[0], topColor[1], topColor[2],
      0, 1, 0,
      0.5, 0.5
    );

    // Bottom center
    const bottomCenterIndex = topCenterIndex + 1;
    vertices.push(
      0, -halfHeight, 0,
      bottomColor[0], bottomColor[1], bottomColor[2],
      0, -1, 0,
      0.5, 0.5
    );

    // Top cap triangles (fan from center)
    // Top vertices are at even indices: 0, 2, 4...
    for (let i = 0; i < sides; i++) {
      indices.push(
        topCenterIndex,
        i * 2,
        (i + 1) * 2
      );
    }

    // Bottom cap triangles (fan from center, reversed winding)
    // Bottom vertices are at odd indices: 1, 3, 5...
    for (let i = 0; i < sides; i++) {
      indices.push(
        bottomCenterIndex,
        (i + 1) * 2 + 1,
        i * 2 + 1
      );
    }

    // === SIDE WALLS ===
    const sideStartIndex = vertices.length / 11; // Starting index for side wall vertices

    // Generate vertices and indices for each face
    for (let i = 0; i < sides; i++) {
      const angle1 = (i * 2 * Math.PI) / sides;
      const angle2 = ((i + 1) * 2 * Math.PI) / sides;

      const x1 = radius * Math.cos(angle1);
      const z1 = radius * Math.sin(angle1);
      const x2 = radius * Math.cos(angle2);
      const z2 = radius * Math.sin(angle2);

      // Calculate normal for this face (flat shading)
      const normalAngle = (angle1 + angle2) / 2;
      const nx = Math.cos(normalAngle);
      const nz = Math.sin(normalAngle);

      // Color gradient for side
      const t = i / sides;
      const r = topColor[0] * (1 - t) + bottomColor[0] * t;
      const g = topColor[1] * (1 - t) + bottomColor[1] * t;
      const b = topColor[2] * (1 - t) + bottomColor[2] * t;

      // Four vertices per face (quad)
      // Top left
      vertices.push(x1, halfHeight, z1, r, g, b, nx, 0, nz, i / sides, 1);
      // Bottom left
      vertices.push(x1, -halfHeight, z1, r, g, b, nx, 0, nz, i / sides, 0);
      // Bottom right
      vertices.push(x2, -halfHeight, z2, r, g, b, nx, 0, nz, (i + 1) / sides, 0);
      // Top right
      vertices.push(x2, halfHeight, z2, r, g, b, nx, 0, nz, (i + 1) / sides, 1);
      
      // Indices for this face
      const base = sideStartIndex + i * 4;
      // TL, TR, BL - reversed winding
      indices.push(base, base + 3, base + 1);
      // TR, BR, BL - reversed winding
      indices.push(base + 3, base + 2, base + 1);
    }

    return new Geometry(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
  }
}
