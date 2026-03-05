import { useState } from 'react';
import { getPreviousCommands, CommandCategory } from '@/data/commands';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import { ChevronDown, Copy, Check, History } from 'lucide-react';

interface PreviousCommandsProps {
  category: CommandCategory;
}

const accentClasses = {
  linux: 'text-linux',
  python: 'text-python',
  sql: 'text-sql',
};

const borderClasses = {
  linux: 'border-linux/20 hover:border-linux/30',
  python: 'border-python/20 hover:border-python/30',
  sql: 'border-sql/20 hover:border-sql/30',
};

export function PreviousCommands({ category }: PreviousCommandsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const previousCommands = getPreviousCommands(category, 7);

  const handleCopy = async (command: string, index: number) => {
    await navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between py-2"
      >
        <span className="flex items-center gap-2">
          <History className="w-4 h-4" />
          Previous Commands
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-2">
            {previousCommands.map(({ date, command }, index) => (
              <div
                key={index}
                className={cn(
                  'group relative rounded-lg border bg-muted/30 p-3 transition-all duration-200',
                  borderClasses[command.category]
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(date)}
                      </span>
                      <CategoryBadge category={command.category} className="scale-75 origin-left" />
                    </div>
                    <code
                      className={cn(
                        'font-mono text-sm block truncate',
                        accentClasses[command.category]
                      )}
                    >
                      {command.command}
                    </code>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {command.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(command.command, index)}
                    className={cn(
                      'p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-accent shrink-0',
                      accentClasses[command.category]
                    )}
                    aria-label="Copy command"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
