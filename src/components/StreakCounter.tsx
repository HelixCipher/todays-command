import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakCounter({ currentStreak, longestStreak, className }: StreakCounterProps) {
  const isOnFire = currentStreak >= 7;
  const isMilestone = currentStreak >= 30;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300',
        isMilestone
          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500'
          : isOnFire
          ? 'border-orange-500/40 bg-orange-500/10 text-orange-500'
          : 'border-primary/30 bg-primary/10 text-primary',
        className
      )}
      title={`Longest streak: ${longestStreak} days`}
    >
      <Flame
        className={cn(
          'w-4 h-4',
          (isOnFire || isMilestone) && 'animate-pulse-glow'
        )}
      />
      <span className="text-sm font-semibold tabular-nums">{currentStreak}</span>
      <span className="text-xs opacity-70">
        {currentStreak === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
}
