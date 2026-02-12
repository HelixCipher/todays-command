import { useState, useEffect, useCallback } from 'react';

export interface WidgetBehaviorSettings {
  reminderEnabled: boolean;
  reminderTime: string;
  notificationType: 'system' | 'auto-show' | 'both';
  skipWeekends: boolean;
  playSound: boolean;
  missedReminderBehavior: 'immediate' | 'next-day' | 'manual';
  isFirstInstall: boolean;
}

const STORAGE_KEY = 'todays-command-widget-behavior';
const LAST_SEEN_KEY = 'todays-command-last-seen';

const defaultSettings: WidgetBehaviorSettings = {
  reminderEnabled: false,
  reminderTime: '09:00',
  notificationType: 'both',
  skipWeekends: false,
  playSound: false,
  missedReminderBehavior: 'immediate',
  isFirstInstall: true,
};

export function useWidgetBehavior() {
  const [behavior, setBehavior] = useState<WidgetBehaviorSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBehavior({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse widget behavior settings:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateBehavior = useCallback((updates: Partial<WidgetBehaviorSettings>) => {
    setBehavior((prev) => {
      const newBehavior = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBehavior));
      return newBehavior;
    });
  }, []);

  const markAsInstalled = useCallback(() => {
    updateBehavior({ isFirstInstall: false });
  }, [updateBehavior]);

  const markCommandAsSeen = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(LAST_SEEN_KEY, today);
  }, []);

  const getLastSeenDate = useCallback(() => {
    return localStorage.getItem(LAST_SEEN_KEY);
  }, []);

  return { 
    behavior, 
    setBehavior: updateBehavior, 
    isLoaded,
    markAsInstalled,
    markCommandAsSeen,
    getLastSeenDate
  };
}
