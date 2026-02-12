import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Terminal } from 'lucide-react';

// Debug: Log when module loads
console.log('DesktopIcon module loaded');

export function DesktopIcon() {
  console.log('DesktopIcon component rendering');
  const [isVisible, setIsVisible] = useState(false);

  // Check window visibility periodically
  useEffect(() => {
    console.log('DesktopIcon: Setting up visibility checker');
    
    const checkVisibility = async () => {
      try {
        const window = getCurrentWindow();
        const visible = await window.isVisible();
        console.log('DesktopIcon: Window visible:', visible);
        setIsVisible(!visible); // Show icon when window is hidden
      } catch (e) {
        console.error('DesktopIcon: Failed to check visibility:', e);
      }
    };

    // Check immediately
    checkVisibility();
    
    // Check every 2 seconds
    const interval = setInterval(checkVisibility, 2000);

    // Also listen for events as backup
    let unlistenHidden: (() => void) | null = null;
    let unlistenShown: (() => void) | null = null;

    listen('window-hidden', () => {
      console.log('DesktopIcon: Received window-hidden event');
      setIsVisible(true);
    }).then((fn) => { unlistenHidden = fn; });

    listen('window-shown', () => {
      console.log('DesktopIcon: Received window-shown event');
      setIsVisible(false);
    }).then((fn) => { unlistenShown = fn; });

    return () => {
      clearInterval(interval);
      if (unlistenHidden) unlistenHidden();
      if (unlistenShown) unlistenShown();
    };
  }, []);

  const handleClick = useCallback(async () => {
    try {
      console.log('DesktopIcon: Clicked, showing window');
      await invoke('show_window');
      setIsVisible(false);
    } catch (e) {
      console.error('DesktopIcon: Failed to show window:', e);
    }
  }, []);

  console.log('DesktopIcon: Rendering, isVisible:', isVisible);

  if (!isVisible) return null;

  return (
    <div
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[100] w-16 h-16 bg-card border-2 border-primary rounded-full shadow-2xl cursor-pointer hover:scale-110 hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center group animate-bounce"
      title="Today's Command - Click to show"
    >
      <Terminal className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
      <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
    </div>
  );
}
