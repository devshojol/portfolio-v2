'use client';

import dynamic from 'next/dynamic';
import { useCanRenderScene, usePrefersReducedMotion } from '@/lib/media';

const AuroraCanvas = dynamic(() => import('./AuroraCanvas'), {
  ssr: false,
  loading: () => <AuroraFallback />,
});

/**
 * Painted stand-in for the shader, used on phones, tablets and for
 * reduced-motion visitors. Same palette, no per-pixel noise to evaluate.
 */
function AuroraFallback() {
  return (
    <div className="bg-void absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,#0f226099_0%,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(45%_50%_at_20%_70%,#2a2a8f99_0%,transparent_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(38%_42%_at_34%_38%,#50239caa_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(30%_58%_at_74%_45%,#0b6d80aa_0%,transparent_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(22%_34%_at_70%_70%,#1a9caa99_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#04070dcc_78%,#04070d_100%)]" />
    </div>
  );
}

export default function AuroraGradient() {
  const canRenderScene = useCanRenderScene();
  const reduced = usePrefersReducedMotion();
  // The shader runs four fbm evaluations per pixel — worth gating to large
  // pointer-driven screens rather than making phones pay for it.
  const showShader = canRenderScene && !reduced;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {showShader ? <AuroraCanvas /> : <AuroraFallback />}
    </div>
  );
}
