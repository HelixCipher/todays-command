import { useState, useMemo } from 'react';
import { commands, Command, CommandCategory } from '@/data/commands';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles } from 'lucide-react';

interface QuizProps {
  category: CommandCategory;
  onClose: () => void;
  onComplete?: (score: number, totalQuestions: number) => void;
}

interface Question {
  command: Command;
  options: string[];
  correctIndex: number;
}

function generateQuestions(category: CommandCategory, count: number = 5): Question[] {
  const filteredCommands = category === 'shuffle' 
    ? commands 
    : commands.filter(cmd => cmd.category === category);
  
  const shuffled = [...filteredCommands].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  return selected.map(command => {
    const otherCommands = filteredCommands
      .filter(c => c.command !== command.command)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [command.description, ...otherCommands.map(c => c.description)];
    const correctIndex = 0;
    
    // Shuffle options
    const shuffledOptions = options
      .map((opt, idx) => ({ opt, isCorrect: idx === 0 }))
      .sort(() => Math.random() - 0.5);
    
    return {
      command,
      options: shuffledOptions.map(o => o.opt),
      correctIndex: shuffledOptions.findIndex(o => o.isCorrect),
    };
  });
}

const accentClasses = {
  linux: 'text-linux',
  python: 'text-python',
  sql: 'text-sql',
};

const bgClasses = {
  linux: 'bg-linux',
  python: 'bg-python',
  sql: 'bg-sql',
};

export function Quiz({ category, onClose, onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>(() => generateQuestions(category));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    if (index === currentQuestion.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      if (!hasReported) {
        onComplete?.(score, questions.length);
        setHasReported(true);
      }
    }
  };

  const handleRestart = () => {
    setQuestions(generateQuestions(category));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setHasReported(false);
  };

  const scorePercentage = Math.round((score / questions.length) * 100);

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Command Quiz</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent transition-colors"
              aria-label="Close quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showResult ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className={cn('w-10 h-10', scorePercentage >= 80 ? 'text-yellow-500' : 'text-primary')} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
              <p className="text-muted-foreground mb-4">
                You scored <span className="text-foreground font-semibold">{score}</span> out of <span className="text-foreground font-semibold">{questions.length}</span>
              </p>
              <div className="w-full bg-muted rounded-full h-3 mb-6">
                <div
                  className={cn('h-3 rounded-full transition-all duration-500', bgClasses[currentQuestion?.command.category || 'linux'])}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {scorePercentage >= 80 
                  ? '🎉 Excellent! You really know your commands!'
                  : scorePercentage >= 60
                  ? '👍 Good job! Keep practicing to improve.'
                  : '📚 Keep learning! Review the commands and try again.'}
              </p>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span>Score: {score}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn('h-2 rounded-full transition-all duration-300', bgClasses[currentQuestion.command.category])}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-4">
                <CategoryBadge category={currentQuestion.command.category} className="mb-3" />
                <p className="text-sm text-muted-foreground mb-2">What does this command do?</p>
                <code className={cn('font-mono text-lg font-medium block p-3 rounded-lg bg-muted/50 border border-border', accentClasses[currentQuestion.command.category])}>
                  {currentQuestion.command.command}
                </code>
              </div>

              {/* Options */}
              <div className="space-y-2 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectOption = index === currentQuestion.correctIndex;
                  
                  let optionClass = 'border-border hover:border-muted-foreground/50 hover:bg-accent/50';
                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionClass = 'border-green-500/50 bg-green-500/10';
                    } else if (isSelected && !isCorrectOption) {
                      optionClass = 'border-red-500/50 bg-red-500/10';
                    } else {
                      optionClass = 'border-border opacity-50';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={isAnswered}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-start gap-3',
                        optionClass,
                        !isAnswered && 'cursor-pointer'
                      )}
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm leading-relaxed flex-1">{option}</span>
                      {isAnswered && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Next */}
              {isAnswered && (
                <div className="animate-fade-in">
                  <div className={cn(
                    'p-3 rounded-lg mb-4 text-sm',
                    isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  )}>
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect. The correct answer is highlighted above.'}
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
