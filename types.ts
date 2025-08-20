



export interface BonusNotification {
  id: string;
  amount: number;
  note?: string;
  createdAt: string; // YYYY-MM-DD
}

export type CompletionState = 'completed' | 'cashed_out' | 'pending_cash_out' | 'pending_acceptance';

export enum Day {
  Sun = 'Sun',
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
}

export type PayDayMode = 'anytime' | 'manual' | 'automatic';

export interface PayDayConfig {
  mode: PayDayMode;
  day?: Day;     // Required for manual and automatic
  time?: string; // e.g., "18:00", required for automatic
}

export interface Chore {
  id: string;
  name: string;
  value: number;
  days: Day[];
  completions: { [date: string]: CompletionState }; // e.g., { '2023-10-27': 'completed' }
  icon: string | null;
  category: string | null;
  order: number; // For drag-and-drop sorting
  type?: 'chore' | 'bonus';
  note?: string;
  createdAt?: string; // Date of creation 'YYYY-MM-DD'
  isOneOff?: boolean; // Is it a one-time chore?
  oneOffDate?: string; // Date for one-off chore 'YYYY-MM-DD'
}

export interface AiChoreSuggestion {
  name: string;
  value: number;
  category: string | null;
}

export interface CompletionSnapshot {
  choreId: string;
  choreName: string;
  choreValue: number;
  date: string; // The date of completion
  isCompleted: boolean;
}

export interface EarningsRecord {
  id:string;
  date: string; // Date of cash-out request
  amount: number; // Final approved amount
  completionsSnapshot?: CompletionSnapshot[]; // Snapshot of what was completed
  note?: string; // For bonuses
  type?: 'chore' | 'bonus';
  seenByParent?: boolean;
}

export interface Profile {
  id: string;
  name: string;
  image: string | null;
  payDayConfig: PayDayConfig;
  theme: string;
  parentViewTheme?: string;
  hasSeenThemePrompt?: boolean;
  showPotentialEarnings: boolean;
}

export interface ParentSettings {
  passcode: string | null;
  theme: string;
  defaultChoreValue: number; // in cents
  defaultBonusValue: number; // in cents
  customCategories: string[];
}

export interface GraphDataPoint {
  date: string; // YYYY-MM-DD
  total: number;
}

export interface PastChoreApproval {
  id: string;
  choreId: string;
  choreName: string;
  date: string; // YYYY-MM-DD
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}