
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Profile } from '../types';
import { UserCircleIcon, PencilIcon, BanknotesIcon, HistoryIcon, ExclamationIcon, XIcon } from '../constants';
import { useSound } from '../hooks/useSound';

interface ProfileMenuProps {
  profile: Profile;
  onEdit: () => void;
  onHistory: () => void;
  onCashOut: () => void;
  onPending: () => void;
  onPastApprovals: () => void;
  pendingCount: number;
  pastApprovalsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3, delay: 0.1 } },
};

const menuVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 350, damping: 30 } },
  exit: { x: '100%', transition: { type: 'spring', stiffness: 350, damping: 30 } },
};

const MenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, 'aria-label': string, hasBadge?: boolean, badgeCount?: number }> = ({ onClick, children, 'aria-label': ariaLabel, hasBadge, badgeCount }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg text-left transition-colors hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-4">
        {children}
      </div>
      {hasBadge && badgeCount !== undefined && badgeCount > 0 && (
        <span className="ml-auto text-sm font-bold bg-[var(--danger)] text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">
          {badgeCount}
        </span>
      )}
    </button>
);


const ProfileMenu: React.FC<ProfileMenuProps> = ({
  profile,
  onEdit,
  onHistory,
  onCashOut,
  onPending,
  onPastApprovals,
  pendingCount,
  pastApprovalsCount,
  isOpen,
  onClose,
}) => {
  const { playButtonClick } = useSound();

  const handleActionClick = (action: () => void) => {
    playButtonClick();
    onClose();
    setTimeout(action, 150);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[80vw] bg-[var(--menu-bg)] z-50 shadow-2xl flex flex-col"
            aria-label="Profile Menu"
            role="dialog"
            aria-modal="true"
          >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">
                      {profile.name}'s Profile
                  </h2>
                  <button onClick={onClose} className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Close menu">
                      <XIcon className="h-6 w-6" />
                  </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-1 p-4 scrollbar-hide">
                  <MenuItem onClick={() => handleActionClick(onEdit)} aria-label={`Edit ${profile.name}'s Profile`}>
                    <PencilIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    <span>Edit Profile</span>
                  </MenuItem>
                  <MenuItem onClick={() => handleActionClick(onCashOut)} aria-label="Cash Out">
                    <BanknotesIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    <span>Cash Out</span>
                  </MenuItem>
                  {pendingCount > 0 && (
                    <MenuItem onClick={() => handleActionClick(onPending)} aria-label="View Pending Payouts" hasBadge badgeCount={pendingCount}>
                        <ExclamationIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                        <span>Pending Payouts</span>
                    </MenuItem>
                  )}
                  {pastApprovalsCount > 0 && (
                    <MenuItem onClick={() => handleActionClick(onPastApprovals)} aria-label="View Past Chore Approvals" hasBadge badgeCount={pastApprovalsCount}>
                        <HistoryIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                        <span>Past Approvals</span>
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => handleActionClick(onHistory)} aria-label="View Earnings History">
                    <HistoryIcon className="w-6 h-6 text-[var(--text-secondary)]" />
                    <span>Earnings History</span>
                  </MenuItem>
              </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileMenu;
