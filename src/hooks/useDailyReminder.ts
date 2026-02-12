import { useCallback, useEffect, useRef } from 'react';
import { useWidgetBehavior } from './useWidgetBehavior';
import { invoke } from '@tauri-apps/api/core';

const LAST_SEEN_KEY = 'todays-command-last-seen';

export function useDailyReminder() {
  const { behavior, getLastSeenDate, markCommandAsSeen } = useWidgetBehavior();
  const hasCheckedToday = useRef(false);

  const shouldShowReminder = useCallback(() => {
    console.log('Checking if reminder should show...');
    console.log('Reminder enabled:', behavior.reminderEnabled);
    
    if (!behavior.reminderEnabled) {
      console.log('Reminders disabled, skipping');
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay();
    
    // Check if weekend should be skipped
    if (behavior.skipWeekends && (currentDay === 0 || currentDay === 6)) {
      console.log('Weekend and skipWeekends enabled, skipping');
      return false;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    console.log('Current time:', currentTime);
    console.log('Reminder time:', behavior.reminderTime);

    // Parse reminder time
    const [reminderHour, reminderMinute] = behavior.reminderTime.split(':').map(Number);

    // Check if current time is past or equal to reminder time
    const currentMinutes = currentHour * 60 + currentMinute;
    const reminderMinutes = reminderHour * 60 + reminderMinute;
    
    const isPastReminderTime = currentMinutes >= reminderMinutes;
    console.log('Is past reminder time:', isPastReminderTime);

    if (!isPastReminderTime) {
      console.log('Not yet time for reminder');
      return false;
    }

    // Check if already seen today
    const lastSeen = getLastSeenDate();
    const today = now.toISOString().split('T')[0];
    
    console.log('Last seen:', lastSeen);
    console.log('Today:', today);
    
    if (lastSeen === today) {
      console.log('Already seen today, skipping');
      return false;
    }

    console.log('Should show reminder!');
    return true;
  }, [behavior, getLastSeenDate]);

  const showReminder = useCallback(async () => {
    console.log('Showing reminder...');
    console.log('Notification type:', behavior.notificationType);
    
    try {
      // Send system notification first if enabled
      if (behavior.notificationType === 'system' || behavior.notificationType === 'both') {
        console.log('Sending system notification...');
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification("Today's Command", {
              body: 'Your daily command is ready! Click to view.',
              icon: '/icon.png',
            });
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification("Today's Command", {
                body: 'Your daily command is ready! Click to view.',
                icon: '/icon.png',
              });
            }
          }
        }
      }

      // Show window if enabled
      if (behavior.notificationType === 'auto-show' || behavior.notificationType === 'both') {
        console.log('Auto-showing widget...');
        await invoke('show_window');
        console.log('Widget shown');
      }

      // Mark as seen
      markCommandAsSeen();
      hasCheckedToday.current = true;
      console.log('Reminder shown and marked as seen');
    } catch (e) {
      console.error('Failed to show reminder:', e);
    }
  }, [behavior.notificationType, markCommandAsSeen]);

  const checkReminder = useCallback(() => {
    console.log('checkReminder called');
    if (shouldShowReminder()) {
      showReminder();
    } else {
      console.log('Reminder check complete - no reminder needed');
    }
  }, [shouldShowReminder, showReminder]);

  // Reset the daily check at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      hasCheckedToday.current = false;
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    checkReminder,
    markAsSeen: markCommandAsSeen,
    shouldShowReminder,
    getLastSeenDate,
  };
}
