'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Smooth mesh gradient: a few wide colour masses plus one flowing cyan
 * ribbon, with the whole coordinate field bent by low-frequency noise. The
 * warp is what turns plain shapes into soft organic masses — high-frequency
 * turbulence would read as smoke, which is not the look here.
 *
 * The pointer doesn't move the composition; it disturbs the field locally —
 * a swirl, an outward nudge and a ripple — so the layout stays put and the
 * colours just bend under the cursor. Deliberately no light source follows
 * the pointer: that reads as a dot tracking the mouse, not as a surface.
 */
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseActive;
  uniform float uMouseSpeed;

  uniform vec3 uBase;
  uniform vec3 uNavy;
  uniform vec3 uIndigo;
  uniform vec3 uViolet;
  uniform vec3 uTeal;
  uniform vec3 uCyan;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Only two octaves — enough to bend the field organically without
  // introducing visible grain.
  float fbm(vec2 p) {
    return noise(p) * 0.65 + noise(p * 2.03) * 0.35;
  }

  /**
   * Soft elliptical mass with independent x/y radii, so it can be stretched
   * rather than always reading as a circle.
   */
  float pool(vec2 p, vec2 center, vec2 radius) {
    vec2 d = (p - center) / radius;
    return exp(-dot(d, d));
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    // Everything works in unit UV space, correcting for aspect only where a
    // shape must stay circular. Staying in 0..1 is what lets the ribbon be
    // described as a curve in y.
    vec2 q = vUv;
    float t = uTime * 0.045;

    // Low-frequency warp of the whole plane. Deliberately gentle — a heavy
    // warp dissolves the ribbon into noise and the composition stops reading.
    vec2 warp = vec2(
      fbm(q * vec2(1.6, 1.0) + vec2(0.0, t)),
      fbm(q * vec2(1.6, 1.0) + vec2(4.7, 2.3) - t * 0.85)
    );
    vec2 wq = q + (warp - 0.5) * 0.24;

    // ── Pointer disturbance ──────────────────────────────────────────
    // A bubble of influence around the cursor. Everything below is scaled by
    // it, which keeps the interaction feeling like a touch on the surface
    // rather than a camera move.
    vec2 toM = (wq - uMouse) * vec2(aspect, 1.0);
    float dM = length(toM);
    float infl = exp(-dM * dM * 5.5) * uMouseActive;

    // Rotate the field around the cursor — the faster the pointer travels,
    // the more the colours twist behind it.
    float ang = infl * (0.7 + uMouseSpeed * 2.6);
    float sa = sin(ang);
    float ca = cos(ang);
    vec2 rot = mat2(ca, -sa, sa, ca) * toM;
    vec2 dir = normalize(rot + 1e-5);

    // Push outward so the mass opens up under the cursor, plus one slow ring
    // riding out from it — a ripple that never resolves into hard bands.
    rot += dir * infl * (0.07 + uMouseSpeed * 0.24);
    rot += dir * sin(dM * 13.0 - uTime * 2.4) * infl * 0.030;
    wq = uMouse + rot / vec2(aspect, 1.0);

    // The whole composition also leans a touch toward the pointer.
    wq -= (uMouse - 0.5) * uMouseActive * 0.05;

    vec3 color = uBase;

    // Broad midnight field filling the middle of the frame.
    color = mix(color, uNavy,   pool(wq, vec2(0.46, 0.52), vec2(0.62, 0.60)) * 0.95);
    // Indigo shoulder, lower left.
    color = mix(color, uIndigo, pool(wq, vec2(0.20, 0.30), vec2(0.34, 0.34)) * 0.90);
    // Violet core, left of centre — the counterweight to the cyan side.
    color = mix(color, uViolet, pool(wq, vec2(0.25, 0.50), vec2(0.22, 0.26)) * 0.95);

    // The ribbon: a sine curve in y, so the cyan flows down the right of the
    // frame as a band instead of pooling into a circle.
    vec2 rq = q + (wq - q) * 0.55;
    float xc = 0.63 + sin(rq.y * 3.0 + 0.9) * 0.16;
    float dr = rq.x - xc;
    // Fades at the very top and bottom so the band has ends.
    float span = smoothstep(-0.15, 0.30, rq.y) * smoothstep(1.20, 0.72, rq.y);
    color = mix(color, uTeal, exp(-dr * dr * 38.0) * span * 0.92);
    // Brighter accent core inside the band, strongest through the middle.
    float core = exp(-dr * dr * 150.0) * span
               * smoothstep(0.02, 0.42, rq.y) * smoothstep(1.00, 0.62, rq.y);
    color = mix(color, uCyan, core * 0.80);

    // Faint teal echo, far right — keeps that corner from going flat black.
    color = mix(color, uTeal, pool(wq, vec2(1.02, 0.44), vec2(0.26, 0.22)) * 0.35);

    // Keep the corners sunk so the UI in front holds its contrast.
    float vig = smoothstep(1.05, 0.20, length(vUv - 0.5) * 1.35);
    color *= mix(0.38, 1.0, vig);

    // Final pull-down — the reference is a poster, this has to sit behind
    // text.
    color *= 0.82;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function AuroraPlane() {
  const { viewport, size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, active: 0, speed: 0 });
  // Mutated every frame, so it lives in a ref rather than a memo.
  const eased = useRef({ x: 0.5, y: 0.5 });

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseActive: { value: 0 },
      uMouseSpeed: { value: 0 },
      // Site palette, each stop taken below its token value so the field
      // stays a backdrop: void base, midnight/indigo body, and the cyan
      // accent reserved for the one bright ribbon.
      uBase: { value: new THREE.Color('#04070d') },
      uNavy: { value: new THREE.Color('#0f2260') },
      uIndigo: { value: new THREE.Color('#2a2a8f') },
      uViolet: { value: new THREE.Color('#50239c') },
      uTeal: { value: new THREE.Color('#0b6d80') },
      uCyan: { value: new THREE.Color('#1a9caa') },
    }),
    []
  );

  useEffect(() => {
    let lastX = 0.5;
    let lastY = 0.5;

    const handleMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      // Distance covered since the previous event drives the swirl strength.
      // Clamped so a fast flick across the screen doesn't tear the field.
      mouse.current.speed = Math.min(Math.hypot(x - lastX, y - lastY) * 12, 1);
      lastX = x;
      lastY = y;
      mouse.current.x = x;
      mouse.current.y = y;
      mouse.current.active = 1;
    };
    const handleLeave = () => {
      mouse.current.active = 0;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uResolution.value.set(size.width, size.height);

    const e = eased.current;
    e.x += (mouse.current.x - e.x) * 0.08;
    e.y += (mouse.current.y - e.y) * 0.08;
    mat.uniforms.uMouse.value.set(e.x, e.y);

    mat.uniforms.uMouseActive.value +=
      (mouse.current.active - mat.uniforms.uMouseActive.value) * 0.05;

    // Speed decays on its own; pointermove only ever pushes it back up, so
    // the swirl unwinds smoothly the moment the pointer stops.
    mat.uniforms.uMouseSpeed.value += (mouse.current.speed - mat.uniforms.uMouseSpeed.value) * 0.12;
    mouse.current.speed *= 0.9;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function AuroraCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1, near: 0, far: 2 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <AuroraPlane />
    </Canvas>
  );
}
