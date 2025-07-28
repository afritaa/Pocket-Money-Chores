
export enum Day {
  Sun = 'Sun',
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
}

export interface Chore {
  id: string;
  name: string;
  value: number;
  days: Day[];
  completions: { [date: string]: boolean }; // e.g., { '2023-10-27': true }
}

export interface EarningsRecord {
  id: string;
  date: string;
  amount: number;
}

export interface Profile {
  name: string;
  image: string | null;
  payDay: Day | null;
  passcode: string | null;
}