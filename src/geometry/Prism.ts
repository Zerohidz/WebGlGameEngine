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

    // Index tracking
    let vertexIndex = 0;

    // === TOP CAP ===
    const topCenterIndex = vertexIndex++;
    // Center vertex
    vertices.push(0, halfHeight, 0, ...topColor, 0, 1, 0);

    // Top cap perimeter
    for (let i = 0; i <= sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Position, color, normal (pointing up)
      vertices.push(x, halfHeight, z, ...topColor, 0, 1, 0);
      vertexIndex++;
    }

    // Top cap triangles (fan from center)
    for (let i = 0; i < sides; i++) {
      indices.push(
        topCenterIndex,
        topCenterIndex + i + 1,
        topCenterIndex + i + 2
      );
    }

    // === BOTTOM CAP ===
    const bottomCenterIndex = vertexIndex++;
    // Center vertex
    vertices.push(0, -halfHeight, 0, ...bottomColor, 0, -1, 0);

    // Bottom cap perimeter
    for (let i = 0; i <= sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Position, color, normal (pointing down)
      vertices.push(x, -halfHeight, z, ...bottomColor, 0, -1, 0);
      vertexIndex++;
    }

    // Bottom cap triangles (fan from center, reversed winding)
    for (let i = 0; i < sides; i++) {
      indices.push(
        bottomCenterIndex,
        bottomCenterIndex + i + 2,
        bottomCenterIndex + i + 1
      );
    }

    // === SIDE WALLS ===
    const sideStartIndex = vertexIndex;

    // Generate vertices for each face
    for (let i = 0; i < sides; i++) {
      const angle1 = (i * 2 * Math.PI) / sides;
      const angle2 = ((i + 1) * 2 * Math.PI) / sides;

      const x1 = radius * Math.cos(angle1);
      const z1 = radius * Math.sin(angle1);
      const x2 = radius * Math.cos(angle2);
      const z2 = radius * Math.sin(angle2);

      // Calculate face normal (perpendicular to face, pointing outward)
      // For flat faces, normal is perpendicular to the edge and pointing out
      const midAngle = (angle1 + angle2) / 2;
      const nx = Math.cos(midAngle);
      const nz = Math.sin(midAngle);

      // Color gradient
      const t = i / sides;
      const r = topColor[0] * (1 - t) + bottomColor[0] * t;
      const g = topColor[1] * (1 - t) + bottomColor[1] * t;
      const b = topColor[2] * (1 - t) + bottomColor[2] * t;

      // Four vertices per face (quad)
      // Top left
      vertices.push(x1, halfHeight, z1, r, g, b, nx, 0, nz);
      // Bottom left
      vertices.push(x1, -halfHeight, z1, r, g, b, nx, 0, nz);
      // Top right
      vertices.push(x2, halfHeight, z2, r, g, b, nx, 0, nz);
      // Bottom right
      vertices.push(x2, -halfHeight, z2, r, g, b, nx, 0, nz);

      vertexIndex += 4;
    }

    // Side wall triangles (two per face)
    for (let i = 0; i < sides; i++) {
      const base = sideStartIndex + i * 4;
      const topLeft = base;
      const bottomLeft = base + 1;
      const topRight = base + 2;
      const bottomRight = base + 3;

      // First triangle
      indices.push(topLeft, bottomLeft, topRight);
      // Second triangle
      indices.push(topRight, bottomLeft, bottomRight);
    }

    return new Geometry(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
  }
}
