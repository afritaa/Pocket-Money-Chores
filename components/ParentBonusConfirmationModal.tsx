import React, { useEffect } from 'react';
import { StarIcon } from '../constants';

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

    // Close on Enter or Escape key press
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

    if (!isOpen) return null;

    const names = childName.split(', ');
    const isMultiple = names.length > 1;

    return (
        <div
            className="fixed inset-0 bg-[var(--bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 transition-opacity"
            onClick={onClose}
        >
            <div
                className="relative bg-gradient-to-br from-yellow-400 to-amber-500 border-4 border-yellow-300 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center transform transition-all text-yellow-900"
                onClick={e => e.stopPropagation()}
            >
                 <div className="mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-yellow-300/80 flex items-center justify-center">
                        <StarIcon className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">Bonus Awarded!</h2>
                <p className="text-lg text-white/90 mb-8 drop-shadow-md">
                    You've awarded a bonus to <span className="font-bold">{childName}</span>. Once {isMultiple ? 'they accept their bonuses' : `${names[0]} accepts the bonus`}, it will appear in {isMultiple ? 'their' : 'their'} earnings.
                </p>
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 rounded-lg text-amber-800 bg-yellow-300 hover:bg-yellow-200 font-extrabold text-xl tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all border-2 border-yellow-200"
                >
                    Great!
                </button>
            </div>
        </div>
    );
};

export default ParentBonusConfirmationModal;