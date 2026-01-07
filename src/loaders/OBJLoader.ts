import { Geometry } from '../geometry/Geometry';

/**
 * OBJ file loader
 * Parses Wavefront OBJ format and creates Geometry
 * Supports: vertices (v), texture coordinates (vt), normals (vn), faces (f)
 */
export class OBJLoader {
  /**
   * Load OBJ file from URL
   */
  static async load(gl: WebGL2RenderingContext, url: string): Promise<Geometry> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load OBJ file: ${url}`);
    }

    const text = await response.text();
    return OBJLoader.parse(gl, text);
  }

  /**
   * Parse OBJ file content
   */
  static parse(gl: WebGL2RenderingContext, content: string): Geometry {
    const lines = content.split('\n');

    // Temporary arrays (1-indexed for OBJ format)
    const positions: number[][] = [[]]; // positions[0] is unused, indices start at 1
    const uvs: number[][] = [[]]; // uvs[0] is unused
    const normals: number[][] = [[]]; // normals[0] is unused
    const faces: Array<Array<{ v: number; vt: number; vn: number }>> = [];

    // Parse lines
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith('#') || trimmed.length === 0) {
        continue;
      }

      const parts = trimmed.split(/\s+/);
      const type = parts[0];

      if (type === 'v') {
        // Vertex position: v x y z
        const x = parseFloat(parts[1] ?? '0');
        const y = parseFloat(parts[2] ?? '0');
        const z = parseFloat(parts[3] ?? '0');
        positions.push([x, y, z]);
      } else if (type === 'vt') {
        // Texture coordinate: vt u v
        const u = parseFloat(parts[1] ?? '0');
        const v = parseFloat(parts[2] ?? '0');
        uvs.push([u, v]);
      } else if (type === 'vn') {
        // Vertex normal: vn x y z
        const x = parseFloat(parts[1] ?? '0');
        const y = parseFloat(parts[2] ?? '0');
        const z = parseFloat(parts[3] ?? '0');
        normals.push([x, y, z]);
      } else if (type === 'f') {
        // Face: f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3
        // Support both v/vt/vn and v//vn formats
        const face: Array<{ v: number; vt: number; vn: number }> = [];
        
        for (let i = 1; i < parts.length; i++) {
          const vertex = parts[i];
          if (vertex === undefined) continue;
          
          const indices = vertex.split('/');
          const vIndex = parseInt(indices[0] ?? '0');
          const vtIndex = parseInt(indices[1] ?? '0') || 0; // 0 if not present
          const vnIndex = parseInt(indices[2] ?? '0');
          
          face.push({ v: vIndex, vt: vtIndex, vn: vnIndex });
        }
        
        faces.push(face);
      }
    }

    // Build interleaved vertex buffer
    const vertices: number[] = [];
    const indices: number[] = [];
    const vertexMap = new Map<string, number>(); // Map "v/vt/vn" -> vertex index
    let currentIndex = 0;

    // Generate a simple color (solid light grey)
    const getColorFromPosition = (_pos: number[]): [number, number, number] => {
      return [0.7, 0.7, 0.7];
    };

    // Process faces
    for (const face of faces) {
      // Triangulate if needed (for quads or n-gons)
      // Simple fan triangulation from first vertex
      for (let i = 1; i < face.length - 1; i++) {
        const v0 = face[0];
        const v1 = face[i];
        const v2 = face[i + 1];
        
        if (!v0 || !v1 || !v2) continue;

        for (const v of [v0, v1, v2]) {
          const key = `${v.v}/${v.vt}/${v.vn}`;
          
          let index = vertexMap.get(key);
          if (index === undefined) {
            // Add new vertex
            const pos = positions[v.v] ?? [0, 0, 0];
            const uv = v.vt > 0 ? (uvs[v.vt] ?? [0, 0]) : [0, 0];
            const normal = normals[v.vn] ?? [0, 0, 0];
            const color = getColorFromPosition(pos);
            
            // Interleaved: [position(3), color(3), normal(3), uv(2)]
            // Note: Flip V coordinate for OpenGL (1.0 - v)
            vertices.push(
              pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0,
              color[0], color[1], color[2],
              normal[0] ?? 0, normal[1] ?? 0, normal[2] ?? 0,
              uv[0] ?? 0, 1.0 - (uv[1] ?? 0) // Flip V coordinate
            );
            
            index = currentIndex++;
            vertexMap.set(key, index);
          }
          
          indices.push(index);
        }
      }
    }

    return new Geometry(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
  }
}
