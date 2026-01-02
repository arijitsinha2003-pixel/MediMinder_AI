
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Heart, 
  Info, 
  ChevronRight, 
  RotateCcw, 
  Loader2, 
  Thermometer, 
  Droplets, 
  Smile, 
  AlertCircle, 
  ShoppingBag, 
  Coffee,
  Pill
} from 'lucide-react';
import { User, CycleData, Medicine } from '../types';
import { getCycleAdvice } from '../geminiService';

interface CycleTrackerProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  medicines?: Medicine[]; // Optional list to check for existing meds
}

const CycleTracker: React.FC<CycleTrackerProps> = ({ user, onUpdate, medicines = [] }) => {
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const cycleData = user.cycleData || {
    lastPeriodStart: new Date().toISOString().split('T')[0],
    cycleLength: 28,
    periodDuration: 5
  };

  const cycleStatus = useMemo(() => {
    const start = new Date(cycleData.lastPeriodStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Day of current cycle
    const dayOfCycle = (diffDaysTotal % cycleData.cycleLength) + 1;
    // Days until the NEXT cycle starts
    const daysUntilNext = cycleData.cycleLength - (dayOfCycle - 1);
    
    let phase = "Follicular";
    let phaseColor = "text-blue-500";
    let phaseBg = "bg-blue-500";
    let phaseDesc = "Energy levels are rising.";

    if (dayOfCycle <= cycleData.periodDuration) {
      phase = "Menstrual";
      phaseColor = "text-rose-500";
      phaseBg = "bg-rose-500";
      phaseDesc = "Take it easy and stay hydrated.";
    } else if (dayOfCycle >= 13 && dayOfCycle <= 15) {
      phase = "Ovulation";
      phaseColor = "text-purple-500";
      phaseBg = "bg-purple-500";
      phaseDesc = "Peak fertility and high energy.";
    } else if (dayOfCycle > 15) {
      phase = "Luteal";
      phaseColor = "text-amber-500";
      phaseBg = "bg-amber-500";
      phaseDesc = "Body preparing for the next cycle.";
    }

    const needsKitReminder = daysUntilNext <= 2;
    const isHeavyPainDay = phase === "Menstrual" && dayOfCycle <= 2;

    return { dayOfCycle, daysUntilNext, phase, phaseColor, phaseBg, phaseDesc, needsKitReminder, isHeavyPainDay };
  }, [cycleData]);

  const handleUpdateCycle = (updates: Partial<CycleData>) => {
    onUpdate({
      ...user,
      cycleData: { ...cycleData, ...updates }
    });
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const result = await getCycleAdvice(cycleStatus.phase, user);
      setAdvice(result);
    } catch (err) {
      setAdvice("I'm having trouble getting tips right now. Try again later.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cycle Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hormonal intelligence & health tracking</p>
        </div>
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600">
          <Droplets className="w-6 h-6" />
        </div>
      </header>

      {/* Preparation Alert (Kit Reminder) */}
      {cycleStatus.needsKitReminder && (
        <section className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-2 border-rose-200 dark:border-rose-900/30 p-6 rounded-[2.5rem] flex items-start gap-5 animate-slide-up">
          <div className="w-14 h-14 bg-white dark:bg-rose-900/30 rounded-2xl flex items-center justify-center shadow-md shadow-rose-200/50 dark:shadow-none shrink-0 relative">
            <ShoppingBag className="w-7 h-7 text-rose-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
          </div>
          <div>
            <h4 className="text-rose-900 dark:text-rose-200 font-black text-lg leading-tight mb-1 uppercase tracking-tight">Period Kit Reminder</h4>
            <p className="text-rose-700 dark:text-rose-400 text-sm font-medium leading-relaxed">
              Your period is predicted to start in <span className="font-bold underline">{cycleStatus.daysUntilNext === 1 ? 'less than a day' : `${cycleStatus.daysUntilNext} days`}</span>. 
              Time to keep your essentials ready!
            </p>
          </div>
        </section>
      )}

      {/* Main Cycle Visualizer */}
      <section className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative group">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-100 dark:text-slate-700"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - cycleStatus.dayOfCycle / cycleData.cycleLength)}
                className={cycleStatus.phaseColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Day</span>
              <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{cycleStatus.dayOfCycle}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">of {cycleData.cycleLength}</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h3 className={`text-3xl font-black uppercase tracking-tight ${cycleStatus.phaseColor}`}>
                {cycleStatus.phase} Phase
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {cycleStatus.phaseDesc}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl">
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Next Period In</p>
                 <p className="text-lg font-black text-slate-900 dark:text-white">{cycleStatus.daysUntilNext} Days</p>
               </div>
               <div className="bg-rose-50 dark:bg-rose-900/10 px-4 py-2 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                 <p className="text-[10px] font-black uppercase text-rose-400 mb-0.5">Fertility</p>
                 <p className="text-lg font-black text-rose-600 dark:text-rose-400">{cycleStatus.phase === "Ovulation" ? 'Peak' : 'Low'}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Management Guide (Days 1-2 Only) */}
      {cycleStatus.isHeavyPainDay && (
        <section className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl animate-slide-up border-4 border-rose-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-900/50">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Comfort & Relief Guide</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Managing Day {cycleStatus.dayOfCycle} Symptoms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Pill className="w-5 h-5 text-rose-400" />
                <h5 className="font-bold text-sm">Medication Check</h5>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                You're in the peak discomfort phase. Check your medicine list for prescribed pain relief.
              </p>
              <button 
                onClick={() => window.location.hash = '/medicines'}
                className="text-[10px] font-black uppercase tracking-widest bg-rose-600 px-4 py-2 rounded-xl hover:bg-rose-700 transition-colors"
              >
                Go to Meds
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                <h5 className="font-bold text-sm">Natural Relief</h5>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-2 font-medium">
                <li className="flex items-center gap-2">• Warm compress on lower abdomen</li>
                <li className="flex items-center gap-2">• Gentle yoga / child's pose</li>
                <li className="flex items-center gap-2">• Magnesium-rich foods (Dark chocolate)</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* AI Advice Section */}
      <section className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[3rem] p-8 text-white shadow-xl shadow-rose-200 dark:shadow-none overflow-hidden relative">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">AI Wellness Insights</h3>
            </div>
            {!advice && !loadingAdvice && (
              <button 
                onClick={fetchAdvice}
                className="bg-white text-rose-600 px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-transform"
              >
                GENERATE TIPS
              </button>
            )}
          </div>

          {loadingAdvice ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm font-bold animate-pulse uppercase tracking-widest">Nano is analyzing your cycle...</p>
            </div>
          ) : advice ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <div className="prose prose-invert prose-sm">
                <p className="text-sm font-medium leading-relaxed">{advice}</p>
              </div>
              <button 
                onClick={fetchAdvice}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh Tips
              </button>
            </div>
          ) : (
            <p className="text-rose-100 text-sm font-medium">Get personalized nutrition and energy tips based on your current hormonal phase.</p>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </section>

      {/* Log Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-2 mb-6">
             <Calendar className="w-5 h-5 text-slate-400" />
             <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Log Period</h4>
           </div>
           <div className="space-y-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Period Started</label>
               <input 
                 type="date"
                 className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                 value={cycleData.lastPeriodStart}
                 onChange={(e) => handleUpdateCycle({ lastPeriodStart: e.target.value })}
               />
             </div>
             <button 
               className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-opacity"
               onClick={() => handleUpdateCycle({ lastPeriodStart: new Date().toISOString().split('T')[0] })}
             >
               STARTED TODAY
             </button>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center gap-2 mb-6">
             <Info className="w-5 h-5 text-slate-400" />
             <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Cycle Settings</h4>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cycle (Days)</label>
                 <input 
                   type="number"
                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-white"
                   value={cycleData.cycleLength}
                   onChange={(e) => handleUpdateCycle({ cycleLength: parseInt(e.target.value) || 28 })}
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Period (Days)</label>
                 <input 
                   type="number"
                   className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-3 text-sm font-bold dark:text-white"
                   value={cycleData.periodDuration}
                   onChange={(e) => handleUpdateCycle({ periodDuration: parseInt(e.target.value) || 5 })}
                 />
              </div>
           </div>
        </div>
      </section>

      {/* Symptom Quick Log */}
      <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
        <h4 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Daily Check-in</h4>
        <div className="grid grid-cols-3 gap-4">
           <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-3xl hover:shadow-md transition-shadow group">
             <Smile className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-bold text-slate-500">GOOD MOOD</span>
           </button>
           <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-3xl hover:shadow-md transition-shadow group">
             <Thermometer className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-bold text-slate-500">CRAMPS</span>
           </button>
           <button className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-3xl hover:shadow-md transition-shadow group">
             <Droplets className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-bold text-slate-500">FLOW</span>
           </button>
        </div>
      </section>
    </div>
  );
};

export default CycleTracker;
