
import React, { useState, useEffect, useCallback } from 'react';

interface ForgotPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MathQuestion {
  questionText: string;
  options: number[];
  correctAnswer: number;
}

// Function to generate a random number in a range
const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateQuestion = (): MathQuestion => {
  const num1 = getRandomInt(5, 15);
  const num2 = getRandomInt(2, 12);
  const correctAnswer = num1 * num2;
  const questionText = `What is ${num1} × ${num2}?`;

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = getRandomInt(-15, 15);
    // Ensure offset is not 0 and the distractor is plausible
    if (offset !== 0 && correctAnswer + offset > 0) {
      const distractor = correctAnswer + offset;
      if (distractor !== correctAnswer) {
        distractors.add(distractor);
      }
    }
  }

  const options = shuffleArray([correctAnswer, ...Array.from(distractors)]);
  return { questionText, options, correctAnswer };
};

const ForgotPasscodeModal: React.FC<ForgotPasscodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuestion(generateQuestion());
      setSelectedAnswer(null);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedAnswer === null) {
      setError('Please select an answer.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (selectedAnswer === question?.correctAnswer) {
        onSuccess();
      } else {
        setError('That’s not correct. Please try again.');
        setQuestion(generateQuestion()); // Ask a new question
        setSelectedAnswer(null);
      }
      setIsLoading(false);
    }, 500);
  }, [selectedAnswer, question, onSuccess]);

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
              event.preventDefault();
              handleSubmit();
          }
      };

      if (isOpen) {
          document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
          document.removeEventListener('keydown', handleKeyDown);
      };
  }, [isOpen, handleSubmit]);

  if (!isOpen || !question) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all text-[var(--text-primary)]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Forgot Passcode?</h2>
        <p className="text-[var(--text-secondary)] mb-6 text-center">
          To reset your passcode, please answer this question.
        </p>

        {error && <p className="bg-[var(--danger-bg-subtle)] text-[var(--danger)] p-3 rounded-lg mb-4 border border-[var(--danger-border)] text-sm">{error}</p>}

        <form onSubmit={handleSubmit}>
            <p className="text-[var(--text-primary)] mb-6 text-center text-3xl font-bold tracking-wider">
                {question.questionText}
            </p>

            <div className="grid grid-cols-2 gap-4 my-8">
                {question.options.map(option => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full py-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:-translate-y-px disabled:opacity-50 ${
                            selectedAnswer === option
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-text)] shadow-lg ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-primary)]'
                                : 'bg-[var(--bg-tertiary)] hover:opacity-80 text-[var(--text-primary)] border border-[var(--border-secondary)]'
                        }`}
                        disabled={isLoading}
                    >
                        {option}
                    </button>
                ))}
            </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:opacity-80 border border-[var(--border-secondary)] font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedAnswer === null}
              className="px-6 py-2 rounded-lg text-[var(--accent-primary-text)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Reset Passcode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasscodeModal;
