export type CommandCategory = 'linux' | 'python' | 'sql' | 'shuffle';

export interface Command {
  command: string;
  description: string;
  category: Exclude<CommandCategory, 'shuffle'>;
  example?: string;
}

export const commands: Command[] = [
  // Linux Commands
  { command: 'ls -la', description: 'List all files including hidden ones with detailed info like permissions, size, and modification date.', category: 'linux' },
  { command: 'grep -r "pattern" .', description: 'Recursively search for a pattern in all files within the current directory and subdirectories.', category: 'linux' },
  { command: 'chmod 755 file', description: 'Set file permissions: owner can read/write/execute, others can read/execute.', category: 'linux' },
  { command: 'find . -name "*.log" -delete', description: 'Find and delete all .log files in the current directory tree.', category: 'linux' },
  { command: 'tar -czvf archive.tar.gz folder/', description: 'Create a compressed gzip archive of a folder.', category: 'linux' },
  { command: 'ps aux | grep process', description: 'List all running processes and filter by name.', category: 'linux' },
  { command: 'df -h', description: 'Display disk space usage in human-readable format.', category: 'linux' },
  { command: 'ssh user@host', description: 'Connect to a remote server via SSH.', category: 'linux' },
  { command: 'curl -I https://example.com', description: 'Fetch only the HTTP headers from a URL.', category: 'linux' },
  { command: 'awk \'{print $1}\' file.txt', description: 'Print the first column of each line in a file.', category: 'linux' },
  { command: 'sed -i \'s/old/new/g\' file.txt', description: 'Replace all occurrences of "old" with "new" in a file.', category: 'linux' },
  { command: 'xargs -I {} command {}', description: 'Execute a command for each line of input, replacing {} with the line.', category: 'linux' },
  { command: 'tail -f logfile.log', description: 'Follow a log file in real-time, showing new lines as they are added.', category: 'linux' },
  { command: 'rsync -avz source/ dest/', description: 'Sync files between directories with compression and verbose output.', category: 'linux' },
  { command: 'htop', description: 'Interactive process viewer with CPU, memory usage, and process management.', category: 'linux' },

  // Python Commands
  { command: 'list(map(lambda x: x**2, nums))', description: 'Apply a function to each element of a list using map and lambda.', category: 'python' },
  { command: '[x for x in items if condition]', description: 'List comprehension with filtering - create a new list from filtered elements.', category: 'python' },
  { command: 'with open("file.txt") as f:', description: 'Context manager for file handling - automatically closes file when done.', category: 'python' },
  { command: 'from collections import defaultdict', description: 'Dictionary that provides default values for missing keys.', category: 'python' },
  { command: '@property', description: 'Decorator to define a method as a property getter for cleaner attribute access.', category: 'python' },
  { command: 'zip(list1, list2)', description: 'Combine two lists into pairs of tuples, iterating in parallel.', category: 'python' },
  { command: 'dict.get(key, default)', description: 'Get a value from dict with a fallback default if key doesn\'t exist.', category: 'python' },
  { command: 'enumerate(iterable)', description: 'Loop with automatic index counter - returns (index, value) pairs.', category: 'python' },
  { command: 'try: ... except Exception as e:', description: 'Exception handling with error capture for graceful error recovery.', category: 'python' },
  { command: '**kwargs', description: 'Accept arbitrary keyword arguments as a dictionary in function definitions.', category: 'python' },
  { command: 'asyncio.gather(*tasks)', description: 'Run multiple async tasks concurrently and wait for all to complete.', category: 'python' },
  { command: 'functools.lru_cache()', description: 'Decorator to cache function results for performance optimization.', category: 'python' },
  { command: 'os.path.join(path, file)', description: 'Join path components in a cross-platform compatible way.', category: 'python' },
  { command: 'datetime.strptime(str, format)', description: 'Parse a string into a datetime object using a format string.', category: 'python' },
  { command: 'json.dumps(obj, indent=2)', description: 'Serialize Python object to a formatted JSON string.', category: 'python' },

  // SQL Commands
  { command: 'SELECT DISTINCT column FROM table', description: 'Return only unique values from a column, removing duplicates.', category: 'sql' },
  { command: 'LEFT JOIN table2 ON t1.id = t2.id', description: 'Join tables keeping all rows from left table, even without matches.', category: 'sql' },
  { command: 'GROUP BY column HAVING COUNT(*) > 1', description: 'Group rows and filter groups based on aggregate conditions.', category: 'sql' },
  { command: 'COALESCE(col1, col2, default)', description: 'Return the first non-null value from a list of columns.', category: 'sql' },
  { command: 'WITH cte AS (SELECT ...)', description: 'Common Table Expression - create a named temporary result set.', category: 'sql' },
  { command: 'ROW_NUMBER() OVER (ORDER BY col)', description: 'Window function to assign sequential numbers to rows.', category: 'sql' },
  { command: 'CASE WHEN cond THEN val END', description: 'Conditional logic within a query - SQL\'s if-else statement.', category: 'sql' },
  { command: 'INSERT INTO ... ON CONFLICT DO UPDATE', description: 'Upsert operation - insert or update if record exists (PostgreSQL).', category: 'sql' },
  { command: 'CREATE INDEX idx ON table(col)', description: 'Create an index to speed up queries on frequently searched columns.', category: 'sql' },
  { command: 'EXPLAIN ANALYZE SELECT ...', description: 'Show query execution plan with actual timing for optimization.', category: 'sql' },
  { command: 'ARRAY_AGG(column)', description: 'Aggregate values into an array within a GROUP BY query.', category: 'sql' },
  { command: 'STRING_AGG(column, delimiter)', description: 'Concatenate string values with a delimiter in a group.', category: 'sql' },
  { command: 'LATERAL JOIN subquery', description: 'Join with a subquery that can reference columns from preceding tables.', category: 'sql' },
  { command: 'NULLIF(expr1, expr2)', description: 'Return null if two expressions are equal, otherwise return expr1.', category: 'sql' },
  { command: 'EXTRACT(YEAR FROM date_col)', description: 'Extract a specific part (year, month, day) from a date/timestamp.', category: 'sql' },
];

export function getCommandForDate(category: CommandCategory, date: Date): Command {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  let filteredCommands: Command[];
  
  if (category === 'shuffle') {
    filteredCommands = commands;
  } else {
    filteredCommands = commands.filter(cmd => cmd.category === category);
  }

  const index = dayOfYear % filteredCommands.length;
  return filteredCommands[index];
}

export function getTodaysCommand(category: CommandCategory): Command {
  return getCommandForDate(category, new Date());
}

export function getPreviousCommands(category: CommandCategory, days: number = 7): { date: Date; command: Command }[] {
  const result: { date: Date; command: Command }[] = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    result.push({
      date,
      command: getCommandForDate(category, date),
    });
  }
  
  return result;
}

export const categoryLabels: Record<CommandCategory, string> = {
  linux: 'Linux',
  python: 'Python',
  sql: 'SQL',
  shuffle: 'Shuffle',
};

export const categoryColors: Record<Exclude<CommandCategory, 'shuffle'>, string> = {
  linux: 'linux',
  python: 'python',
  sql: 'sql',
};
