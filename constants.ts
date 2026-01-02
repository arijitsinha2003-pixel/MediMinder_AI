
import { Medicine, AppSettings } from './types';

export const SAMPLE_MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Daily',
    times: ['08:00'],
    inventory: 45,
    refillThreshold: 10,
    category: 'Diabetes'
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Daily',
    times: ['09:00'],
    inventory: 5,
    refillThreshold: 7,
    category: 'Hypertension'
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Nightly',
    times: ['21:00'],
    inventory: 30,
    refillThreshold: 5,
    category: 'Cholesterol'
  }
];

export const CATEGORIES = ['Pain Relief', 'Diabetes', 'Hypertension', 'Cholesterol', 'Vitamin', 'Other'];

/**
 * Global default application settings used for initial state and resetting preferences.
 * Relocated here to resolve scope issues between App.tsx and Settings.tsx.
 */
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  alarmSound: 'https://assets.mixkit.co/active_storage/sfx/997/997-preview.mp3',
  voiceAssistant: true,
  notificationsEnabled: true
};
