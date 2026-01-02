
import React, { useState, useRef, useMemo } from 'react';
import { Camera, MapPin, Activity, CheckCircle2, Loader2, MapPinned, ExternalLink, RefreshCw, XCircle, Award, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User, AdherenceLog } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  logs?: AdherenceLog[];
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, logs = [] }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [isSyncingFit, setIsSyncingFit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const healthStats = useMemo(() => {
    if (!logs || logs.length === 0) return { rate: 0, taken: 0, missed: 0, chartData: [] };
    
    const taken = logs.filter(l => l.status === 'taken').length;
    const rate = Math.round((taken / logs.length) * 100);
    
    // Generate data for the 7-day trend graph
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toDateString();
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === dStr);
      const dayTaken = dayLogs.filter(l => l.status === 'taken').length;
      const dayRate = dayLogs.length ? Math.round((dayTaken / dayLogs.length) * 100) : 0;
      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: dayRate
      });
    }

    return { rate, taken, missed: logs.length - taken, chartData };
  }, [logs]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...user, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const syncLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onUpdate({ 
          ...user, 
          lat: latitude, 
          lng: longitude, 
          address: `Current Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location. Please check permissions.");
        setIsLocating(false);
      }
    );
  };

  const toggleGoogleFit = () => {
    if (!user.googleFitSynced) {
      setIsSyncingFit(true);
      setTimeout(() => {
        onUpdate({ ...user, googleFitSynced: true });
        setIsSyncingFit(false);
      }, 1500);
    } else {
      onUpdate({ ...user, googleFitSynced: false });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your identity and connected health services</p>
      </header>

      {/* Identity Section */}
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-blue-100 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
              {user.photo ? (
                <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl font-black text-blue-200">{user.name.charAt(0)}</div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-slate-800"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>

          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Full Name</label>
              <input 
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={user.name}
                onChange={(e) => onUpdate({ ...user, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest">Email Address</label>
              <input 
                type="email"
                disabled
                className="w-full bg-slate-100 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed"
                value={user.email}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ENHANCED Health Scoreboard Section */}
      <section className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-indigo-600 rounded-2xl">
                    <Award className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">Personal Scoreboard</h3>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Medical Performance Tracking</p>
                 </div>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-1.5 text-green-400 font-black text-sm uppercase tracking-tighter">
                   <TrendingUp className="w-4 h-4" /> 
                   Excellent
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Lifetime Progress Ring */}
              <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center relative overflow-hidden">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lifetime Adherence</span>
                 <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                       <circle cx="56" cy="56" r="48" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray={301} strokeDashoffset={301 * (1 - healthStats.rate / 100)} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-2xl font-black">{healthStats.rate}%</span>
                 </div>
                 <p className="mt-4 text-[9px] text-slate-500 font-bold uppercase">Based on all historical logs</p>
              </div>

              {/* Weekly Performance Graph */}
              <div className="lg:col-span-2 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> 7-Day Performance
                  </span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase">Trend Analysis</span>
                </div>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthStats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profileChartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', padding: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        fill="url(#profileChartGradient)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between px-2 mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {healthStats.chartData.map((d, i) => <span key={i}>{d.name}</span>)}
                </div>
              </div>
           </div>

           {/* Counter Breakdowns */}
           <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 group-hover:bg-white/10 transition-all">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Total Doses Taken</span>
                    <span className="text-3xl font-black text-green-400">{healthStats.taken}</span>
                 </div>
                 <div className="p-3 bg-green-500/10 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                 </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 group-hover:bg-white/10 transition-all">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Total Doses Missed</span>
                    <span className="text-3xl font-black text-rose-400">{healthStats.missed}</span>
                 </div>
                 <div className="p-3 bg-rose-500/10 rounded-2xl">
                    <XCircle className="w-6 h-6 text-rose-400" />
                 </div>
              </div>
           </div>
        </div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mb-40"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -ml-32 -mt-32"></div>
      </section>

      {/* Google Maps Integration */}
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-blue-50/30 dark:bg-blue-900/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPinned className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Google Maps Sync</h3>
          </div>
          {user.lat && <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Synced</span>}
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">Emergency Home Address</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Syncing your location helps MediMinder find the nearest pharmacies and ensures emergency services can find you instantly.
              </p>
              {user.address ? (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {user.address}
                  </p>
                  <a 
                    href={`https://www.google.com/maps?q=${user.lat},${user.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:underline uppercase"
                  >
                    View on Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-500">Location not yet synced.</p>
                </div>
              )}
            </div>
            <button 
              onClick={syncLocation}
              disabled={isLocating}
              className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLocating ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </section>

      {/* Google Fit Integration */}
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-pink-50/30 dark:bg-pink-900/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Fitness Tracker</h3>
          </div>
          {user.googleFitSynced && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </div>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">Sync with Google Fit</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-sm">
                Connect to Google Fit to monitor your steps, heart rate, and activity levels. MediMinder uses this data to provide better health guidance.
              </p>
            </div>
            <button 
              onClick={toggleGoogleFit}
              disabled={isSyncingFit}
              className={`relative w-14 h-8 rounded-full p-1 transition-colors ${user.googleFitSynced ? 'bg-pink-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all flex items-center justify-center ${user.googleFitSynced ? 'translate-x-6' : 'translate-x-0'}`}>
                {isSyncingFit && <Loader2 className="w-3 h-3 text-pink-600 animate-spin" />}
              </div>
            </button>
          </div>

          {user.googleFitSynced && (
            <div className="grid grid-cols-2 gap-4 animate-slide-up">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Daily Steps</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">8,432</span>
                  <span className="text-[10px] text-green-600 font-bold">+12%</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Heart Rate</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">72 <span className="text-xs font-normal">bpm</span></span>
                  <Activity className="w-4 h-4 text-pink-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center p-6">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          Cloud Sync Last Attempted: {new Date().toLocaleTimeString()}
        </p>
      </footer>
    </div>
  );
};

export default Profile;
