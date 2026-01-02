
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Pill, Package, X, Check, AlertCircle, Calendar, ExternalLink, Clock, Search, Filter, RotateCcw, CalendarRange, AlertTriangle, PencilLine } from 'lucide-react';
import { Medicine } from '../types';
import { CATEGORIES } from '../constants';

interface MedicineListProps {
  medicines: Medicine[];
  onAdd: (med: Omit<Medicine, 'id'>) => void;
  onUpdate: (id: string, med: Omit<Medicine, 'id'>) => void;
  onDelete: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_CODES: Record<string, string> = {
  'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA', 'Sunday': 'SU'
};
const FREQUENCIES = ['All', 'Daily', 'Twice a day', 'Nightly', 'Weekly'];

const MedicineList: React.FC<MedicineListProps> = ({ medicines, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFrequency, setFilterFrequency] = useState('All');

  const [formData, setFormData] = useState<Omit<Medicine, 'id'> & { customCategory: string }>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    dayOfWeek: 'Monday',
    times: ['08:00'],
    inventory: 30,
    refillThreshold: 5,
    category: CATEGORIES[0],
    customCategory: '',
    isSyncedToCalendar: false,
    startDate: '',
    endDate: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Daily',
      dayOfWeek: 'Monday',
      times: ['08:00'],
      inventory: 30,
      refillThreshold: 5,
      category: CATEGORIES[0],
      customCategory: '',
      isSyncedToCalendar: false,
      startDate: '',
      endDate: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddTime = () => {
    setFormData(prev => ({ ...prev, times: [...prev.times, '12:00'] }));
  };

  const handleRemoveTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? value : t)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (formData.times.length === 0) {
      alert("Please add at least one schedule time.");
      return;
    }
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        alert("End date cannot be earlier than start date.");
        return;
      }
    }

    const finalCategory = formData.category === 'Other' && formData.customCategory.trim() 
      ? formData.customCategory.trim() 
      : formData.category;

    const dataToSubmit: Omit<Medicine, 'id'> = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      dayOfWeek: formData.dayOfWeek,
      times: formData.times,
      inventory: formData.inventory,
      refillThreshold: formData.refillThreshold,
      category: finalCategory,
      isSyncedToCalendar: formData.isSyncedToCalendar,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    if (editingId) {
      onUpdate(editingId, dataToSubmit);
    } else {
      onAdd(dataToSubmit);
    }
    resetForm();
  };

  const handleEdit = (med: Medicine) => {
    const isPredefined = CATEGORIES.includes(med.category);
    
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      dayOfWeek: med.dayOfWeek || 'Monday',
      times: med.times,
      inventory: med.inventory,
      refillThreshold: med.refillThreshold,
      category: isPredefined ? med.category : 'Other',
      customCategory: isPredefined ? '' : med.category,
      isSyncedToCalendar: med.isSyncedToCalendar,
      startDate: med.startDate || '',
      endDate: med.endDate || ''
    });
    setEditingId(med.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const generateGCalUrl = (med: Medicine) => {
    const title = encodeURIComponent(`Take Medicine: ${med.name}`);
    const details = encodeURIComponent(`Dosage: ${med.dosage}\nFrequency: ${med.frequency}\nTimes: ${med.times.join(', ')}\nManaged by MediMinder AI`);
    
    const now = new Date();
    let startDate = med.startDate ? new Date(med.startDate) : new Date();
    
    if (!med.startDate && med.frequency === 'Weekly' && med.dayOfWeek) {
      const targetDay = DAYS.indexOf(med.dayOfWeek);
      const currentDay = (now.getDay() + 6) % 7; 
      const diff = (targetDay - currentDay + 7) % 7;
      startDate.setDate(now.getDate() + diff);
    }

    const [hours, minutes] = med.times[0].split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + 30 * 60000);
    const format = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${format(startDate)}/${format(endDate)}`;
    
    let recur = '';
    if (med.frequency === 'Daily') recur = '&recur=RRULE:FREQ=DAILY';
    if (med.frequency === 'Weekly') recur = `&recur=RRULE:FREQ=WEEKLY;BYDAY=${DAY_CODES[med.dayOfWeek || 'Monday']}`;
    
    if (med.endDate && recur) {
      const gCalEndDate = med.endDate.replace(/-/g, '') + 'T235959Z';
      recur += `;UNTIL=${gCalEndDate}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}${recur}`;
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          med.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || med.category === filterCategory;
      const matchesFrequency = filterFrequency === 'All' || med.frequency === filterFrequency;
      return matchesSearch && matchesCategory && matchesFrequency;
    });
  }, [medicines, searchQuery, filterCategory, filterFrequency]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterFrequency('All');
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isFiltered = searchQuery !== '' || filterCategory !== 'All' || filterFrequency !== 'All';

  return (
    <div className="space-y-6 animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 max-sm w-full shadow-2xl animate-slide-up border border-slate-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">Delete Medicine?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
              This will permanently remove this medicine and its history. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Medicines</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your prescriptions and course durations</p>
        </div>
        {!showForm && (
          <button 
            onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
            className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">Add New</span>
          </button>
        )}
      </div>

      {!showForm && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by medicine name or category..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px] relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-9 pr-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 appearance-none focus:ring-1 focus:ring-blue-500 outline-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px] relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-9 pr-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 appearance-none focus:ring-1 focus:ring-blue-500 outline-none"
                value={filterFrequency}
                onChange={(e) => setFilterFrequency(e.target.value)}
              >
                {FREQUENCIES.map(f => <option key={f} value={f}>{f === 'All' ? 'All Frequencies' : f}</option>)}
              </select>
            </div>
            {isFiltered && (
              <button 
                onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border-2 border-blue-100 dark:border-slate-700 shadow-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">{editingId ? 'Edit Medicine' : 'New Medicine'}</h3>
            <button onClick={(e) => { e.stopPropagation(); resetForm(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Medicine Name</label>
                <input 
                  required
                  placeholder="e.g. Aspirin"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Dosage</label>
                <input 
                  required
                  placeholder="e.g. 100mg"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.dosage}
                  onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Frequency</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.frequency}
                  onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                >
                  {FREQUENCIES.filter(f => f !== 'All').map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              {formData.frequency === 'Weekly' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Day of Week</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  >
                    {DAYS.map(day => <option key={day}>{day}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Category</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {formData.category === 'Other' && (
              <div className="space-y-1 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 animate-slide-up">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1 flex items-center space-x-2">
                  <PencilLine className="w-3.5 h-3.5" />
                  <span>Custom Category Name</span>
                </label>
                <input 
                  required
                  placeholder="e.g. Allergy, Mental Health, etc."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.customCategory}
                  onChange={e => setFormData({ ...formData, customCategory: e.target.value })}
                />
              </div>
            )}

            <div className="p-5 bg-violet-50 dark:bg-violet-900/10 rounded-3xl border border-violet-100 dark:border-violet-800">
               <label className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 flex items-center space-x-2 mb-4">
                  <CalendarRange className="w-3.5 h-3.5" />
                  <span>Course Duration (Optional)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-violet-400 ml-1">Start Date</label>
                    <input 
                      type="date"
                      className="w-full bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:text-white"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-violet-400 ml-1">End Date</label>
                    <input 
                      type="date"
                      className="w-full bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:text-white"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
            </div>

            <div className="space-y-3 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Schedule Times</span>
                </label>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAddTime(); }}
                  className="text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                >
                  + Add Time
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.times.map((time, idx) => (
                  <div key={idx} className="relative group">
                    <input 
                      type="time"
                      required
                      value={time}
                      onChange={e => handleTimeChange(idx, e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    />
                    {formData.times.length > 1 && (
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveTime(idx); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Current Stock</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.inventory}
                  onChange={e => setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Refill Alert At</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={formData.refillThreshold}
                  onChange={e => setFormData({ ...formData, refillThreshold: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
               <Check className="w-5 h-5" />
               <span>{editingId ? 'Save Changes' : 'Add Medicine'}</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4" onClick={(e) => e.stopPropagation()}>
        {filteredMedicines.map(med => (
          <div key={med.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform border border-blue-100/50 dark:border-blue-800">
                  <Pill className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">{med.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase font-bold text-[10px]">{med.category}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• {med.dosage} •</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-tight">{med.frequency}{med.frequency === 'Weekly' && ` (${med.dayOfWeek})`}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(med); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeletingId(med.id); }} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {(med.startDate || med.endDate) && (
              <div className="mb-4 flex items-center space-x-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-4 py-2 rounded-xl text-[10px] font-bold border border-violet-100 dark:border-violet-800">
                <CalendarRange className="w-3.5 h-3.5" />
                <span>
                  {med.startDate ? formatDateLabel(med.startDate) : 'No start set'} 
                  {' — '} 
                  {med.endDate ? formatDateLabel(med.endDate) : 'Indefinite course'}
                </span>
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {med.times.map((time, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 dark:border-blue-800">
                  <Clock className="w-3 h-3" />
                  <span>{time}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                 <Package className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 leading-none mb-1">Inventory</span>
                   <div className="flex items-center space-x-2">
                      <span className={`text-sm font-black ${med.inventory <= med.refillThreshold ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                        {med.inventory} Left
                      </span>
                      {med.inventory <= med.refillThreshold && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                   </div>
                 </div>
              </div>
              <a 
                href={generateGCalUrl(med)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Sync to Calendar</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>
        ))}

        {filteredMedicines.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold">No medicines found matching your criteria.</p>
            {isFiltered && (
              <button 
                onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                className="mt-4 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineList;
