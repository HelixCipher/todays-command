import { useState, useEffect, useCallback } from 'react';
import { CommandCategory } from '@/data/commands';

const STORAGE_KEY = 'todays-command-quiz-history';

export interface QuizAttempt {
  date: string;
  category: CommandCategory;
  score: number;
  totalQuestions: number;
  percentage: number;
}

export interface QuizStats {
  totalQuizzes: number;
  bestScore: number;
  averageScore: number;
  perfectScores: number;
  quizzesByCategory: Record<string, number>;
}

export function useQuizHistory() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Invalid data, start fresh
    }
    setIsLoaded(true);
  }, []);

  const addAttempt = useCallback((attempt: Omit<QuizAttempt, 'date' | 'percentage'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      date: new Date().toISOString().split('T')[0],
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
    };

    setHistory(prev => {
      const updated = [newAttempt, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newAttempt;
  }, []);

  const stats: QuizStats = {
    totalQuizzes: history.length,
    bestScore: history.length > 0 ? Math.max(...history.map(h => h.percentage)) : 0,
    averageScore: history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / history.length)
      : 0,
    perfectScores: history.filter(h => h.percentage === 100).length,
    quizzesByCategory: history.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return { history, stats, addAttempt, isLoaded };
}
