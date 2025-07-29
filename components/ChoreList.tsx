import React from 'react';
import { Chore, ChoreCategory } from '../types';
import ChoreCard from './ChoreCard';
import { CHORE_CATEGORY_ORDER } from '../constants';

interface ChoreListProps {
  chores: Chore[];
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onDeleteChore?: (choreId: string) => void;
  onEditChore?: (chore: Chore) => void;
  onReorderChores?: (draggedChoreId: string, targetChoreId: string) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  isKidsMode: boolean;
}

const ChoreList: React.FC<ChoreListProps> = ({ chores, currentWeekDays, onToggleCompletion, onDeleteChore, onEditChore, onReorderChores, viewMode, selectedDate, isKidsMode }) => {
  
  if (chores.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <h3 className="text-2xl font-semibold text-[var(--text-secondary)]">{viewMode === 'daily' ? 'No chores for this day!' : 'No chores yet!'}</h3>
        <p className="text-[var(--text-tertiary)] mt-2">{viewMode === 'daily' ? 'Enjoy the day off!' : 'Click "Add Chore" to get started.'}</p>
      </div>
    );
  }

  const groupedChores = chores.reduce((acc, chore) => {
    const category = chore.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  const categoryOrder = [...Object.keys(CHORE_CATEGORY_ORDER) as ChoreCategory[], 'Uncategorized'];
  
  const groupKeys = Object.keys(groupedChores);
  const showHeaders = !(groupKeys.length === 1 && groupKeys[0] === 'Uncategorized');


  return (
    <div className="space-y-8">
      {categoryOrder.map(category => {
        const choresForCategory = groupedChores[category];
        if (!choresForCategory || choresForCategory.length === 0) {
          return null;
        }

        return (
          <div key={category}>
            {showHeaders && (
              <h3 className="text-lg font-bold mb-4 ml-1 text-[var(--text-secondary)] tracking-wider uppercase">
                {category}
              </h3>
            )}
            <div className="space-y-4">
              {choresForCategory.map(chore => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  currentWeekDays={currentWeekDays}
                  onToggleCompletion={onToggleCompletion}
                  onDeleteChore={onDeleteChore}
                  onEditChore={onEditChore}
                  onReorderChores={onReorderChores}
                  viewMode={viewMode}
                  selectedDate={selectedDate}
                  isKidsMode={isKidsMode}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChoreList;
