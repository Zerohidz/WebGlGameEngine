/**
 * Texture loader for WebGL
 * Loads images and creates WebGL texture objects
 */
export class TextureLoader {
  /**
   * Load a texture from a URL
   */
  static async load(
    gl: WebGL2RenderingContext,
    url: string,
    options: {
      wrapS?: number;
      wrapT?: number;
      minFilter?: number;
      magFilter?: number;
      generateMipmaps?: boolean;
    } = {}
  ): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        const texture = TextureLoader.createTextureFromImage(gl, image, options);
        if (texture) {
          resolve(texture);
        } else {
          reject(new Error('Failed to create texture'));
        }
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      image.src = url;
    });
  }

  /**
   * Create a WebGL texture from an image
   */
  static createTextureFromImage(
    gl: WebGL2RenderingContext,
    image: HTMLImageElement,
    options: {
      wrapS?: number;
      wrapT?: number;
      minFilter?: number;
      magFilter?: number;
      generateMipmaps?: boolean;
    } = {}
  ): WebGLTexture | null {
    const texture = gl.createTexture();
    if (!texture) {
      return null;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload the image to the texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );

    // Set texture parameters
    const wrapS = options.wrapS ?? gl.REPEAT;
    const wrapT = options.wrapT ?? gl.REPEAT;
    const minFilter = options.minFilter ?? gl.LINEAR_MIPMAP_LINEAR;
    const magFilter = options.magFilter ?? gl.LINEAR;
    const generateMipmaps = options.generateMipmaps ?? true;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

    // Generate mipmaps if requested
    if (generateMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }

  /**
   * Create a solid color texture (useful for objects without textures)
   */
  static createColorTexture(
    gl: WebGL2RenderingContext,
    r: number,
    g: number,
    b: number,
    a: number = 255
  ): WebGLTexture | null {
    const texture = gl.createTexture();
    if (!texture) {
      return null;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Create a 1x1 pixel texture with the specified color
    const pixel = new Uint8Array([r, g, b, a]);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixel
    );

    // No need for mipmaps on a 1x1 texture
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
}
