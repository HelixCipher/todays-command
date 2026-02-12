import { useState, useEffect } from 'react';
import { CommandCategory } from '@/data/commands';

const STORAGE_KEY = 'todays-command-category';

export function useCommandSettings() {
  const [category, setCategory] = useState<CommandCategory>('linux');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['linux', 'python', 'sql', 'shuffle'].includes(stored)) {
      setCategory(stored as CommandCategory);
    }
    setIsLoaded(true);
  }, []);

  const updateCategory = (newCategory: CommandCategory) => {
    setCategory(newCategory);
    localStorage.setItem(STORAGE_KEY, newCategory);
  };

  return { category, setCategory: updateCategory, isLoaded };
}
