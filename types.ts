
export type DosageStatus = 'taken' | 'missed' | 'pending';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "Daily", "Twice a day", "Weekly"
  dayOfWeek?: string; // e.g., "Monday"
  times: string[]; // e.g., ["08:00", "20:00"]
  inventory: number;
  refillThreshold: number;
  category: string;
  isSyncedToCalendar?: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface AdherenceLog {
  id: string;
  medicineId: string;
  timestamp: number;
  status: DosageStatus;
}

export interface CycleData {
  lastPeriodStart: string; // YYYY-MM-DD
  cycleLength: number;     // e.g., 28
  periodDuration: number;  // e.g., 5
}

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  photo?: string;
  address?: string;
  lat?: number;
  lng?: number;
  googleFitSynced?: boolean;
  cycleData?: CycleData;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  alarmSound: string;
  voiceAssistant: boolean;
  notificationsEnabled: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    }
  }>;
}
