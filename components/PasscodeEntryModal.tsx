
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface PasscodeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPasscode: string | null;
  onSuccess: () => void;
}

const PasscodeEntryModal: React.FC<PasscodeEntryModalProps> = ({ isOpen, onClose, correctPasscode, onSuccess }) => {
    const [enteredPasscode, setEnteredPasscode] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEnteredPasscode('');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = useCallback(() => {
        if (enteredPasscode === correctPasscode) {
            onSuccess();
        } else {
            setError('Incorrect passcode. Please try again.');
            setShake(true);
            setEnteredPasscode('');
            setTimeout(() => setShake(false), 500);
        }
    }, [enteredPasscode, correctPasscode, onSuccess]);
    
    useEffect(() => {
        if (enteredPasscode.length === 4) {
            handleSubmit();
        }
    }, [enteredPasscode, handleSubmit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 4) {
            setEnteredPasscode(value);
            setError('');
        }
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={`bg-[var(--card-bg)] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center ${shake ? 'animate-shake' : ''}`}
                        onClick={e => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                        exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                    >
                        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Enter Passcode</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Enter the 4-digit passcode to access Parent Mode.</p>
                        
                        <div className="flex justify-center gap-3 mb-4 cursor-text" onClick={() => inputRef.current?.focus()}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className={`w-10 h-12 rounded-lg flex items-center justify-center border-2 ${error ? 'border-red-500' : 'border-[var(--border-secondary)]'} transition-colors`}>
                                    {enteredPasscode[i] && <div className="w-4 h-4 rounded-full bg-[var(--text-primary)]"></div>}
                                </div>
                            ))}
                        </div>
                        
                        <input
                            ref={inputRef}
                            type="tel"
                            inputMode="numeric"
                            value={enteredPasscode}
                            onChange={handleInputChange}
                            maxLength={4}
                            className="absolute opacity-0 w-full h-full top-0 left-0 cursor-default"
                            autoComplete="off"
                        />
                        
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        
                    </motion.div>
                    <style>{`
                        @keyframes shake {
                          10%, 90% { transform: translate3d(-1px, 0, 0); }
                          20%, 80% { transform: translate3d(2px, 0, 0); }
                          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                          40%, 60% { transform: translate3d(4px, 0, 0); }
                        }
                        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PasscodeEntryModal;