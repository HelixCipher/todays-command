import { CommandCategory, categoryLabels } from '@/data/commands';
import { WidgetBehaviorSettings } from '@/hooks/useWidgetBehavior';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Code, 
  Database, 
  Shuffle, 
  Settings, 
  X,
  Bell,
  Clock,
  Volume2,
  Calendar,
  Monitor,
  AlertCircle,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsPanelProps {
  currentCategory: CommandCategory;
  onCategoryChange: (category: CommandCategory) => void;
  behavior: any;
  setBehavior: any;
}

const categoryConfig: Record<CommandCategory, { icon: typeof Terminal; colorClass: string }> = {
  linux: { icon: Terminal, colorClass: 'text-linux border-linux/40 bg-linux/10 hover:bg-linux/20' },
  python: { icon: Code, colorClass: 'text-python border-python/40 bg-python/10 hover:bg-python/20' },
  sql: { icon: Database, colorClass: 'text-sql border-sql/40 bg-sql/10 hover:bg-sql/20' },
  shuffle: { icon: Shuffle, colorClass: 'text-shuffle border-shuffle/40 bg-shuffle/10 hover:bg-shuffle/20' },
};

const activeClasses: Record<CommandCategory, string> = {
  linux: 'ring-2 ring-linux ring-offset-2 ring-offset-background',
  python: 'ring-2 ring-python ring-offset-2 ring-offset-background',
  sql: 'ring-2 ring-sql ring-offset-2 ring-offset-background',
  shuffle: 'ring-2 ring-shuffle ring-offset-2 ring-offset-background',
};

