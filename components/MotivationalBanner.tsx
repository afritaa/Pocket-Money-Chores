import React, { useMemo, useState, useEffect } from 'react';
import { PayDayMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MotivationalBannerProps {
  todaysCompletedChores: number;
  todaysTotalChores: number;
  potentialEarnings: number;
  showPotentialEarnings: boolean;
  isPaydayToday: boolean;
  payDayMode: PayDayMode | undefined;
  earnings: number;
}

const MotivationalBanner: React.FC<MotivationalBannerProps> = ({
  todaysCompletedChores,
  todaysTotalChores,
  potentialEarnings,
  showPotentialEarnings,
  isPaydayToday,
  payDayMode,
  earnings,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = useMemo(() => {
    // 1. Determine the chore progress message
    let choreProgressMessage = '';
    const choresLeft = todaysTotalChores - todaysCompletedChores;

    if (todaysTotalChores === 0) {
      choreProgressMessage = "No chores today, enjoy! 😎";
    } else if (choresLeft === 0) {
      choreProgressMessage = "You've smashed it! 🤯";
    } else if (todaysTotalChores > 2 && choresLeft <= 2) {
      choreProgressMessage = "Almost there! 🤩";
    } else if (todaysCompletedChores === 0) {
      choreProgressMessage = "Let's get started! 💪";
    } else if (todaysCompletedChores === 1) {
      choreProgressMessage = "Every chore counts! 💯";
    } else if (todaysCompletedChores >= 2) {
      // Alternate based on the number of completed chores
      choreProgressMessage = todaysCompletedChores % 2 === 0
        ? "Keep up the great work! ✨"
        : "You're doing great! 🎉";
    }

    // 2. Determine the potential earnings message
    let earningsMessage = null;
    if (showPotentialEarnings && potentialEarnings > 0) {
        const totalPossible = earnings + potentialEarnings;
        earningsMessage = `You could have $${(totalPossible / 100).toFixed(2)}`;
        
        if (payDayMode === 'manual' || payDayMode === 'automatic') {
            earningsMessage += isPaydayToday ? " by the end of today! 💰" : " by pay day! 💪";
        } else { // anytime mode
            earningsMessage += " by the end of today! 🥕";
        }
    }

    // 3. Combine them
    const messagePool = [choreProgressMessage];
    // Only show potential earnings if there are still chores to do
    if (earningsMessage && choresLeft > 0) {
      messagePool.push(earningsMessage);
    }
    
    return messagePool.filter(Boolean);

  }, [todaysCompletedChores, todaysTotalChores, potentialEarnings, showPotentialEarnings, isPaydayToday, payDayMode, earnings]);
  
  useEffect(() => {
    // Reset index if messages change to avoid out-of-bounds error
    setMessageIndex(0);
    
    if (messages.length <= 1) return;
    
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, [messages]); // Rerun effect when the list of messages changes

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-10 bg-black/70 text-white/90 backdrop-blur-sm z-30 flex items-center justify-center overflow-hidden rounded-t-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={`${messageIndex}-${messages[messageIndex]}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="py-2 font-semibold text-sm"
        >
          {messages[messageIndex] || ''}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default MotivationalBanner;
