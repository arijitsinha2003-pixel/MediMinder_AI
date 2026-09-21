
import { Medicine, AppSettings } from './types';

export const SAMPLE_MEDICINES: Medicine[] = [];

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
