
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Activity, ShieldAlert, Truck, ChevronRight, Pill, Sparkles, Zap, BrainCircuit, MessageSquare, TrendingUp } from 'lucide-react';
import { Medicine, AdherenceLog, User } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  medicines: Medicine[];
  logs: AdherenceLog[];
  onLog: (id: string, status: 'taken' | 'missed') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, medicines, logs, onLog }) => {
  const todayDate = new Date();
  const todayStr = todayDate.toLocaleDateString();
  
  const todayMeds = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];

    return medicines.filter(med => {
      if (med.startDate) {
        const start = new Date(med.startDate);
        if (start > today) return false;
      }
      if (med.endDate) {
        const end = new Date(med.endDate);
        if (end < today) return false;
      }

      const freq = med.frequency;
      if (freq === 'Daily' || freq === 'Nightly' || freq === 'Twice a day') {
        return true;
      }
      if (freq === 'Weekly' && med.dayOfWeek === todayName) {
        return true;
      }
      return false;
    });
  }, [medicines]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekLogs = logs.filter(l => l.timestamp > weekAgo);
    const taken = weekLogs.filter(l => l.status === 'taken').length;
    const rate = weekLogs.length ? Math.round((taken / weekLogs.length) * 100) : 0;
    
    // Generate data for the mini-graph
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dStr = d.toDateString();
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === dStr);
      const dayTaken = dayLogs.filter(l => l.status === 'taken').length;
      const dayRate = dayLogs.length ? Math.round((dayTaken / dayLogs.length) * 100) : 0;
      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: dayRate
      });
    }

    return { rate, chartData };
  }, [logs]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors">Hello, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">You have {todayMeds.length} doses scheduled for today.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-blue-200">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">{stats.rate}% Adherence</span>
        </div>
      </section>

      {/* AI Assistant Quick Call to Action */}
      <Link 
        to="/chatbot" 
        className="block bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl border-b-4 border-blue-600"
      >
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">New Mode</span>
              <h3 className="text-xl font-black uppercase tracking-tight">Health Q&A Session</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Start a well-trained expert consultation powered by Google Gemini Pro and Live Search.
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          to="/services" 
          className="bg-red-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-red-100 dark:shadow-none relative overflow-hidden group hover:scale-[1.02] transition-all"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
             <div className="flex items-center justify-between mb-2">
               <ShieldAlert className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
               <ChevronRight className="w-5 h-5 opacity-50" />
             </div>
             <div>
               <h4 className="font-black text-xl uppercase tracking-tighter">Emergency</h4>
               <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Ambulance</p>
             </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" />
        </Link>

        <Link 
          to="/services" 
          className="bg-blue-50 dark:bg-slate-800 p-6 rounded-[2.5rem] border border-blue-100 dark:border-slate-700 shadow-xl shadow-blue-50 dark:shadow-none relative overflow-hidden group hover:scale-[1.02] transition-all"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
             <div className="flex items-center justify-between mb-2">
               <Truck className="w-8 h-8 text-blue-600 group-hover:text-blue-500 transition-colors" />
               <ChevronRight className="w-5 h-5 opacity-50" />
             </div>
             <div>
               <h4 className="font-black text-xl uppercase tracking-tighter text-slate-900 dark:text-white">Pharmacy</h4>
               <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">Refill Order</p>
             </div>
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
        </Link>

        <Link 
          to="/imagelab" 
          className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-yellow-100 dark:shadow-none relative overflow-hidden group hover:scale-[1.02] transition-all"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
             <div className="flex items-center justify-between mb-2">
               <Zap className="w-8 h-8 text-white/60 group-hover:text-white transition-colors fill-white/20" />
               <ChevronRight className="w-5 h-5 opacity-50" />
             </div>
             <div>
               <h4 className="font-black text-xl uppercase tracking-tighter">AI Lab</h4>
               <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Nano Banana</p>
             </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </Link>
      </div>

      {/* NEW Adherence Trend Section on Front Page */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weekly Trend</h3>
              <p className="text-lg font-black text-slate-900 dark:text-white">Adherence Level</p>
            </div>
          </div>
          <div className="text-right">
             <span className={`text-2xl font-black ${stats.rate >= 80 ? 'text-green-600' : 'text-amber-500'}`}>{stats.rate}%</span>
             <p className="text-[10px] font-bold text-slate-400 uppercase">7-Day Avg</p>
          </div>
        </div>
        
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', padding: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fill="url(#dashboardGradient)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between px-2 mt-4 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
           {stats.chartData.map((d, i) => <span key={i}>{d.name}</span>)}
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Today's Progress</p>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString() && l.status === 'taken').length}
            </span>
            <span className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-tighter">of {todayMeds.length} Taken</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-8 -mt-8" />
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Low Stock</p>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`w-5 h-5 ${medicines.filter(m => m.inventory <= m.refillThreshold).length > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
            <span className="text-lg font-black text-slate-900 dark:text-white">{medicines.filter(m => m.inventory <= m.refillThreshold).length} items</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-full -mr-8 -mt-8" />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Today's Schedule</h3>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase">{todayStr}</span>
        </div>
        <div className="space-y-3">
          {todayMeds.map(med => {
            const log = logs.find(l => l.medicineId === med.id && new Date(l.timestamp).toDateString() === new Date().toDateString());
            const isTaken = log?.status === 'taken';
            const isMissed = log?.status === 'missed';

            return (
              <div key={med.id} className={`p-5 rounded-[2.5rem] border-2 transition-all ${
                isTaken ? 'bg-green-50/50 border-green-100 dark:border-green-900/30' : 
                isMissed ? 'bg-red-50/50 border-red-100 dark:border-red-900/30' : 
                'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${isTaken ? 'bg-green-500 text-white' : isMissed ? 'bg-red-500 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'}`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white leading-tight">{med.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{med.dosage} • {med.times[0]}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!log ? (
                      <>
                        <button 
                          onClick={() => onLog(med.id, 'missed')}
                          className="p-3 bg-slate-50 dark:bg-slate-700 text-red-500 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-90"
                          title="Mark as Missed"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={() => onLog(med.id, 'taken')}
                          className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-90"
                          title="Mark as Taken"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </>
                    ) : (
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isTaken ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {todayMeds.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-slate-50 dark:border-slate-700">
               <Pill className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active schedules</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
