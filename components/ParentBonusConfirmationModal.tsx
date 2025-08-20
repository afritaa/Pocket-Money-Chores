



import React, { useEffect } from 'react';
import { StarIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ParentBonusConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
}

const ParentBonusConfirmationModal: React.FC<ParentBonusConfirmationModalProps> = ({ isOpen, onClose, childName }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000); // Auto-close after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const names = childName.split(', ');
    const isMultiple = names.length > 1;

    return (
        <AnimatePresence>
            {isOpen && (
            <motion.div
                className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity p-4"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-[var(--accent-secondary)] rounded-3xl p-6 sm:p-8 w-full max-w-md transform transition-all text-black/80 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                    initial={{ y: '-100vh', opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }}
                    exit={{ y: '-100vh', opacity: 0, transition: { duration: 0.2 } }}
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-300/80 flex items-center justify-center">
                                <StarIcon className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-black drop-shadow-lg">Bonus Awarded!</h2>
                        <p className="text-lg text-black/90 drop-shadow-md">
                            You've awarded a bonus to <span className="font-bold">{childName}</span>. Once {isMultiple ? 'they accept their bonuses' : `${names[0]} accepts the bonus`}, it will appear in {isMultiple ? 'their' : 'their'} earnings.
                        </p>
                    </div>
                    <div className="flex-shrink-0 mt-6">
                        <button
                            onClick={onClose}
                            className="mx-auto block px-8 py-3 rounded-lg text-amber-800 bg-yellow-300 hover:bg-yellow-200 font-extrabold text-lg tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all border-2 border-yellow-200"
                        >
                            Great!
                        </button>
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ParentBonusConfirmationModal;