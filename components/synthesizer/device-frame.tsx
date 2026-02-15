'use client';

import { ReactNode } from 'react';

interface DeviceFrameProps {
  children: ReactNode;
}

export function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="device-frame rounded-3xl border border-device-border w-full max-w-4xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
