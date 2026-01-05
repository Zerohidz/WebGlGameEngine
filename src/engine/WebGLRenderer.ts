/**
 * WebGL2 Renderer
 */
export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;

  constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    this.gl = gl;
    this.canvas = canvas;

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Enable face culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Set clear color (black)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }

  /**
   * Clear the screen
   */
  clear(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Set clear color
   */
  setClearColor(r: number, g: number, b: number, a: number): void {
    this.gl.clearColor(r, g, b, a);
  }

  /**
   * Set viewport
   */
  setViewport(x: number, y: number, width: number, height: number): void {
    this.gl.viewport(x, y, width, height);
  }

  /**
   * Get the WebGL context
   */
  getContext(): WebGL2RenderingContext {
    return this.gl;
  }

  /**
   * Get the canvas
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get canvas aspect ratio
   */
  getAspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }
}
