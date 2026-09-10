import * as THREE from 'three';

let glow: THREE.Texture | null = null;
let streak: THREE.Texture | null = null;

function canvasTexture(
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) paint(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A soft radial falloff — the flare that rides the edge through a cut. */
export function getGlowTexture(): THREE.Texture {
  glow ??= canvasTexture(128, 128, (ctx) => {
    const half = 64;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.22, 'rgba(214,244,255,0.6)');
    gradient.addColorStop(0.55, 'rgba(120,200,255,0.16)');
    gradient.addColorStop(1, 'rgba(80,160,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  });
  return glow;
}

/**
 * The mark a cut leaves behind: a thin white core inside a wider halo, tapered
 * to nothing at both ends. Drawn per-pixel because the shape is the point — a
 * plain gradient reads as a smudge, and this reads as an edge.
 */
export function getStreakTexture(): THREE.Texture {
  streak ??= canvasTexture(512, 96, (ctx) => {
    const image = ctx.createImageData(512, 96);
    const { data } = image;

    for (let y = 0; y < 96; y++) {
      const d = (y - 48) / 48;
      const core = Math.exp(-(d * d) / 0.0022);
      const halo = Math.exp(-(d * d) / 0.06);

      for (let x = 0; x < 512; x++) {
        // Tapered ends, sharpened so the middle of the slash carries the light.
        const along = Math.pow(Math.sin((Math.PI * x) / 511), 0.55);
        const alpha = Math.min(1, (core + halo * 0.2) * along);
        const i = (y * 512 + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(image, 0, 0);
  });
  return streak;
}
