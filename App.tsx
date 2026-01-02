
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Bell, 
  Home, 
  MessageSquare, 
  Pill, 
  Truck, 
  User as UserIcon,
  Volume2,
  VolumeX,
  LogOut,
  UserCircle,
  Settings as SettingsIcon,
  Clock,
  ShieldAlert,
  MessageSquareHeart,
  Droplets,
  Brain,
  AlertTriangle,
  X,
  Check,
  HelpCircle,
  Sparkles,
  BrainCircuit
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MedicineList from './components/MedicineList';
import AdherenceTable from './components/AdherenceTable';
import HealthChatbot from './components/HealthChatbot';
import Services from './components/Services';
import Support from './components/Support';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ImageLab from './components/ImageLab';
import CycleTracker from './components/CycleTracker';
import Mindset from './components/Mindset';
import Auth from './components/Auth';
import { Medicine, AdherenceLog, User, AppSettings } from './types';
import { SAMPLE_MEDICINES, DEFAULT_SETTINGS } from './constants';

interface NotificationItem {
  id: string;
  message: string;
  medId?: string;
  type: 'reminder' | 'refill';
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES);
  const [logs, setLogs] = useState<AdherenceLog[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  
  const firedReminders = useRef<Set<string>>(new Set());
  const firedRefills = useRef<Set<string>>(new Set());
  const alarmTimeoutRef = useRef<number | null>(null);
  
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const takenSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user, settings]);

  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
      const savedMeds = localStorage.getItem(`medicines_${emailKey}`);
      const savedLogs = localStorage.getItem(`logs_${emailKey}`);
      
      setMedicines(savedMeds ? JSON.parse(savedMeds) : SAMPLE_MEDICINES);
      setLogs(savedLogs ? JSON.parse(savedLogs) : []);
      
      firedReminders.current = new Set();
      firedRefills.current = new Set();
    } else {
      setMedicines(SAMPLE_MEDICINES);
      setLogs([]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.setItem(`medicines_${emailKey}`, JSON.stringify(medicines));
      localStorage.setItem(`logs_${emailKey}`, JSON.stringify(logs));
    }
  }, [medicines, logs, user?.email]);

  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  const stopAllAudio = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      alarmRef.current.loop = false;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    setIsRinging(false);
  };

  const startAlarm = (soundUrl: string) => {
    if (isRinging) return;
    
    setIsRinging(true);
    if (alarmRef.current) {
      alarmRef.current.src = soundUrl;
      alarmRef.current.loop = true;
      alarmRef.current.play().then(() => {
        setIsRinging(true);
      }).catch(() => setAudioBlocked(true));
    }

    alarmTimeoutRef.current = window.setTimeout(() => {
      stopAllAudio();
    }, 60000);
  };

  const unlockAudio = () => {
    if (alarmRef.current) {
      alarmRef.current.volume = 0.6;
      alarmRef.current.play().then(() => {
        if (!isRinging) stopAllAudio();
      }).catch(() => setAudioBlocked(true));
    }
    setAudioBlocked(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!user) return;
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayKey = now.toDateString();
      
      medicines.forEach(med => {
        const reminderId = `${med.id}-${currentTime}-${todayKey}`;
        if (med.times.includes(currentTime) && !firedReminders.current.has(reminderId)) {
          firedReminders.current.add(reminderId);
          
          setNotifications(prev => [{ 
            id: Math.random().toString(36).substr(2, 9), 
            message: `REMINDER: Take ${med.name} (${med.dosage})`, 
            medId: med.id, 
            type: 'reminder' 
          }, ...prev]);

          startAlarm(settings.alarmSound);
        }

        const refillId = `refill-${med.id}-${todayKey}`;
        if (med.inventory <= med.refillThreshold && !firedRefills.current.has(refillId)) {
          firedRefills.current.add(refillId);
          setNotifications(prev => [{ 
            id: Math.random().toString(36).substr(2, 9), 
            message: `LOW STOCK: ${med.name} needs a refill!`, 
            medId: med.id, 
            type: 'refill' 
          }, ...prev]);
          startAlarm(settings.alarmSound);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [medicines, user, settings.alarmSound, isRinging]);

  const handleLogStatus = (medId: string, status: 'taken' | 'missed') => {
    const newLog: AdherenceLog = { id: Math.random().toString(36).substr(2, 9), medicineId: medId, timestamp: Date.now(), status };
    setLogs(prev => [newLog, ...prev]);
    if (status === 'taken') {
      setMedicines(prev => prev.map(m => m.id === medId ? { ...m, inventory: Math.max(0, m.inventory - 1) } : m));
      takenSoundRef.current?.play().catch(() => {});
    }
    stopAllAudio();
    setNotifications(prev => prev.filter(n => n.medId !== medId));
  };

  const handleClearData = () => {
    if (window.confirm("Permanently wipe all health data?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogin = (u: any) => {
    setShowUserDropdown(false);
    setShowNotificationsList(false);
    setUser(u as User);
    setTimeout(() => {
      window.location.hash = '#/';
      unlockAudio();
    }, 100);
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors" onClick={() => {
        if (audioBlocked) unlockAudio();
        if (showUserDropdown) setShowUserDropdown(false);
        if (showNotificationsList) setShowNotificationsList(false);
      }}>
        <audio ref={alarmRef} src={settings.alarmSound} preload="auto" />
        <audio ref={takenSoundRef} src="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3" preload="auto" />

        {isRinging && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-2xl animate-fade-in">
             <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 max-sm w-full shadow-2xl animate-bounce-in border-4 border-red-500 text-center relative overflow-hidden">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                  <Clock className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Active Alert</h2>
                <div className="space-y-4 mb-8">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                      <p className={`text-sm font-bold ${n.type === 'refill' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {notifications.some(n => n.type === 'reminder') && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        const note = notifications.find(n => n.type === 'reminder'); 
                        if (note) handleLogStatus(note.medId!, 'taken'); 
                      }} 
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest active:scale-95"
                    >
                      I have Taken it
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); stopAllAudio(); }} 
                    className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-widest text-sm"
                  >
                    Dismiss Alarm
                  </button>
                </div>
                <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alarm will auto-stop in 1 minute</p>
             </div>
          </div>
        )}

        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between transition-colors">
          <Link to="/" className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Pill className="text-white w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">MediMinder AI</h1>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest animate-pulse">Monitoring Active</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            {audioBlocked && (
              <button onClick={(e) => { e.stopPropagation(); unlockAudio(); }} className="text-amber-500 flex items-center gap-1 text-[10px] font-black uppercase px-2">
                <VolumeX className="w-4 h-4" /> Sound Blocked
              </button>
            )}

            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowNotificationsList(!showNotificationsList); }} 
                className={`p-2 rounded-full transition-colors ${showNotificationsList ? 'bg-slate-100 dark:bg-slate-700 text-blue-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full" />
                )}
              </button>

              {showNotificationsList && (
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl z-[100] p-3 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Recent Alerts</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 font-bold">No active notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-1">
                          <p className={`text-[11px] font-bold leading-tight ${n.type === 'refill' ? 'text-amber-600' : 'text-red-600'}`}>{n.message}</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(item => item.id !== n.id)); }}
                            className="text-[9px] font-black uppercase tracking-tighter text-slate-400 hover:text-slate-600 text-right"
                          >
                            Dismiss
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowUserDropdown(!showUserDropdown); }} 
                className="flex items-center space-x-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-blue-600" />}
                </div>
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 top-12 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl z-[100] p-2 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                  <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors" onClick={() => setShowUserDropdown(false)}>
                    <UserCircle className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors" onClick={() => setShowUserDropdown(false)}>
                    <SettingsIcon className="w-4 h-4" /> Settings
                  </Link>
                  <Link to="/support" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors" onClick={() => setShowUserDropdown(false)}>
                    <HelpCircle className="w-4 h-4" /> Help & Feedback
                  </Link>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button onClick={(e) => { e.stopPropagation(); setUser(null); stopAllAudio(); }} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-all">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24">
          <div className="max-w-4xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard user={user!} medicines={medicines} logs={logs} onLog={handleLogStatus} />} />
              <Route path="/medicines" element={<MedicineList medicines={medicines} onAdd={(m) => setMedicines(prev => [...prev, { ...m, id: Math.random().toString(36).substr(2, 9) }])} onUpdate={(id, m) => setMedicines(prev => prev.map(item => item.id === id ? { ...m, id } : item))} onDelete={(id) => setMedicines(prev => prev.filter(m => m.id !== id))} />} />
              <Route path="/cycle" element={<CycleTracker user={user!} onUpdate={(u) => setUser(u)} medicines={medicines} />} />
              <Route path="/mindset" element={<Mindset />} />
              <Route path="/adherence" element={<AdherenceTable medicines={medicines} logs={logs} />} />
              <Route path="/services" element={<Services medicines={medicines} onRefill={() => {}} />} />
              <Route path="/chatbot" element={<HealthChatbot user={user!} medicines={medicines} logs={logs} />} />
              <Route path="/profile" element={<Profile user={user!} onUpdate={setUser} logs={logs} />} />
              <Route path="/settings" element={<Settings settings={settings} onUpdate={setSettings} onClearData={handleClearData} alarmRef={alarmRef} />} />
              <Route path="/support" element={<Support />} />
              <Route path="/imagelab" element={<ImageLab />} />
            </Routes>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-2 py-3 flex items-center justify-around z-40 transition-colors">
          <NavLink to="/" icon={<Home />} label="Home" />
          <NavLink to="/medicines" icon={<Pill />} label="Meds" />
          <NavLink to="/cycle" icon={<Droplets className="text-rose-500" />} label="Cycle" />
          <NavLink to="/chatbot" icon={<BrainCircuit className="text-blue-600" />} label="AI Expert" />
          <NavLink to="/imagelab" icon={<Sparkles className="text-yellow-500" />} label="Lab" />
          <NavLink to="/mindset" icon={<Brain className="text-indigo-500" />} label="Mind" />
          <NavLink to="/services" icon={<Truck />} label="Service" />
        </nav>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </Link>
  );
};

export default App;
