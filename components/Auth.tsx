
import React, { useState } from 'react';
import { Pill, Mail, Lock, User, CheckCircle, Shield, Brain, Zap, ArrowRight, Heart, Activity, Star, Smartphone, Bell, Clock, Quote, Users, FileText, ShoppingBag, Sparkles, Code, Globe } from 'lucide-react';

interface AuthProps {
  onLogin: (user: { name: string; email: string; isLoggedIn: boolean }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: formData.name || 'User', email: formData.email, isLoggedIn: true });
  };

  // Creator data without images, keeping the unique AI styles
  const creators = [
    { 
      name: 'Arijit Sinha', 
      style: 'from-blue-400 via-cyan-300 to-indigo-500'
    },
    { 
      name: 'Anam Khandakar', 
      style: 'from-pink-400 via-rose-300 to-purple-500'
    },
    { 
      name: 'Arunjit Jana', 
      style: 'from-emerald-400 via-teal-300 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-pink-200">
      {/* Dynamic Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Pill className="text-white w-5 h-5" />
          </div>
          <span className="text-slate-900 font-extrabold text-xl tracking-tight">Medi<span className="text-pink-600">Minder AI</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => {setIsLogin(true); window.scrollTo({top: 0, behavior: 'smooth'});}} className="text-slate-600 font-bold text-sm hover:text-blue-600">Log In</button>
          <button onClick={() => {setIsLogin(false); window.scrollTo({top: 0, behavior: 'smooth'});}} className="bg-gradient-to-r from-blue-600 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
            Join Free
          </button>
        </div>
      </nav>

      {/* Primary Hero & Auth Section */}
      <section id="auth-section" className="relative pt-32 pb-24 px-6 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-gradient-to-b from-blue-50/70 to-transparent -z-10 rounded-[100%]"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-pink-100 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-60"></div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-16">
          <div className="lg:w-1/2 w-full order-1 lg:order-2 animate-slide-up">
            <div className="bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 p-2 overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-pink-600 p-10 text-white rounded-[3rem]">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Pill className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold mb-1">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
                <p className="text-blue-100 font-medium text-sm">Sign in to sync your health routine.</p>
                
                <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 mt-8 mb-6">
                  <button 
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white shadow-lg text-blue-600' : 'text-white hover:bg-white/10'}`}
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white shadow-lg text-blue-600' : 'text-white hover:bg-white/10'}`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 group-focus-within:text-white transition-colors" />
                      <input 
                        type="text" required
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-14 pr-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-0 outline-none placeholder:text-blue-100 text-white font-medium"
                      />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 group-focus-within:text-white transition-colors" />
                    <input 
                      type="email" required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-0 outline-none placeholder:text-blue-100 text-white font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 group-focus-within:text-white transition-colors" />
                    <input 
                      type="password" required
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:ring-0 outline-none placeholder:text-blue-100 text-white font-medium"
                    />
                  </div>
                  
                  <button type="submit" className="w-full bg-white text-blue-700 font-extrabold py-5 rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-blue-900/40 text-lg flex items-center justify-center space-x-3 mt-4">
                    <span>{isLogin ? 'Sign In Now' : 'Join MediMinder AI'}</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center space-x-2 text-blue-100 text-[10px] font-bold uppercase tracking-widest">
                  <Shield className="w-3 h-3" />
                  <span>Secure & Private Healthcare</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8 text-center lg:text-left order-2 lg:order-1 animate-fade-in pt-4">
            <div className="inline-flex items-center space-x-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full border border-pink-100 text-xs font-bold uppercase tracking-widest">
              <Star className="w-4 h-4 fill-pink-600" />
              <span>Ranked #1 Medicine Manager</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              Smart Care for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">A Healthier You.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Join thousands of users who never miss a recovery step. Your medicine schedule, tracking, and AI health advice, all in one smart dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-24 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Pill className="text-white w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-2xl tracking-tighter">Medi<span className="text-pink-500">Minder AI</span></span>
            </div>
          </div>
          <div className="space-y-6 text-sm">
            <h6 className="text-white font-bold uppercase text-xs tracking-widest">Navigation</h6>
            <ul className="space-y-4 font-medium">
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-pink-500 transition-colors">Sign In</button></li>
            </ul>
          </div>
          <div className="space-y-6 text-sm">
            <h6 className="text-white font-bold uppercase text-xs tracking-widest">Connect</h6>
            <p className="font-medium">help@mediminder.ai</p>
            <div className="flex space-x-4">
               <Smartphone className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
               <Activity className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
               <Bell className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="space-y-6 text-sm">
            <h6 className="text-white font-bold uppercase text-xs tracking-widest">Security</h6>
            <div className="flex items-center space-x-2 text-slate-300 font-bold">
               <Shield className="w-5 h-5 text-blue-500" />
               <span>HIPAA COMPLIANT</span>
            </div>
          </div>
        </div>

        {/* Creator Acknowledgements & Gratitude Section */}
        <div className="max-w-6xl mx-auto pb-12 pt-12 border-t border-white/5">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className="space-y-10 w-full">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 mb-8">System Architects</p>
              
              <div className="flex flex-wrap justify-center gap-12 md:gap-24">
                {creators.map((creator) => (
                  <div key={creator.name} className="flex flex-col items-center group relative">
                    {/* AI Styled Name Typography */}
                    <div className="relative z-10 flex flex-col items-center">
                      <span className={`text-lg md:text-xl font-black tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-r ${creator.style} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:tracking-[0.25em]`}>
                        {creator.name}
                      </span>
                      <div className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${creator.style} mt-2 transition-all duration-500 opacity-60 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gratitude Message */}
            <div className="flex items-center gap-4 p-6 bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/10 max-w-2xl group hover:bg-white/[0.07] transition-all shadow-3xl hover:border-blue-500/30">
              <div className="p-3 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl shadow-xl shadow-pink-900/40 transform group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
              </div>
              <p className="text-sm md:text-base font-bold text-slate-200 leading-relaxed text-left">
                We thanks to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 font-black tracking-tighter drop-shadow-sm">Google tools</span> for making this site so beautiful.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">© 2025 MediMinder AI. Empowering Healthcare through AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
