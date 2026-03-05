import { cn } from '@/lib/utils';
import { BarChart3, Target, Trophy, Percent, X } from 'lucide-react';
import { QuizStats, QuizAttempt } from '@/hooks/useQuizHistory';
import { Achievements } from './Achievements';

interface QuizStatsPanelProps {
  stats: QuizStats;
  history: QuizAttempt[];
  currentStreak: number;
  longestStreak: number;
  onClose: () => void;
}

export function QuizStatsPanel({ stats, history, currentStreak, longestStreak, onClose }: QuizStatsPanelProps) {
  const recentHistory = history.slice(0, 10);

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Quiz Statistics</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent transition-colors"
              aria-label="Close stats"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard
              icon={<Trophy className="w-4 h-4" />}
              label="Total Quizzes"
              value={stats.totalQuizzes.toString()}
              colorClass="text-primary"
            />
            <StatCard
              icon={<Target className="w-4 h-4" />}
              label="Best Score"
              value={`${stats.bestScore}%`}
              colorClass="text-primary"
            />
            <StatCard
              icon={<Percent className="w-4 h-4" />}
              label="Avg Score"
              value={`${stats.averageScore}%`}
              colorClass="text-sql"
            />
            <StatCard
              icon={<Target className="w-4 h-4" />}
              label="Perfect Scores"
              value={stats.perfectScores.toString()}
              colorClass="text-python"
            />
          </div>

          {/* Achievements */}
          <div className="mb-6">
            <Achievements
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              stats={stats}
            />
          </div>

          {/* Recent History */}
          {recentHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Recent Quizzes</h3>
              <div className="space-y-2">
                {recentHistory.map((attempt, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        attempt.percentage >= 80 ? 'bg-primary' :
                        attempt.percentage >= 60 ? 'bg-python' : 'bg-destructive'
                      )} />
                      <div>
                        <span className="text-xs font-medium capitalize">{attempt.category}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(attempt.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {attempt.score}/{attempt.totalQuestions}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({attempt.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.totalQuizzes === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Take your first quiz to start tracking stats!
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, colorClass }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className={cn('flex items-center gap-1.5 mb-1', colorClass)}>
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  if (dateStr === todayStr) return 'Today';
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
