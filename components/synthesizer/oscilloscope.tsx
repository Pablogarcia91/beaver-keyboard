'use client';

import { useRef, useEffect } from 'react';
import { useOscilloscope } from '@/hooks/use-oscilloscope';

interface OscilloscopeProps {
  analyser: AnalyserNode | null;
  color?: string;
}

export function Oscilloscope({
  analyser,
  color = '#4ECB71',
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { mode, setMode } = useOscilloscope(canvasRef, analyser, color);

  // Resize canvas to fill container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="rounded-md w-full h-full"
      />
      <div className="absolute top-2 right-2 flex border border-op1-green/30 rounded overflow-hidden">
        <button
          onClick={() => setMode('waveform')}
          className={`px-2 py-0.5 text-[9px] font-mono font-bold transition-colors ${
            mode === 'waveform'
              ? 'bg-op1-green/20 text-op1-green'
              : 'text-op1-green/40 hover:text-op1-green/70'
          }`}
        >
          WAVE
        </button>
        <button
          onClick={() => setMode('spectrum')}
          className={`px-2 py-0.5 text-[9px] font-mono font-bold transition-colors ${
            mode === 'spectrum'
              ? 'bg-op1-green/20 text-op1-green'
              : 'text-op1-green/40 hover:text-op1-green/70'
          }`}
        >
          SPEC
        </button>
      </div>
    </div>
  );
}
