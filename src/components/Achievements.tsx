import { cn } from '@/lib/utils';
import { Trophy, Flame, Star, Crown, Zap, Target } from 'lucide-react';
import { QuizStats } from '@/hooks/useQuizHistory';

interface AchievementsProps {
  currentStreak: number;
  longestStreak: number;
  stats: QuizStats;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  colorClass: string;
}

export function Achievements({ currentStreak, longestStreak, stats }: AchievementsProps) {
  const peakStreak = Math.max(currentStreak, longestStreak);

  const achievements: Achievement[] = [
    {
      id: 'first-quiz',
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: <Zap className="w-4 h-4" />,
      unlocked: stats.totalQuizzes >= 1,
      colorClass: 'text-primary border-primary/30 bg-primary/10',
    },
    {
      id: 'streak-7',
      name: 'On Fire',
      description: '7-day quiz streak',
      icon: <Flame className="w-4 h-4" />,
      unlocked: peakStreak >= 7,
      colorClass: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
    },
    {
      id: 'streak-30',
      name: 'Dedicated',
      description: '30-day quiz streak',
      icon: <Star className="w-4 h-4" />,
      unlocked: peakStreak >= 30,
      colorClass: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    },
    {
      id: 'streak-100',
      name: 'Legendary',
      description: '100-day quiz streak',
      icon: <Crown className="w-4 h-4" />,
      unlocked: peakStreak >= 100,
      colorClass: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    },
    {
      id: 'perfect',
      name: 'Perfect Score',
      description: 'Score 100% on a quiz',
      icon: <Target className="w-4 h-4" />,
      unlocked: stats.perfectScores >= 1,
      colorClass: 'text-primary border-primary/30 bg-primary/10',
    },
    {
      id: 'ten-quizzes',
      name: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: <Trophy className="w-4 h-4" />,
      unlocked: stats.totalQuizzes >= 10,
      colorClass: 'text-sql border-sql/30 bg-sql/10',
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-primary" />
          Achievements
        </h3>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={cn(
              'flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-200',
              achievement.unlocked
                ? achievement.colorClass
                : 'border-border/50 bg-muted/30 text-muted-foreground opacity-50'
            )}
          >
            <div className={cn(
              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              achievement.unlocked ? 'bg-current/10' : 'bg-muted'
            )}>
              {achievement.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{achievement.name}</p>
              <p className="text-[10px] opacity-70 truncate">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
