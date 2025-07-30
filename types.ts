
export type CompletionState = 'completed' | 'cashed_out' | 'pending_cash_out';

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

export enum ChoreCategory {
  Morning = 'Morning',
  BeforeSchool = 'Before School',
  AfterSchool = 'After School',
  Evening = 'Evening',
}

export interface Chore {
  id: string;
  name: string;
  value: number;
  days: Day[];
  completions: { [date: string]: CompletionState }; // e.g., { '2023-10-27': 'completed' }
  icon: string | null;
  category: ChoreCategory | null;
  order: number; // For drag-and-drop sorting
}

export interface CompletionSnapshot {
  choreId: string;
  choreName: string;
  choreValue: number;
  date: string; // The date of completion
  isCompleted: boolean;
}

export interface EarningsRecord {
  id: string;
  date: string; // Date of cash-out request
  amount: number; // Final approved amount
  completionsSnapshot?: CompletionSnapshot[]; // Snapshot of what was completed
}

export interface Profile {
  id: string;
  name: string;
  image: string | null;
  payDayConfig: PayDayConfig;
  theme: string;
}

export interface ParentSettings {
  passcode: string | null;
  theme: string;
  defaultChoreValue: number; // in cents
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