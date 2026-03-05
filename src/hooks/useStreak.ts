import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'todays-command-streak';

interface StreakData {
  lastQuizDate: string;
  currentStreak: number;
  longestStreak: number;
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    lastQuizDate: '',
    currentStreak: 0,
    longestStreak: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Migrate old format
        if (data.lastVisitDate && !data.lastQuizDate) {
          data.lastQuizDate = data.lastVisitDate;
          delete data.lastVisitDate;
        }
        setStreak(data);
      } catch {
        // Invalid data
      }
    }
    setIsLoaded(true);
  }, []);

  const recordQuizCompletion = useCallback(() => {
    const today = getDateString(new Date());

    setStreak(prev => {
      let updated: StreakData;

      if (prev.lastQuizDate === today) {
        // Already completed a quiz today
        return prev;
      } else if (prev.lastQuizDate && getDaysDifference(prev.lastQuizDate, today) === 1) {
        // Consecutive day
        const newStreak = prev.currentStreak + 1;
        updated = {
          lastQuizDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
        };
      } else {
        // First quiz or streak broken
        updated = {
          lastQuizDate: today,
          currentStreak: 1,
          longestStreak: Math.max(prev.longestStreak, 1),
        };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { ...streak, isLoaded, recordQuizCompletion };
}
