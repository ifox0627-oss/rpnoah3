import React from 'react';
import { Mic, Check, X } from 'lucide-react';

interface AudioWaveformProps {
  isListening: boolean;
  interimText: string;
  onFinish: () => void;
  onCancel: () => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isListening,
  interimText,
  onFinish,
  onCancel,
}) => {
  if (!isListening) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border border-rose-500/50 shadow-xl shadow-rose-950/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Animated Mic + Status + Wave bars */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Pulsing Mic Indicator */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <span className="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping" />
            <div className="relative w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/50">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Waveform bars */}
          <div className="flex items-center gap-1 h-7 px-1 flex-shrink-0">
            {[40, 75, 95, 60, 85, 50, 90, 65].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-rose-500 to-pink-300 rounded-full transition-all duration-150 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '600ms',
                }}
              />
            ))}
          </div>

          {/* Transcript / Listening Label */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-xs font-bold text-rose-300 font-['Jua'] tracking-wide">
                듣고 있어요... 마이크에 말씀해 주세요!
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium truncate max-w-xs sm:max-w-md mt-0.5">
              {interimText ? (
                <span className="text-amber-200">"{interimText}"</span>
              ) : (
                <span className="text-slate-400 italic">말씀하시는 내용이 여기에 실시간으로 표시됩니다...</span>
              )}
            </p>
          </div>
        </div>

        {/* Right action buttons: Finish & Cancel */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <button
            type="button"
            onClick={onFinish}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-['Jua'] text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
            title="음성 인식을 완료하고 입력창에 반영합니다"
          >
            <Check className="w-3.5 h-3.5 text-emerald-200" />
            <span>녹음 완료</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            title="음성 인식을 취소합니다"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>취소</span>
          </button>
        </div>
      </div>
    </div>
  );
};
