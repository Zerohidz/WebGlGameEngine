/**
 * Base class for all geometry types
 * Manages WebGL buffers (VAO, VBO, IBO) for rendering
 */
export class Geometry {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;
  private indexCount: number;

  /**
   * Create geometry with interleaved vertex data
   * @param gl WebGL context
   * @param vertices Interleaved vertex data [posX, posY, posZ, colorR, colorG, colorB, normalX, normalY, normalZ, ...]
   * @param indices Index buffer for indexed drawing
   */
  constructor(
    gl: WebGL2RenderingContext,
    vertices: Float32Array,
    indices: Uint16Array
  ) {
    this.gl = gl;
    this.indexCount = indices.length;

    // Create Vertex Array Object (VAO)
    // WebGL spec allows null return, but TS lib types don't reflect this
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const vao = gl.createVertexArray();
    if (vao === null) {
      throw new Error('Failed to create VAO');
    }
    this.vao = vao;
    gl.bindVertexArray(this.vao);

    // Create Vertex Buffer Object (VBO)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const vbo = gl.createBuffer();
    if (vbo === null) {
      throw new Error('Failed to create VBO');
    }
    this.vbo = vbo;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Vertex attribute layout (interleaved):
    // Position (3 floats) + Color (3 floats) + Normal (3 floats) = 9 floats per vertex
    const stride = 9 * Float32Array.BYTES_PER_ELEMENT;

    // Position attribute (location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);

    // Color attribute (location 1)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(
      1,
      3,
      gl.FLOAT,
      false,
      stride,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    // Normal attribute (location 2)
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(
      2,
      3,
      gl.FLOAT,
      false,
      stride,
      6 * Float32Array.BYTES_PER_ELEMENT
    );

    // Create Index Buffer Object (IBO)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const ibo = gl.createBuffer();
    if (ibo === null) {
      throw new Error('Failed to create IBO');
    }
    this.ibo = ibo;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Unbind
    gl.bindVertexArray(null);
  }

  /**
   * Get the Vertex Array Object
   */
  getVAO(): WebGLVertexArrayObject {
    return this.vao;
  }

  /**
   * Get the number of indices to draw
   */
  getIndexCount(): number {
    return this.indexCount;
  }

  /**
   * Cleanup WebGL resources
   */
  dispose(): void {
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteBuffer(this.vbo);
    this.gl.deleteBuffer(this.ibo);
  }
}
