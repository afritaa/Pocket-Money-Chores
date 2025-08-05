
import React from 'react';
import { Chore, PastChoreApproval } from '../types';
import ChoreCard from './ChoreCard';
import { CHORE_CATEGORY_ORDER } from '../constants';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
  Modifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

interface ChoreListProps {
  chores: Chore[];
  currentWeekDays: Date[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore?: (chore: Chore) => void;
  viewMode: 'weekly' | 'daily';
  selectedDate: Date;
  isKidsMode: boolean;
  pastChoreApprovals: PastChoreApproval[];
  onApprovePastChore?: (approvalId: string) => void;
  onReorderChores: (reorderedChores: Chore[], category: string | null) => void;
  onChoreDragStart: () => void;
  onChoreDragEnd: () => void;
  newlyAddedChoreId?: string | null;
}

// Modifier to restrict movement to the vertical axis
const restrictToVerticalAxis: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: 0,
  };
};

const ChoreList: React.FC<ChoreListProps> = ({ 
  chores, 
  currentWeekDays, 
  onToggleCompletion, 
  onEditChore, 
  viewMode, 
  selectedDate, 
  isKidsMode, 
  pastChoreApprovals, 
  onApprovePastChore,
  onReorderChores,
  onChoreDragStart,
  onChoreDragEnd,
  newlyAddedChoreId
}) => {
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before starting a drag.
      // This allows for single clicks on elements within the card without
      // accidentally triggering a drag.
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press and hold for 250ms to start a drag on touch devices.
      // Allows for scrolling and tapping on elements within the card.
      activationConstraint: {
        delay: 250,
        tolerance: 10, // User can move finger 10px during the delay.
      },
    })
  );

  const groupedChores = chores.reduce((acc, chore) => {
    const category = chore.category || 'Anytime';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  const handleDragStart = (event: DragStartEvent) => {
    document.body.classList.add('dragging');
    onChoreDragStart();
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    document.body.classList.remove('dragging');
    onChoreDragEnd();
  };

  function handleDragEnd(event: DragEndEvent) {
    document.body.classList.remove('dragging');
    onChoreDragEnd();
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }
    
    // Find which category the active item belongs to
    const activeChore = chores.find(c => c.id === active.id);
    const overChore = chores.find(c => c.id === over.id);

    if (!activeChore || !overChore || activeChore.category !== overChore.category) {
        return; // Can't move between categories
    }

    const categoryName = activeChore.category || 'Anytime';
    const choresForCategory = groupedChores[categoryName];
    if (!choresForCategory) return;

    const oldIndex = choresForCategory.findIndex(c => c.id === active.id);
    const newIndex = choresForCategory.findIndex(c => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(choresForCategory, oldIndex, newIndex);
      onReorderChores(newOrder, activeChore.category);
    }
  }

  if (chores.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <h3 className="text-2xl font-semibold text-[var(--text-secondary)]">{viewMode === 'daily' ? 'No chores for this day!' : 'No chores yet!'}</h3>
        <p className="text-[var(--text-tertiary)] mt-2">{viewMode === 'daily' ? 'Enjoy the day off!' : 'Click "Add Chore" to get started.'}</p>
      </div>
    );
  }

  const categoryOrder = [...Object.keys(CHORE_CATEGORY_ORDER), 'Anytime'];
  
  const groupKeys = Object.keys(groupedChores);
  const showHeaders = !(groupKeys.length === 1 && groupKeys[0] === 'Anytime');


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="space-y-8">
        {categoryOrder.map(category => {
          const choresForCategory = groupedChores[category];
          if (!choresForCategory || choresForCategory.length === 0) {
            return null;
          }

          const choreIds = choresForCategory.map(c => c.id);
          const categoryId = `category-header-${category.replace(/\s+/g, '-').toLowerCase()}`;

          return (
            <div key={category}>
              {showHeaders && (
                <h3 id={categoryId} className="text-lg font-bold mb-4 ml-1 text-[var(--text-secondary)] tracking-wider uppercase">
                  {category}
                </h3>
              )}
              <SortableContext
                items={choreIds}
                strategy={verticalListSortingStrategy}
              >
                  {choresForCategory.map(chore => (
                    <ChoreCard
                      key={chore.id}
                      chore={chore}
                      currentWeekDays={currentWeekDays}
                      onToggleCompletion={onToggleCompletion}
                      onEditChore={onEditChore}
                      viewMode={viewMode}
                      selectedDate={selectedDate}
                      isKidsMode={isKidsMode}
                      pastChoreApprovals={pastChoreApprovals}
                      onApprovePastChore={onApprovePastChore}
                      isNewlyAdded={chore.id === newlyAddedChoreId}
                    />
                  ))}
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
};

export default ChoreList;
