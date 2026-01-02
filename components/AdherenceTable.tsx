
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, Calendar as CalendarIcon, CheckCircle2, XCircle, Activity, TrendingUp, Award, Zap, Filter, ListChecks, TrendingDown } from 'lucide-react';
import { Medicine, AdherenceLog } from '../types';

interface AdherenceTableProps {
  medicines: Medicine[];
  logs: AdherenceLog[];
}

const AdherenceTable: React.FC<AdherenceTableProps> = ({ medicines, logs }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'taken' | 'missed'>('all');

  const filteredLogs = useMemo(() => {
    let sorted = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    if (statusFilter === 'all') return sorted;
    return sorted.filter(l => l.status === statusFilter);
  }, [logs, statusFilter]);

  const stats = useMemo(() => {
    if (logs.length === 0) return { rate: 0, taken: 0, missed: 0, streak: 0 };
    const taken = logs.filter(l => l.status === 'taken').length;
    const rate = Math.round((taken / logs.length) * 100);
    
    let streak = 0;
    const sorted = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    for (const log of sorted) {
      if (log.status === 'taken') streak++;
      else break;
    }

    return { rate, taken, missed: logs.length - taken, streak };
  }, [logs]);

  // Generate chart data for the last 7 days
  const chartData = useMemo(() => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toDateString();
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === dateStr);
      const takenCount = dayLogs.filter(l => l.status === 'taken').length;
      const totalCount = dayLogs.length;
      
      const rate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
      
      days.push({
        name: dayLabel,
        rate: rate
      });
    }
    return days;
  }, [logs]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors">Health Intelligence</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daily adherence performance tracking</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
           {(['all', 'taken', 'missed'] as const).map(f => (
             <button 
               key={f}
               onClick={() => setStatusFilter(f)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${statusFilter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </header>

      {/* Analytics Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Adherence</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white">{stats.rate}%</span>
              <span className={`text-xs font-bold mb-2 flex items-center gap-1 ${stats.rate >= 80 ? 'text-green-500' : 'text-amber-500'}`}>
                {stats.rate >= 80 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} 
                {stats.rate >= 80 ? 'Optimal' : 'Needs Focus'}
              </span>
            </div>
          </div>
          <Activity className="w-20 h-20 text-blue-500/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Taken</p>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                 <CheckCircle2 className="w-4 h-4 text-green-600" />
               </div>
               <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.taken}</span>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Current Streak</p>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                 <Award className="w-4 h-4 text-amber-600" />
               </div>
               <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.streak}</span>
             </div>
          </div>
        </div>
      </section>

      {/* Adherence Graph Section */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Adherence Trend (7 Days)</h3>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Taken %
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                domain={[0, 100]}
                ticks={[0, 50, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                formatter={(value: number) => [`${value}% Adherence`, 'Daily Rate']}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="#6366f1" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRate)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Detailed Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
             <ListChecks className="w-4 h-4" /> Comprehensive Log
           </h3>
           <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
             <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
             <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">Past 30 Days</span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found for filter: {statusFilter}</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const med = medicines.find(m => m.id === log.medicineId);
                  const date = new Date(log.timestamp);
                  const isTaken = log.status === 'taken';

                  return (
                    <tr key={log.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${
                            isTaken ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/20' : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20'
                          }`}>
                            {isTaken ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white transition-colors">
                              {med?.name || 'Deleted Medication'}
                            </p>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isTaken ? 'text-green-600' : 'text-red-500'}`}>
                              {log.status} • {med?.dosage}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdherenceTable;
