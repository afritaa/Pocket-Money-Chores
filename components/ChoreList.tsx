import React, { useState } from 'react';
import { Chore } from '../types';
import ChoreCard from './ChoreCard';

interface ChoreListProps {
  chores: Chore[];
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onDeleteChore?: (choreId: string) => void;
  onEditChore?: (chore: Chore) => void;
  onReorderChores?: (draggedId: string, targetId: string) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
}

const ChoreList: React.FC<ChoreListProps> = ({ chores, currentWeekDays, onToggleCompletion, onDeleteChore, onEditChore, onReorderChores, viewMode, selectedDate }) => {
  const [draggingChoreId, setDraggingChoreId] = useState<string | null>(null);
  
  if (chores.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <h3 className="text-2xl font-semibold text-slate-600 dark:text-gray-300">{viewMode === 'daily' ? 'No chores for this day!' : 'No chores yet!'}</h3>
        <p className="text-slate-500 dark:text-gray-400 mt-2">{viewMode === 'daily' ? 'Enjoy the day off!' : 'Click "Add Chore" to get started.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chores.map(chore => (
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
          draggingChoreId={draggingChoreId}
          setDraggingChoreId={setDraggingChoreId}
        />
      ))}
    </div>
  );
};

export default ChoreList;