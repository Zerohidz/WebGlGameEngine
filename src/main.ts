console.log('WebGL2 Game Engine - Starting...');

const canvas = document.getElementById('canvas');

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

// Resize canvas to fill window
function resizeCanvas(): void {
  if (canvas instanceof HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

console.log('Canvas initialized:', canvas.width, 'x', canvas.height);
