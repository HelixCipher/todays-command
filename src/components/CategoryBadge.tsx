import { cn } from '@/lib/utils';
import { CommandCategory } from '@/data/commands';
import { Terminal, Code, Database, Shuffle } from 'lucide-react';

interface CategoryBadgeProps {
  category: Exclude<CommandCategory, 'shuffle'>;
  className?: string;
}

const categoryConfig = {
  linux: {
    icon: Terminal,
    label: 'Linux',
    colorClass: 'text-linux border-linux/30 bg-linux/10',
  },
  python: {
    icon: Code,
    label: 'Python',
    colorClass: 'text-python border-python/30 bg-python/10',
  },
  sql: {
    icon: Database,
    label: 'SQL',
    colorClass: 'text-sql border-sql/30 bg-sql/10',
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider transition-all duration-300',
        config.colorClass,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}
