'use client';

import { useRef, useCallback } from 'react';
import { useSynthContext } from '@/contexts/synth-context';
import { useTransportContext } from '@/contexts/transport-context';
import { useLoopRecorder } from '@/hooks/use-loop-recorder';
import { emitTutorialEvent } from '@/lib/tutorial-events';
import { cn } from '@/lib/utils';

// SVG Icon components
function IconRecord({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={cn('w-3.5 h-3.5', className)}>
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}

function IconStop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={cn('w-3 h-3', className)}>
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  );
}

function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={cn('w-3.5 h-3.5', className)}>
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}

function IconPause({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={cn('w-3 h-3', className)}>
      <rect x="3" y="2" width="3.5" height="12" rx="0.5" />
      <rect x="9.5" y="2" width="3.5" height="12" rx="0.5" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn('w-3 h-3', className)}>
      <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
      <path d="M3 12h10" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn('w-3 h-3', className)}>
      <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M3 4h10" />
      <path d="M5 4l.5 9h5l.5-9" />
    </svg>
  );
}

export function LoopRecorder() {
  const { engine } = useSynthContext();
  const { state: transportState, dispatch } = useTransportContext();
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const mediaStream = engine?.getMediaStream() ?? null;
  const { isRecording, duration, startRecording, stopRecording } =
    useLoopRecorder(mediaStream);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording().then((loop) => {
        if (loop) {
          dispatch({ type: 'ADD_LOOP', payload: loop });
        }
      });
    } else {
      startRecording();
      emitTutorialEvent('recording-start');
    }
  }, [isRecording, startRecording, stopRecording, dispatch]);

  const handlePlayLoop = useCallback(
    (index: number) => {
      const loop = transportState.loops[index];
      if (!loop) return;

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }

      const audio = new Audio(loop.url);
      audio.loop = true;
      audio.play();
      audioPlayerRef.current = audio;
      dispatch({ type: 'SET_ACTIVE_LOOP', payload: index });
      dispatch({ type: 'PLAY_LOOP' });
    },
    [transportState.loops, dispatch]
  );

  const handleStopLoop = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    dispatch({ type: 'STOP_LOOP' });
    dispatch({ type: 'SET_ACTIVE_LOOP', payload: null });
  }, [dispatch]);

  const handleDeleteLoop = useCallback(
    (index: number) => {
      if (transportState.activeLoopIndex === index) {
        handleStopLoop();
      }
      dispatch({ type: 'DELETE_LOOP', payload: index });
    },
    [transportState.activeLoopIndex, handleStopLoop, dispatch]
  );

  const handleDownloadLoop = useCallback(
    (index: number) => {
      const loop = transportState.loops[index];
      if (!loop) return;
      const a = document.createElement('a');
      a.href = loop.url;
      a.download = `${loop.name}.webm`;
      a.click();
    },
    [transportState.loops]
  );

  const formatDuration = (d: number) => {
    const mins = Math.floor(d / 60);
    const secs = Math.floor(d % 60);
    const ms = Math.floor((d % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="px-4 py-3 border-t border-device-divider">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-op1-red font-mono text-[10px] font-bold tracking-wider">
          LOOPS
        </span>

        {/* Record button */}
        <button
          onClick={handleRecord}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors',
            isRecording
              ? 'border-op1-red bg-op1-red/20 recording-pulse'
              : 'border-device-text-dim hover:border-op1-red'
          )}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <IconStop className="text-op1-red" />
          ) : (
            <IconRecord className="text-op1-red" />
          )}
        </button>

        {/* Stop playback button */}
        {transportState.isPlaying && (
          <button
            onClick={handleStopLoop}
            className="w-7 h-7 rounded-full border-2 border-device-text-dim hover:border-op1-white flex items-center justify-center transition-colors"
            title="Stop playback"
          >
            <IconStop className="text-op1-white" />
          </button>
        )}

        {/* Recording duration */}
        {isRecording && (
          <span className="text-op1-red font-mono text-xs">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Saved loops */}
      {transportState.loops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {transportState.loops.map((loop, index) => {
            const isActive = transportState.activeLoopIndex === index && transportState.isPlaying;
            return (
              <div
                key={loop.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono transition-colors',
                  isActive
                    ? 'border-op1-green/50 bg-op1-green/5'
                    : 'border-device-border bg-device-step-bg/50 hover:border-device-text-dim'
                )}
              >
                {/* Play/Pause button */}
                <button
                  onClick={() => isActive ? handleStopLoop() : handlePlayLoop(index)}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0',
                    isActive
                      ? 'border-op1-green text-op1-green hover:bg-op1-green/20'
                      : 'border-device-text-dim text-device-text-muted hover:border-op1-green hover:text-op1-green'
                  )}
                  title={isActive ? 'Stop' : 'Play'}
                >
                  {isActive ? <IconPause /> : <IconPlay />}
                </button>

                {/* Loop info */}
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    'text-[10px] block truncate',
                    isActive ? 'text-op1-green' : 'text-device-text-muted'
                  )}>
                    {loop.name}
                  </span>
                  <span className={cn(
                    'text-[9px]',
                    isActive ? 'text-op1-green/60' : 'text-device-text-dim'
                  )}>
                    {formatDuration(loop.duration)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownloadLoop(index)}
                    className="w-6 h-6 rounded flex items-center justify-center text-device-text-dim hover:text-op1-blue hover:bg-op1-blue/10 transition-colors"
                    title="Download loop"
                  >
                    <IconDownload />
                  </button>
                  <button
                    onClick={() => handleDeleteLoop(index)}
                    className="w-6 h-6 rounded flex items-center justify-center text-device-text-dim hover:text-op1-red hover:bg-op1-red/10 transition-colors"
                    title="Delete loop"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
