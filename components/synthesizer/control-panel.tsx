'use client';

import { useSynthContext } from '@/contexts/synth-context';
import { RotaryKnob } from './rotary-knob';
import { OP1_COLORS } from '@/lib/audio/constants';

export function ControlPanel() {
  const { state, setEffects, setVolume, setEnvelope } = useSynthContext();
  const { effects, masterVolume, envelope } = state;

  return (
    <div className="px-4 py-3 border-t border-device-divider">
      <div className="flex items-center justify-center gap-8">
        {/* Knobs */}
        <div className="flex items-start gap-5">
          <RotaryKnob
            value={effects.filterFrequency}
            min={20}
            max={20000}
            color={OP1_COLORS.orange}
            label="FILTER"
            displayValue={`${effects.filterFrequency > 1000 ? `${(effects.filterFrequency / 1000).toFixed(1)}k` : Math.round(effects.filterFrequency)}Hz`}
            onChange={(v) => setEffects({ filterFrequency: v })}
          />
          <RotaryKnob
            value={effects.filterResonance}
            min={0}
            max={20}
            color={OP1_COLORS.green}
            label="RES"
            displayValue={effects.filterResonance.toFixed(1)}
            onChange={(v) => setEffects({ filterResonance: v })}
          />
          <RotaryKnob
            value={effects.delayMix}
            min={0}
            max={1}
            color={OP1_COLORS.blue}
            label="DELAY"
            displayValue={`${Math.round(effects.delayMix * 100)}%`}
            onChange={(v) => setEffects({ delayMix: v })}
          />
          <RotaryKnob
            value={masterVolume}
            min={0}
            max={1}
            color={OP1_COLORS.white}
            label="VOL"
            displayValue={`${Math.round(masterVolume * 100)}%`}
            onChange={setVolume}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-14 bg-device-border" />

        {/* ADSR controls */}
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-device-text-dim tracking-wider mr-1">ADSR</span>
          {(['attack', 'decay', 'sustain', 'release'] as const).map((param) => {
            const isTime = param !== 'sustain';
            const max = param === 'release' ? 3 : param === 'sustain' ? 1 : 2;
            const min = isTime ? 0.001 : 0;
            const color =
              param === 'attack'
                ? OP1_COLORS.orange
                : param === 'decay'
                ? OP1_COLORS.green
                : param === 'sustain'
                ? OP1_COLORS.blue
                : OP1_COLORS.white;

            return (
              <div key={param} className="flex flex-col items-center gap-1">
                <div className="relative h-14 w-3 bg-device-divider rounded-full overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full rounded-full transition-all duration-100"
                    style={{
                      height: `${((envelope[param] - min) / (max - min)) * 100}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 4px ${color}`,
                    }}
                  />
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={0.01}
                    value={envelope[param]}
                    onChange={(e) =>
                      setEnvelope({ [param]: parseFloat(e.target.value) })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                </div>
                <span className="text-[8px] font-mono text-device-text-dim uppercase">
                  {param[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
