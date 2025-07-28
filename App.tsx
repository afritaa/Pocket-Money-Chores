
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Chore, Day, EarningsRecord, Profile } from './types';
import Header from './components/Header';
import ChoreList from './components/ChoreList';
import ChoreFormModal from './components/AddChoreModal';
import { PlusIcon } from './constants';
import EarningsHistoryModal from './components/EarningsHistoryModal';
import MenuBanner from './components/MenuBanner';
import PendingCashOutsModal from './components/PendingCashOutsModal';
import CashOutConfirmationModal from './components/CashOutConfirmationModal';
import EditProfileModal from './components/EditProfileModal';
import PasscodeSetupModal from './components/PasscodeSetupModal';
import PasscodeEntryModal from './components/PasscodeEntryModal';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to get the start of the current week (Sunday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getDayFromDate = (date: Date): Day => {
  const dayIndex = date.getDay();
  const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
  return days[dayIndex];
};

const defaultProfile: Profile = { name: '', image: null, payDay: null, passcode: null };

// Re-usable hook for state that syncs with localStorage
const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};


const App: React.FC = () => {
  const [chores, setChores] = usePersistentState<Chore[]>('chores', []);
  const [profile, setProfile] = usePersistentState<Profile>('profile', defaultProfile);
  const [earningsHistory, setEarningsHistory] = usePersistentState<EarningsRecord[]>('earningsHistory', []);
  const [pendingCashOuts, setPendingCashOuts] = usePersistentState<EarningsRecord[]>('pendingCashOuts', []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);
  const [currentDate, _] = useState(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  
  const [isKidsMode, setIsKidsMode] = usePersistentState<boolean>('isKidsMode', false);
  
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPasscodeSetupModalOpen, setIsPasscodeSetupModalOpen] = useState(false);
  const [isPasscodeEntryModalOpen, setIsPasscodeEntryModalOpen] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isCashOutConfirmOpen, setIsCashOutConfirmOpen] = useState(false);
  const [cashedOutAmount, setCashedOutAmount] = useState(0);

  const handleSetIsKidsMode = (newMode: boolean) => {
    setIsKidsMode(newMode);
  };

  const handleUpdateProfile = useCallback((newProfileData: Omit<Profile, 'passcode'>) => {
    setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));
    setIsEditProfileModalOpen(false);
  }, [setProfile]);

  const handleUpdatePasscode = useCallback((passcode: string | null) => {
    setProfile(prevProfile => ({ ...prevProfile, passcode }));
  }, [setProfile]);
  
  const handleUpdatePasscodeInProfile = useCallback((current: string, newPasscode: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (profile.passcode !== current) {
            reject(new Error("Current passcode is incorrect."));
            return;
        }
        handleUpdatePasscode(newPasscode);
        resolve();
    });
  }, [profile, handleUpdatePasscode]);

  const handleAttemptSwitchToParentMode = useCallback(() => {
      if (!profile.passcode) {
          setIsPasscodeSetupModalOpen(true);
      } else {
          setIsPasscodeEntryModalOpen(true);
      }
  }, [profile.passcode]);

  const handlePasscodeSetupSuccess = (passcode: string) => {
    handleUpdatePasscode(passcode);
    handleSetIsKidsMode(false);
    setIsPasscodeSetupModalOpen(false);
  };

  const handlePasscodeEntrySuccess = () => {
    handleSetIsKidsMode(false);
    setIsPasscodeEntryModalOpen(false);
  };

  const currentWeekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);
  
  const weeklyTotal = useMemo(() => {
    const weekDateStrings = currentWeekDays.map(formatDate);
    return chores.reduce((total, chore) => {
      const choreTotal = Object.entries(chore.completions).reduce((sum, [date, completed]) => {
        if (completed && weekDateStrings.includes(date)) {
          return sum + chore.value;
        }
        return sum;
      }, 0);
      return total + choreTotal;
    }, 0);
  }, [chores, currentWeekDays]);

  const displayMode = isKidsMode ? 'daily' : viewMode;

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Effect to reset to today's date when entering kids mode
  useEffect(() => {
    if (isKidsMode) {
      setSelectedDate(new Date());
    }
  }, [isKidsMode]);

   const filteredChores = useMemo(() => {
    if (displayMode === 'daily') {
        const selectedDay = getDayFromDate(selectedDate);
        return chores.filter(chore => chore.days.includes(selectedDay));
    }
    return chores;
  }, [chores, displayMode, selectedDate]);

  const handleOpenAddModal = () => {
    setChoreToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chore: Chore) => {
    setChoreToEdit(chore);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setChoreToEdit(null);
  };

  const handleSaveChore = useCallback((choreData: Omit<Chore, 'id' | 'completions'>) => {
    if (choreToEdit) {
      setChores(prevChores =>
        prevChores.map(c =>
          c.id === choreToEdit.id ? { ...c, ...choreData } : c
        )
      );
    } else {
      setChores(prevChores => [
        ...prevChores,
        { ...choreData, id: Date.now().toString(), completions: {} }
      ]);
    }
    handleCloseModal();
  }, [choreToEdit, setChores]);

  const handleDeleteChore = useCallback((choreId: string) => {
    setChores(prevChores => prevChores.filter(chore => chore.id !== choreId));
  }, [setChores]);

  const handleToggleCompletion = useCallback((choreId: string, date: Date) => {
    const dateString = formatDate(date);
    setChores(prevChores =>
      prevChores.map(chore => {
        if (chore.id === choreId) {
          const newCompletions = { ...chore.completions };
          newCompletions[dateString] = !newCompletions[dateString];
          return { ...chore, completions: newCompletions };
        }
        return chore;
      })
    );
  }, [setChores]);

  const handleReorderChores = useCallback((draggedId: string, targetId: string) => {
    setChores(prevChores => {
      const newChores = [...prevChores];
      const draggedIndex = newChores.findIndex(c => c.id === draggedId);
      const targetIndex = newChores.findIndex(c => c.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return newChores;
      }

      const [draggedItem] = newChores.splice(draggedIndex, 1);
      newChores.splice(targetIndex, 0, draggedItem);
      return newChores;
    });
  }, [setChores]);

  const handleCashOut = useCallback(() => {
    if (weeklyTotal <= 0) return;

    const newRecord: EarningsRecord = {
      id: Date.now().toString(),
      date: formatDate(new Date()),
      amount: weeklyTotal,
    };
    setPendingCashOuts(prevPending => [...prevPending, newRecord]);

    if (isKidsMode) {
      setCashedOutAmount(weeklyTotal);
      setIsCashOutConfirmOpen(true);
    }

    // Reset completions for the current week
    const weekDateStrings = currentWeekDays.map(formatDate);
    setChores(prevChores =>
      prevChores.map(chore => {
        const newCompletions = { ...chore.completions };
        for (const dateStr of weekDateStrings) {
          delete newCompletions[dateStr];
        }
        return { ...chore, completions: newCompletions };
      })
    );
  }, [weeklyTotal, currentWeekDays, isKidsMode, setChores, setPendingCashOuts]);

  const handleShowHistory = () => setIsHistoryModalOpen(true);
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);

  const handleOpenPendingModal = () => setIsPendingModalOpen(true);
  const handleClosePendingModal = () => setIsPendingModalOpen(false);

  const handleApproveCashOut = useCallback((recordId: string) => {
    const recordToApprove = pendingCashOuts.find(r => r.id === recordId);
    if (recordToApprove) {
      setEarningsHistory(prev => [...prev, recordToApprove]);
      setPendingCashOuts(prev => prev.filter(r => r.id !== recordId));
    }
  }, [pendingCashOuts, setEarningsHistory, setPendingCashOuts]);

  const handleApproveAllCashOuts = useCallback(() => {
    setEarningsHistory(prev => [...prev, ...pendingCashOuts]);
    setPendingCashOuts([]);
  }, [pendingCashOuts, setEarningsHistory, setPendingCashOuts]);
  
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  const showCashOutButton = useMemo(() => {
    if (!isKidsMode) return true;
    if (profile.payDay) {
      const todayDay = getDayFromDate(new Date());
      return todayDay === profile.payDay;
    }
    return true;
  }, [isKidsMode, profile.payDay]);

  const isCashOutDisabled = useMemo(() => {
    return weeklyTotal <= 0;
  }, [weeklyTotal]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-white relative bg-slate-100 dark:bg-black transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header>
          <MenuBanner 
            isKidsMode={isKidsMode} 
            onSwitchToKidMode={() => handleSetIsKidsMode(true)}
            onAttemptSwitchToParentMode={handleAttemptSwitchToParentMode}
            pendingCount={pendingCashOuts.length}
            onShowPending={handleOpenPendingModal}
            profile={profile}
            onShowEditProfile={() => setIsEditProfileModalOpen(true)}
          />
          <Header 
            weeklyTotal={weeklyTotal} 
            isKidsMode={isKidsMode}
            profile={profile}
            onCashOut={handleCashOut}
            onShowHistory={handleShowHistory}
            isCashOutDisabled={isCashOutDisabled}
            showCashOutButton={showCashOutButton}
          />
        </header>
        
        <main>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-grow">
               <div className="flex items-baseline gap-4">
                 <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {displayMode === 'weekly' ? "This Week's Chores" : isToday ? "Today's Chores" : `${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}'s Chores`}
                 </h2>
                 {!isKidsMode && (
                  <div className="bg-slate-200 dark:bg-gray-900 rounded-full p-1 flex items-center">
                    <button onClick={() => setViewMode('weekly')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${viewMode === 'weekly' ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Weekly</button>
                    <button onClick={() => setViewMode('daily')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${viewMode === 'daily' ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Daily</button>
                  </div>
                 )}
               </div>
            </div>
            
            {!isKidsMode && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
              >
                <PlusIcon />
                <span className="hidden sm:inline">Add Chore</span>
              </button>
            )}
          </div>
          
           {displayMode === 'daily' && !isKidsMode && (
                <div className="mb-6 flex justify-center gap-1 p-2 rounded-xl bg-slate-200 dark:bg-gray-900">
                    {currentWeekDays.map(date => {
                        const dayString = formatDate(date);
                        const isSelected = dayString === formatDate(selectedDate);
                        return (
                            <button
                                key={dayString}
                                onClick={() => setSelectedDate(date)}
                                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                    isSelected
                                        ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-300 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </button>
                        );
                    })}
                </div>
            )}
          
          <ChoreList
            chores={filteredChores}
            currentWeekDays={currentWeekDays}
            onToggleCompletion={handleToggleCompletion}
            onDeleteChore={isKidsMode ? undefined : handleDeleteChore}
            onEditChore={isKidsMode ? undefined : handleOpenEditModal}
            onReorderChores={isKidsMode || displayMode === 'daily' ? undefined : handleReorderChores}
            viewMode={displayMode}
            selectedDate={selectedDate}
          />
        </main>

        <EarningsHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={handleCloseHistoryModal}
          history={earningsHistory}
        />

        <PendingCashOutsModal
          isOpen={isPendingModalOpen}
          onClose={handleClosePendingModal}
          pendingCashOuts={pendingCashOuts}
          onApprove={handleApproveCashOut}
          onApproveAll={handleApproveAllCashOuts}
        />

        <CashOutConfirmationModal
            isOpen={isCashOutConfirmOpen}
            onClose={() => setIsCashOutConfirmOpen(false)}
            amount={cashedOutAmount}
        />

        {isEditProfileModalOpen && (
            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
                onSave={handleUpdateProfile}
                initialData={profile}
                onUpdatePasscode={handleUpdatePasscodeInProfile}
            />
        )}
        
        <PasscodeSetupModal 
            isOpen={isPasscodeSetupModalOpen}
            onClose={() => setIsPasscodeSetupModalOpen(false)}
            onSave={handlePasscodeSetupSuccess}
        />

        <PasscodeEntryModal
            isOpen={isPasscodeEntryModalOpen}
            onClose={() => setIsPasscodeEntryModalOpen(false)}
            onSuccess={handlePasscodeEntrySuccess}
            passcodeToMatch={profile.passcode}
        />
        
        {!isKidsMode && (
            <ChoreFormModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveChore}
              initialData={choreToEdit}
            />
        )}
      </div>
    </div>
  );
};

export default App;