const reminderTimes = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const isValidTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export function SettingsPanel({ currentCategory, onCategoryChange, behavior, setBehavior }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState<WidgetBehaviorSettings | null>(null);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState('09:00');
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes whenever formState updates
  useEffect(() => {
    if (formState && behavior) {
      const currentTime = useCustomTime && isValidTime(customTimeValue) 
        ? customTimeValue 
        : formState.reminderTime;
      
      const savedTime = behavior.reminderTime;
      
      const changed = 
        formState.reminderEnabled !== behavior.reminderEnabled ||
        currentTime !== savedTime ||
        formState.notificationType !== behavior.notificationType ||
        formState.skipWeekends !== behavior.skipWeekends ||
        formState.playSound !== behavior.playSound ||
        formState.missedReminderBehavior !== behavior.missedReminderBehavior;
      
      setHasChanges(changed);
    }
  }, [formState, behavior, useCustomTime, customTimeValue]);

  // Open settings
  const openSettings = () => {
    if (behavior) {
      setFormState({ ...behavior });
      // Check if using custom time
      const isCustom = !reminderTimes.includes(behavior.reminderTime);
      setUseCustomTime(isCustom);
      if (isCustom) {
        setCustomTimeValue(behavior.reminderTime);
      }
    }
    setIsOpen(true);
    setHasChanges(false);
  };

  // Close settings
  const closeSettings = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      setIsOpen(false);
      setFormState(null);
    }
  };

  // Force close without saving
  const forceClose = () => {
    setIsOpen(false);
    setFormState(null);
    setShowUnsavedDialog(false);
    setHasChanges(false);
  };

  // Save settings
  const saveSettings = () => {
    if (formState) {
      const timeToSave = useCustomTime && isValidTime(customTimeValue) 
        ? customTimeValue 
        : formState.reminderTime;
      
      setBehavior({
        ...formState,
        reminderTime: timeToSave
      });
      setHasChanges(false);
      setIsOpen(false);
      setFormState(null);
      setShowUnsavedDialog(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof WidgetBehaviorSettings>(
    field: K, 
    value: WidgetBehaviorSettings[K]
  ) => {
    setFormState(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (!behavior) {
    return (
      <button className="p-2 rounded-lg text-muted-foreground">
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={openSettings}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Open settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && formState && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={closeSettings}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Settings</h2>
                <button
                  onClick={closeSettings}
                  className="p-1 rounded-md hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-3 block">
                  Command Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(categoryConfig) as CommandCategory[]).map((cat) => {
                    const config = categoryConfig[cat];
                    const Icon = config.icon;
                    const isActive = currentCategory === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border transition-all duration-200',
                          config.colorClass,
                          isActive && activeClasses[cat]
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{categoryLabels[cat]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Widget Behavior */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Widget Behavior</h3>
                  {hasChanges && (
                    <span className="ml-auto text-xs text-yellow-500 font-medium">
                      Unsaved changes
                    </span>
                  )}
                </div>

                {/* Enable Reminders */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.reminderEnabled}
                      onChange={(e) => updateField('reminderEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-sm">Enable daily reminders</span>
                  </label>
                </div>

                {formState.reminderEnabled && (
                  <div className="space-y-4 pl-7">
                    {/* Reminder Time */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="w-3 h-3" />
                        Reminder time
                      </label>
                      
                      {/* Preset times */}
                      {!useCustomTime ? (
                        <select
                          value={formState.reminderTime}
                          onChange={(e) => updateField('reminderTime', e.target.value)}
                          className="w-full p-2 rounded-lg bg-background border border-border text-sm"
                        >
                          {reminderTimes.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={customTimeValue}
                          onChange={(e) => setCustomTimeValue(e.target.value)}
                          placeholder="HH:MM"
                          className="w-full p-2 rounded-lg bg-background border border-border text-sm"
                        />
                      )}
                      
                      {/* Custom time toggle */}
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useCustomTime}
                          onChange={(e) => setUseCustomTime(e.target.checked)}
                          className="w-3 h-3 rounded text-primary"
                        />
                        <span className="text-xs text-muted-foreground">Use custom time</span>
                      </label>
                      
                      {useCustomTime && !isValidTime(customTimeValue) && customTimeValue && (
                        <p className="text-xs text-red-500 mt-1">
                          Invalid time format. Use HH:MM (e.g., 07:30)
                        </p>
                      )}
                    </div>

                    {/* Notification Type */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Monitor className="w-3 h-3" />
                        Notification type
                      </label>
                      <div className="space-y-2">
                        {(['system', 'auto-show', 'both'] as const).map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="notificationType"
                              checked={formState.notificationType === type}
                              onChange={() => updateField('notificationType', type)}
                              className="w-3 h-3 text-primary"
                            />
                            <span className="text-sm">
                              {type === 'system' && 'System notification only'}
                              {type === 'auto-show' && 'Auto-show widget'}
                              {type === 'both' && 'Both notification and auto-show'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Skip Weekends */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.skipWeekends}
                          onChange={(e) => updateField('skipWeekends', e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">Skip weekends</span>
                        </div>
                      </label>
                    </div>

                    {/* Play Sound */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formState.playSound}
                          onChange={(e) => updateField('playSound', e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">Play notification sound</span>
                        </div>
                      </label>
                    </div>

                    {/* Missed Reminder */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <AlertCircle className="w-3 h-3" />
                        If you miss the reminder
                      </label>
                      <select
                        value={formState.missedReminderBehavior}
                        onChange={(e) => updateField('missedReminderBehavior', e.target.value as any)}
                        className="w-full p-2 rounded-lg bg-background border border-border text-sm"
                      >
                        <option value="immediate">Show immediately when computer starts</option>
                        <option value="next-day">Wait until next scheduled time</option>
                        <option value="manual">Show only when manually opening widget</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={saveSettings}
                  disabled={useCustomTime && !isValidTime(customTimeValue)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Unsaved Changes Dialog */}
          {showUnsavedDialog && (
            <>
              <div
                className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[60]"
                onClick={() => setShowUnsavedDialog(false)}
              />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm">
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Unsaved Changes</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    You have unsaved changes in your widget behavior settings. Would you like to save them before closing?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={forceClose}
                      className="flex-1 p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => setShowUnsavedDialog(false)}
                      className="flex-1 p-3 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSettings}
                      className="flex-1 p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
