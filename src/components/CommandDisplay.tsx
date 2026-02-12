import { Command } from '@/data/commands';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CommandDisplayProps {
  command: Command;
}

const glowClasses = {
  linux: 'glow-linux',
  python: 'glow-python',
  sql: 'glow-sql',
};

const borderClasses = {
  linux: 'border-linux/20 hover:border-linux/40',
  python: 'border-python/20 hover:border-python/40',
  sql: 'border-sql/20 hover:border-sql/40',
};

const accentClasses = {
  linux: 'text-linux',
  python: 'text-python',
  sql: 'text-sql',
};

export function CommandDisplay({ command }: CommandDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <CategoryBadge category={command.category} />
      </div>

      <div
        className={cn(
          'relative group rounded-lg border bg-muted/50 p-4 transition-all duration-300',
          borderClasses[command.category],
          glowClasses[command.category]
        )}
      >
        <button
          onClick={handleCopy}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent',
            accentClasses[command.category]
          )}
          aria-label="Copy command"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        <code
          className={cn(
            'font-mono text-lg md:text-xl font-medium block pr-10 break-all',
            accentClasses[command.category]
          )}
        >
          {command.command}
        </code>
      </div>

      <p className="mt-4 text-muted-foreground leading-relaxed">
        {command.description}
      </p>
    </div>
  );
}
