'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

type DisplayMode = 'waveform' | 'spectrum';

export function useOscilloscope(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  analyser: AnalyserNode | null,
  color: string = '#4ECB71'
) {
  const animationFrameRef = useRef<number>(0);
  const [mode, setMode] = useState<DisplayMode>('waveform');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) {
      animationFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const y = (height / 8) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 0; i < 16; i++) {
      const x = (width / 16) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const bufferLength = analyser.frequencyBinCount;

    if (modeRef.current === 'waveform') {
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // Spectrum mode
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        ctx.fillStyle = color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
        if (x > width) break;
      }
      ctx.shadowBlur = 0;
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  }, [canvasRef, analyser, color]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [draw]);

  return { mode, setMode };
}
