

export enum Day {
  Sun = 'Sun',
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
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
  completions: { [date: string]: boolean }; // e.g., { '2023-10-27': true }
  icon: string | null;
  category: ChoreCategory | null;
  order: number; // For drag-and-drop sorting
}

export interface EarningsRecord {
  id: string;
  date: string;
  amount: number;
}

export interface Profile {
  id: string;
  name: string;
  image: string | null;
  payDay: Day | null;
  theme: string;
}

export interface ParentSettings {
  passcode: string | null;
  theme: string;
}

export interface GraphDataPoint {
  date: string; // YYYY-MM-DD
  total: number;
}
