'use client';

import { useRef, useState, useCallback } from 'react';
import { LoopRecording } from '@/lib/types';

export function useLoopRecorder(mediaStream: MediaStream | null) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(() => {
    if (!mediaStream) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorderRef.current = recorder;
    recorder.start(100); // collect data every 100ms
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, [mediaStream]);

  const stopRecording = useCallback((): Promise<LoopRecording | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const dur = (Date.now() - startTimeRef.current) / 1000;

        const loop: LoopRecording = {
          id: `loop-${Date.now()}`,
          name: `Loop ${new Date().toLocaleTimeString()}`,
          blob,
          url,
          duration: dur,
          createdAt: Date.now(),
        };

        setIsRecording(false);
        setDuration(0);
        resolve(loop);
      };

      recorder.stop();
    });
  }, []);

  return { isRecording, duration, startRecording, stopRecording };
}
