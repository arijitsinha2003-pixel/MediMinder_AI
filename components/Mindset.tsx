
import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Wind, 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  Quote, 
  CloudRain, 
  Trees, 
  Waves, 
  Heart,
  Loader2,
  X,
  ChevronRight,
  Youtube,
  ExternalLink,
  Headphones
} from 'lucide-react';
import { getMeditationGuidance } from '../geminiService';

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Soft Rain', icon: <CloudRain />, url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { id: 'forest', name: 'Forest Birds', icon: <Trees />, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'waves', name: 'Ocean Waves', icon: <Waves />, url: 'https://assets.mixkit.co/active_storage/sfx/2550/2550-preview.mp3' },
  { id: 'zen', name: 'Zen Piano', icon: <Music />, url: 'https://assets.mixkit.co/active_storage/sfx/1004/1004-preview.mp3' }
];

const YT_PLAYLISTS = [
  { 
    name: 'Lo-fi Focus', 
    desc: 'Perfect for productivity & study', 
    url: 'https://music.youtube.com/search?q=lofi+hip+hop+radio',
    color: 'from-orange-400 to-rose-400' 
  },
  { 
    name: 'Deep Sleep', 
    desc: 'Theta waves for restful night', 
    url: 'https://music.youtube.com/search?q=deep+sleep+meditation+music',
    color: 'from-blue-600 to-indigo-900' 
  },
  { 
    name: 'Anxiety Relief', 
    desc: 'Calming frequencies (432Hz)', 
    url: 'https://music.youtube.com/search?q=anxiety+relief+music+432hz',
    color: 'from-teal-400 to-emerald-600' 
  },
  { 
    name: 'Nature Mix', 
    desc: 'Pure birdsong & flowing water', 
    url: 'https://music.youtube.com/search?q=nature+sounds+relaxing+music',
    color: 'from-green-400 to-lime-600' 
  }
];

const QUOTES = [
  "Self-care is how you take your power back.",
  "Your mental health is a priority. Your happiness is an essential.",
  "Deep breaths are like little love notes to your body.",
  "You don't have to control your thoughts. You just have to stop letting them control you.",
  "Slow down. Calm is a superpower."
];

const Mindset: React.FC = () => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditation, setMeditation] = useState<string | null>(null);
  const [loadingMed, setLoadingMed] = useState(false);
  const [mood, setMood] = useState('Restless');
  const [breathingPhase, setBreathingPhase] = useState<'In' | 'Hold' | 'Out'>('In');
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingPhase(prev => {
        if (prev === 'In') return 'Hold';
        if (prev === 'Hold') return 'Out';
        return 'In';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = (soundId: string, url: string) => {
    if (activeSound === soundId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setActiveSound(soundId);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.loop = true;
        audioRef.current.play();
      }
    }
  };

  const handleGenerateMeditation = async () => {
    setLoadingMed(true);
    try {
      const script = await getMeditationGuidance(mood);
      setMeditation(script || "Find a quiet space, close your eyes, and focus on your heartbeat.");
    } catch (err) {
      setMeditation("Take five deep breaths. Imagine a calm blue ocean with every exhale.");
    } finally {
      setLoadingMed(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <audio ref={audioRef} />
      
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Zen Zone</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nurture your mind and spirit</p>
        </div>
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
          <Brain className="w-6 h-6" />
        </div>
      </header>

      {/* Quote of the Day */}
      <section className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
        <Quote className="absolute top-4 right-4 w-12 h-12 text-white/10" />
        <div className="relative z-10 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Daily Inspiration</p>
          <p className="text-xl font-bold italic leading-relaxed">"{quote}"</p>
        </div>
      </section>

      {/* Breathing Guide */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
          <Wind className="w-4 h-4" />
          Breathing Ritual
        </h3>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-indigo-500/10 transition-all duration-[4000ms] ease-in-out ${breathingPhase === 'In' ? 'scale-110 opacity-100' : breathingPhase === 'Hold' ? 'scale-110 opacity-60' : 'scale-50 opacity-20'}`} />
          <div className={`w-32 h-32 rounded-full border-4 border-indigo-500 flex items-center justify-center transition-all duration-[4000ms] ${breathingPhase === 'In' ? 'scale-100' : breathingPhase === 'Hold' ? 'scale-100' : 'scale-75'}`}>
             <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                {breathingPhase === 'In' ? 'Inhale' : breathingPhase === 'Hold' ? 'Hold' : 'Exhale'}
             </span>
          </div>
        </div>
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400 font-medium">Follow the circle to regulate your nervous system.</p>
      </section>

      {/* YouTube Music Integration Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            Curated Relaxing Music
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            YouTube Music <ExternalLink className="w-3 h-3" />
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {YT_PLAYLISTS.map((playlist, idx) => (
            <a 
              key={idx}
              href={playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${playlist.color} text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all group`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <Headphones className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <Youtube className="w-5 h-5 opacity-60" />
                </div>
                <h4 className="font-black text-lg uppercase tracking-tight">{playlist.name}</h4>
                <p className="text-white/70 text-xs font-medium leading-relaxed">{playlist.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  Open Player <ChevronRight className="w-3 h-3" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </a>
          ))}
        </div>
      </section>

      {/* AI Guided Meditation */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
               <Sparkles className="w-5 h-5 text-indigo-600" />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Meditation</h3>
          </div>
        </div>

        {meditation ? (
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 animate-slide-up">
            <div className="prose prose-sm prose-indigo dark:prose-invert">
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-300 font-medium">{meditation}</p>
            </div>
            <button 
              onClick={() => setMeditation(null)}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Close Session
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['Anxious', 'Restless', 'Tired', 'Sad', 'Stressed'].map(m => (
                <button 
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mood === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerateMeditation}
              disabled={loadingMed}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              {loadingMed ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              <span>START GUIDED SESSION</span>
            </button>
          </div>
        )}
      </section>

      {/* Soundscape Selection */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Local Ambient Soundscapes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {AMBIENT_SOUNDS.map(sound => (
            <button 
              key={sound.id}
              onClick={() => toggleSound(sound.id, sound.url)}
              className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${activeSound === sound.id && isPlaying ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeSound === sound.id && isPlaying ? 'bg-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                {activeSound === sound.id && isPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : sound.icon}
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{sound.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Mindful Habits Check-in */}
      <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-5 h-5 text-rose-500" />
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Gratitude Check</h4>
        </div>
        <div className="space-y-4">
           <textarea 
             placeholder="Write one thing you're grateful for today..."
             className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all"
           />
           <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
              Save Entry <ChevronRight className="w-3 h-3" />
           </button>
        </div>
      </section>
    </div>
  );
};

export default Mindset;
