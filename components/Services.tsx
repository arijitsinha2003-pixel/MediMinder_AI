
import React, { useState } from 'react';
import { Truck, PhoneCall, ShoppingCart, MapPin, ShieldAlert, Heart, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Medicine } from '../types';

interface ServicesProps {
  medicines: Medicine[];
  onRefill: () => void;
}

const Services: React.FC<ServicesProps> = ({ medicines, onRefill }) => {
  const [booking, setBooking] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<{title: string, body: string} | null>(null);

  const lowMeds = medicines.filter(m => m.inventory <= m.refillThreshold);

  const handleServiceAction = (service: string) => {
    if (service === 'Medicine Refill' && lowMeds.length === 0) {
      setSuccessMsg({
        title: "No Refills Needed",
        body: "Your medicine inventory is currently healthy. No items meet the threshold for a refill order."
      });
      return;
    }

    setBooking(service);
    
    // Simulate API delay
    setTimeout(() => {
      setBooking(null);
      if (service === 'Medicine Refill') {
        onRefill(); // Actually update the parent state
        setSuccessMsg({
          title: "Refill Ordered Successfully!",
          body: `Order placed for ${lowMeds.length} items: ${lowMeds.map(m => m.name).join(', ')}. Pharmacist will contact you soon.`
        });
      } else if (service === 'Ambulance Dispatch') {
        setSuccessMsg({
          title: "Ambulance Dispatched!",
          body: "An emergency unit is on the way to your current GPS location. ETA: 8 minutes. Keep your phone line clear."
        });
      } else {
        setSuccessMsg({
          title: "Request Received",
          body: `${service} has been successfully booked. Check your registered mobile for the confirmation link.`
        });
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Global Success Overlay Toast */}
      {successMsg && (
        <div className="fixed inset-x-0 top-20 z-[100] px-4 pointer-events-none flex justify-center">
          <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl shadow-blue-900/40 max-w-md w-full border border-white/10 pointer-events-auto animate-slide-up">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500 p-2 rounded-xl shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-lg leading-tight mb-1">{successMsg.title}</h4>
                <p className="text-slate-400 text-sm font-medium">{successMsg.body}</p>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => setSuccessMsg(null)}
              className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm"
            >
              Great, thank you
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-900">Health Services</h2>
      
      {/* Emergency Feature */}
      <div className="bg-red-50 border-2 border-red-200 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-red-100">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
             <div className="bg-red-600 p-2.5 rounded-xl text-white animate-pulse shadow-lg shadow-red-200">
                <ShieldAlert className="w-7 h-7" />
             </div>
             <h3 className="text-2xl font-black text-red-900 uppercase tracking-tight">Ambulance Dispatch</h3>
          </div>
          <p className="text-red-700 text-sm mb-8 max-w-sm font-semibold leading-relaxed">
            Instant priority emergency response. One tap will share your medical profile and location with the nearest dispatch center.
          </p>
          <button 
            onClick={() => handleServiceAction('Ambulance Dispatch')}
            disabled={!!booking}
            className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-red-700 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-red-400/30 hover:-translate-y-1 active:scale-95 disabled:opacity-70"
          >
            {booking === 'Ambulance Dispatch' ? <Loader2 className="w-7 h-7 animate-spin" /> : <PhoneCall className="w-7 h-7" />}
            <span>{booking === 'Ambulance Dispatch' ? 'CALLING...' : 'EMERGENCY DISPATCH'}</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-200/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100/30 rounded-full -ml-16 -mb-16"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicine Delivery */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-xl mb-2 text-slate-900">Medicine Refill Order</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Running low? We'll bundle all your low-stock medications into a single delivery from our partner pharmacies.
          </p>
          
          {lowMeds.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-amber-700 uppercase">{lowMeds.length} items ready for refill</span>
            </div>
          )}

          <button 
            onClick={() => handleServiceAction('Medicine Refill')}
            disabled={!!booking}
            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center space-x-2 border-2 ${
              lowMeds.length > 0 
              ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100' 
              : 'border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            {booking === 'Medicine Refill' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
            <span>{booking === 'Medicine Refill' ? 'Processing...' : 'Book Refills Now'}</span>
          </button>
        </div>

        {/* Doctor Consultation */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-teal-100 transition-all group">
          <div className="bg-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-xl mb-2 text-slate-900">Tele-Consultation</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Connect with a verified GP in under 15 minutes to discuss symptoms, dosages, or general health.
          </p>
          <button 
             onClick={() => handleServiceAction('Tele-Consultation')}
             disabled={!!booking}
             className="w-full border-2 border-teal-500 text-teal-600 py-4 rounded-2xl font-black hover:bg-teal-50 transition-all flex items-center justify-center space-x-2"
          >
            {booking === 'Tele-Consultation' ? <Loader2 className="w-5 h-5 animate-spin" /> : <PhoneCall className="w-5 h-5" />}
            <span>Start Video Call</span>
          </button>
        </div>
      </div>

      {/* Locations */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-lg flex items-center space-x-2 uppercase tracking-widest">
            <MapPin className="w-6 h-6 text-blue-400" />
            <span>Nearby Network</span>
          </h3>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 font-bold uppercase">Real-time GPS</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
            <p className="font-extrabold text-blue-400 mb-1">City General Pharmacy</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">0.8 miles • Delivery Active</p>
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Open 24h</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
            <p className="font-extrabold text-blue-400 mb-1">St. Mary's Medical Center</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">2.1 miles • Emergency Only</p>
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Open Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
