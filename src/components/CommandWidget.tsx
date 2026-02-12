import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getTodaysCommand } from '@/data/commands';
import { useCommandSettings } from '@/hooks/useCommandSettings';
import { useStreak } from '@/hooks/useStreak';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { useWidgetBehavior } from '@/hooks/useWidgetBehavior';
import { CommandDisplay } from './CommandDisplay';
import { SettingsPanel } from './SettingsPanel';
import { PreviousCommands } from './PreviousCommands';
import { Quiz } from './Quiz';
import { QuizStatsPanel } from './QuizStatsPanel';
import { StreakCounter } from './StreakCounter';
import { Calendar, Sparkles, BarChart3, Minus } from 'lucide-react';

export function CommandWidget() {
  const { category, setCategory, isLoaded } = useCommandSettings();
  const { currentStreak, longestStreak, isLoaded: streakLoaded, recordQuizCompletion } = useStreak();
  const { history, stats, addAttempt, isLoaded: historyLoaded } = useQuizHistory();
  const { behavior, setBehavior, isLoaded: behaviorLoaded } = useWidgetBehavior();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Sound for notification
  const playNotificationSound = useCallback(() => {
    if (!behavior?.playSound) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 200);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }, [behavior?.playSound]);

  // Simple reminder checker
  useEffect(() => {
    if (!behaviorLoaded || !behavior?.reminderEnabled) return;
    
    console.log('Reminder: Setting up checker for time:', behavior.reminderTime);
    
    let lastTriggeredMinute: string | null = null;
    
    const checkReminder = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentMinute = `${now.getHours()}:${now.getMinutes()}`;
      
      // Only trigger once per minute
      if (currentTime === behavior.reminderTime && lastTriggeredMinute !== currentMinute) {
        console.log('Reminder: Time matched! Showing widget...');
        lastTriggeredMinute = currentMinute;
        
        // Play sound
        playNotificationSound();
        
        // Show window
        invoke('show_window');
      }
    };

    // Check immediately
    checkReminder();
    
    // Then check every 10 seconds (more responsive)
    const interval = setInterval(checkReminder, 10000);
    return () => clearInterval(interval);
  }, [behaviorLoaded, behavior?.reminderEnabled, behavior?.reminderTime, playNotificationSound]);

  const handleMinimize = useCallback(async () => {
    await invoke('hide_window');
  }, []);

  const handleDragStart = useCallback(async () => {
    await invoke('start_drag');
  }, []);

  const handleQuizComplete = useCallback((score: number, totalQuestions: number) => {
    addAttempt({ category, score, totalQuestions });
    recordQuizCompletion();
  }, [category, addAttempt, recordQuizCompletion]);

  if (!isLoaded || !streakLoaded || !historyLoaded || !behaviorLoaded) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 bg-card/95 border border-border rounded-xl p-4 animate-pulse">
          <div className="h-5 bg-muted rounded w-28 mb-3" />
          <div className="h-12 bg-muted rounded mb-3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-3/4 mt-2" />
        </div>
      </div>
    );
  }

  const command = getTodaysCommand(category);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Drag handle */}
      <div 
        className="h-6 w-full cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-primary/5"
        data-tauri-drag-region
        onMouseDown={handleDragStart}
      >
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
      </div>
      
      <div className="flex-1 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-bold truncate">Today's Command</h1>
              <StreakCounter currentStreak={currentStreak} longestStreak={longestStreak} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {today}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setShowStats(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQuiz(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <SettingsPanel 
              currentCategory={category} 
              onCategoryChange={setCategory}
              behavior={behavior}
              setBehavior={setBehavior}
            />
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CommandDisplay command={command} />
        </div>

        <div className="mt-3 pt-3 border-t border-border overflow-hidden">
          <PreviousCommands category={category} />
        </div>
      </div>

      {showQuiz && (
        <Quiz
          category={category}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}

      {showStats && (
        <QuizStatsPanel
          stats={stats}
          history={history}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}
