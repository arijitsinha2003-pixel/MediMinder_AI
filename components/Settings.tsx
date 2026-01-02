
import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Volume2, 
  Smartphone, 
  Play, 
  Check, 
  Trash2, 
  RotateCcw, 
  ShieldCheck,
  AlertCircle,
  MessageSquareHeart,
  ChevronRight
} from 'lucide-react';
import { AppSettings } from '../types';
import { Link } from 'react-router-dom';
import { DEFAULT_SETTINGS } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
  onClearData: () => void;
  alarmRef: React.RefObject<HTMLAudioElement | null>;
}

const ALARM_SOUNDS = [
  { name: 'Standard Pulse', url: 'https://assets.mixkit.co/active_storage/sfx/1004/1004-preview.mp3' },
  { name: 'Digital Alert', url: 'https://assets.mixkit.co/active_storage/sfx/997/997-preview.mp3' },
  { name: 'Gentle Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { name: 'Retro Beep', url: 'https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearData, alarmRef }) => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const toggleTheme = () => {
    onUpdate({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const handleSoundChange = (url: string) => {
    onUpdate({ ...settings, alarmSound: url });
    if (alarmRef.current) {
      alarmRef.current.src = url;
      alarmRef.current.currentTime = 0;
      alarmRef.current.loop = false;
      alarmRef.current.play().then(() => {
        setIsPlaying(url);
        setTimeout(() => setIsPlaying(null), 3000);
      }).catch(() => alert("Please interact with the page to enable audio."));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalize your MediMinder AI experience</p>
      </header>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Sun className="w-4 h-4" /> User Interface
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Easier on the eyes at night</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-slate-100 dark:bg-slate-700 rounded-full p-1 transition-all"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${settings.theme === 'dark' ? 'translate-x-6 bg-blue-600' : 'translate-x-0 bg-white shadow-md'}`}>
                {settings.theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Sound Selection */}
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Notification Alerts
          </h3>
        </div>
        <div className="p-6 space-y-3">
          {ALARM_SOUNDS.map((sound) => (
            <button
              key={sound.name}
              onClick={() => handleSoundChange(sound.url)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                settings.alarmSound === sound.url ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.alarmSound === sound.url ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                  {isPlaying === sound.url ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{sound.name}</span>
              </div>
              {settings.alarmSound === sound.url && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Alarm loops for 60 seconds on all reminders & refill alerts.</p>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden group">
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Community Feedback</h3>
          </div>
          <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-sm">
            Help us make MediMinder AI better for everyone. Share your experience or suggest a new feature.
          </p>
          <Link to="/support" className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95">
            Help & Feedback <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </section>

      {/* Dangerous Options */}
      <section className="bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 p-8 space-y-4">
          <button onClick={() => { if(confirm('Reset all app preferences to default?')) onUpdate(DEFAULT_SETTINGS)}} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-2xl transition-all hover:border-red-300 group">
            <div className="flex items-center gap-3"><RotateCcw className="w-4 h-4 text-red-500 group-hover:rotate-[-45deg] transition-transform" /><span className="text-sm font-bold text-red-600">Restore Defaults</span></div>
          </button>
          <button onClick={onClearData} className="w-full flex items-center justify-between p-4 bg-red-600 text-white rounded-2xl shadow-lg hover:bg-red-700 transition-all">
            <div className="flex items-center gap-3"><Trash2 className="w-4 h-4" /><span className="text-sm font-bold">Wipe Medical History</span></div>
          </button>
      </section>
      
      <footer className="text-center text-slate-400 dark:text-slate-600">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">System Integrity Secured • v2.5.1</p>
      </footer>
    </div>
  );
};

export default Settings;
