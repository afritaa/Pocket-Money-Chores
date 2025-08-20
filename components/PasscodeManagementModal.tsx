
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, LockClosedIcon } from '../constants';

interface PasscodeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPasscode: string | null;
  onSave: (newPasscode: string | null) => void;
}

type View = 'verify' | 'manage' | 'create' | 'change' | 'remove';

const PasscodeManagementModal: React.FC<PasscodeManagementModalProps> = ({ isOpen, onClose, currentPasscode, onSave }) => {
    const [view, setView] = useState<View>('verify');
    const [enteredCode, setEnteredCode] = useState('');
    const [newCode, setNewCode] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEnteredCode('');
            setNewCode('');
            setConfirmCode('');
            setError('');
            setView(currentPasscode ? 'verify' : 'create');
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, currentPasscode]);

    const triggerError = (message: string) => {
        setError(message);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleVerify = () => {
        if (enteredCode === currentPasscode) {
            setView('manage');
            setEnteredCode('');
            setError('');
        } else {
            triggerError('Incorrect passcode. Please try again.');
            setEnteredCode('');
        }
    };

    const handleCreate = () => {
        if (newCode.length !== 4) {
            triggerError('Passcode must be 4 digits.');
            return;
        }
        if (newCode !== confirmCode) {
            triggerError('Passcodes do not match.');
            return;
        }
        onSave(newCode);
    };

    const handleRemove = () => {
        onSave(null);
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 4) {
            setter(value);
            setError('');
        }
    };
    
    useEffect(() => {
        if (view === 'verify' && enteredCode.length === 4) handleVerify();
    }, [view, enteredCode]);

    const renderContent = () => {
        switch (view) {
            case 'verify':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Verify It's You</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Enter your current passcode to continue.</p>
                        <div className="flex justify-center gap-3 mb-4 cursor-text" onClick={() => inputRef.current?.focus()}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className={`w-10 h-12 rounded-lg flex items-center justify-center border-2 ${error ? 'border-red-500' : 'border-[var(--border-secondary)]'}`}>
                                    {enteredCode[i] && <div className="w-4 h-4 rounded-full bg-[var(--text-primary)]"></div>}
                                </div>
                            ))}
                        </div>
                        <input ref={inputRef} type="password" inputMode="numeric" value={enteredCode} onChange={handleInputChange(setEnteredCode)} maxLength={4} className="absolute opacity-0"/>
                    </>
                );
            case 'manage':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Manage Passcode</h2>
                        <div className="space-y-4">
                            <button onClick={() => setView('change')} className="w-full py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] font-semibold hover:bg-[var(--border-primary)] transition-colors">Change Passcode</button>
                            <button onClick={() => setView('remove')} className="w-full py-3 px-4 rounded-lg text-[var(--danger)] bg-[var(--danger-bg-subtle)] border border-[var(--danger-border)] font-semibold hover:bg-opacity-80 transition-colors">Remove Passcode</button>
                        </div>
                    </>
                );
            case 'create':
            case 'change':
                 return (
                    <>
                        <h2 className="text-2xl font-bold mb-2">{view === 'create' ? 'Create Passcode' : 'Set New Passcode'}</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Enter a new 4-digit passcode.</p>
                        <div className="space-y-4">
                            <input type="password" inputMode="numeric" placeholder="New Passcode" value={newCode} onChange={handleInputChange(setNewCode)} maxLength={4} className={`w-full p-3 bg-[var(--bg-tertiary)] border-2 rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all ${error ? 'border-red-500' : 'border-[var(--border-secondary)]'}`}/>
                            <input type="password" inputMode="numeric" placeholder="Confirm Passcode" value={confirmCode} onChange={handleInputChange(setConfirmCode)} maxLength={4} className={`w-full p-3 bg-[var(--bg-tertiary)] border-2 rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] transition-all ${error ? 'border-red-500' : 'border-[var(--border-secondary)]'}`}/>
                        </div>
                        <button onClick={handleCreate} className="w-full mt-6 py-3 rounded-lg bg-[var(--success)] text-[var(--success-text)] font-bold">Save Passcode</button>
                    </>
                );
            case 'remove':
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-2 text-[var(--danger)]">Are you sure?</h2>
                        <p className="text-[var(--text-secondary)] mb-6">If you remove the passcode, Parent Mode will be accessible without a code.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setView('manage')} className="w-full py-3 rounded-lg bg-[var(--bg-tertiary)] font-semibold">Cancel</button>
                            <button onClick={handleRemove} className="w-full py-3 rounded-lg bg-[var(--danger)] text-[var(--danger-text)] font-bold">Yes, Remove</button>
                        </div>
                    </>
                );
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
                    className={`relative bg-[var(--card-bg)] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center ${shake ? 'animate-shake' : ''}`}
                    onClick={e => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                    exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                >
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full z-10"><XIcon className="w-6 h-6"/></button>
                    <div className="animate-fade-in-fast">
                        {renderContent()}
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                </motion.div>
                <style>{`
                    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
                    .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                    @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                    .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
                `}</style>
            </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PasscodeManagementModal;
