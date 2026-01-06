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

    // Index tracking
    let vertexIndex = 0;

    // === TOP CAP ===
    const topCenterIndex = vertexIndex++;
    // Center vertex: position, color, normal
    vertices.push(0, halfHeight, 0, ...topColor, 0, 1, 0);

    // Top cap perimeter
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Position, color, normal (pointing up)
      vertices.push(x, halfHeight, z, ...topColor, 0, 1, 0);
      vertexIndex++;
    }

    // Top cap triangles (fan from center)
    for (let i = 0; i < segments; i++) {
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
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Position, color, normal (pointing down)
      vertices.push(x, -halfHeight, z, ...bottomColor, 0, -1, 0);
      vertexIndex++;
    }

    // Bottom cap triangles (fan from center, reversed winding)
    for (let i = 0; i < segments; i++) {
      indices.push(
        bottomCenterIndex,
        bottomCenterIndex + i + 2,
        bottomCenterIndex + i + 1
      );
    }

    // === SIDE WALLS ===
    const sideStartIndex = vertexIndex;

    // Generate two rings of vertices (top and bottom)
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Normal for cylinder side (radial outward)
      const nx = Math.cos(angle);
      const nz = Math.sin(angle);

      // Top vertex
      const t = i / segments; // Color gradient parameter
      const r = topColor[0] * (1 - t) + bottomColor[0] * t;
      const g = topColor[1] * (1 - t) + bottomColor[1] * t;
      const b = topColor[2] * (1 - t) + bottomColor[2] * t;

      vertices.push(x, halfHeight, z, r, g, b, nx, 0, nz);

      // Bottom vertex
      vertices.push(x, -halfHeight, z, r, g, b, nx, 0, nz);

      vertexIndex += 2;
    }

    // Side wall quads (two triangles per segment)
    for (let i = 0; i < segments; i++) {
      const topLeft = sideStartIndex + i * 2;
      const bottomLeft = topLeft + 1;
      const topRight = topLeft + 2;
      const bottomRight = topRight + 1;

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
