



import React, { useEffect, useRef, useState } from 'react';
import { Chore, PastChoreApproval } from '../types';
import ChoreCard from './ChoreCard';
import type { ChoreCardProps } from './ChoreCard';
import { CHORE_CATEGORY_ORDER } from '../constants';
import { Reorder, AnimatePresence, useDragControls } from 'framer-motion';

interface ChoreListProps {
  chores: Chore[];
  onToggleCompletion: (choreId: string, date: Date) => void;
  onEditChore?: (chore: Chore) => void;
  selectedDate: Date;
  currentDateForWeek: Date;
  isKidsMode: boolean;
  pastChoreApprovals: PastChoreApproval[];
  onApprovePastChore?: (approvalId: string) => void;
  onReorderChores: (reorderedChores: Chore[], category: string | null) => void;
  newlyAcknowledgedBonusId: string | null;
  scrollRef: React.RefObject<HTMLElement>;
}

const ReorderableChoreItem = (props: ChoreCardProps) => {
    const { chore } = props;
    const dragControls = useDragControls();
    const [isHeld, setIsHeld] = useState(false);
    const timerRef = useRef<number | null>(null);
    const pointerStartPos = useRef<{ x: number; y: number } | null>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Prevent right-click from initiating drag
        if (e.button !== 0) return;

        // For mouse, drag starts immediately
        if (e.pointerType === 'mouse') {
            dragControls.start(e);
            return;
        }

        // For touch, implement long-press
        pointerStartPos.current = { x: e.clientX, y: e.clientY };
        timerRef.current = window.setTimeout(() => {
            setIsHeld(true);
            // Haptic feedback for a better mobile experience
            if (navigator.vibrate) navigator.vibrate(50);
            dragControls.start(e);
            pointerStartPos.current = null;
        }, 300);
    };

    const handlePointerUp = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsHeld(false);
        pointerStartPos.current = null;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' || !pointerStartPos.current) return;
        
        // If user moves finger more than 10px, it's a scroll, not a drag.
        const threshold = 10;
        const dx = Math.abs(e.clientX - pointerStartPos.current.x);
        const dy = Math.abs(e.clientY - pointerStartPos.current.y);
        
        if (dx > threshold || dy > threshold) {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    return (
        <Reorder.Item
            key={chore.id}
            value={chore}
            layout // This prop makes other items animate out of the way
            dragListener={false} // Disable default drag behavior
            dragControls={dragControls} // Use our custom controls
            onDragStart={() => document.body.classList.add('dragging')}
            onDragEnd={() => document.body.classList.remove('dragging')}
            whileDrag={{
                scale: 1.05,
                zIndex: 100,
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
            animate={{ 
                scale: isHeld ? 1.05 : 1, 
                zIndex: isHeld ? 100 : 1 
            }}
            className="cursor-grab active:cursor-grabbing"
        >
            <ChoreCard
                {...props}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
            />
        </Reorder.Item>
    );
};


const ChoreList: React.FC<ChoreListProps> = ({ 
  chores, 
  onToggleCompletion, 
  onEditChore,
  selectedDate, 
  currentDateForWeek,
  isKidsMode, 
  pastChoreApprovals, 
  onApprovePastChore,
  onReorderChores,
  newlyAcknowledgedBonusId,
  scrollRef,
}) => {
  const listContentRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState('60vh'); // Fallback

  useEffect(() => {
    const calculateSpacer = () => {
        const scrollElement = scrollRef.current;
        const contentElement = listContentRef.current;
        if (!scrollElement || !contentElement) return;

        const firstCard = contentElement.querySelector('.chore-card-sizing-target') as HTMLElement;
        if (!firstCard) {
            setSpacerHeight('0px');
            return;
        }

        const viewportHeight = scrollElement.clientHeight;
        const cardHeight = firstCard.offsetHeight;
        
        const newHeight = viewportHeight - (cardHeight / 2);
        setSpacerHeight(`${Math.max(0, newHeight)}px`);
    };

    const timer = setTimeout(calculateSpacer, 100);
    window.addEventListener('resize', calculateSpacer);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculateSpacer);
    };
  }, [chores, isKidsMode, scrollRef]);

  const groupedChores = chores.reduce((acc, chore) => {
    const category = chore.category || 'Anytime';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  if (chores.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <h3 className="text-2xl font-semibold text-[var(--text-secondary)]">No chores scheduled!</h3>
        <p className="text-[var(--text-muted)] mt-2">{isKidsMode ? "Enjoy the day off or check other days." : "Add some chores to get started."}</p>
      </div>
    );
  }

  const sortedCategoryKeys = Object.keys(groupedChores).sort((a, b) => {
    const orderValue = (cat: string) => {
      if (cat === 'Bonus') return 9999;
      if (cat === 'Anytime') return 9998;
      return CHORE_CATEGORY_ORDER[cat] ?? 100; // Custom categories get a high order
    };
    const aOrder = orderValue(a);
    const bOrder = orderValue(b);
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.localeCompare(b); // for custom categories with same order, sort alphabetically
  });
  
  const showHeaders = !(Object.keys(groupedChores).length === 1 && Object.keys(groupedChores)[0] === 'Anytime');


  return (
    <div ref={listContentRef}>
      <div className="space-y-6">
        {sortedCategoryKeys.map(category => {
          const choresForCategory = groupedChores[category];
          const isBonusCategory = category === 'Bonus';
          const isReorderable = !isKidsMode && !isBonusCategory;

          return (
            <div key={category}>
              {showHeaders && (
                <h3 className="text-sm font-bold mb-3 ml-1 text-[var(--text-secondary)] tracking-wider uppercase">
                  {category}
                </h3>
              )}
              
              {isReorderable ? (
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={choresForCategory}
                  onReorder={(newOrder) => onReorderChores(newOrder, category === 'Anytime' ? null : category)}
                  className="space-y-4 m-0 p-0 list-none"
                >
                  <AnimatePresence>
                    {choresForCategory.map(chore => (
                       <ReorderableChoreItem
                          key={chore.id}
                          chore={chore}
                          onToggleCompletion={onToggleCompletion}
                          onEditChore={onEditChore}
                          selectedDate={selectedDate}
                          currentDateForWeek={currentDateForWeek}
                          isKidsMode={isKidsMode}
                          pastChoreApprovals={pastChoreApprovals}
                          onApprovePastChore={onApprovePastChore}
                          isNewlyAcknowledgedBonus={chore.id === newlyAcknowledgedBonusId}
                       />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {choresForCategory.map(chore => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        onToggleCompletion={onToggleCompletion}
                        onEditChore={onEditChore}
                        selectedDate={selectedDate}
                        currentDateForWeek={currentDateForWeek}
                        isKidsMode={isKidsMode}
                        pastChoreApprovals={pastChoreApprovals}
                        onApprovePastChore={onApprovePastChore}
                        isNewlyAcknowledgedBonus={chore.id === newlyAcknowledgedBonusId}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>
       <div style={{ height: spacerHeight }} />
    </div>
  );
};

export default ChoreList;