
import React from 'react';
import { Chore, PastChoreApproval } from '../types';
import ChoreCard from './ChoreCard';
import { CHORE_CATEGORY_ORDER } from '../constants';

interface ChoreListProps {
  chores: Chore[];
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore?: (chore: Chore) => void;
  onReorderChores?: (draggedChoreId: string, targetChoreId: string) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  isKidsMode: boolean;
  pastChoreApprovals: PastChoreApproval[];
  onApprovePastChore?: (approvalId: string) => void;
  draggingChoreId: string | null;
  dragOverChoreId: string | null;
  onDragStartTouch: (e: React.TouchEvent, choreId: string) => void;
  areSoundsEnabled: boolean;
}

const ChoreList: React.FC<ChoreListProps> = ({ 
  chores, 
  currentWeekDays, 
  onToggleCompletion, 
  onEditChore, 
  onReorderChores, 
  viewMode, 
  selectedDate, 
  isKidsMode, 
  pastChoreApprovals, 
  onApprovePastChore,
  draggingChoreId,
  dragOverChoreId,
  onDragStartTouch,
  areSoundsEnabled
}) => {
  
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

  const categoryOrder = [...Object.keys(CHORE_CATEGORY_ORDER), 'Uncategorized'];
  
  const groupKeys = Object.keys(groupedChores);
  const showHeaders = !(groupKeys.length === 1 && groupKeys[0] === 'Uncategorized');


  return (
    <div className="space-y-8">
      {categoryOrder.map(category => {
        const choresForCategory = groupedChores[category];
        if (!choresForCategory || choresForCategory.length === 0) {
          return null;
        }

        const categoryId = `category-header-${category.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <div key={category}>
            {showHeaders && (
              <h3 id={categoryId} className="text-lg font-bold mb-4 ml-1 text-[var(--text-secondary)] tracking-wider uppercase">
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
                  onEditChore={onEditChore}
                  onReorderChores={onReorderChores}
                  viewMode={viewMode}
                  selectedDate={selectedDate}
                  isKidsMode={isKidsMode}
                  pastChoreApprovals={pastChoreApprovals}
                  onApprovePastChore={onApprovePastChore}
                  draggingChoreId={draggingChoreId}
                  dragOverChoreId={dragOverChoreId}
                  onDragStartTouch={onDragStartTouch}
                  areSoundsEnabled={areSoundsEnabled}
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
