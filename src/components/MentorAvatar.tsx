import React from 'react';

interface MentorAvatarProps {
  icon: string;
  themeColor: string;
  mood?: 'happy' | 'proud' | 'thinking' | 'touched' | 'sparkle';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  icon,
  themeColor,
  mood = 'happy',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
    hero: 'w-32 h-32 sm:w-36 sm:h-36 text-6xl',
  };

  const moodAura = {
    happy: 'ring-4 ring-emerald-300 shadow-emerald-200/50',
    proud: 'ring-4 ring-amber-300 shadow-amber-200/50',
    thinking: 'ring-4 ring-blue-300 shadow-blue-200/50',
    touched: 'ring-4 ring-pink-300 shadow-pink-200/50',
    sparkle: 'ring-4 ring-purple-300 shadow-purple-200/50',
  };

  const moodEmoji = {
    happy: '😊',
    proud: '✨',
    thinking: '💡',
    touched: '💖',
    sparkle: '🌟',
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-xl opacity-40 transition-all duration-500"
        style={{ backgroundColor: themeColor }}
      />

      {/* Main Avatar Card Frame */}
      <div
        className={`relative flex items-center justify-center rounded-3xl bg-gradient-to-b from-white/95 to-slate-100 shadow-lg border-2 border-white/80 transition-all duration-300 ${sizeMap[size]} ${moodAura[mood]}`}
      >
        <span className="transform transition-transform duration-300 hover:scale-110 drop-shadow-md">
          {icon}
        </span>

        {/* Small mood status badge on bottom right */}
        {size !== 'sm' && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-xs">
            {moodEmoji[mood]}
          </span>
        )}
      </div>
    </div>
  );
};
